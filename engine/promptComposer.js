import { ageDirection, resolveAgePriorities } from './ageLogic.js'
import { resolveCompatibility } from './compatibility.js'
import { hairLibrary, humanDiversity, isHumanCharacter, isMascotCharacter, mascotLibrary } from '../data/characters.js'
import { fashionDirection } from '../data/fashion.js'
import { artStyleLibrary, compositionLibrary, materialDirection, paletteDirection, typographyLibrary } from '../data/visualIntelligence.js'
import { intensityDirection } from './intensity.js'
import { controlledMaximalismCheck, creativeVolumeDirection } from './creativeVolume.js'

const clean = (value, fallback) => value && value !== 'You Choose' ? value : fallback
const choose = (list, seed, offset=0) => list[(seed + offset) % list.length]
export const imageExecutionLock = 'Generate the image now from the instructions below exactly as written. Do not rewrite, summarize, simplify, reinterpret, improve, omit, substitute, or add creative details. Do not return a revised prompt or ask follow-up questions; create the image.'

export function composePrompt(input, context = {}) {
  const ageResolved = resolveAgePriorities(input)
  const compatible = resolveCompatibility({ ...ageResolved.selections, placement: context.placement || ageResolved.selections.placement })
  const s = compatible.selections
  const resolutions = [...ageResolved.resolutions, ...compatible.notes]
  const phrase = s.typography === 'No typography' ? '' : (s.phrase || 'CREATE LOUD')
  const character = clean(s.character, 'an original inclusive character direction selected creatively without assuming identity traits')
  const diversitySeed = [...`${s.theme}${s.phrase}${s.age}`].reduce((sum,char) => sum + char.charCodeAt(0),0)
  const hair = isHumanCharacter(s.character) && hairLibrary[s.hairstyle] ? ` Hair direction: ${hairLibrary[s.hairstyle]}, without inferring identity or culture.` : ''
  const diversity = isHumanCharacter(s.character) && (!s.skinTone || s.skinTone === 'Not specified') ? ` Inclusive character variation for this concept: ${choose(humanDiversity.skinTones,diversitySeed)} skin with a ${choose(humanDiversity.undertones,diversitySeed,1)} undertone, ${choose(humanDiversity.facialStructures,diversitySeed,2)} facial structure, ${choose(humanDiversity.bodyBuilds,diversitySeed,3)} age-appropriate build, ${choose(humanDiversity.expressions,diversitySeed,4)} expression, and ${choose(humanDiversity.energies,diversitySeed,5)} personality energy. These independent visual choices describe no race, ethnicity, nationality, culture, religion, or gender and must not be used to infer one another.` : ''
  const ethnicityValue = s.ethnicity === 'Custom' ? String(s.customCulturalBackground || '').trim() : s.ethnicity
  const ethnicity = isHumanCharacter(s.character) && ethnicityValue && ethnicityValue !== 'Not specified'
    ? ethnicityValue === 'Surprise Me'
      ? ' Ethnicity / cultural background: Surprise Me. Let the image generator make this creative decision without stereotypes and without deriving any other appearance or styling trait from it.'
      : ` Ethnicity / cultural background: ${ethnicityValue}. Treat this only as the explicitly selected identity context; do not stereotype it or derive skin tone, hair texture, hairstyle, facial features, body type, fashion, pose, accessories, or cultural clothing from it.`
    : ''
  const mascot = isMascotCharacter(s.character) ? ` Use ${mascotLibrary[s.mascot] || mascotLibrary.Bear}; preserve the selected theme and energy, keep its silhouette readable at apparel scale, reinterpret clothing anatomically for the creature, and do not apply human hairstyle instructions.` : ''
  const production = s.production === 'Sublimation'
    ? 'Optimize for sublimation: allow a fuller edge-to-edge composition, broader textures, environmental color, and all-over treatment where appropriate.'
    : 'Optimize for DTF: deliver isolated artwork on a transparent background with a cohesive silhouette, clean printable edges, strong contrast, controlled fine detail, and grouped decorative elements.'
  const type = phrase
    ? `Use ${typographyLibrary[s.typography] || clean(s.typography, 'original readable display lettering').toLowerCase()} and reproduce the exact phrase “${phrase}” with identical spelling, punctuation, capitalization, and word order. This is the only text: add no secondary slogans, prop text, garment labels, logos, or pseudo-text.`
    : 'Use no typography, labels, logos, slogans, or random text anywhere.'
  const material = materialDirection(s.material, s.production)
  const coordination = context.coordination ? ` Coordination system: ${context.coordination}.` : s.coordination ? ` Optional coordination: ${s.coordination}.` : ''
  const placementText = ` Placement-aware direction: ${s.resolvedPlacement}`
  const conceptTitle = `${s.theme || 'Original Kids Concept'} — ${s.product || 'Apparel'}`
  const twist = s.visualTwist ? ` Creative twist: ${s.visualTwist}; execute it without adding unrequested objects.` : ''

  const prompt = [
    imageExecutionLock,
    `Create an original, production-ready BOOMBOX KIDS™ kids-apparel design built around the concept “${s.theme || 'creative confidence'},” with a ${clean(s.mood, 'playful').toLowerCase()} emotional tone.`,
    `Developmental appropriateness for ${s.age || 'Toddler'}: use ${ageDirection(s.age)}. Never make the child appear younger, older, or adult. Developmental rules may alter how an idea is depicted but must not erase what makes it creative.`,
    `Apply the artwork to a ${s.product || 'T-shirt'} with ${clean(s.sizing, 'age-appropriate youth fit').toLowerCase()} and structurally believable garment construction.${placementText}`,
    `Character direction: ${character.toLowerCase()}.${mascot}${ethnicity}${diversity} Pose or action: ${clean(s.pose, 'a natural age-appropriate action').toLowerCase()}.${hair} Do not assume gender, race, ethnicity, nationality, skin tone, hair texture, culture, religion, or family structure; honor only traits explicitly supplied and avoid stereotypes or tokenism.`,
    `Fashion direction: ${fashionDirection(s.fashion)}; keep it wearable, brand-free, age-appropriate, visually interesting, and free of recognizable commercial logos, branded footwear or bags, and trademarked fashion identifiers.${coordination}`,
    `Composition: ${compositionLibrary[s.composition] || clean(s.composition, 'clear balanced composition').toLowerCase()}. Art style: ${artStyleLibrary[s.artStyle] || clean(s.artStyle, 'polished original illustration').toLowerCase()}. Keep the focal hierarchy clear and readable at garment distance.${twist}`,
    `Creative intensity — ${s.intensity || 'PLAYFUL'}: ${intensityDirection(s.intensity, s.age)}`,
    `Creative-volume system: ${creativeVolumeDirection(s.age, s.intensity)}`,
    type,
    `Use the curated ${clean(s.palette, 'balanced kid-friendly palette')} palette: ${paletteDirection(s.palette)}. Maintain intentional contrast and controlled color distribution.`,
    material,
    production,
    controlledMaximalismCheck(),
    'Object discipline: add no crowns, stars, hearts, sunglasses, backpacks, paint cans, boomboxes, headphones, sports equipment, toys, graffiti splashes, jewelry, extra characters, or extra slogans unless explicitly requested by the concept; every object must earn its place. Quality safeguards: believable age-appropriate anatomy, correct limb count, natural hands and finger structure, natural posture, coherent facial features, correctly rooted hair, structurally believable garments, no duplicate body parts, fused limbs, warped faces, floating accessories, accidental duplicate characters, random text, brand logos, copyrighted characters, protected mascots, or trademarked graphics.',
  ].join(' ')

  return { title: conceptTitle, direction: `${s.mood || 'Playful'} ${s.theme || 'creative'} direction for a ${s.age || 'Toddler'} ${s.product || 'T-shirt'}.`, prompt, production: s.production, age: s.age, product: s.product, resolutions }
}
