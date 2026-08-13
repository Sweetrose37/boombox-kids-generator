import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { defaults } from '../data/options.js'
import { composePrompt } from '../engine/promptComposer.js'
import { intelligentShake } from '../engine/shakeLogic.js'
import { buildMatchMini } from '../engine/matchMiniLogic.js'
import { buildOutfit } from '../engine/outfitLogic.js'
import { buildCollection } from '../engine/collectionLogic.js'
import { remixPrompt } from '../engine/remixLogic.js'
import { resolveAgePriorities } from '../engine/ageLogic.js'
import { resolveCompatibility } from '../engine/compatibility.js'
import { WorkspaceRepository } from '../workspace/repository.js'
import { clearDraft, completeIntro, exportSession, importSession, introComplete, loadDraft, loadPreferences, saveDraft, savePreferences } from '../state/session.js'

class MemoryStorage { constructor(){this.map=new Map()}getItem(key){return this.map.has(key)?this.map.get(key):null}setItem(key,value){this.map.set(key,String(value))}removeItem(key){this.map.delete(key)} }

test('Phase 6 session draft validates, restores, and clears independently',()=>{
  const storage=new MemoryStorage(),draft={mode:'Build with BooBoo',step:5,state:{...defaults,age:'Tweens',phrase:'EXACT BEAT',phraseMode:'manual'}}
  saveDraft(draft,storage)
  assert.equal(loadDraft(storage).step,5)
  assert.equal(loadDraft(storage).state.phrase,'EXACT BEAT')
  assert.equal(loadDraft(storage).state.phraseMode,'manual')
  storage.setItem('boombox-kids-phase6-draft','{"mode":"broken"}')
  assert.equal(loadDraft(storage),null)
  saveDraft(draft,storage);clearDraft(storage);assert.equal(loadDraft(storage),null)
})

test('legacy drafts migrate CREATE LOUD to automatic wording and preserve custom phrases',()=>{
  const storage=new MemoryStorage()
  storage.setItem('boombox-kids-phase6-draft',JSON.stringify({mode:'Build with BooBoo',step:5,state:{...defaults,phrase:'CREATE LOUD',phraseMode:undefined}}))
  assert.equal(loadDraft(storage).state.phraseMode,'auto');assert.equal(loadDraft(storage).state.phrase,'')
  storage.setItem('boombox-kids-phase6-draft',JSON.stringify({mode:'Build with BooBoo',step:5,state:{...defaults,phrase:'MY LEGACY WORDS',phraseMode:undefined}}))
  assert.equal(loadDraft(storage).state.phraseMode,'manual');assert.equal(loadDraft(storage).state.phrase,'MY LEGACY WORDS')
})

test('preferences and intro state are local, normalized, and backup-compatible',()=>{
  const source=new MemoryStorage(),target=new MemoryStorage()
  savePreferences({age:'Big Kids',product:'Hoodie',production:'Sublimation',intensity:'BOLD'},source);completeIntro(source)
  importSession(exportSession(source),target)
  assert.deepEqual(loadPreferences(target),{age:'Big Kids',product:'Hoodie',production:'Sublimation',intensity:'BOLD',reducedMotion:false})
  assert.equal(introComplete(target),true)
  target.setItem('boombox-kids-phase6-preferences','not-json');assert.equal(loadPreferences(target).age,defaults.age)
})

test('all six modes produce compatible prompt output architecture',()=>{
  const state={...defaults,phrase:'KEEP THIS EXACT',phraseMode:'manual'}
  const shaken=intelligentShake(state,new Set(['phrase']),[])
  const outputs=[composePrompt(state),composePrompt(shaken),buildMatchMini(state),buildOutfit(state),buildCollection({...state,collectionCount:'4'}),remixPrompt(composePrompt(state).prompt,['Stronger concept'])]
  outputs.forEach((item)=>{assert.equal(typeof item.title,'string');assert.equal(typeof item.direction,'string');assert.equal(typeof item.prompt,'string');assert.ok(item.age);assert.ok(item.product);assert.equal(item.production,'DTF')})
})

test('all multi-design modes remain DTF-only even from a Sublimation state',()=>{
  const state={...defaults,production:'Sublimation'}
  for(const output of [buildMatchMini(state),buildOutfit(state),buildCollection({...state,collectionCount:'4'})]){
    assert.equal(output.production,'DTF')
    output.items.forEach((item)=>{assert.equal(item.production,'DTF');assert.match(item.prompt,/Mandatory DTF final deliverable/i);assert.match(item.prompt,/do not render the garment itself/i)})
  }
})

test('coordinated sets and collections preserve exact phrases in every item',()=>{
  const phrase='Keep My EXACT 2026!'
  for(const output of [buildMatchMini({...defaults,phrase,phraseMode:'manual'}),buildCollection({...defaults,phrase,phraseMode:'manual',collectionCount:'4'}),buildOutfit({...defaults,phrase,phraseMode:'manual'})]) {
    output.items.forEach((item)=>assert.match(item.prompt,new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))))
  }
})

test('automatic phrases vary throughout Match My Mini Outfit and Collection modes',()=>{
  for(const output of [buildMatchMini(defaults),buildOutfit(defaults),buildCollection({...defaults,collectionCount:'6'})]){
    const phrases=output.items.map((item)=>item.exactPhrase).filter(Boolean)
    assert.equal(phrases.length,output.items.length)
    assert.ok(new Set(phrases).size>1)
    phrases.forEach((phrase)=>assert.notEqual(phrase,'CREATE LOUD'))
  }
})

test('age conflicts translate across intensity and fashion cases',()=>{
  const newborn=composePrompt({...defaults,age:'Newborn',pose:'Dancing',intensity:'BOOMBOX MODE'})
  assert.match(newborn.prompt,/supported gentle rhythmic wiggle/i)
  assert.match(newborn.prompt,/newborn proportions/i)
  assert.equal(resolveAgePriorities({...defaults,age:'Toddler',pose:'Runway pose'}).selections.pose,'playful confident walking movement with toddler balance')
  assert.equal(resolveAgePriorities({...defaults,age:'Tweens',fashion:'Adult glamour'}).selections.fashion,'Bold artistic')
  assert.match(composePrompt({...defaults,age:'Teens 13â€“17',fashion:'Casual elevated'}).prompt,/clearly under age 18|teen proportions/i)
})

test('character compatibility suppresses human hair without losing phrase',()=>{
  const state={...defaults,character:'Original animal mascot',hairstyle:'Braids',phrase:'MY EXACT WORDS',phraseMode:'manual'}
  const resolved=resolveCompatibility(state)
  assert.equal(resolved.selections.hairstyle,'Not specified')
  assert.equal(resolved.selections.phrase,'MY EXACT WORDS')
  assert.equal(resolveCompatibility({...state,character:'Original human character'}).selections.hairstyle,'Braids')
})

test('full mode outputs save as independent prompts and groups without overwrites',()=>{
  const storage=new MemoryStorage(),repository=new WorkspaceRepository(storage),state={...defaults,phrase:'ORIGINAL EXACT',phraseMode:'manual'}
  const match=repository.saveOutput(buildMatchMini(state),state,'Match My Mini')
  const outfit=repository.saveOutput(buildOutfit(state),state,'Outfit Builder')
  const collection=repository.saveOutput(buildCollection({...state,collectionCount:'4'}),state,'Collection Builder')
  assert.equal(repository.data.matchGroups.length,1);assert.equal(repository.data.outfitSets.length,1);assert.equal(repository.data.collections.length,1)
  const ids=repository.data.prompts.map((item)=>item.id);assert.equal(new Set(ids).size,ids.length)
  const original=match.records[0],remix=remixPrompt(original.prompt,['Stronger concept']);repository.createPrompt(remix,state,'Remix My Prompt',{sourcePromptId:original.id})
  assert.equal(repository.findPrompt(original.id).prompt,original.prompt)
  assert.ok(outfit.group.promptIds.length>=2);assert.equal(collection.group.promptIds.length,4)
})

test('Phase 6 UI exposes onboarding, help, draft, production returns, and mobile access',async()=>{
  const [html,app,ui,css]=await Promise.all(['../index.html','../app.js','../ui/workspace.js','../styles.css'].map((path)=>readFile(new URL(path,import.meta.url),'utf8')))
  for(const text of ['START CREATING','QUICK GUIDE','CONTINUE BUILDING','START FRESH','THE FINISHED PRODUCT IS THE PROMPT'])assert.match(html,new RegExp(text))
  assert.match(app,/workspace\.continueDraft/);assert.match(app,/data-open-guide/)
  for(const text of ['YOUR PRODUCTION PROMPT IS READY','OPEN IN PRODUCTION CENTER','ADD TO COLLECTION','RETURN TO PROMPT','SAVE FULL COLLECTION','SAVE OUTFIT SET','SAVE COORDINATED SET'])assert.match(ui,new RegExp(text))
  assert.match(css,/\.phase6-overlay/);assert.match(css,/@media\(max-width:520px\).*phase6-dialog/s)
})

test('creation and Quick Build cards reflow before laptop-width content can overlap',async()=>{
  const css=await readFile(new URL('../styles.css',import.meta.url),'utf8')
  assert.match(css,/@media \(max-width:1380px\)\{\.mode-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/)
  assert.match(css,/\.mode-card footer span\{display:block;min-width:0;max-width:100%;overflow-wrap:anywhere\}/)
  assert.match(css,/\.quick-build\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}/)
  assert.match(css,/@media \(max-width:520px\).*\.mode-card\{height:290px/s)
  assert.match(css,/\.mode-card h2\{position:absolute;left:26px;top:38px;width:54%/)
  assert.match(css,/\.mode-card footer\{left:16px;right:16px;bottom:16px;min-height:88px/)
})

test('site footer permanently credits Crown & Craft Studio across responsive layouts',async()=>{
  const [html,css]=await Promise.all(['../index.html','../styles.css'].map((path)=>readFile(new URL(path,import.meta.url),'utf8')))
  assert.match(html,/class="studio-credit"/)
  assert.match(html,/POWERED BY/)
  assert.match(html,/CROWN &amp; CRAFT STUDIO/)
  assert.match(css,/\.studio-credit\{flex:1 0 100%/)
  assert.match(css,/@media \(max-width:520px\).*\.studio-credit\{width:100%;flex-basis:auto/s)
})

test('human character UI exposes persistent ethnicity and custom cultural background controls',async()=>{
  const [optionsSource,ui]=await Promise.all(['../data/options.js','../ui/workspace.js'].map((path)=>readFile(new URL(path,import.meta.url),'utf8')))
  assert.match(optionsSource,/ethnicity: \['Not specified'.*'Surprise Me', 'Custom'\]/)
  assert.match(optionsSource,/\['ethnicity', 'ETHNICITY \/ CULTURAL BACKGROUND'\]/)
  assert.match(ui,/CUSTOM CULTURAL BACKGROUND/)
  assert.match(ui,/isHumanCharacter\(state\.character\).*field\('ethnicity'/s)
})

test('Shake UI explains automatic replacement and lock protection',async()=>{
  const ui=await readFile(new URL('../ui/workspace.js',import.meta.url),'utf8')
  assert.match(ui,/Every shake replaces the previous unlocked art style, typography, and composition/)
  assert.match(ui,/Lock what you love before shaking/)
})
