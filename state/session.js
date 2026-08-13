import { defaults, options } from '../data/options.js'

export const DRAFT_KEY='boombox-kids-phase6-draft'
export const PREFERENCES_KEY='boombox-kids-phase6-preferences'
export const INTRO_KEY='boombox-kids-phase6-intro-complete'
const modes=['Build with BooBoo','Shake the Box','Match My Mini','Outfit Builder','Collection Builder','Remix My Prompt']
const read=(storage,key)=>{try{return JSON.parse(storage?.getItem(key)||'null')}catch{return null}}

export function normalizePreferences(raw={}) {
  const value=raw&&typeof raw==='object'?raw:{}
  return {production:options.production.includes(value.production)?value.production:defaults.production,intensity:options.intensity.includes(value.intensity)?value.intensity:defaults.intensity,age:options.age.includes(value.age)?value.age:defaults.age,product:options.product.includes(value.product)?value.product:defaults.product,reducedMotion:Boolean(value.reducedMotion)}
}
export const loadPreferences=(storage=globalThis.localStorage)=>normalizePreferences(read(storage,PREFERENCES_KEY))
export const savePreferences=(preferences,storage=globalThis.localStorage)=>{const value=normalizePreferences(preferences);storage?.setItem(PREFERENCES_KEY,JSON.stringify(value));return value}

export function normalizeDraft(raw) {
  if(!raw||typeof raw!=='object'||!modes.includes(raw.mode)||!raw.state||typeof raw.state!=='object')return null
  if(!options.age.includes(raw.state.age)||!options.product.includes(raw.state.product))return null
  const step=Number(raw.step)
  if(!Number.isInteger(step)||step<0||step>30)return null
  return {version:1,mode:raw.mode,step,state:{...defaults,...raw.state},updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:new Date().toISOString()}
}
export const loadDraft=(storage=globalThis.localStorage)=>normalizeDraft(read(storage,DRAFT_KEY))
export const saveDraft=(draft,storage=globalThis.localStorage)=>{const value=normalizeDraft({...draft,updatedAt:new Date().toISOString()});if(value)storage?.setItem(DRAFT_KEY,JSON.stringify(value));return value}
export const clearDraft=(storage=globalThis.localStorage)=>storage?.removeItem(DRAFT_KEY)
export const introComplete=(storage=globalThis.localStorage)=>storage?.getItem(INTRO_KEY)==='true'
export const completeIntro=(storage=globalThis.localStorage)=>storage?.setItem(INTRO_KEY,'true')
export function exportSession(storage=globalThis.localStorage){return {preferences:loadPreferences(storage),draft:loadDraft(storage),introComplete:introComplete(storage)}}
export function importSession(raw,storage=globalThis.localStorage){if(!raw||typeof raw!=='object')return;savePreferences(raw.preferences,storage);const draft=normalizeDraft(raw.draft);if(draft)saveDraft(draft,storage);if(raw.introComplete)completeIntro(storage)}
