import { composePrompt } from './promptComposer.js'
import { options } from '../data/options.js'

export function buildCollection(state) {
  const count = Number(state.collectionCount || 4)
  const prompts = Array.from({ length: count }, (_, index) => {
    const variation = { ...state,
      age: options.age[(options.age.indexOf(state.age) + index) % options.age.length],
      product: options.product[(options.product.indexOf(state.product) + index) % options.product.length],
      character: options.character[index % (options.character.length - 1)],
      mascot: options.mascot[index % options.mascot.length],
      hairstyle: options.hairstyle[(index + 1) % (options.hairstyle.length - 1)],
      pose: options.pose[index % (options.pose.length - 1)],
      fashion: options.fashion[(options.fashion.indexOf(state.fashion) + index) % options.fashion.length],
      composition: options.composition[index % (options.composition.length - 1)],
      material: options.material[(options.material.indexOf(state.material) + index) % options.material.length],
      typography: options.typography[(options.typography.indexOf(state.typography) + index) % options.typography.length],
      phrase: state.phrase,
    }
    return {...composePrompt(variation, { coordination: `collection piece ${index + 1} of ${count}; preserve shared ${state.theme} creative DNA and palette family while forcing meaningful variation` }),title:`${state.theme} — Collection Piece ${index+1}`,settings:variation}
  })
  return { title: `${count}-Piece ${state.theme} Collection`, direction: 'A varied kids-apparel capsule with shared creative DNA—not recolors of one repeated design.', prompt: prompts.map((item, index) => `COLLECTION PROMPT ${index + 1}: ${item.prompt}`).join('\n\n'), production: state.production, age: state.age, product: `${count}-piece collection`,items:prompts }
}
