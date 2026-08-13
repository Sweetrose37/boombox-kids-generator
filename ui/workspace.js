import { defaults, guidedSteps, options, quickMap } from '../data/options.js'
import { composePrompt } from '../engine/promptComposer.js'
import { intelligentShake } from '../engine/shakeLogic.js'
import { isHumanCharacter, isMascotCharacter } from '../data/characters.js'
import { buildMatchMini } from '../engine/matchMiniLogic.js'
import { buildOutfit } from '../engine/outfitLogic.js'
import { buildCollection } from '../engine/collectionLogic.js'
import { remixPrompt } from '../engine/remixLogic.js'
import { buildSpecialOccasion } from '../engine/specialOccasionLogic.js'
import { loadState, saveState } from '../state/store.js'
import { WorkspaceRepository } from '../workspace/repository.js'
import { queryPrompts } from '../workspace/query.js'
import { downloadFile, groupText, promptText } from '../workspace/export.js'
import { defaultSizingState, describeDimensions, PPI_OPTIONS, proportionalResize, referenceSizes } from '../production/sizing.js'
import { appendProductionGuidance, buildProductionGuidance, validZones } from '../production/guidance.js'
import { clearDraft, exportSession, importSession, loadDraft, loadPreferences, saveDraft, savePreferences } from '../state/session.js'

const modeNames = {
  'Build with BooBoo': 'BUILD WITH BOOBOO', 'Shake the Box': 'SHAKE THE BOX', 'Match My Mini': 'MATCH MY MINI™',
  'Outfit Builder': 'OUTFIT BUILDER', 'Collection Builder': 'COLLECTION BUILDER', 'Special Occasions':'SPECIAL OCCASIONS', 'Remix My Prompt': 'REMIX MY PROMPT',
}

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]))
const field = (key, label, value, list = options[key]) => list
  ? `<label class="builder-field"><span>${label}</span><select data-field="${key}">${list.map((item) => `<option${item === value ? ' selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></label>`
  : `<label class="builder-field"><span>${label}</span><input data-field="${key}" value="${escapeHtml(value)}" /></label>`

export function initWorkspace() {
  const overlay = document.querySelector('#builder-workspace')
  const title = document.querySelector('#workspace-title')
  const body = document.querySelector('#workspace-body')
  const savedOverlay = document.querySelector('#saved-library')
  const savedList = document.querySelector('#saved-list')
  const savedCount = document.querySelector('.saved-prompts strong')
  let state = loadState()
  let mode = 'Build with BooBoo'
  let step = 0
  let output = null
  let locks = new Set()
  let shakeHistory = []
  let remixChoices = new Set()
  let productionState = null
  let productionSource = null
  let productionUpdatedPrompt = ''
  let productionReturn = 'home'
  let activeDraft = loadDraft()
  const preferences = loadPreferences()
  const repository = new WorkspaceRepository()
  const library = { view:'prompts', selectedPrompt:'', selectedGroup:'', search:'', age:'', product:'', production:'', intensity:'', mode:'', status:'All', collection:'', sort:'NEWEST' }

  const persist = () => { saveState(state);savePreferences({age:state.age,product:state.product,production:state.production,intensity:state.intensity,reducedMotion:preferences.reducedMotion});activeDraft=saveDraft({mode,step,state});updateCount() }
  const updateCount = () => { savedCount.textContent = repository.refresh().prompts.length }
  const open = () => { overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); document.body.classList.add('dialog-open') }
  const close = () => { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); document.body.classList.remove('dialog-open') }
  const closeSaved = () => { savedOverlay.classList.remove('is-open'); savedOverlay.setAttribute('aria-hidden','true'); document.body.classList.remove('dialog-open') }
  const updateFields = () => body.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('change', () => { state[input.dataset.field] = input.value;if(input.dataset.field==='phrase')state.phraseMode=input.value.trim()?'manual':'auto';persist(); if (['character','ethnicity','specialOccasion'].includes(input.dataset.field)) render() }))

  function outputMarkup(result) {
    const resolutionNote = result.resolutions?.length ? `<p class="age-resolution-note"><strong>AGE PRIORITY APPLIED:</strong> ${result.resolutions.map((item) => `${escapeHtml(item.field)} adjusted to ${escapeHtml(item.to)}`).join(' • ')}</p>` : ''
    return `<section class="prompt-output"><div class="output-meta"><span><small>DESIGN CONCEPT</small><strong>${escapeHtml(result.title)}</strong><p>${escapeHtml(result.direction)}</p></span><dl><div><dt>PRODUCTION METHOD</dt><dd>${escapeHtml(result.production)}</dd></div><div><dt>AGE GROUP</dt><dd>${escapeHtml(result.age)}</dd></div><div><dt>PRODUCT</dt><dd>${escapeHtml(result.product)}</dd></div></dl></div>${resolutionNote}<label><span>FINAL PRODUCTION PROMPT</span><textarea readonly>${escapeHtml(result.prompt)}</textarea></label><div class="builder-actions"><button data-copy>▣ COPY PROMPT</button><button data-save>♥ ${mode==='Remix My Prompt'?'SAVE AS NEW':'SAVE PROMPT'}</button><button data-remix-output>⟳ REMIX</button><button data-build-another>↺ BUILD ANOTHER</button></div><p class="workspace-feedback" aria-live="polite"></p></section>`
  }

  async function copyText(value,feedback,message='READY TO DROP INTO YOUR GENERATOR.') { try { await navigator.clipboard.writeText(value);if(feedback)feedback.textContent=message;return true } catch { if(feedback)feedback.textContent='COPY DID NOT WORK. SELECT THE PROMPT AND COPY IT MANUALLY.';return false } }
  function bindOutput() {
    body.querySelector('[data-copy]')?.addEventListener('click', () => copyText(output.prompt,body.querySelector('.workspace-feedback')))
    body.querySelector('[data-save]')?.addEventListener('click', () => { const result=repository.saveOutput(output,state,mode); updateCount(); body.querySelector('.workspace-feedback').textContent = result.created ? (output.items?.length ? 'PROMPTS AND CREATIVE SET SAVED LOCALLY.' : state.remixSourceId ? 'REMIX SAVED AS NEW.' : 'PROMPT SAVED LOCALLY.') : 'THAT PROMPT IS ALREADY IN YOUR PLAYLIST.' })
    body.querySelector('[data-remix-output]')?.addEventListener('click', () => { mode = 'Remix My Prompt'; state.remixSource = output.prompt; output = null;persist();render() })
    body.querySelector('[data-build-another]')?.addEventListener('click', () => { output = null; step = 0;persist();render() })
  }

  function finish(result) {
    output=result;clearDraft();activeDraft=null;body.innerHTML=outputMarkup(result)
    body.querySelector('.prompt-output')?.insertAdjacentHTML('afterbegin','<p class="result-ready">YOUR PRODUCTION PROMPT IS READY.<br><small>Turn it up — your prompt is ready.</small></p>')
    body.querySelector('.output-meta dl')?.insertAdjacentHTML('beforeend',`<div><dt>CREATIVE INTENSITY</dt><dd>${escapeHtml(state.intensity)}</dd></div>`)
    const promptLabel=body.querySelector('.prompt-output>label')
    if(result.items?.length)promptLabel?.insertAdjacentHTML('beforebegin',`<section class="output-items"><h3>REVIEW INDIVIDUAL PROMPTS</h3>${result.items.map((item,index)=>`<article class="output-item"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.prompt)}</p><footer><button data-copy-item="${index}">COPY PROMPT</button><button data-remix-item="${index}">REMIX DESIGN</button><button data-production-item="${index}">PRODUCTION CENTER</button></footer></article>`).join('')}</section>`)
    const actions=body.querySelector('.builder-actions'),remixButton=body.querySelector('[data-remix-output]'),productionButton=document.createElement('button')
    productionButton.type='button';productionButton.textContent='OPEN IN PRODUCTION CENTER';productionButton.addEventListener('click',()=>openProduction({...output,settings:{...state},creationMode:mode},'output'));remixButton?.before(productionButton)
    if(result.items?.length){const save=body.querySelector('[data-save]');save.textContent=mode==='Collection Builder'?'SAVE FULL COLLECTION':mode==='Outfit Builder'?'SAVE OUTFIT SET':'SAVE COORDINATED SET';body.querySelector('[data-copy]').textContent=mode==='Collection Builder'?'COPY COLLECTION':'COPY SET'}
    const collections=repository.data.collections
    actions?.insertAdjacentHTML('afterend',`<div class="output-group-actions"><select data-output-collection aria-label="Choose collection"><option value="">ADD TO COLLECTION…</option>${collections.map((group)=>`<option value="${group.id}">${escapeHtml(group.name)}</option>`).join('')}</select><button data-add-output-collection>ADD TO COLLECTION</button></div>`)
    bindOutput()
    body.querySelectorAll('[data-copy-item]').forEach((button)=>button.addEventListener('click',()=>copyText(result.items[Number(button.dataset.copyItem)].prompt,body.querySelector('.workspace-feedback'))))
    body.querySelectorAll('[data-remix-item]').forEach((button)=>button.addEventListener('click',()=>{const item=result.items[Number(button.dataset.remixItem)];state={...state,...item.settings,remixSource:item.prompt};mode='Remix My Prompt';output=null;persist();render()}))
    body.querySelectorAll('[data-production-item]').forEach((button)=>button.addEventListener('click',()=>{const item=result.items[Number(button.dataset.productionItem)];openProduction({...item,creationMode:mode},'output')}))
    body.querySelector('[data-add-output-collection]')?.addEventListener('click',()=>{const id=body.querySelector('[data-output-collection]').value,feedback=body.querySelector('.workspace-feedback');if(!id){feedback.textContent='CHOOSE A COLLECTION FIRST.';return}const saved=repository.saveOutput(result,state,mode),records=saved.records||[saved.record];records.filter(Boolean).forEach((record)=>repository.addToGroup('collections',id,record.id));updateCount();feedback.textContent='ADDED TO THE COLLECTION.'})
  }

  function renderGuided() {
    const [key,label] = guidedSteps[step]
    const progress = Math.round(((step + 1) / guidedSteps.length) * 100)
    const suppressed = ['ethnicity','hairstyle'].includes(key) && !isHumanCharacter(state.character)
    const mascotChoice = key === 'character' && isMascotCharacter(state.character) ? field('mascot','ORIGINAL MASCOT TYPE',state.mascot) : ''
    const customCulture = key === 'ethnicity' && state.ethnicity === 'Custom' ? field('customCulturalBackground','CUSTOM CULTURAL BACKGROUND',state.customCulturalBackground,null) : ''
    body.innerHTML = `<div class="booboo-guide"><img src="assets/booboo-mascot.png" alt="" /><div><small>BOOBOO SAYS</small><strong>LET'S BUILD IT STEP BY STEP!</strong><p>Choose your ${label.toLowerCase()}. Your earlier choices stay in the mix.</p></div></div><div class="step-meter"><span style="width:${progress}%"></span></div><p class="step-count">STEP ${step + 1} OF ${guidedSteps.length}</p><div class="single-step">${suppressed ? '<p class="context-note">Human hairstyle controls are not applied to this character type. Ethnicity choices also apply only to original human characters.</p>' : field(key,label,state[key], key === 'phrase' || key === 'coordination' ? null : options[key])}${customCulture}${mascotChoice}</div><div class="builder-actions"><button data-back ${step === 0 ? 'disabled' : ''}>← BACK</button>${suppressed ? '' : '<button data-you-choose>YOU CHOOSE</button><button data-surprise>SURPRISE THIS</button>'}<button data-next>${step === guidedSteps.length - 1 ? 'BUILD PROMPT' : 'NEXT →'}</button></div>`
    updateFields()
    const resetStep=document.createElement('button');resetStep.type='button';resetStep.textContent='RESET STEP';resetStep.dataset.resetStep='';body.querySelector('[data-next]').before(resetStep)
    body.querySelector('[data-back]').addEventListener('click', () => { step -= 1;persist();render() })
    resetStep.addEventListener('click',()=>{state[key]=defaults[key];if(key==='ethnicity')state.customCulturalBackground='';persist();render()})
    body.querySelector('[data-you-choose]')?.addEventListener('click', () => { state[key] = key === 'phrase' || key === 'coordination' ? '' : 'You Choose';if(key==='phrase')state.phraseMode='auto'; persist(); render() })
    body.querySelector('[data-surprise]')?.addEventListener('click', () => { state[key] = options[key] ? options[key].filter((v) => v !== 'You Choose')[Math.floor(Math.random() * options[key].filter((v) => v !== 'You Choose').length)] : key === 'phrase' ? '' : 'BooBoo chooses a coordinated accent';if(key==='phrase')state.phraseMode='auto'; persist(); render() })
    body.querySelector('[data-next]').addEventListener('click', () => { if (step === guidedSteps.length - 1) finish(composePrompt(state)); else { step += 1;persist();render() } })
  }

  function renderShake() {
    const keys = ['age','product','theme','character',...(isHumanCharacter(state.character)?['ethnicity']:[]),'artStyle','fashion','typography','palette','material','composition','production']
    body.innerHTML = `<p class="mode-intro">A controlled creative shuffle. Every shake replaces the previous unlocked art style, typography, and composition with new choices. Lock what you love before shaking.</p><div class="shake-grid">${keys.map((key) => `<button type="button" class="shake-choice ${locks.has(key)?'is-locked':''}" data-lock="${key}"><small>${key.replace(/([A-Z])/g,' $1').toUpperCase()}</small><strong>${escapeHtml(state[key])}</strong><span>${locks.has(key)?'🔒 LOCKED':'TAP TO LOCK'}</span></button>`).join('')}</div><div class="builder-actions"><button data-shake>ϟ SHAKE AGAIN</button><button data-lock-all>🔒 LOCK THIS</button><button data-build>BUILD PROMPT</button></div>`
    body.querySelectorAll('[data-lock]').forEach((button) => button.addEventListener('click', () => { locks.has(button.dataset.lock) ? locks.delete(button.dataset.lock) : locks.add(button.dataset.lock); render() }))
    body.querySelector('[data-shake]').addEventListener('click', () => { state = intelligentShake(state,locks,shakeHistory); persist(); render() })
    body.querySelector('[data-lock-all]').addEventListener('click', () => { locks = new Set(keys); render() })
    body.querySelector('[data-build]').addEventListener('click', () => finish(composePrompt(state)))
    const startOver=document.createElement('button');startOver.type='button';startOver.textContent='START OVER';startOver.addEventListener('click',()=>startFresh(false));body.querySelector('.builder-actions').append(startOver)
  }

  function formMarkup(extra = '') {
    const characterFields = `${field('character','CHARACTER',state.character)}${isMascotCharacter(state.character) ? field('mascot','ORIGINAL MASCOT TYPE',state.mascot) : ''}${isHumanCharacter(state.character) ? `${field('ethnicity','ETHNICITY / CULTURAL BACKGROUND',state.ethnicity)}${state.ethnicity === 'Custom' ? field('customCulturalBackground','CUSTOM CULTURAL BACKGROUND',state.customCulturalBackground,null) : ''}${field('hairstyle','HAIRSTYLE',state.hairstyle)}` : ''}`
    return `<div class="form-grid">${field('age','AGE GROUP',state.age)}${field('product','PRODUCT',state.product)}${field('theme','THEME',state.theme)}${characterFields}${field('artStyle','ART STYLE',state.artStyle)}${field('fashion','FASHION',state.fashion)}${field('typography','TYPOGRAPHY',state.typography)}${field('phrase','EXACT PHRASE (OPTIONAL — AUTO-MATCHED IF BLANK)',state.phrase,null)}${field('palette','COLORS',state.palette)}${field('material','FAUX MATERIAL',state.material)}${field('production','PRINT METHOD',state.production)}${field('intensity','CREATIVE INTENSITY',state.intensity)}${extra}</div>`
  }

  function renderModeForm() {
    let extra = ''
    if (mode === 'Match My Mini') extra = field('relationship','PAIRING / GROUP',state.relationship)
    if (mode === 'Outfit Builder') extra = field('outfit','OUTFIT',state.outfit) + field('placement','PLACEMENT',state.placement)
    if (mode === 'Collection Builder') extra = field('collectionCount','NUMBER OF PROMPTS',state.collectionCount)
    if (mode === 'Special Occasions') extra = field('specialOccasion','SPECIAL OCCASION',state.specialOccasion) + (/birthday/i.test(state.specialOccasion) ? field('birthdayAge','BIRTHDAY AGE / MILESTONE (OPTIONAL)',state.birthdayAge,null) : '') + (state.specialOccasion === 'Custom' ? field('customOccasion','CUSTOM OCCASION / HOLIDAY',state.customOccasion,null) : '')
    body.innerHTML = `<p class="mode-intro">${mode === 'Special Occasions' ? 'Build an original birthday, holiday, cultural, seasonal, school, or family-celebration design. Selected traditions stay distinct, respectful, and age-appropriate.' : 'Set the shared creative direction. The engine will preserve coordination while forcing meaningful variation.'}</p>${formMarkup(extra)}<div class="builder-actions"><button data-build>BUILD PROMPT</button></div>`
    updateFields()
    body.querySelector('[data-build]').addEventListener('click', () => finish(mode === 'Match My Mini' ? buildMatchMini(state) : mode === 'Outfit Builder' ? buildOutfit(state) : mode === 'Special Occasions' ? buildSpecialOccasion(state) : buildCollection(state)))
  }

  function renderRemix() {
    body.innerHTML = `<p class="mode-intro">Paste an existing kids-apparel prompt, then choose what to strengthen or change. The core idea stays intact.</p><label class="remix-source"><span>EXISTING PROMPT</span><textarea data-remix-source>${escapeHtml(state.remixSource || '')}</textarea></label><div class="remix-options">${options.remix.map((item) => `<button type="button" class="${remixChoices.has(item)?'is-active':''}" data-remix-choice="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div><div class="builder-actions"><button data-remix-build>REMIX PROMPT</button></div>`
    body.querySelector('[data-remix-source]').addEventListener('input', (event) => { state.remixSource = event.target.value; persist() })
    body.querySelectorAll('[data-remix-choice]').forEach((button) => button.addEventListener('click', () => { remixChoices.has(button.dataset.remixChoice) ? remixChoices.delete(button.dataset.remixChoice) : remixChoices.add(button.dataset.remixChoice); render() }))
    body.querySelector('[data-remix-build]').addEventListener('click', () => { if (!state.remixSource?.trim()) return; finish(remixPrompt(state.remixSource,[...remixChoices])) })
  }

  function renderQuick(key,label) {
    body.innerHTML = `<div class="booboo-guide compact"><img src="assets/booboo-mascot.png" alt="" /><div><small>QUICK BUILD</small><strong>${label.toUpperCase()}</strong><p>This updates your working prompt state without replacing the deeper modes.</p></div></div><div class="single-step">${field(key,label.toUpperCase(),state[key])}</div><div class="builder-actions"><button data-done>DONE</button><button data-full-builder>OPEN FULL BUILDER</button></div>`
    updateFields(); body.querySelector('[data-done]').addEventListener('click',close); body.querySelector('[data-full-builder]').addEventListener('click',() => openMode('Build with BooBoo'))
  }

  const productionSelect = (key,label,values,value) => `<label><span>${label}</span><select data-production-field="${key}">${values.map((item)=>`<option${String(item)===String(value)?' selected':''}>${escapeHtml(item)}</option>`).join('')}</select></label>`
  function renderProductionCenter() {
    const source=productionSource || composePrompt(state)
    let dimensions, dimensionError=''
    try { dimensions=describeDimensions(productionState.pixelWidth,productionState.pixelHeight,productionState.ppi) } catch(error) { dimensionError=error.message }
    const zones=validZones(productionState.product)
    if (!productionState.zones.length || !productionState.zones.some((zone)=>zones.includes(zone))) productionState.zones=[zones[0]]
    const guidance=buildProductionGuidance({ ...productionState, phrase:source.exactPhrase || source.settings?.phrase || state.phrase, typography:source.typography || source.settings?.typography || state.typography, composition:source.settings?.composition || state.composition, intensity:source.intensity || source.settings?.intensity || state.intensity, mode:source.creationMode || mode, outfit:source.settings?.outfit || state.outfit, dimensions })
    let resizeResult='Enter an original size and one target dimension.'
    try { const resized=proportionalResize(productionState.originalWidth,productionState.originalHeight,productionState.targetWidth,productionState.targetHeight);resizeResult=`${resized.width} × ${resized.height} px` } catch(error) { resizeResult=error.message }
    body.innerHTML=`<div class="production-center">
      <div class="booboo-guide compact production-booboo"><img src="assets/booboo-mascot.png" alt="" /><div><small>BOOBOO'S PRODUCTION TIP</small><strong>SIZE THE ART, THEN CHECK THE GARMENT.</strong><p>These are planning ranges. Your print vendor and garment template make the final call.</p></div></div>
      <p class="production-disclaimer">EDUCATIONAL PLANNING GUIDANCE ONLY — confirm printable areas, templates, bleed, color, and final specifications with your production vendor.</p>
      <section class="production-section"><h3>IMAGE SIZE</h3><div class="production-grid dimension-inputs"><label><span>WIDTH (PX)</span><input type="number" min="1" data-production-field="pixelWidth" value="${productionState.pixelWidth}"></label><label><span>HEIGHT (PX)</span><input type="number" min="1" data-production-field="pixelHeight" value="${productionState.pixelHeight}"></label>${productionSelect('ppi','PPI',PPI_OPTIONS.map(String),String(productionState.ppi))}</div>
      ${dimensionError?`<p class="production-error" role="alert">${escapeHtml(dimensionError)}</p>`:`<div class="production-results"><span><b>ASPECT RATIO</b>${dimensions.ratio}</span><span><b>ORIENTATION</b>${dimensions.orientation}</span><span><b>PHYSICAL SIZE</b>${dimensions.physicalWidth} × ${dimensions.physicalHeight} in @ ${dimensions.ppi} PPI</span></div>`}
      <h4 class="reference-title">COMMON WORKING MASTER REFERENCES <small>— not universal printer requirements</small></h4><div class="reference-sizes">${referenceSizes.map((item)=>`<button data-reference-size="${item.width}:${item.height}"><b>${escapeHtml(item.label)}</b><span>${item.width} × ${item.height}px</span></button>`).join('')}</div>
      <details><summary>PROPORTIONAL RESIZE</summary><div class="production-grid"><label><span>ORIGINAL WIDTH</span><input type="number" min="1" data-production-field="originalWidth" value="${productionState.originalWidth}"></label><label><span>ORIGINAL HEIGHT</span><input type="number" min="1" data-production-field="originalHeight" value="${productionState.originalHeight}"></label><label><span>TARGET WIDTH</span><input type="number" min="1" data-resize-target="width" value="${productionState.targetWidth}"></label><label><span>TARGET HEIGHT</span><input type="number" min="1" data-resize-target="height" value="${productionState.targetHeight}"></label></div><output class="resize-result">PROPORTIONAL RESULT: ${escapeHtml(resizeResult)}</output></details></section>
      <section class="production-section"><h3>AGE &amp; GARMENT</h3><div class="production-grid">${productionSelect('age','AGE GROUP',options.age,productionState.age)}${productionSelect('product','GARMENT / PRODUCT',options.product,productionState.product)}${productionSelect('production','PRINT METHOD',options.production,productionState.production)}</div><div class="production-callout"><b>STARTING WIDTH RANGE</b><strong>${escapeHtml(guidance.size)}</strong><p>Adjust for the actual printable area, artwork shape, garment size, and vendor requirements.</p></div></section>
      <section class="production-section"><h3>PLACEMENT</h3><p class="section-help">Choose valid zones for this product. The first is HERO, the second SUPPORT, and any remaining zones are ACCENT.</p><div class="zone-picker">${zones.map((zone)=>`<label><input type="checkbox" data-zone="${escapeHtml(zone)}" ${productionState.zones.includes(zone)?'checked':''}><span>${escapeHtml(zone)}</span></label>`).join('')}</div><ol class="zone-plan">${guidance.hierarchy.map((item)=>`<li><b>${item.role}</b><span>${escapeHtml(item.zone)} — ${escapeHtml(item.direction)}</span></li>`).join('')}</ol><p class="production-note">Avoid duplicating the same full graphic in every zone. Use one hero, one smaller support, and restrained accents.</p></section>
      <section class="production-section method-sections"><h3>DTF</h3><p>${escapeHtml(buildProductionGuidance({...productionState,production:'DTF'}).method)}</p><h3>SUBLIMATION</h3><p>${escapeHtml(buildProductionGuidance({...productionState,production:'Sublimation'}).method)}</p></section>
      <section class="production-section"><h3>FAUX MATERIALS</h3>${productionSelect('material','VISUAL MATERIAL / EFFECT',options.material,productionState.material)}<p class="production-callout">${escapeHtml(guidance.material)}</p></section>
      <section class="production-section"><h3>OUTFIT / SET GUIDANCE</h3><p>${escapeHtml(guidance.special || 'For coordinated looks, give every garment its own final placement file and scale. Keep shared visual DNA without repeating one full graphic everywhere.')}</p><p class="production-note">MASTER VS FINAL PRINT: preserve a high-resolution master, then export separate final files sized to each placement. Upscaling cannot restore missing detail; recreate or vectorize artwork when enlargement exposes softness.</p></section>
      <section class="production-section production-card"><h3>SIZING RESULT &amp; PROMPT-SPECIFIC PRODUCTION CARD</h3><dl><div><dt>PROMPT</dt><dd>${escapeHtml(source.title || 'Current working prompt')}</dd></div><div><dt>MASTER ARTWORK</dt><dd>${dimensions?`${dimensions.width} × ${dimensions.height}px`:'Invalid dimensions'}</dd></div><div><dt>RATIO / ORIENTATION</dt><dd>${dimensions?`${dimensions.ratio} ${dimensions.orientation}`:'—'}</dd></div><div><dt>SELECTED PPI / NOMINAL SIZE</dt><dd>${dimensions?`${dimensions.ppi} PPI · ${dimensions.physicalWidth} × ${dimensions.physicalHeight} in`:'—'}</dd></div><div><dt>AGE / GARMENT</dt><dd>${escapeHtml(productionState.age)} / ${escapeHtml(productionState.product)}</dd></div><div><dt>METHOD</dt><dd>${escapeHtml(productionState.production)}</dd></div><div><dt>PLACEMENT ZONE</dt><dd>${escapeHtml(productionState.zones.join(', '))}</dd></div><div><dt>STARTING PLACEMENT</dt><dd>${escapeHtml(guidance.size)}</dd></div></dl>${guidance.warnings.length?`<ul class="production-warnings">${guidance.warnings.map((warning)=>`<li>${escapeHtml(warning)}</li>`).join('')}</ul>`:''}<label><span>PRODUCTION GUIDANCE</span><textarea readonly>${escapeHtml(guidance.text)}</textarea></label>
      ${productionUpdatedPrompt?`<label><span>UPDATED PROMPT COPY</span><textarea readonly data-updated-production-prompt>${escapeHtml(productionUpdatedPrompt)}</textarea></label>`:''}
      <div class="builder-actions">${productionReturn!=='home'?'<button data-return-production>RETURN TO PROMPT</button>':''}<button data-copy-sizing>COPY SIZING RESULTS</button><button data-copy-guidance>COPY PRODUCTION GUIDANCE</button><button data-add-guidance aria-label="ADD GUIDANCE TO COPY — ADD PRODUCTION GUIDANCE TO PROMPT">ADD PRODUCTION GUIDANCE TO PROMPT</button>${productionUpdatedPrompt?'<button data-copy-updated>COPY UPDATED PROMPT</button><button data-save-production>SAVE AS NEW</button>':''}<button data-reset-production>RESET SIZING ONLY</button></div><p class="workspace-feedback" aria-live="polite"></p></section>
    </div>`
    bindProductionCenter(source,guidance,dimensions)
  }

  function bindProductionCenter(source,guidance,dimensions) {
    const feedback=()=>body.querySelector('.workspace-feedback')
    body.querySelectorAll('[data-production-field]').forEach((input)=>input.addEventListener('change',()=>{productionState[input.dataset.productionField]=input.value;if(input.dataset.productionField==='product')productionState.zones=[];renderProductionCenter()}))
    body.querySelectorAll('[data-zone]').forEach((input)=>input.addEventListener('change',()=>{productionState.zones=input.checked?[...productionState.zones,input.dataset.zone]:productionState.zones.filter((zone)=>zone!==input.dataset.zone);renderProductionCenter()}))
    body.querySelectorAll('[data-reference-size]').forEach((button)=>button.addEventListener('click',()=>{[productionState.pixelWidth,productionState.pixelHeight]=button.dataset.referenceSize.split(':').map(Number);renderProductionCenter()}))
    body.querySelectorAll('[data-resize-target]').forEach((input)=>input.addEventListener('change',()=>{if(input.dataset.resizeTarget==='width'){productionState.targetWidth=input.value;productionState.targetHeight=''}else{productionState.targetHeight=input.value;productionState.targetWidth=''}renderProductionCenter()}))
    body.querySelector('[data-return-production]')?.addEventListener('click',()=>returnFromProduction())
    body.querySelector('[data-copy-sizing]')?.addEventListener('click',()=>{if(dimensions)copyText(`BOOMBOX KIDS™ Sizing Guidance\nMaster: ${dimensions.width} × ${dimensions.height}px\nRatio: ${dimensions.ratio} ${dimensions.orientation}\n${dimensions.ppi} PPI: ${dimensions.physicalWidth} × ${dimensions.physicalHeight} in\nAge: ${productionState.age}\nGarment: ${productionState.product}\nPlacement: ${productionState.zones.join(', ')}\nStarting width: ${guidance.size}\nPlanning guidance only; confirm final specifications with your print vendor.`,feedback(),'SIZING RESULTS COPIED.')})
    body.querySelector('[data-copy-guidance]')?.addEventListener('click',()=>copyText(guidance.text,feedback(),'PRODUCTION GUIDANCE COPIED.'))
    body.querySelector('[data-add-guidance]')?.addEventListener('click',()=>{productionUpdatedPrompt=appendProductionGuidance(source.prompt,guidance);renderProductionCenter()})
    body.querySelector('[data-copy-updated]')?.addEventListener('click',()=>copyText(productionUpdatedPrompt,feedback(),'UPDATED PROMPT COPY COPIED.'))
    body.querySelector('[data-save-production]')?.addEventListener('click',()=>{const saved=repository.createPrompt({title:`${source.title || 'Prompt'} — Production Copy`,direction:source.designConcept || source.direction || '',prompt:productionUpdatedPrompt,age:productionState.age,product:productionState.product,production:productionState.production},{...(source.settings || state),age:productionState.age,product:productionState.product,production:productionState.production,material:productionState.material},'Sizing & Production Center',{sourcePromptId:source.id || ''});updateCount();feedback().textContent=saved.created?'PRODUCTION COPY SAVED AS NEW.':'THAT PRODUCTION COPY IS ALREADY SAVED.'})
    body.querySelector('[data-reset-production]')?.addEventListener('click',()=>{productionState=defaultSizingState(productionSource?.settings || productionSource || state);productionUpdatedPrompt='';renderProductionCenter()})
  }

  function returnFromProduction(){if(productionReturn==='saved'&&productionSource?.id){close();library.selectedPrompt=productionSource.id;renderSaved();savedOverlay.classList.add('is-open');savedOverlay.setAttribute('aria-hidden','false');document.body.classList.add('dialog-open')}else if(productionReturn==='output'&&output){title.textContent=modeNames[mode];finish(output)}else close()}
  function openProduction(source=null,returnTo='home') { productionSource=source;productionReturn=returnTo;const metadata=source?.settings || source || state;productionState=defaultSizingState(metadata);const requested=String(metadata.placement||'').toLowerCase(),zones=validZones(productionState.product);productionState.zones=zones.filter((zone)=>requested.includes(zone.split(' ')[0]));productionUpdatedPrompt='';title.textContent='SIZING & PRODUCTION CENTER';renderProductionCenter();open() }

  function render() {
    title.textContent = modeNames[mode]
    if (output) return finish(output)
    if (mode === 'Build with BooBoo') renderGuided()
    else if (mode === 'Shake the Box') renderShake()
    else if (mode === 'Remix My Prompt') renderRemix()
    else renderModeForm()
  }

  function openMode(nextMode) { mode = nextMode; output = null; step = 0; if (mode === 'Shake the Box') state = intelligentShake(state,locks,shakeHistory);persist();render();open() }
  function openQuick(label) { if(label==='Sizing & Fit')return openProduction();mode = 'Build with BooBoo'; output = null; title.textContent = `QUICK BUILD — ${label.toUpperCase()}`; renderQuick(quickMap[label],label); open() }
  const dateLabel = (value) => value ? new Date(value).toLocaleDateString() : '—'
  const optionsMarkup = (values,current,blank) => `<option value="">${blank}</option>${values.map((value)=>`<option${value===current?' selected':''}>${escapeHtml(value)}</option>`).join('')}`
  function collectionKinds() { return [['collections','COLLECTIONS'],['matchGroups','MATCH MY MINI™ SETS'],['outfitSets','OUTFIT SETS']] }
  function libraryToolbar() {
    const data=repository.data
    return `<div class="library-tabs"><button data-library-view="prompts" class="${library.view==='prompts'?'is-active':''}">ALL PROMPTS</button><button data-library-view="favorites" class="${library.view==='favorites'?'is-active':''}">FAVORITES</button><button data-library-view="recent" class="${library.view==='recent'?'is-active':''}">RECENT</button><button data-library-view="groups" class="${library.view==='groups'?'is-active':''}">CREATIVE SETS</button></div><div class="library-search"><label><span>SEARCH YOUR PLAYLIST</span><input data-library-search value="${escapeHtml(library.search)}" placeholder="Title, phrase, age, style, notes…" /></label><label><span>SORT</span><select data-library-sort>${['NEWEST','OLDEST','RECENTLY UPDATED','A–Z','Z–A'].map((value)=>`<option${value===library.sort?' selected':''}>${value}</option>`).join('')}</select></label></div>${library.view!=='groups'?`<details class="library-filters"><summary>FILTERS</summary><div>${fieldFilter('age','AGE GROUP',options.age)}${fieldFilter('product','PRODUCT',options.product)}${fieldFilter('production','PRODUCTION',options.production)}${fieldFilter('intensity','INTENSITY',options.intensity)}${fieldFilter('mode','CREATION MODE',Object.keys(modeNames))}${fieldFilter('collection','COLLECTION',data.collections.map((item)=>[item.id,item.name]))}<button data-clear-filters>CLEAR FILTERS</button></div></details>`:''}<div class="library-tools"><button data-export-backup>EXPORT WORKSPACE BACKUP</button><label class="import-backup">IMPORT &amp; MERGE<input type="file" accept="application/json" data-import-backup /></label></div><p class="library-feedback" aria-live="polite"></p>`
  }
  function fieldFilter(key,label,values) { const normalized=values.map((value)=>Array.isArray(value)?value:[value,value]);return `<label><span>${label}</span><select data-library-filter="${key}"><option value="">ALL</option>${normalized.map(([value,text])=>`<option value="${escapeHtml(value)}"${library[key]===value?' selected':''}>${escapeHtml(text)}</option>`).join('')}</select></label>` }
  function promptCard(item) { return `<article class="prompt-card ${item.favorite?'is-favorite':''}"><button class="favorite-pin" data-favorite="${item.id}" aria-label="${item.favorite?'Remove from':'Add to'} favorites">${item.favorite?'♥':'♡'}</button><small>${escapeHtml(item.creationMode)} • ${dateLabel(item.createdAt)}</small><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.designConcept || item.prompt.slice(0,150))}</p><dl><div><dt>AGE</dt><dd>${escapeHtml(item.age)}</dd></div><div><dt>PRODUCT</dt><dd>${escapeHtml(item.product)}</dd></div><div><dt>METHOD</dt><dd>${escapeHtml(item.production)}</dd></div><div><dt>INTENSITY</dt><dd>${escapeHtml(item.intensity)}</dd></div></dl><footer><button data-open-prompt="${item.id}">OPEN</button><button data-copy-saved="${item.id}">COPY</button><button data-remix-saved="${item.id}">REMIX</button><button data-duplicate-saved="${item.id}">DUPLICATE</button><button data-rename-saved="${item.id}">RENAME</button><button data-delete-saved="${item.id}">DELETE</button></footer></article>` }
  function promptDetail(item) { const settings=[['ART STYLE',item.artStyle],['CHARACTER',`${item.character}${item.mascot?` — ${item.mascot}`:''}`],['ETHNICITY / CULTURAL BACKGROUND',item.ethnicity === 'Custom' ? item.customCulturalBackground : item.ethnicity],['TYPOGRAPHY',item.typography],['PALETTE',item.palette],['MATERIAL',item.material]].filter(([,value])=>value&&value!=='Not specified');return `<button class="library-back" data-back-library>← BACK TO SAVED PROMPTS</button><article class="prompt-detail"><button class="favorite-pin" data-favorite="${item.id}">${item.favorite?'♥':'♡'}</button><small>DESIGN CONCEPT</small><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.designConcept)}</p><dl><div><dt>AGE GROUP</dt><dd>${escapeHtml(item.age)}</dd></div><div><dt>PRODUCT</dt><dd>${escapeHtml(item.product)}</dd></div><div><dt>PRODUCTION</dt><dd>${escapeHtml(item.production)}</dd></div><div><dt>INTENSITY</dt><dd>${escapeHtml(item.intensity)}</dd></div><div><dt>CREATED</dt><dd>${dateLabel(item.createdAt)}</dd></div><div><dt>UPDATED</dt><dd>${dateLabel(item.modifiedAt)}</dd></div></dl><div class="key-settings">${settings.map(([key,value])=>`<span><b>${key}</b>${escapeHtml(value)}</span>`).join('')}</div><label class="detail-prompt"><span>FINAL PRODUCTION PROMPT</span><textarea readonly>${escapeHtml(item.prompt)}</textarea></label><label class="detail-notes"><span>PRIVATE NOTES</span><textarea data-notes="${item.id}" placeholder="Notes never enter the final prompt.">${escapeHtml(item.notes)}</textarea></label><footer><button data-copy-saved="${item.id}">COPY PROMPT</button><button data-production-prompt="${item.id}">PRODUCTION CENTER</button><button data-remix-saved="${item.id}">REMIX</button><button data-duplicate-saved="${item.id}">DUPLICATE</button><button data-export-plain="${item.id}">PLAIN .TXT</button><button data-export-prompt="${item.id}">STRUCTURED .TXT</button><button data-save-notes="${item.id}">SAVE NOTES</button><button data-delete-saved="${item.id}">DELETE</button></footer></article>` }
  function groupCard(group,kind,label) { return `<article class="group-card"><small>${label} • ${group.promptIds.length} PROMPTS</small><h3>${escapeHtml(group.name)}</h3><p>${escapeHtml(group.description || group.sharedDNA)}</p><span>${escapeHtml(group.production)} • ${escapeHtml(group.intensity)} • ${dateLabel(group.createdAt)}</span><footer><button data-open-group="${kind}:${group.id}">OPEN</button><button data-rename-group="${kind}:${group.id}">RENAME</button><button data-duplicate-group="${kind}:${group.id}">DUPLICATE</button><button data-export-group="${kind}:${group.id}">EXPORT</button><button data-delete-group="${kind}:${group.id}">DELETE</button></footer></article>` }
  function groupDetail(group,kind) { const prompts=group.promptIds.map((id)=>repository.findPrompt(id)).filter(Boolean);return `<button class="library-back" data-back-groups>← BACK TO CREATIVE SETS</button><article class="group-detail"><small>CREATIVE SET</small><h3>${escapeHtml(group.name)}</h3><p>${escapeHtml(group.description)}</p><dl><div><dt>PROMPT COUNT</dt><dd>${prompts.length}</dd></div><div><dt>SHARED DNA</dt><dd>${escapeHtml(group.sharedDNA)}</dd></div><div><dt>AGE</dt><dd>${escapeHtml(group.age)}</dd></div><div><dt>PRODUCTION</dt><dd>${escapeHtml(group.production)}</dd></div><div><dt>CREATED / UPDATED</dt><dd>${dateLabel(group.createdAt)} / ${dateLabel(group.modifiedAt)}</dd></div></dl><label class="detail-notes"><span>PRIVATE NOTES</span><textarea data-group-notes>${escapeHtml(group.notes)}</textarea></label><div class="group-actions"><button data-save-group-notes="${kind}:${group.id}">SAVE NOTES</button><select data-add-prompt>${optionsMarkup(repository.data.prompts.filter((item)=>!group.promptIds.includes(item.id)).map((item)=>item.title),'','ADD EXISTING PROMPT')}</select><button data-add-to-group="${kind}:${group.id}">ADD</button><button data-export-group="${kind}:${group.id}">EXPORT</button></div><div class="group-prompts">${prompts.map((item,index)=>`<article><small>${index+1} / ${prompts.length}</small><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.designConcept)}</p><footer><button data-copy-saved="${item.id}">COPY</button><button data-remix-saved="${item.id}">REMIX</button><button data-move-group="${kind}:${group.id}:${item.id}:-1" ${index===0?'disabled':''}>MOVE UP</button><button data-move-group="${kind}:${group.id}:${item.id}:1" ${index===prompts.length-1?'disabled':''}>MOVE DOWN</button><button data-remove-group="${kind}:${group.id}:${item.id}">REMOVE</button></footer></article>`).join('')}</div></article>` }
  function renderSaved() {
    repository.refresh(); updateCount()
    if(library.selectedPrompt){const item=repository.openPrompt(library.selectedPrompt);if(!item){library.selectedPrompt='';return renderSaved()}savedList.innerHTML=promptDetail(item);const footer=savedList.querySelector('.prompt-detail>footer');footer?.insertAdjacentHTML('beforeend',`<select data-saved-collection aria-label="Choose collection"><option value="">ADD TO COLLECTION…</option>${repository.data.collections.map((group)=>`<option value="${group.id}">${escapeHtml(group.name)}</option>`).join('')}</select><button data-add-saved-collection="${item.id}">ADD TO COLLECTION</button>`);return bindLibrary()}
    if(library.selectedGroup){const [kind,id]=library.selectedGroup.split(':');const group=repository.groupList(kind).find((item)=>item.id===id);if(!group){library.selectedGroup='';return renderSaved()}savedList.innerHTML=groupDetail(group,kind);return bindLibrary()}
    let items=queryPrompts(repository.data.prompts,{...library,status:library.view==='favorites'?'Favorites':library.status},repository.data.collections)
    if(library.view==='recent')items=repository.data.recent.map((id)=>items.find((item)=>item.id===id)).filter(Boolean)
    let content=''
    if(library.view==='groups')content=collectionKinds().map(([kind,label])=>`<section class="group-section"><h3>${label}</h3><div>${repository.groupList(kind).length?repository.groupList(kind).map((item)=>groupCard(item,kind,label)).join(''):`<p class="saved-empty">NO CREATIVE SETS<br /><span>No crew assembled yet.</span></p>`}</div></section>`).join('')
    else content=items.length?`<div class="prompt-card-grid">${items.map(promptCard).join('')}</div>`:`<p class="saved-empty">${library.search?'NO SEARCH RESULTS<br /><span>Nothing matched that beat.</span>':library.view==='favorites'?'NO FAVORITES<br /><span>Nothing has hit replay yet.</span>':'NO SAVED PROMPTS<br /><span>Your playlist is empty. Build something loud.</span>'}</p>`
    savedList.innerHTML=libraryToolbar()+content;bindLibrary()
  }
  function copyFeedback(message='COPIED!'){const feedback=savedList.querySelector('.library-feedback');if(feedback)feedback.textContent=message}
  function parseTarget(value){const [kind,id]=value.split(':');return {kind,id}}
  function bindLibrary() {
    savedList.querySelectorAll('[data-library-view]').forEach((button)=>button.addEventListener('click',()=>{library.view=button.dataset.libraryView;library.selectedPrompt='';library.selectedGroup='';renderSaved()}))
    savedList.querySelector('[data-library-search]')?.addEventListener('input',(event)=>{library.search=event.target.value;const position=library.search.length;renderSaved();const next=savedList.querySelector('[data-library-search]');next?.focus();next?.setSelectionRange(position,position)})
    savedList.querySelector('[data-library-sort]')?.addEventListener('change',(event)=>{library.sort=event.target.value;renderSaved()})
    savedList.querySelectorAll('[data-library-filter]').forEach((input)=>input.addEventListener('change',()=>{library[input.dataset.libraryFilter]=input.value;renderSaved()}))
    savedList.querySelector('[data-clear-filters]')?.addEventListener('click',()=>{for(const key of ['age','product','production','intensity','mode','status','collection'])library[key]=key==='status'?'All':'';renderSaved()})
    savedList.querySelectorAll('[data-open-prompt]').forEach((button)=>button.addEventListener('click',()=>{library.selectedPrompt=button.dataset.openPrompt;renderSaved()}))
    savedList.querySelectorAll('[data-back-library]').forEach((button)=>button.addEventListener('click',()=>{library.selectedPrompt='';renderSaved()}))
    savedList.querySelectorAll('[data-favorite]').forEach((button)=>button.addEventListener('click',()=>{repository.toggleFavorite(button.dataset.favorite);renderSaved()}))
    savedList.querySelectorAll('[data-copy-saved]').forEach((button)=>button.addEventListener('click',async()=>{const item=repository.findPrompt(button.dataset.copySaved);if(item){const copied=await copyText(item.prompt,savedList.querySelector('.library-feedback'));if(!savedList.querySelector('.library-feedback'))button.textContent=copied?'COPIED!':'SELECT PROMPT TO COPY'}}))
    savedList.querySelectorAll('[data-duplicate-saved]').forEach((button)=>button.addEventListener('click',()=>{repository.duplicatePrompt(button.dataset.duplicateSaved);library.selectedPrompt='';renderSaved()}))
    savedList.querySelectorAll('[data-rename-saved]').forEach((button)=>button.addEventListener('click',()=>{const item=repository.findPrompt(button.dataset.renameSaved),name=prompt('Rename prompt',item.title);if(name?.trim())repository.updatePrompt(item.id,{title:name.trim()});renderSaved()}))
    savedList.querySelectorAll('[data-delete-saved]').forEach((button)=>button.addEventListener('click',()=>{if(confirm('Delete this saved prompt? This cannot be undone.')){repository.deletePrompt(button.dataset.deleteSaved);library.selectedPrompt='';renderSaved()}}))
    savedList.querySelectorAll('[data-remix-saved]').forEach((button)=>button.addEventListener('click',()=>{const item=repository.findPrompt(button.dataset.remixSaved);state={...state,...item.settings,remixSource:item.prompt,remixSourceId:item.id};persist();closeSaved();openMode('Remix My Prompt')}))
    savedList.querySelectorAll('[data-export-prompt]').forEach((button)=>button.addEventListener('click',()=>{const item=repository.findPrompt(button.dataset.exportPrompt);downloadFile(`${item.title}.txt`,promptText(item,true))}))
    savedList.querySelectorAll('[data-export-plain]').forEach((button)=>button.addEventListener('click',()=>{const item=repository.findPrompt(button.dataset.exportPlain);downloadFile(`${item.title}-prompt.txt`,promptText(item,false))}))
    savedList.querySelectorAll('[data-save-notes]').forEach((button)=>button.addEventListener('click',()=>{repository.updatePrompt(button.dataset.saveNotes,{notes:savedList.querySelector(`[data-notes="${button.dataset.saveNotes}"]`).value});renderSaved()}))
    savedList.querySelectorAll('[data-add-saved-collection]').forEach((button)=>button.addEventListener('click',()=>{const groupId=savedList.querySelector('[data-saved-collection]')?.value;if(groupId){repository.addToGroup('collections',groupId,button.dataset.addSavedCollection);renderSaved()}}))
    savedList.querySelectorAll('[data-production-prompt]').forEach((button)=>button.addEventListener('click',()=>{const item=repository.findPrompt(button.dataset.productionPrompt);if(item){closeSaved();openProduction(item,'saved')}}))
    savedList.querySelectorAll('[data-open-group]').forEach((button)=>button.addEventListener('click',()=>{library.selectedGroup=button.dataset.openGroup;renderSaved()}));savedList.querySelectorAll('[data-back-groups]').forEach((button)=>button.addEventListener('click',()=>{library.selectedGroup='';renderSaved()}))
    savedList.querySelectorAll('[data-rename-group]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.renameGroup),group=repository.groupList(kind).find((item)=>item.id===id),name=prompt('Rename creative set',group.name);if(name?.trim())repository.updateGroup(kind,id,{name:name.trim()});renderSaved()}))
    savedList.querySelectorAll('[data-duplicate-group]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.duplicateGroup);repository.duplicateGroup(kind,id);renderSaved()}))
    savedList.querySelectorAll('[data-delete-group]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.deleteGroup);if(confirm('Delete this creative set? Its prompts will remain saved.'))repository.deleteGroup(kind,id);renderSaved()}))
    savedList.querySelectorAll('[data-export-group]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.exportGroup),group=repository.groupList(kind).find((item)=>item.id===id);downloadFile(`${group.name}.txt`,groupText(group,repository.data.prompts))}))
    savedList.querySelectorAll('[data-save-group-notes]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.saveGroupNotes);repository.updateGroup(kind,id,{notes:savedList.querySelector('[data-group-notes]').value});renderSaved()}))
    savedList.querySelectorAll('[data-add-to-group]').forEach((button)=>button.addEventListener('click',()=>{const {kind,id}=parseTarget(button.dataset.addToGroup),select=savedList.querySelector('[data-add-prompt]'),promptTitle=select.value,promptItem=repository.data.prompts.find((item)=>item.title===promptTitle);if(promptItem)repository.addToGroup(kind,id,promptItem.id);renderSaved()}))
    savedList.querySelectorAll('[data-remove-group]').forEach((button)=>button.addEventListener('click',()=>{const [kind,id,promptId]=button.dataset.removeGroup.split(':');repository.removeFromGroup(kind,id,promptId);renderSaved()}))
    savedList.querySelectorAll('[data-move-group]').forEach((button)=>button.addEventListener('click',()=>{const [kind,id,promptId,direction]=button.dataset.moveGroup.split(':');repository.moveInGroup(kind,id,promptId,Number(direction));renderSaved()}))
    savedList.querySelector('[data-export-backup]')?.addEventListener('click',()=>downloadFile('boombox-kids-workspace-backup.json',JSON.stringify({...repository.data,phase6:exportSession()},null,2),'application/json'))
    savedList.querySelector('[data-import-backup]')?.addEventListener('change',async(event)=>{try{const raw=JSON.parse(await event.target.files[0].text());repository.mergeBackup(raw);importSession(raw.phase6);renderSaved();copyFeedback('WORKSPACE MERGED SAFELY.')}catch{copyFeedback('THAT BACKUP COULD NOT BE IMPORTED. TRY AN UNMODIFIED BOOMBOX BACKUP.')}})
  }
  function openSaved() { close(); library.selectedPrompt='';library.selectedGroup='';renderSaved(); savedOverlay.classList.add('is-open'); savedOverlay.setAttribute('aria-hidden','false'); document.body.classList.add('dialog-open') }
  function closeAll() { close(); closeSaved() }
  function continueDraft(){const draft=loadDraft();if(!draft)return startFresh(true);mode=draft.mode;step=draft.step;state=draft.state;output=null;render();open()}
  function startFresh(openBuilder=false){clearDraft();activeDraft=null;const prefs=loadPreferences();state={...defaults,age:prefs.age,product:prefs.product,production:prefs.production,intensity:prefs.intensity};saveState(state);mode='Build with BooBoo';step=0;output=null;locks=new Set();shakeHistory=[];remixChoices=new Set();if(openBuilder){render();open()}else render()}

  overlay.querySelectorAll('[data-close-workspace]').forEach((el) => el.addEventListener('click',close))
  savedOverlay.querySelectorAll('[data-close-saved]').forEach((el) => el.addEventListener('click',closeSaved))
  document.addEventListener('keydown',(event) => { if(event.key === 'Escape') closeAll() })
  updateCount()
  return { openMode, openQuick, openSaved, closeAll, continueDraft, startFresh, hasDraft:()=>Boolean(loadDraft()) }
}
