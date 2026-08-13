import test from 'node:test'
import assert from 'node:assert/strict'
import { defaults } from '../data/options.js'
import { composePrompt } from '../engine/promptComposer.js'
import { shake } from '../engine/shakeLogic.js'
import { buildMatchMini } from '../engine/matchMiniLogic.js'
import { buildOutfit } from '../engine/outfitLogic.js'
import { buildCollection } from '../engine/collectionLogic.js'
import { remixPrompt } from '../engine/remixLogic.js'
import { resolveAgePriorities } from '../engine/ageLogic.js'
import { resolveCompatibility } from '../engine/compatibility.js'
import { intensityDirection } from '../engine/intensity.js'
import { garmentDirection } from '../data/garments.js'
import { intelligentShake } from '../engine/shakeLogic.js'
import { readFile } from 'node:fs/promises'

test('composer produces self-contained DTF direction and exact phrase', () => {
  const result = composePrompt({ ...defaults, phrase: 'CREATE Loud! 2026' })
  assert.match(result.prompt, /^Generate the image now/i)
  assert.match(result.prompt, /Do not rewrite, summarize, simplify, reinterpret/i)
  assert.match(result.prompt, /“CREATE Loud! 2026”/)
  assert.match(result.prompt, /transparent background/i)
  assert.match(result.prompt, /correct limb count/i)
  assert.match(result.prompt, /do not assume gender, race, ethnicity/i)
})

test('remix prompts tell ChatGPT to create the image without rewriting the prompt', () => {
  const result = remixPrompt('Keep this exact concept.', [])
  assert.match(result.prompt, /^Generate the image now/i)
  assert.match(result.prompt, /Do not return a revised prompt/i)
})

test('age logic materially changes developmental direction', () => {
  const baby = composePrompt({ ...defaults, age: 'Newborn' }).prompt
  const teen = composePrompt({ ...defaults, age: 'Teens 13–17' }).prompt
  assert.match(baby, /newborn proportions/i)
  assert.match(teen, /teen proportions/i)
  assert.notEqual(baby, teen)
})

test('age priority resolves infant conflicts before composition', () => {
  const resolved = resolveAgePriorities({ ...defaults, age: 'Newborn', product: 'Varsity jacket', pose: 'Skating', fashion: 'Original streetwear', sizing: 'Oversized youth fit' })
  assert.equal(resolved.selections.product, 'Bodysuit')
  assert.match(resolved.selections.pose, /supported reclined or safely held pose/i)
  assert.equal(resolved.selections.fashion, 'Original streetwear')
  assert.equal(resolved.selections.sizing, 'Baby-safe placement')
  assert.ok(resolved.resolutions.length >= 3)
})

test('newborn standing is translated rather than discarded', () => {
  const resolved = resolveAgePriorities({ ...defaults, age:'Newborn', pose:'Standing naturally' })
  assert.match(resolved.selections.pose,/supported reclined or safely held pose/i)
  assert.match(resolved.resolutions.find((item) => item.field === 'pose').reason,/translated/i)
})

test('toddler adult-fashion movement becomes a playful walk', () => {
  const resolved = resolveAgePriorities({ ...defaults, age:'Toddler', pose:'Adult couture runway stride' })
  assert.match(resolved.selections.pose,/playful confident walking movement/i)
})

test('age priority prevents baby products and placement for teens', () => {
  const result = composePrompt({ ...defaults, age: 'Teens 13–17', product: 'Bodysuit', sizing: 'Baby-safe placement' })
  assert.equal(result.product, 'T-shirt')
  assert.match(result.prompt, /standard youth fit/i)
  assert.doesNotMatch(result.prompt, /baby-safe placement/i)
})

test('sublimation behavior differs from DTF', () => {
  const prompt = composePrompt({ ...defaults, production: 'Sublimation' }).prompt
  assert.match(prompt, /edge-to-edge composition/i)
  assert.doesNotMatch(prompt, /isolated artwork on a transparent background/i)
})

test('mascot compatibility suppresses human hairstyle controls', () => {
  const resolved = resolveCompatibility({ ...defaults, character:'Original animal mascot', hairstyle:'Braids' })
  assert.equal(resolved.selections.hairstyle,'Not specified')
  const prompt = composePrompt({ ...defaults, character:'Original animal mascot', mascot:'Fox', hairstyle:'Braids' }).prompt
  assert.match(prompt,/original quick, curious fox mascot/i)
  assert.doesNotMatch(prompt,/hair direction:.*braids/i)
})

test('human diversity varies independent traits without identity inference', () => {
  const prompt = composePrompt({ ...defaults, character:'Original human character', hairstyle:'Coils' }).prompt
  assert.match(prompt,/skin with a .* undertone/i)
  assert.match(prompt,/natural coils with believable density/i)
  assert.match(prompt,/describe no race, ethnicity/i)
})

test('garment placement changes by garment construction', () => {
  assert.match(garmentDirection('Hoodie').direction,/front.*back/i)
  assert.match(garmentDirection('Varsity jacket').direction,/left chest.*back/i)
  assert.match(garmentDirection('Skirt').direction,/hem.*border/i)
})

test('Creative Intensity levels differ while baby safety wins', () => {
  const playful = composePrompt({ ...defaults, intensity:'PLAYFUL' }).prompt
  const maxBaby = composePrompt({ ...defaults, age:'Newborn', intensity:'BOOMBOX MODE' }).prompt
  assert.match(playful,/colorful, imaginative, cheerful/i)
  assert.match(maxBaby,/maximum BOOMBOX creative imagination/i)
  assert.match(maxBaby,/keep posture, interaction, clothing construction, and anatomy developmentally accurate/i)
})

test('baby art style and palette remain creatively independent from developmental rules', () => {
  const result = composePrompt({ ...defaults, age:'0–3 Months', artStyle:'Teen streetwear editorial', palette:'Street neon' })
  assert.match(result.prompt,/under-18 streetwear editorial energy/i)
  assert.match(result.prompt,/electric cyan.*acid yellow and hot pink/i)
  assert.doesNotMatch(result.prompt,/soft baby pastels/i)
  assert.ok(!result.resolutions.some((item) => ['artStyle','palette'].includes(item.field)))
})

test('patch case 1: newborn BOOMBOX futuristic holographic oversized type stays bold and developmentally accurate', () => {
  const result = composePrompt({ ...defaults, age:'Newborn', intensity:'BOOMBOX MODE', fashion:'Futuristic', material:'Faux holographic', typography:'Dimensional type', palette:'Street neon' })
  assert.match(result.prompt,/newborn proportions/i)
  assert.match(result.prompt,/supported/i)
  assert.match(result.prompt,/maximum BOOMBOX creative imagination/i)
  assert.match(result.prompt,/spectral shift/i)
  assert.match(result.prompt,/simulated dimensional lettering/i)
  assert.match(result.prompt,/small garment canvas instead of deleting it/i)
  assert.doesNotMatch(result.prompt,/soft baby pastels|low visual complexity/i)
})

test('patch case 2: toddler EXTRA mixed media and dimensional type use controlled maximalism', () => {
  const result = composePrompt({ ...defaults, age:'Toddler', intensity:'EXTRA', artStyle:'Mixed media', typography:'Dimensional type' })
  assert.match(result.prompt,/toddler proportions/i)
  assert.match(result.prompt,/controlled maximalism/i)
  assert.match(result.prompt,/combination of two complementary media/i)
  assert.match(result.prompt,/simulated dimensional lettering/i)
})

test('patch case 3: Big Kids BOLD editorial streetwear is sophisticated without adultization', () => {
  const result = composePrompt({ ...defaults, age:'Big Kids', intensity:'BOLD', fashion:'Original streetwear', artStyle:'Fashion editorial illustration' })
  assert.match(result.prompt,/school-age proportions/i)
  assert.match(result.prompt,/composition drama, dimensionality/i)
  assert.match(result.prompt,/sophisticated youth-fashion graphics/i)
  assert.match(result.prompt,/without adultizing/i)
})

test('patch case 4: tween BOOMBOX treatment permits advanced fashion and faux materials without adult styling', () => {
  const result = composePrompt({ ...defaults, age:'Tweens', intensity:'BOOMBOX MODE', fashion:'Fashion-lab', artStyle:'Mixed media', material:'Faux chenille' })
  assert.match(result.prompt,/visibly pre-adult/i)
  assert.match(result.prompt,/fashion-editorial graphic thinking/i)
  assert.match(result.prompt,/looped yarn-like surface/i)
  assert.match(result.prompt,/without adultizing/i)
})

test('patch case 5: newborn neon graffiti lettering survives age resolution', () => {
  const result = composePrompt({ ...defaults, age:'Newborn', palette:'Street neon', typography:'Original graffiti lettering' })
  assert.match(result.prompt,/newborn proportions/i)
  assert.match(result.prompt,/electric cyan.*acid yellow and hot pink/i)
  assert.match(result.prompt,/original graffiti-inspired lettering/i)
  assert.doesNotMatch(result.prompt,/soft baby pastels/i)
})

test('tween and teen direction remains explicitly under-adult', () => {
  assert.match(composePrompt({ ...defaults, age:'Tweens' }).prompt,/without adult styling/i)
  assert.match(composePrompt({ ...defaults, age:'Teens 13–17' }).prompt,/clearly under age 18/i)
})

test('materials change surface, edge, light, and production language', () => {
  const chenille = composePrompt({ ...defaults, material:'Faux chenille' }).prompt
  const holo = composePrompt({ ...defaults, material:'Faux holographic' }).prompt
  assert.match(chenille,/looped yarn-like surface/i)
  assert.match(holo,/spectral shift/i)
  assert.notEqual(chenille,holo)
})

test('DTF resolves incompatible all-over composition', () => {
  const result = composePrompt({ ...defaults, production:'DTF', composition:'All-over composition' })
  assert.match(result.prompt,/dominant back statement/i)
  assert.ok(result.resolutions.some((item) => item.field === 'composition'))
})

test('text and unrequested-element purity guardrails are explicit', () => {
  const prompt = composePrompt({ ...defaults, phrase:'ONLY THIS!' }).prompt
  assert.match(prompt,/This is the only text/i)
  assert.match(prompt,/add no crowns, stars, hearts/i)
  assert.match(prompt,/“ONLY THIS!”/)
})

test('intelligent Shake creates compatible novel choices', () => {
  const recent = []
  const first = intelligentShake({ ...defaults, age:'Newborn' },new Set(['age']),recent)
  const second = intelligentShake({ ...defaults, age:'Newborn' },new Set(['age']),recent)
  assert.equal(first.age,'Newborn')
  assert.ok(['Bodysuit'].includes(first.product))
  assert.equal(recent.length,2)
  assert.notDeepEqual(first,second)
})

test('shake preserves locks and tracks generated combinations', () => {
  const history = new Set()
  const result = shake(defaults, new Set(['age', 'phrase']), history)
  assert.equal(result.age, defaults.age)
  assert.equal(result.phrase, defaults.phrase)
  assert.equal(history.size, 1)
})

test('Match My Mini creates coordinated non-identical looks', () => {
  const result = buildMatchMini(defaults)
  assert.match(result.prompt, /LOOK ONE:/)
  assert.match(result.prompt, /LOOK TWO:/)
  assert.match(result.direction, /non-identical/i)
  assert.match(result.prompt, /without assuming gender, ethnicity, or biological relationship/i)
})

test('Outfit Builder provides placement-aware multiple garment direction', () => {
  const result = buildOutfit({ ...defaults, outfit: 'Hoodie + joggers' })
  assert.match(result.prompt, /GARMENT 1 — HOODIE/)
  assert.match(result.prompt, /GARMENT 2 — JOGGERS/)
  assert.match(result.prompt, /placement-aware direction/i)
  assert.match(result.prompt, /distribute the outfit's visual information/i)
})

test('Collection Builder forces varied prompts at requested count', () => {
  const result = buildCollection({ ...defaults, collectionCount: '6' })
  assert.equal((result.prompt.match(/COLLECTION PROMPT/g) || []).length, 6)
  assert.match(result.direction, /not recolors/i)
  assert.deepEqual(result.items.slice(0,5).map((item)=>item.settings.intensity),['PLAYFUL','POPPIN’','BOLD','EXTRA','BOOMBOX MODE'])
})

test('Remix preserves source and exact phrase', () => {
  const source = 'A toddler tee with exact phrase “LOUD & KIND!” and a star mascot.'
  const result = remixPrompt(source, ['Make it more fashion-forward', 'DTF optimization'])
  assert.match(result.prompt, /LOUD & KIND!/) 
  assert.match(result.prompt, /Preserve the central concept/i)
  assert.match(result.prompt, /scale, typography interaction, composition, dimensionality/i)
  assert.match(result.prompt, /not by piling on props/i)
  assert.equal(result.production, 'DTF')
})

test('locked shell exposes all six modes and nine quick controls', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.equal((html.match(/data-mode=/g) || []).length, 6)
  assert.equal((html.match(/data-control=/g) || []).length, 9)
  for (const mode of ['Build with BooBoo','Shake the Box','Match My Mini','Outfit Builder','Collection Builder','Remix My Prompt']) assert.match(html, new RegExp(`data-mode="${mode}"`))
})

test('Phase 2 contains no image generation feature or API', async () => {
  const files = ['../index.html','../app.js','../ui/workspace.js']
  const source = (await Promise.all(files.map((file) => readFile(new URL(file,import.meta.url),'utf8')))).join('\n')
  assert.doesNotMatch(source, /GENERATE IMAGE|CREATE ARTWORK|MAKE IMAGE|image api|openai/i)
})

test('responsive workspace rules cover tablet and mobile', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8')
  assert.match(css, /@media \(max-width:820px\)/)
  assert.match(css, /@media \(max-width:520px\)/)
  assert.match(css, /\.booboo-guide\{display:grid/)
})

test('Phase 3 UI exposes intensity and context-sensitive mascot controls', async () => {
  const source = await readFile(new URL('../ui/workspace.js', import.meta.url), 'utf8')
  assert.match(source,/CREATIVE INTENSITY/)
  assert.match(source,/ORIGINAL MASCOT TYPE/)
  assert.match(source,/Human hairstyle controls are not applied/)
})
