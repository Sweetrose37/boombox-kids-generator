export const humanDiversity = {
  skinTones: ['very deep','deep','medium-deep','medium','light-medium','light','very light'],
  undertones: ['warm','cool','neutral','golden','olive','red-brown'],
  facialStructures: ['round','oval','soft angular','heart-shaped','broad','long'],
  bodyBuilds: ['slender','average','soft','sturdy','athletic youth','broad youth'],
  expressions: ['joyful','curious','confident','thoughtful','playful','calm','focused'],
  energies: ['bright','chill','bold','creative','sporty','dreamy','mischievous'],
}

export const hairLibrary = {
  'Not specified': null, 'You Choose': null,
  Coils: 'age-appropriate natural coils with believable density, gravity, and scalp origin',
  Curls: 'age-appropriate curls with believable density, gravity, and scalp origin',
  Puffs: 'age-appropriate natural puffs with secure believable sections and scalp origin',
  Afro: 'an age-appropriate rounded afro with believable density and scalp origin',
  Braids: 'age-appropriate braids with believable parting, roots, weight, and gravity',
  Twists: 'age-appropriate twists with believable roots, density, and gravity',
  Cornrows: 'age-appropriate cornrows with coherent scalp parting and natural direction',
  Locs: 'age-appropriate locs with believable roots, density, weight, and gravity',
  Buns: 'age-appropriate buns with believable gathered hair and secure roots',
  Ponytail: 'an age-appropriate ponytail with believable roots, tension, and gravity',
  'Silk press': 'an age-appropriate silk-pressed style with natural movement and rooted strands',
  'Short cut': 'an age-appropriate short cut with a natural hairline and density',
  'Protective style': 'an age-appropriate protective style with coherent sections, roots, and tension',
  'Curly layers': 'age-appropriate layered curls with natural density and gravity',
  'Wavy bob': 'an age-appropriate wavy bob with rooted strands and natural movement',
  'Long layers': 'age-appropriate long layers with natural roots, density, and gravity',
}

export function hairDirection(name='') {
  if (!name || ['Not specified','You Choose'].includes(name)) return ''
  return hairLibrary[name] || `an age-appropriate ${name.toLowerCase()} hairstyle with believable roots, density, construction, weight, and gravity`
}

export const mascotLibrary = {
  Bear: 'an original warm, sturdy bear mascot', Bunny: 'an original energetic bunny mascot', Cat: 'an original clever cat mascot', Dog: 'an original friendly dog mascot',
  Lion: 'an original confident young lion mascot', Fox: 'an original quick, curious fox mascot', Frog: 'an original joyful frog mascot', Panda: 'an original playful panda mascot',
  Dinosaur: 'an original friendly dinosaur mascot', 'Fantasy creature': 'an original fantasy-friendly creature with a wholly new silhouette',
}

export function mascotDirection(name='Bear') {
  return mascotLibrary[name] || `an entirely original, friendly ${String(name).toLowerCase()} mascot with a distinctive new silhouette and no resemblance to any protected character or commercial mascot`
}

export function isHumanCharacter(character='') { return character.includes('human') }
export function isMascotCharacter(character='') { return character.includes('mascot') || character.includes('animal') || character.includes('fantasy') }
