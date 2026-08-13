import { options } from '../data/options.js'
import { resolveAgePriorities } from './ageLogic.js'
import { resolveCompatibility } from './compatibility.js'
import { noveltyScore, remember } from './originality.js'
import { themePhrase } from './phraseLogic.js'

const keys = ['age','product','theme','mood','character','mascot','ethnicity','hairstyle','fashion','artStyle','pose','typography','palette','composition','material','production','sizing','intensity']
const replacementKeys = new Set(['artStyle','typography','composition'])
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const visualTwists = ['unexpected scale shift','controlled negative-space reveal','single motif transformed across type','inside-out color hierarchy','rhythmic panel-to-graphic echo','foreground/background type exchange','surreal-but-safe visual metaphor','dramatic type architecture','bold asymmetrical crop','layered graphic planes with clean occlusion','repeating visual cadence','character-to-type interaction','expressive framing with unusual negative space','fashion-poster silhouette system']

export function shake(current, locks = new Set(), previous = new Set()) {
  let candidate
  let signature
  let tries = 0
  do {
    candidate = { ...current }
    keys.forEach((key) => {
      if (locks.has(key)) return
      const choices = options[key].filter((value) => value !== 'You Choose' && (!replacementKeys.has(key) || value !== current[key]))
      candidate[key] = pick(choices)
    })
    if (!locks.has('phrase')) candidate.phraseMode = 'auto'
    candidate.visualTwist = pick(visualTwists.filter((value) => value !== current.visualTwist))
    candidate = resolveCompatibility(resolveAgePriorities(candidate).selections).selections
    if (!locks.has('composition') && candidate.composition === current.composition) {
      const compatibleCompositions = options.composition.filter((value) => value !== 'You Choose' && value !== current.composition && !(candidate.production === 'DTF' && value === 'All-over composition'))
      candidate.composition = pick(compatibleCompositions)
      candidate = resolveCompatibility(candidate).selections
    }
    if (!locks.has('phrase')) candidate.phrase = themePhrase(candidate,tries,current.phrase)
    signature = keys.map((key) => candidate[key]).join('|')
    tries += 1
  } while (previous.has(signature) && tries < 20)
  previous.add(signature)
  return candidate
}

export function intelligentShake(current, locks = new Set(), recent = []) {
  let candidate = current
  for (let attempt=0; attempt<30; attempt += 1) {
    candidate = shake(current, locks, new Set())
    if (noveltyScore(candidate,recent) >= .45) break
  }
  remember(candidate,recent)
  return candidate
}
