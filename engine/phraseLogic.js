const phraseLibrary = {
  'Music makers': ['TURN UP THE JOY', 'RHYTHM IN MOTION', 'MAKE YOUR OWN BEAT', 'SOUND ON, DREAM ON', 'BORN FOR THE BEAT', 'GOOD VIBES PLAY LOUD'],
  'Future dreamers': ['DREAM FORWARD', 'NEXT UP: AMAZING', 'FUTURE IN MOTION', 'IMAGINE WHAT’S NEXT', 'BRIGHT IDEAS AHEAD', 'TOMORROW STARTS HERE'],
  'Happy day club': ['JOY LOOKS GOOD', 'HAPPY STARTS HERE', 'SUNNY SIDE UP', 'GOOD DAY ENERGY', 'SMILES IN STYLE', 'WEAR THE HAPPY'],
  'Cosmic playground': ['PLAY BEYOND THE STARS', 'COSMIC KID ENERGY', 'ORBIT YOUR OWN WAY', 'OUT OF THIS WORLD', 'GALAXY OF FUN', 'SPACE TO IMAGINE'],
  'Creative crew': ['IDEAS IN MOTION', 'MADE TO IMAGINE', 'CREATE YOUR WAY', 'THE IDEA CREW', 'ORIGINAL BY NATURE', 'MAKE SOMETHING AMAZING'],
  'Wildflower energy': ['GROW YOUR OWN WAY', 'BLOOM OUT LOUD', 'WILDLY WONDERFUL', 'ROOTED IN JOY', 'BRIGHT THINGS GROW', 'FREE TO BLOOM'],
  'Game day spirit': ['BRING THE ENERGY', 'READY, SET, SHINE', 'PLAY WITH HEART', 'ALL HEART, ALL DAY', 'TEAM AWESOME', 'GAME FACE: ON'],
  'Retro recess': ['PLAY IT OLD SCHOOL', 'RECESS FOREVER', 'THROWBACK FUN CLUB', 'CLASSIC KID ENERGY', 'GOOD TIMES REPLAY', 'PLAYGROUND REMIX'],
  'Kindness rocks': ['KIND IS POWERFUL', 'LEAD WITH KINDNESS', 'GOOD HEART ENERGY', 'KINDNESS HITS DIFFERENT', 'MAKE KINDNESS LOUD', 'COOL TO CARE'],
  'Adventure squad': ['READY FOR ANYTHING', 'ADVENTURE STARTS NOW', 'GO FIND WONDER', 'BUILT TO EXPLORE', 'BRAVE DAYS AHEAD', 'THE FUN IS OUT THERE'],
}

const fallbackPhrases = ['MAKE YOUR MARK', 'BRING YOUR OWN MAGIC', 'ORIGINAL ENERGY', 'IMAGINE IT BIG', 'GOOD THINGS IN MOTION', 'MADE TO STAND OUT']
const legacyAutomaticPhrases = new Set(['CREATE LOUD'])
const hash = (value='') => [...String(value)].reduce((total,character) => ((total * 31) + character.charCodeAt(0)) >>> 0,0)

export function usesAutomaticPhrase(state={}) {
  const phrase=String(state.phrase || '').trim()
  return state.phraseMode === 'auto' || !phrase || (state.phraseMode !== 'manual' && legacyAutomaticPhrases.has(phrase.toUpperCase()))
}

export function themePhrase(state={}, offset=0, excluded='') {
  const phrases=phraseLibrary[state.theme] || fallbackPhrases
  const seed=`${state.theme}|${state.product}|${state.age}|${state.artStyle}|${state.composition}|${state.material}|${state.visualTwist}`
  let index=(hash(seed)+Number(offset || 0))%phrases.length
  if(phrases.length>1 && phrases[index]===excluded)index=(index+1)%phrases.length
  return phrases[index]
}

export function resolvePhrase(state={}, context={}) {
  if(state.typography === 'No typography')return ''
  return usesAutomaticPhrase(state) ? themePhrase(state,context.phraseIndex || 0) : String(state.phrase || '').trim()
}
