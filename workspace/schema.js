export const WORKSPACE_KEY = 'boombox-kids-phase4-workspace'
export const emptyWorkspace = () => ({ version:4, prompts:[], collections:[], matchGroups:[], outfitSets:[], recent:[] })
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
const text = (value, fallback='') => typeof value === 'string' ? value : fallback
const unique = (items) => [...new Set(Array.isArray(items) ? items.filter((item) => typeof item === 'string') : [])]

export function normalizePrompt(raw={}) {
  if (!raw || typeof raw !== 'object' || !text(raw.prompt || raw.finalPrompt)) return null
  const now = new Date().toISOString()
  return {
    id:text(raw.id) || uid(), title:text(raw.title,'Untitled Prompt').trim() || 'Untitled Prompt', designConcept:text(raw.designConcept || raw.direction),
    prompt:text(raw.prompt || raw.finalPrompt), exactPhrase:text(raw.exactPhrase), age:text(raw.age,'Not specified'), product:text(raw.product,'Not specified'), production:text(raw.production,'DTF'),
    intensity:text(raw.intensity,'PLAYFUL'), artStyle:text(raw.artStyle), character:text(raw.character), mascot:text(raw.mascot), typography:text(raw.typography), palette:text(raw.palette), material:text(raw.material),
    creationMode:text(raw.creationMode,'Build with BooBoo'), collectionIds:unique(raw.collectionIds), createdAt:text(raw.createdAt || raw.savedAt,now), modifiedAt:text(raw.modifiedAt || raw.savedAt,now), lastOpenedAt:text(raw.lastOpenedAt),
    favorite:Boolean(raw.favorite), notes:text(raw.notes), sourcePromptId:text(raw.sourcePromptId), settings:raw.settings && typeof raw.settings === 'object' ? { ...raw.settings } : {},
  }
}

export function normalizeGroup(raw={}, kind='collection') {
  if (!raw || typeof raw !== 'object') return null
  const now = new Date().toISOString()
  return { id:text(raw.id) || uid(), name:text(raw.name,kind === 'collection' ? 'Untitled Collection' : 'Untitled Set').trim() || 'Untitled Set', description:text(raw.description), promptIds:unique(raw.promptIds),
    relationship:text(raw.relationship), sharedDNA:text(raw.sharedDNA), sharedTheme:text(raw.sharedTheme), sharedPalette:text(raw.sharedPalette), sharedMotif:text(raw.sharedMotif), coordinatedProducts:text(raw.coordinatedProducts),
    age:text(raw.age), production:text(raw.production,'DTF'), intensity:text(raw.intensity,'PLAYFUL'), coordinationLogic:text(raw.coordinationLogic), notes:text(raw.notes), createdAt:text(raw.createdAt,now), modifiedAt:text(raw.modifiedAt,now) }
}

export function normalizeWorkspace(raw) {
  const fallback = emptyWorkspace()
  if (!raw || typeof raw !== 'object') return fallback
  const dedupe = (items, mapper) => { const ids=new Set(); return (Array.isArray(items)?items:[]).map(mapper).filter((item) => item && !ids.has(item.id) && ids.add(item.id)) }
  return { version:4, prompts:dedupe(raw.prompts,normalizePrompt), collections:dedupe(raw.collections,(item)=>normalizeGroup(item,'collection')), matchGroups:dedupe(raw.matchGroups,(item)=>normalizeGroup(item,'match')), outfitSets:dedupe(raw.outfitSets,(item)=>normalizeGroup(item,'outfit')), recent:unique(raw.recent).slice(0,30) }
}
