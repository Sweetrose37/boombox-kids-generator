import { composePrompt } from './promptComposer.js'
import { options } from '../data/options.js'

export function buildMatchMini(state) {
  const first = composePrompt(state, { coordination: `${state.relationship}; share theme, palette family, typography family, motif, and material direction while keeping each look distinct` })
  const ageIndex = options.age.indexOf(state.age)
  const alternate = { ...state, age: options.age[Math.min(options.age.length - 1, Math.max(0, ageIndex + 1))], product: state.product === 'T-shirt' ? 'Hoodie' : 'T-shirt', character: state.character === 'Original human character' ? 'Original animal mascot' : 'Original human character', pose: state.pose === 'Dancing' ? 'Walking with energy' : 'Dancing', composition: 'Dynamic diagonal composition', phrase: state.phrase }
  const second = composePrompt(alternate, { coordination: `companion look for ${state.relationship}; vary garment, phrase, pose, character styling, composition, and placement without assuming gender, ethnicity, or biological relationship` })
  const items=[{...first,title:`${state.relationship} — Look One`,settings:{...state}},{...second,title:`${state.relationship} — Look Two`,settings:alternate}]
  return { title: `Match My Mini™ — ${state.relationship}`, direction: 'Coordinated creative DNA with intentionally non-identical apparel direction.', prompt: `LOOK ONE: ${first.prompt}\n\nLOOK TWO: ${second.prompt}`, production: state.production, age: state.age, product: `${state.product} + ${alternate.product}`, items }
}
