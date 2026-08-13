export const garmentLibrary = {
  Bodysuit:['center chest','small back accent'], 'Baby tee':['center front','small back accent'], 'T-shirt':['front','back','left chest','sleeve'], Raglan:['front','contrast sleeves'], Tank:['front','upper back'],
  Sweatshirt:['front','back','sleeve'], Hoodie:['front','back','sleeve','hood','pocket'], Crewneck:['front','back','sleeve'], 'Varsity jacket':['left chest','back','sleeve','side panel'], 'Bomber jacket':['left chest','back','sleeve'], 'Denim jacket':['back panel','left chest','sleeve'],
  Dress:['bodice','skirt panel','hem','all-over'], Skirt:['hem','border','side panel'], Skort:['hem','side panel'], Shorts:['leg panel','hem','pocket'], Joggers:['leg panel','pocket'], Leggings:['side panel','all-over'], Jeans:['pocket','leg panel'], 'Cargo pants':['pocket','leg panel'],
  Romper:['center front','back','all-over'], Overalls:['bib','pocket','leg panel'], 'Matching set':['coordinated set placement'], Tracksuit:['chest','back','sleeve','leg panel'], Pajamas:['all-over','center front'], Outerwear:['left chest','back','sleeve'],
  Hat:['front panel','side panel'], Bag:['front panel','pocket'], Shoes:['side panel','heel accent'], 'Matching set':['coordinated set placement'],
  'Baby tee':['center front','small back accent'], 'Denim jacket':['back panel','left chest','sleeve'], Skirt:['hem','border','side panel'], Shorts:['leg panel','hem','pocket'], Joggers:['leg panel','pocket'],
}

export function garmentDirection(product, requestedPlacement) {
  const zones = garmentLibrary[product] || ['front','back']
  const requested = requestedPlacement?.toLowerCase() || ''
  const matched = zones.find((zone) => requested.includes(zone.split(' ')[0]))
  const primary = matched || zones[0]
  const secondary = zones.find((zone) => zone !== primary)
  return { zones, direction: `place the primary artwork at the ${primary}${secondary ? ` with a smaller coordinated accent at the ${secondary}` : ''}; respect the garment's seams, closures, and usable print area` }
}
