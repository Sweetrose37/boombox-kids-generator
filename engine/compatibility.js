import { ageIntelligence } from '../data/ages.js'
import { isHumanCharacter, isMascotCharacter } from '../data/characters.js'
import { garmentDirection } from '../data/garments.js'

export function resolveCompatibility(input) {
  const selections = { ...input }
  const notes = []
  if (isMascotCharacter(selections.character) && selections.hairstyle && selections.hairstyle !== 'Not specified') {
    notes.push({ field:'hairstyle', from:selections.hairstyle, to:'Not applicable to mascot', reason:'human-only control suppressed' })
    selections.hairstyle = 'Not specified'
  }
  if (isHumanCharacter(selections.character) && !selections.pose) selections.pose = ageIntelligence[selections.age]?.poses.split(', ')[0]
  const baby = ['Newborn','0–3 Months','3–6 Months','6–12 Months'].includes(selections.age)
  if (baby && ['Bold tween editorial','Teen streetwear editorial','Fashion illustration'].includes(selections.artStyle)) {
    notes.push({ field:'artStyle', from:selections.artStyle, to:'Soft baby illustration', reason:'age-appropriate style complexity' })
    selections.artStyle = 'Soft baby illustration'
  }
  if (baby && ['Street neon','Jewel pop','Monochrome + electric accent'].includes(selections.palette)) {
    notes.push({ field:'palette', from:selections.palette, to:'Soft baby pastels', reason:'palette softened and simplified for baby age' })
    selections.palette = 'Soft baby pastels'
  }
  const garment = garmentDirection(selections.product, selections.placement)
  selections.resolvedPlacement = garment.direction
  if (selections.production === 'DTF' && selections.composition === 'All-over composition') {
    notes.push({ field:'composition', from:'All-over composition', to:'Large back graphic with small front accent', reason:'DTF production compatibility' })
    selections.composition = 'Large back graphic with small front accent'
  }
  return { selections, notes }
}
