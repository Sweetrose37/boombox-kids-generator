const directions = {
  PLAYFUL: 'Make the creative volume colorful, imaginative, cheerful, clear, and lively, with one strong creative surprise.',
  'POPPIN’': 'Increase movement, scale contrast, typography interaction, energetic color relationships, and visual rhythm while maintaining a clear focal hierarchy.',
  BOLD: 'Increase silhouette strength, composition drama, dimensionality, confident typography scale, and purposeful graphic overlap with garment-distance readability.',
  EXTRA: 'Use controlled maximalism with stronger layering, coordinated material contrast, unexpected composition, expressive framing, and multiple intentional visual moments without random filler.',
  'BOOMBOX MODE': 'Use maximum BOOMBOX creative imagination: dramatic type architecture, exaggerated graphic scale, bold layering, dimensional faux materials, unusual but coherent compositions, energetic color relationships, surreal-but-safe visual metaphors, expressive pattern, strong foreground/background interaction, and fashion-editorial graphic thinking. Preserve age appropriateness, readability, production logic, and originality.',
}

export function intensityDirection(level='PLAYFUL', age='Toddler') {
  const safety = ['Newborn','0–3 Months','3–6 Months','6–12 Months'].includes(age) ? ' For this baby age, keep posture, interaction, clothing construction, and anatomy developmentally accurate; move creative motion into diagonal composition, type movement, shape direction, crop, overlap, scale, color rhythm, and foreground/background interaction before increasing body action. Bold palettes, expressive type, advanced art styles, and faux materials remain valid.' : ''
  return `${directions[level] || directions.PLAYFUL}${safety}`
}
