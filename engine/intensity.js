const directions = {
  PLAYFUL: 'Keep the creative volume clean, colorful, fun, imaginative, and easy to read, with lively kid energy and one clear focal move.',
  'POPPIN’': 'Increase movement, type interaction, bright color relationships, and rhythmic supporting details while maintaining a clear focal hierarchy.',
  BOLD: 'Use a bigger silhouette, stronger material zoning, confident typography scale, and a more dynamic layout with garment-distance readability.',
  EXTRA: 'Layer complementary materials, dramatic exact typography, and energetic composition with disciplined zoning and no visual clutter.',
  'BOOMBOX MODE': 'Turn creative volume to maximum through fearless silhouette, vivid curated color, dramatic exact type, inventive fashion construction, and controlled multi-layer depth while remaining age-appropriate, readable, and production-minded.',
}

export function intensityDirection(level='PLAYFUL', age='Toddler') {
  const safety = ['Newborn','0–3 Months','3–6 Months','6–12 Months'].includes(age) ? ' For this baby age, express intensity through color rhythm and graphic scale only—not mature posing, complex accessories, or overloaded detail.' : ''
  return `${directions[level] || directions.PLAYFUL}${safety}`
}
