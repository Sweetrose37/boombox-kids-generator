import { options } from '../data/options.js'
import { resolveAgePriorities } from './ageLogic.js'
import { resolveCompatibility } from './compatibility.js'
import { noveltyScore, remember } from './originality.js'

const keys = ['age','product','theme','mood','character','mascot','hairstyle','fashion','artStyle','pose','typography','palette','composition','material','production','sizing','intensity']
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const visualTwists = ['unexpected scale shift','controlled negative-space reveal','single motif transformed across type','inside-out color hierarchy','rhythmic panel-to-graphic echo','foreground/background type exchange']

export function shake(current, locks = new Set(), previous = new Set()) {
  let candidate
  let signature
  let tries = 0
  do {
    candidate = { ...current }
    keys.forEach((key) => { if (!locks.has(key)) candidate[key] = pick(options[key].filter((v) => v !== 'You Choose')) })
    if (!locks.has('phrase')) candidate.phrase = pick(['CREATE LOUD', 'DREAM IN COLOR', 'FUTURE LEGEND', 'KINDNESS ROCKS', 'PLAY ALL DAY', 'BORN TO CREATE'])
    candidate.visualTwist = pick(visualTwists)
    candidate = resolveCompatibility(resolveAgePriorities(candidate).selections).selections
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
