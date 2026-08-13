import { composePrompt } from './promptComposer.js'

export function buildOutfit(state) {
  const parts = state.outfit.split(' + ').map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  const placement = state.placement || 'Front + sleeve accent'
  const items = parts.map((part, index) => { const settings={ ...state, product:part, composition:index ? 'Coordinated supporting composition' : state.composition }; return {...composePrompt(settings,{ placement:index ? `${placement}; supporting motif with restrained scale` : `${placement}; primary focal artwork` }),title:`${state.outfit} — ${part}`,settings} })
  return { title: `Outfit Builder — ${state.outfit}`, direction: 'A coordinated multi-garment look with placement-aware hierarchy and no visual overcrowding.', prompt: items.map((item, i) => `GARMENT ${i + 1} — ${parts[i].toUpperCase()}: ${item.prompt}`).join('\n\n'), production: state.production, age: state.age, product: state.outfit, items }
}
