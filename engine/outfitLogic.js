import { composePrompt } from './promptComposer.js'

export function buildOutfit(state) {
  const parts = state.outfit.split(' + ').map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  const placement = state.placement || 'Front + sleeve accent'
  const distribution = ['hero character and exact phrase as the dominant focal treatment','coordinated pattern rhythm and recurring motif with open breathing room','large back treatment with a small chest accent','one simplified recurring symbol']
  const items = parts.map((part, index) => { const settings={ ...state, product:part, composition:index ? 'Coordinated supporting composition' : state.composition }; return {...composePrompt(settings,{ phraseIndex:index, placement, coordination:`${distribution[index] || `supporting visual moment ${index + 1}`}; distribute the outfit's visual information instead of overloading one garment` }),title:`${state.outfit} — ${part}`,settings} })
  return { title: `Outfit Builder — ${state.outfit}`, direction: 'A coordinated multi-garment look with placement-aware hierarchy and no visual overcrowding.', prompt: items.map((item, i) => `GARMENT ${i + 1} — ${parts[i].toUpperCase()}: ${item.prompt}`).join('\n\n'), production: state.production, age: state.age, product: state.outfit, items }
}
