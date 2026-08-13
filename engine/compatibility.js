import { isHumanCharacter, isMascotCharacter } from '../data/characters.js'
import { garmentDirection } from '../data/garments.js'

export function resolveCompatibility(input) {
  const selections = { ...input }
  const notes = []
  if (isMascotCharacter(selections.character) && selections.hairstyle && selections.hairstyle !== 'Not specified') {
    notes.push({ field:'hairstyle', from:selections.hairstyle, to:'Not applicable to mascot', reason:'human-only control suppressed' })
    selections.hairstyle = 'Not specified'
  }
  const garment = garmentDirection(selections.product, selections.placement)
  selections.resolvedPlacement = garment.direction
  if (selections.production === 'DTF' && selections.composition === 'All-over composition') {
    notes.push({ field:'composition', from:'All-over composition', to:'Large back graphic with small front accent', reason:'DTF production compatibility' })
    selections.composition = 'Large back graphic with small front accent'
  }
  return { selections, notes }
}
