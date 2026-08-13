export const agePrintRanges = {
  Newborn:'2.5–4 in', '0–3 Months':'2.5–4 in', '3–6 Months':'3–5 in', '6–12 Months':'3–5 in', Infant:'3–5 in', Toddler:'5–7 in',
  'Little Kids':'6–8 in', 'Big Kids':'7–9.5 in', Tweens:'8–10.5 in', 'Teens 13–17':'9–12 in',
}

export const garmentZones = {
  Bodysuit:['center chest','small upper back'], 'Baby tee':['center front','small upper back'], 'T-shirt':['center front','full back','left chest','right chest','sleeve'],
  Raglan:['center front','upper back','contrast sleeve'], Tank:['center front','upper back'], Sweatshirt:['center front','full back','left chest','sleeve'],
  Hoodie:['center front','full back','left chest','sleeve','hood','pocket area'], Crewneck:['center front','full back','left chest','sleeve'],
  'Varsity jacket':['jacket back','left chest','right chest','sleeve'], 'Bomber jacket':['jacket back','left chest','sleeve'], 'Denim jacket':['back panel','left chest','sleeve'],
  Dress:['bodice','skirt front panel','side panel','hem border','all-over'], Skirt:['front panel','side panel','hem border','all-over'], Skort:['front panel','side panel','hem border'],
  Shorts:['upper leg','lower leg','side leg','small accent'], Joggers:['upper leg','lower leg','side leg','small accent'], Leggings:['side leg','lower leg','all-over'], Jeans:['upper leg','pocket','lower leg'], 'Cargo pants':['upper leg','pocket','side leg'],
  Romper:['center front','small upper back','all-over'], Overalls:['bib','pocket','leg panel'], 'Matching set':['top hero zone','bottom support zone','small shared accent'],
  Tracksuit:['chest','jacket back','sleeve','upper leg','side leg'], Pajamas:['center front','all-over'], Outerwear:['jacket back','left chest','sleeve'],
  Hat:['front panel','side panel'], Bag:['front panel','pocket'], Shoes:['side panel','heel accent'], Accessories:['main face','small accent'],
}

const materialRules = {
  'Faux chenille':'Keep chenille loops broad, simplified, and visibly separated; tiny loops will collapse at small print scale.',
  'Faux rhinestones':'Use fewer, larger simulated stones with deliberate spacing; this is a printed visual effect, not applied rhinestones.',
  'Faux puff ink':'Use broad raised-looking shapes and preserve open gaps; this simulates dimensional puff and does not specify physical ink height.',
  'Faux embroidery':'Use bold stitch-like bands and simplified thread direction; this is visual simulation, not an embroidery machine file.',
  'Faux sequins':'Use large, separated sequin highlights and avoid dense micro-patterns; this is a printed simulation.',
  'Faux holographic':'Use controlled iridescent highlight zones with strong base contrast; printed appearance varies by vendor and substrate.',
  'Faux reflective':'Use broad high-contrast reflective-looking zones; this does not guarantee reflective material performance.',
  'Faux flock velvet':'Use large soft-edged velvet-like masses without tiny islands; this is a visual simulation.',
  'Faux felt':'Use substantial cut-felt shapes with simple edges; standard printing only simulates felt texture.',
  'Faux leather':'Use broad grain and highlight cues without micro-texture; standard printing does not create physical leather.',
  'Faux rubber silicone':'Use thick clean edges and broad molded-looking highlights; this is printed visual simulation, not applied rubber or silicone.',
  'Faux foil metallic':'Use bold metallic-looking highlight areas with reliable contrast; a standard print does not guarantee real foil reflectivity.',
  'Gel jelly effect':'Use substantial translucent shapes and broad highlights rather than tiny glints; this visually simulates gel or jelly.',
  'Faux toy plastic':'Use broad molded planes, clean specular highlights, and simplified seams; this is visual simulation.',
  'Faux patchwork':'Use large readable fabric sections and substantial faux seams; this is printed simulation rather than assembled fabric.',
}

const normalizeAge = (age='') => Object.keys(agePrintRanges).find((key)=>key.toLowerCase()===String(age).toLowerCase()) || (String(age).toLowerCase().includes('teen')?'Teens 13–17':String(age).toLowerCase().includes('tween')?'Tweens':String(age).toLowerCase().includes('big')?'Big Kids':String(age).toLowerCase().includes('little')?'Little Kids':String(age).toLowerCase().includes('toddler')?'Toddler':String(age).toLowerCase().includes('newborn')?'Newborn':String(age).toLowerCase().includes('month')?'Infant':'Toddler')
export const printRangeForAge = (age) => agePrintRanges[normalizeAge(age)]

export function validZones(product='T-shirt') {
  return garmentZones[product] || (String(product).toLowerCase().includes('jacket') ? garmentZones['Varsity jacket'] : ['center front','full back'])
}

export function zoneHierarchy(product, selected=[]) {
  const valid=validZones(product), unique=[...new Set(selected)].filter((zone)=>valid.includes(zone))
  const chosen=unique.length ? unique : [valid[0]]
  return chosen.map((zone,index)=>({ zone, role:index===0?'HERO':index===1?'SUPPORT':'ACCENT', direction:index===0?'primary artwork':index===1?'smaller coordinated support graphic':'small motif or typography accent' }))
}

export function typographyWarnings(phrase='', typography='') {
  const warnings=[]
  if (String(phrase).trim().length > 24 || String(phrase).trim().split(/\s+/).length > 4) warnings.push('Long exact phrase: test at final garment size and preserve the wording exactly; increase space or simplify surrounding artwork instead of rewriting it.')
  if (/thin|script|hand-drawn|serif|condensed|inline|stacked/i.test(typography)) warnings.push('Fine, condensed, inline, or tightly stacked letterforms may close up at small print scale; proof the exact lettering at final size.')
  return warnings
}

export function productionMethodGuidance(method='DTF', product='T-shirt', age='Toddler') {
  if (/sublimation/i.test(method)) return 'SUBLIMATION: fuller backgrounds, repeating motifs, broader textures, all-over color, and panel-aware composition are possible. Plan for the vendor’s exact blank, manufacturer template, bleed, seams, collars, cuffs, and panel transitions. A master canvas is not a universal garment template; confirm specifications before production.'
  const small=/newborn|month|infant|toddler/i.test(`${age}`) || /bodysuit|baby/i.test(product)
  return `DTF: favor isolated transparent-background artwork, a cohesive silhouette, clean printable edges, strong contrast, substantial important lines, controlled micro-detail, grouped decoration, exact typography, and intentional negative space. Pixel dimensions alone do not make artwork DTF-ready.${small?' For this smaller garment, reduce heavy ink coverage and avoid a large solid print plate; tiny lettering, stones, fine outlines, micro-halftones, particles, collage pieces, facial details, fibers, and objects can disappear after reduction.':''}`
}

export function outfitPlacementGuidance(outfit='') {
  const garments=String(outfit).split(/\s*\+\s*/).filter(Boolean)
  return garments.length>1 ? garments.map((garment,index)=>`${garment}: ${index===0?'hero placement':'smaller coordinated support placement'} sized independently for its own printable area`).join('; ') : 'Size every garment placement independently; do not reuse one full-scale graphic across unequal print zones.'
}

export function matchMiniSizingGuidance(items=[]) {
  return items.map((item,index)=>`${item.age || `Look ${index+1}`} / ${item.product || 'garment'}: ${printRangeForAge(item.age)}, adjusted for its printable zone and artwork aspect ratio`).join('; ')
}

export function buildProductionGuidance(input={}) {
  const { age='Toddler', product='T-shirt', production='DTF', material='None', zones=[], phrase='', typography='', composition='', intensity='', mode='', outfit='', dimensions }=input
  const hierarchy=zoneHierarchy(product,zones)
  const warnings=typographyWarnings(phrase,typography)
  const size=`Start around ${printRangeForAge(age)} wide for ${age}; this is planning guidance, not a universal print specification.`
  const placement=hierarchy.map(({role,zone,direction})=>`${role}: ${zone} (${direction})`).join('; ')
  const canvas=dimensions ? `Master canvas ${dimensions.width} × ${dimensions.height}px (${dimensions.ratio}, ${dimensions.orientation}) equals approximately ${dimensions.physicalWidth} × ${dimensions.physicalHeight} in at ${dimensions.ppi} PPI. Canvas size is not the same as visible artwork bounds; measure transparent margins separately.` : ''
  const special=/outfit/i.test(mode)?outfitPlacementGuidance(outfit):/match/i.test(mode)?'Scale each coordinated look independently by wearer age, garment, composition, aspect ratio, and selected zone.':/collection/i.test(mode)?'Keep one high-resolution master artwork, then create separate final placement files for every garment and zone.':''
  const materialNote=materialRules[material] || (material && material!=='None' ? `${material}: treat this as a scale-aware visual simulation unless a production vendor specifies a physical process.` : 'No faux-material simulation selected.')
  const metadataNote=[composition&&`Composition: preserve the selected ${composition} while keeping the hero/support/accent hierarchy readable at garment scale.`,intensity&&`Creative Intensity: ${intensity}; retain its energy without allowing micro-detail to overwhelm the final print size.`].filter(Boolean).join(' ')
  return { size, placement, canvas, method:productionMethodGuidance(production,product,age), material:materialNote, special, warnings, hierarchy, text:[size,placement,canvas,productionMethodGuidance(production,product,age),materialNote,metadataNote,special,...warnings].filter(Boolean).join(' ') }
}

export function appendProductionGuidance(prompt, guidance) {
  return `${String(prompt).trim()}\n\nPRODUCTION PLANNING GUIDANCE (educational planning only; confirm final specifications with your print vendor):\n${guidance.text}`
}
