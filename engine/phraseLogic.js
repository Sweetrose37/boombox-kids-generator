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
const occasionPhrases = {
  Birthday:['BEST DAY EVER','BIRTHDAY ENERGY','LEVELING UP','PARTY MODE ON','BORN TO SHINE','THIS IS MY YEAR'],
  'First birthday':['ONE-DERFUL DAY','WILD ONE','ONE BIG YEAR','FIRST TRIP AROUND THE SUN','HELLO, ONE','ONE HAPPY KID'],
  'Milestone birthday':['LEVEL UP','NEW AGE, NEW ENERGY','MADE FOR THIS YEAR','BIG YEAR ENERGY','NEXT CHAPTER','CELEBRATE THE GLOW UP'],
  Halloween:['SPOOKY FUN CLUB','CREEPIN’ IT CUTE','TRICK OR TREAT ENERGY','BOO CREW','NIGHT OF DELIGHT','PLAYFUL AFTER DARK'],
  Christmas:['MERRY & BRIGHT','HOLIDAY JOY CREW','MAGIC IN THE AIR','VERY MERRY ENERGY','JOY ALL AROUND','BRIGHT DAYS AHEAD'],
  Hanukkah:['SHINE ALL EIGHT','LIGHT UP THE JOY','EIGHT NIGHTS BRIGHT','SPIN INTO JOY','BRIGHT TRADITIONS','GLOW TOGETHER'],
  Kwanzaa:['UNITY IN COLOR','CREATE WITH PURPOSE','ROOTED & RISING','SEVEN DAYS OF LIGHT','TOGETHER WE SHINE','CULTURE, JOY, COMMUNITY'],
  Diwali:['FESTIVAL OF LIGHT','SHINE WITH JOY','BRIGHT HEARTS GLOW','LIGHT THE WAY','JOY IN EVERY COLOR','GLOW TOGETHER'],
  'Lunar New Year':['LUCK IN MOTION','BRIGHT NEW BEGINNINGS','JOYFUL NEW YEAR','FORTUNE & FUN','CELEBRATE THE NEW','NEW YEAR, BRIGHT ENERGY'],
  'Día de los Muertos':['REMEMBER WITH LOVE','LOVE LIVES ON','COLORFUL MEMORIES','HONOR & CELEBRATE','MEMORIES BLOOM','CONNECTED BY LOVE'],
  'Eid al-Fitr':['EID JOY','CELEBRATE TOGETHER','BRIGHT EID DAYS','JOY & GRATITUDE','EID MUBARAK','SHARE THE JOY'],
  'Eid al-Adha':['EID MUBARAK','GIVE WITH JOY','CELEBRATE TOGETHER','HEARTS FULL OF GRATITUDE','BRIGHT EID ENERGY','JOY IN COMMUNITY'],
  Ramadan:['RAMADAN LIGHT','GROW IN GRATITUDE','PEACEFUL HEARTS','LIGHT & REFLECTION','TOGETHER IN GRATITUDE','BRIGHT NIGHTS, KIND HEARTS'],
  Holi:['COLOR IN MOTION','JOY IN EVERY COLOR','BRIGHT DAY ENERGY','CELEBRATE IN COLOR','COLORFUL TOGETHER','LET JOY FLY'],
  Juneteenth:['FREEDOM SHINES','JOY ROOTED IN FREEDOM','CELEBRATE FREEDOM','BRIGHT FUTURES RISE','FREEDOM IN FULL COLOR','ROOTED & RISING'],
  Graduation:['NEXT CHAPTER','DREAMS IN MOTION','READY FOR WHAT’S NEXT','BIG FUTURE ENERGY','MADE IT!','THE ADVENTURE CONTINUES'],
  'Back to School':['READY TO SHINE','SMART START ENERGY','NEW YEAR, NEW ADVENTURE','LEARN IT. ROCK IT.','BRIGHT IDEAS AHEAD','SCHOOL MODE ON'],
  'Family reunion':['BETTER TOGETHER','FAMILY JOY CREW','CONNECTED BY LOVE','OUR CREW, OUR STORY','TOGETHER IS THE VIBE','ROOTED TOGETHER'],
}
const legacyAutomaticPhrases = new Set(['CREATE LOUD'])
const hash = (value='') => [...String(value)].reduce((total,character) => ((total * 31) + character.charCodeAt(0)) >>> 0,0)

export function usesAutomaticPhrase(state={}) {
  const phrase=String(state.phrase || '').trim()
  return state.phraseMode === 'auto' || !phrase || (state.phraseMode !== 'manual' && legacyAutomaticPhrases.has(phrase.toUpperCase()))
}

export function themePhrase(state={}, offset=0, excluded='') {
  const occasion=state.specialOccasionContext
  const phrases=(occasion && (occasionPhrases[occasion] || occasionPhrases[Object.keys(occasionPhrases).find((key)=>occasion.includes(key))])) || phraseLibrary[state.theme] || fallbackPhrases
  const seed=`${state.theme}|${state.product}|${state.age}|${state.artStyle}|${state.composition}|${state.material}|${state.visualTwist}`
  let index=(hash(seed)+Number(offset || 0))%phrases.length
  if(phrases.length>1 && phrases[index]===excluded)index=(index+1)%phrases.length
  return phrases[index]
}

export function resolvePhrase(state={}, context={}) {
  if(state.typography === 'No typography')return ''
  const phraseState=context.specialOccasion ? {...state,specialOccasionContext:context.specialOccasion} : state
  return usesAutomaticPhrase(state) ? themePhrase(phraseState,context.phraseIndex || 0) : String(state.phrase || '').trim()
}
