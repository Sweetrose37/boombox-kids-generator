const smallGarmentAges = new Set(['Newborn', '0–3 Months', '3–6 Months', '6–12 Months'])

export function creativeVolumeDirection(age, intensity = 'PLAYFUL') {
  const scaleTranslation = smallGarmentAges.has(age)
    ? 'Translate complexity for the small garment canvas instead of deleting it: use fewer but larger collage planes, broader readable fiber or stitch geometry, spaced gem clusters, larger letterforms, and move action energy into type, shape, crop, overlap, scale, and color rhythm rather than unrealistic body movement.'
    : age === 'Toddler'
      ? 'Keep toddler anatomy and movement believable while allowing wild readable typography, energetic silhouettes, oversized graphics, tactile simulations, bright color, controlled pattern, and funny visual metaphors in the surrounding graphic world.'
      : age === 'Big Kids' || age === 'Tweens' || age === 'Teens 13–17'
        ? 'Allow sophisticated youth-fashion graphics, editorial composition, expressive typography, mixed media, dimensional materials, bold asymmetry, unusual cropping, pattern, and controlled maximalism without adultizing the subject.'
        : 'Let sophistication come from graphic design, typography, composition, color, and materials while the depicted child remains developmentally accurate.'

  return `Developmental appropriateness and creative volume are independent: age controls anatomy, proportions, posture, movement, expression, garment construction, accessories, and safe interaction—not palette intensity, typography scale, material simulation, composition ambition, or art style. ${scaleTranslation} ${intensity === 'PLAYFUL' ? 'Keep the hierarchy clear and include one strong creative surprise.' : 'Use controlled maximalism: increase visual energy without visual chaos.'}`
}

export function controlledMaximalismCheck() {
  return 'Controlled-maximalism quality check: keep one clear hero, make every supporting element strengthen the concept, preserve exact readable typography, use clean occlusion and intentional negative space, zone simulated materials deliberately, retain garment-distance readability and believable garment construction, and rebalance hierarchy if density becomes unclear—do not flatten the whole concept. Maximal does not mean messy, and added energy must come from type, shape, color, material, composition, pattern, depth, scale, crop, rhythm, and visual metaphor rather than random filler props.'
}
