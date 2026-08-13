import { imageExecutionLock } from './promptComposer.js'

export function remixPrompt(source, instructions) {
  const requested = instructions.length ? instructions.join(', ') : 'make it more original and production-ready'
  return { title: 'Remixed Kids Apparel Direction', direction: `Preserve the core idea while applying: ${requested}.`, prompt: `${imageExecutionLock}\n\nPreserve the central concept and recognizable creative intent of this user-supplied kids-apparel prompt:\n\n“${source.trim()}”\n\nRemix requirements: ${requested}. Improve the creative hierarchy and originality without replacing the core idea. Keep all exact quoted phrases exactly as supplied. Ensure age-appropriate styling, readable intentional typography, brand-free original fashion, and no copyrighted characters or trademarked identifiers. Require believable anatomy, correct limbs and fingers, natural posture, coherent faces, correctly rooted hair, structurally believable garments, no duplicates, no floating accessories, and no random text.`, production: instructions.includes('Sublimation optimization') ? 'Sublimation' : 'DTF', age: 'As specified in source', product: 'As specified in source' }
}
