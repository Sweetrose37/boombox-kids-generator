export const fashionLibrary = {
  'Original streetwear': ['relaxed graphic layers and utility-inspired youth silhouettes','medium-high','black or neutral base with electric accents'],
  Sporty: ['clean athletic-inspired panels, piping, and movement-friendly shapes','medium','high-contrast energetic color blocking'],
  Preppy: ['fresh collars, neat layers, pleats, and original collegiate cues','medium','crisp coordinated colors'],
  'Soft playful': ['rounded silhouettes, gentle layers, and tactile-looking accents','low-medium','soft color with bright joyful accents'],
  Retro: ['period-inspired proportions reimagined without logos','medium','muted brights with warm accents'],
  'Y2K-inspired': ['playful futuristic youth shapes and graphic layering without branded cues','high','candy brights and cool metallic accents'],
  'Varsity-inspired': ['original team-energy panels, stripes, and letterform cues without sports marks','medium-high','sporty primary contrast'],
  'Skate-inspired': ['relaxed durable-looking layers and functional youth silhouettes','medium-high','earthy base with graphic accents'],
  'Dance-inspired': ['movement-led layering and rhythmic panel lines','medium-high','high-energy coordinated color'],
  'Music-inspired': ['rhythmic seams, sound-wave geometry, and expressive layers','medium-high','neon or jewel accents'],
  'Art-kid': ['creative smock cues, patch pockets, and expressive modular details','medium','unexpected curated color mixes'],
  Futuristic: ['clean modular panels and imaginative technical-looking details','high','cool brights with controlled reflective accents'],
  'Playful luxury': ['polished youth tailoring, rich texture simulation, and whimsical proportion','high','jewel tones with restrained metallic accent'],
  'Casual elevated': ['clean comfortable silhouettes with thoughtful construction details','medium','modern neutral plus bright accent'],
  Dressy: ['age-appropriate celebration silhouettes with comfortable construction','medium-high','refined color with playful highlights'],
  'Coordinated sets': ['related silhouettes with varied motif scale and placement','medium','shared palette with piece-specific emphasis'],
  'Fashion-lab': ['inventive modular youth construction and original experimental details','high','controlled unexpected color relationships'],
  'Playful casual': ['comfortable expressive basics with cheerful construction details','medium','bright balanced color'],
  'Soft boutique': ['gentle comfort-led silhouettes with restrained charming details','low-medium','soft pastels and warm neutrals'],
  'Bold artistic': ['graphic silhouettes and inventive youth construction','high','saturated artful contrast'],
  'Varsity-inspired': ['original team-energy panels and stripes without marks','medium-high','sporty primary contrast'],
}

export function fashionDirection(name) {
  const [silhouette='original expressive kidswear', intensity='medium', color='curated kid-forward color'] = fashionLibrary[name] || []
  return `${silhouette}; ${intensity} styling intensity; ${color}; use brand-free construction and accessories appropriate to the selected age`
}
