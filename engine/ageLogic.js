import { ageIntelligence } from '../data/ages.js'
import { options } from '../data/options.js'

export const ageProfiles = Object.fromEntries(Object.entries(ageIntelligence).map(([age,p]) => [age, `${p.body}, ${p.posture}, ${p.actions}, ${p.fashion}, ${p.accessories}, ${p.placement}, expressions appropriate to ${p.expressions}, and safe interaction limited to ${p.objects}`]))

function normalizedAge(age='') {
  if(ageIntelligence[age])return age
  const value=String(age).toLowerCase()
  if(value.includes('teen'))return Object.keys(ageIntelligence).find((key)=>key.toLowerCase().includes('teen'))
  if(value.includes('tween'))return 'Tweens'
  if(value.includes('big'))return 'Big Kids'
  if(value.includes('little'))return 'Little Kids'
  if(value.includes('toddler'))return 'Toddler'
  if(value.includes('newborn'))return 'Newborn'
  const months=value.match(/(0|3|6).*?(3|6|12)/)
  return months?Object.keys(ageIntelligence).find((key)=>key.includes(months[1])&&key.includes(months[2])):'Toddler'
}
export function ageDirection(age) {
  return ageProfiles[normalizedAge(age)] || ageProfiles.Toddler
}

const babyProducts = ['Bodysuit', 'Baby tee']
const youthProducts = options.product.filter((product) => !babyProducts.includes(product))

const priorityRules = {
  Newborn: { products: ['Bodysuit'], pose: 'Supported restful pose', sizing: 'Baby-safe placement' },
  '0–3 Months': { products: babyProducts, pose: 'Supported restful pose', sizing: 'Baby-safe placement' },
  '3–6 Months': { products: babyProducts, pose: 'Supported seated pose', sizing: 'Baby-safe placement' },
  '6–12 Months': { products: [...babyProducts, 'T-shirt'], pose: 'Stable seated or crawling-friendly play pose', sizing: 'Baby-safe placement' },
  Toddler: { products: youthProducts, sizing: 'Toddler-proportioned placement' },
  'Little Kids': { products: youthProducts, sizingFallback: 'Standard youth fit' },
  'Big Kids': { products: youthProducts, sizingFallback: 'Standard youth fit' },
  Tweens: { products: youthProducts, sizingFallback: 'Relaxed youth fit' },
  'Teens 13–17': { products: youthProducts, sizingFallback: 'Standard youth fit' },
}

const infantAges = ['Newborn','0–3 Months','3–6 Months','6–12 Months']
function translatedPose(age, requested) {
  const value = (requested || '').toLowerCase()
  if (age === 'Newborn') {
    if (value.includes('danc')) return 'supported gentle rhythmic wiggle with musical energy'
    if (value.includes('stand') || value.includes('walk') || value.includes('jump') || value.includes('skat')) return 'supported reclined or safely held pose that preserves the requested energetic mood'
  }
  if (infantAges.includes(age) && (value.includes('jump') || value.includes('skat') || value.includes('walk') || value.includes('stand'))) return 'stable supported baby movement that preserves the requested action energy'
  if (age === 'Toddler' && (value.includes('runway') || value.includes('editorial'))) return 'playful confident walking movement with toddler balance'
  if (age === 'Little Kids' && (value.includes('couture') || value.includes('adult'))) return 'age-appropriate playful fashion pose'
  return requested
}

export function resolveAgePriorities(input) {
  const selections = { ...input }
  const age = normalizedAge(selections.age || 'Toddler')
  selections.age=age
  const rules = priorityRules[age] || priorityRules.Toddler
  const resolutions = []
  const replace = (key, value, reason) => {
    if (selections[key] !== value) resolutions.push({ field: key, from: selections[key], to: value, reason })
    selections[key] = value
  }

  if (!rules.products.includes(selections.product)) replace('product', rules.products[0], `${age} product compatibility`)
  const interpretedPose = translatedPose(age, selections.pose)
  if (interpretedPose !== selections.pose) replace('pose', interpretedPose, `${age} action translated to a developmentally plausible equivalent`)
  else if (rules.poses && !rules.poses.includes(selections.pose)) replace('pose', rules.pose, `${age} movement and balance compatibility`)
  else if (rules.pose) replace('pose', rules.pose, `${age} developmental posing priority`)
  if (age === 'Tweens' && /adult|glamour|sexy|mature/i.test(selections.fashion || '')) replace('fashion','Bold artistic','tween fashion translated without adult styling')
  else if (age === 'Teens 13–17' && /adult|glamour|sexy|mature/i.test(selections.fashion || '')) replace('fashion','Casual elevated','teen fashion translated to remain clearly under age 18')
  if (rules.sizing) replace('sizing', rules.sizing, `${age} placement and fit priority`)
  if (rules.sizingFallback && ['Baby-safe placement', 'Toddler-proportioned placement'].includes(selections.sizing)) replace('sizing', rules.sizingFallback, `${age} placement and fit compatibility`)

  return { selections, resolutions }
}
