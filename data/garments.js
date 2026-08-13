export const garmentLibrary = {
  Bodysuit:['center chest','small back accent'], 'Baby tee':['center front','small back accent'], 'T-shirt':['front','back','left chest','sleeve'], 'Long-sleeve tee':['front','back','sleeve'], Raglan:['front','contrast sleeves'], Tank:['front','upper back'], Polo:['left chest','back'], 'Button-up shirt':['left chest','back panel'], Tunic:['front','hem'],
  Sweatshirt:['front','back','sleeve'], Hoodie:['front','back','sleeve','hood','pocket'], 'Zip hoodie':['left chest','back','sleeve'], Crewneck:['front','back','sleeve'], Cardigan:['left chest','back','sleeve'], 'Sweater vest':['front','back'], 'Varsity jacket':['left chest','back','sleeve','side panel'], 'Bomber jacket':['left chest','back','sleeve'], 'Denim jacket':['back panel','left chest','sleeve'], Windbreaker:['left chest','back','sleeve'], 'Puffer vest':['left chest','back'], 'Rain jacket':['left chest','back','sleeve'],
  Dress:['bodice','skirt panel','hem'], 'T-shirt dress':['front','back','hem'], 'Sweater dress':['front','hem'], Skirt:['hem','border','side panel'], Skort:['hem','side panel'], Shorts:['leg panel','hem','pocket'], 'Bike shorts':['side panel','leg panel'], Joggers:['leg panel','pocket'], Leggings:['side panel','leg panel'], Jeans:['pocket','leg panel'], 'Cargo pants':['pocket','leg panel'], 'Wide-leg pants':['leg panel','pocket'],
  Romper:['center front','back'], Jumpsuit:['center front','back','leg panel'], Overalls:['bib','pocket','leg panel'], 'Matching set':['coordinated set placement'], Tracksuit:['chest','back','sleeve','leg panel'], Pajamas:['center front','leg panel'], Outerwear:['left chest','back','sleeve'], 'Swim cover-up':['front','back','hem'], Apron:['bib','pocket'],
  Hat:['front panel','side panel'], Beanie:['front cuff','side accent'], 'Bucket hat':['front panel','side panel'], Visor:['front band','side accent'], Headband:['center front','side accent'], Bandana:['center panel','border'], Socks:['ankle panel','leg panel'], Bag:['front panel','pocket'], Backpack:['front panel','pocket'], 'Tote bag':['front panel','small back accent'], Shoes:['side panel','heel accent'],
}

export function garmentDirection(product, requestedPlacement) {
  const zones = garmentLibrary[product] || ['front','back']
  const requested = requestedPlacement?.toLowerCase() || ''
  const matched = zones.find((zone) => requested.includes(zone.split(' ')[0]))
  const primary = matched || zones[0]
  const secondary = zones.find((zone) => zone !== primary)
  return { zones, direction: `place the primary artwork at the ${primary}${secondary ? ` with a smaller coordinated accent at the ${secondary}` : ''}; respect the garment's seams, closures, and usable print area` }
}
