import { composePrompt } from './promptComposer.js'

const culturalOccasions = /Lunar New Year|Ramadan|Eid|Holi|Passover|Día de los Muertos|Diwali|Hanukkah|Kwanzaa|Juneteenth|Pride/i

export function occasionName(state={}) {
  const selected=state.specialOccasion === 'Custom' ? String(state.customOccasion || '').trim() : state.specialOccasion
  return selected || 'Special celebration'
}

export function buildSpecialOccasion(state={}) {
  const occasion=occasionName(state)
  const birthday=/birthday/i.test(occasion)
  const age=birthday && String(state.birthdayAge || '').trim() ? String(state.birthdayAge).trim() : ''
  const occasionLabel=age ? `${occasion} — age ${age}` : occasion
  const respect=culturalOccasions.test(occasion)
    ? 'Use only respectful, contextually appropriate visual language for the selected celebration. Do not combine unrelated traditions, invent sacred symbols or scripture, caricature a culture or religion, or infer the character’s identity from the occasion.'
    : 'Use celebration details intentionally and avoid generic piles of unrelated holiday props.'
  const result=composePrompt(state,{specialOccasion:occasion,birthdayAge:age,coordination:`special-occasion capsule for ${occasionLabel}. ${respect}`})
  return {...result,title:`${occasionLabel} — ${result.product}`,direction:`An age-appropriate ${occasionLabel} apparel concept with original celebratory art direction and DTF-ready execution.`}
}
