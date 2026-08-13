export const options = {
  age: ['Newborn', '0–3 Months', '3–6 Months', '6–12 Months', 'Toddler', 'Little Kids', 'Big Kids', 'Tweens', 'Teens 13–17'],
  product: ['Bodysuit', 'Baby tee', 'T-shirt', 'Raglan', 'Tank', 'Sweatshirt', 'Hoodie', 'Crewneck', 'Varsity jacket', 'Bomber jacket', 'Denim jacket', 'Dress', 'Skirt', 'Skort', 'Shorts', 'Joggers', 'Leggings', 'Jeans', 'Cargo pants', 'Romper', 'Overalls', 'Matching set', 'Tracksuit', 'Pajamas', 'Outerwear', 'Hat', 'Bag', 'Shoes'],
  theme: ['Music makers', 'Future dreamers', 'Happy day club', 'Cosmic playground', 'Creative crew', 'Wildflower energy', 'Game day spirit', 'Retro recess', 'Kindness rocks', 'Adventure squad'],
  mood: ['Playful', 'Bold', 'Joyful', 'Cool', 'Dreamy', 'Confident', 'Sporty', 'Sweet', 'Artistic', 'Future-forward'],
  character: ['No character', 'Original human character', 'Original animal mascot', 'Original fantasy friend', 'Original object character', 'You Choose'],
  mascot: ['Bear', 'Bunny', 'Cat', 'Dog', 'Lion', 'Fox', 'Frog', 'Panda', 'Dinosaur', 'Fantasy creature'],
  ethnicity: ['Not specified', 'African American / Black', 'Latino / Hispanic', 'Asian', 'South Asian', 'Middle Eastern / North African', 'Indigenous', 'White / European', 'Multiracial', 'Surprise Me', 'Custom'],
  hairstyle: ['Not specified', 'Coils', 'Curls', 'Puffs', 'Afro', 'Braids', 'Twists', 'Cornrows', 'Locs', 'Buns', 'Ponytail', 'Silk press', 'Short cut', 'Protective style', 'Curly layers', 'Wavy bob', 'Long layers', 'You Choose'],
  fashion: ['Playful casual', 'Original streetwear', 'Sporty', 'Preppy', 'Soft playful', 'Retro', 'Y2K-inspired', 'Varsity-inspired', 'Skate-inspired', 'Dance-inspired', 'Music-inspired', 'Art-kid', 'Futuristic', 'Playful luxury', 'Casual elevated', 'Dressy', 'Coordinated sets', 'Fashion-lab', 'Soft boutique', 'Bold artistic'],
  artStyle: ['Graffiti pop', 'Polished cartoon', 'Chibi-inspired original', 'Storybook', 'Retro cartoon', 'Cut-paper collage', 'Crayon texture', 'Marker art', 'Watercolor', 'Comic', 'Pop art', 'Fashion illustration', 'Sticker art', 'Screen-print texture', 'Patchwork', 'Mixed media', 'Vector-like graphic', 'Soft baby illustration', 'Bold tween editorial', 'Teen streetwear editorial'],
  pose: ['Standing naturally', 'Dancing', 'Jumping', 'Skating', 'Walking with energy', 'Hero pose', 'Seated playfully', 'You Choose'],
  typography: ['Playful bubble type', 'Chunky block', 'Stacked bold type', 'Curved badge type', 'Arch', 'Original varsity lettering', 'Original graffiti lettering', 'Hand-drawn lettering', 'Comic lettering', 'Playful serif', 'Retro groovy', 'Dimensional type', 'Faux chenille type', 'Puff type', 'Type behind subject', 'Type crossing foreground', 'Type wrapping', 'Type weaving', 'Badge typography', 'No typography'],
  palette: ['Neon cyan, pink, purple, and yellow', 'Primary pop', 'Soft baby pastels', 'Warm playground brights', 'Earthy modern', 'Retro muted', 'Sporty primary', 'Candy brights', 'Jewel pop', 'Street neon', 'Monochrome + electric accent', 'Soft neutral + bright accent', 'Sunset tones', 'Cool blues + citrus', 'You Choose'],
  composition: ['Centered hero graphic', 'Badge composition', 'Dynamic diagonal composition', 'Stacked vertical', 'Circular', 'Split composition', 'Layered sticker collage', 'Mascot + type', 'Character breaking through type', 'Character with wrapped typography', 'Type as architecture', 'Object-led design', 'Negative-space design', 'Repeated character rhythm', 'Storybook scene', 'Fashion-poster layout', 'Sticker-cluster composition', 'Asymmetrical layout', 'Large back graphic with small front accent', 'All-over composition', 'You Choose'],
  material: ['None', 'Faux puff ink', 'Faux chenille', 'Faux embroidery', 'Faux rhinestones', 'Faux sequins', 'Faux holographic', 'Faux reflective', 'Faux flock velvet', 'Faux felt', 'Faux leather', 'Faux rubber silicone', 'Faux foil metallic', 'Cracked ink effect', 'Neon glow effect', 'Gel jelly effect'],
  production: ['DTF', 'Sublimation'],
  intensity: ['PLAYFUL', 'POPPIN’', 'BOLD', 'EXTRA', 'BOOMBOX MODE'],
  sizing: ['Standard youth fit', 'Relaxed youth fit', 'Oversized youth fit', 'Baby-safe placement', 'Toddler-proportioned placement'],
  outfit: ['Top + bottom', 'Shirt + skirt', 'Shirt + shorts', 'Hoodie + joggers', 'Jacket + pants', 'Dress + accessory', 'Matching set', 'Layered outfit', 'Outerwear look'],
  placement: ['Front graphic', 'Front + back graphics', 'Front + sleeve accent', 'Pocket area + back graphic', 'Panel treatment', 'Hem or border accent', 'All-over treatment'],
  relationship: ['Coordinated set', 'Siblings', 'Twins', 'Cousins', 'Parent + child', 'Grandparent + child', 'Best-friend kids', 'Family set'],
  collectionCount: ['4', '6', '8', '12'],
  remix: ['Stronger concept', 'Different age direction', 'Different character', 'Different art style', 'Different fashion', 'Stronger typography', 'Different composition', 'Different palette', 'Different faux materials', 'DTF optimization', 'Sublimation optimization', 'Make it more original', 'Make it more playful', 'Make it more fashion-forward'],
}

export const defaults = {
  age: 'Toddler', product: 'T-shirt', theme: 'Music makers', mood: 'Playful', character: 'Original animal mascot', mascot: 'Bear',
  ethnicity: 'Not specified', customCulturalBackground: '', hairstyle: 'Not specified', fashion: 'Original streetwear', artStyle: 'Graffiti pop', pose: 'Dancing',
  typography: 'Playful bubble type', phrase: 'CREATE LOUD', palette: 'Neon cyan, pink, purple, and yellow',
  composition: 'Centered hero graphic', material: 'Faux chenille', production: 'DTF', sizing: 'Toddler-proportioned placement',
  outfit: 'Hoodie + joggers', placement: 'Front + sleeve accent', relationship: 'Coordinated set', collectionCount: '4', coordination: 'Optional coordinated accessories', intensity: 'PLAYFUL',
}

export const guidedSteps = [
  ['age', 'AGE / DEVELOPMENT'], ['product', 'GARMENT / PRODUCT'], ['theme', 'THEME'], ['mood', 'DESIGN MOOD'],
  ['character', 'CHARACTER DIRECTION'], ['ethnicity', 'ETHNICITY / CULTURAL BACKGROUND'], ['hairstyle', 'HAIRSTYLE'], ['fashion', 'FASHION DIRECTION'], ['artStyle', 'ART STYLE'],
  ['pose', 'POSE / ACTION'], ['typography', 'TYPOGRAPHY'], ['phrase', 'EXACT PHRASE'], ['palette', 'COLOR PALETTE'],
  ['composition', 'COMPOSITION'], ['material', 'FAUX MATERIAL / EFFECT'], ['production', 'PRINT METHOD'], ['intensity', 'CREATIVE INTENSITY'], ['coordination', 'OUTFIT COORDINATION'],
]

export const quickMap = {
  'Age Group': 'age', Product: 'product', 'Art Style': 'artStyle', Character: 'character', Typography: 'typography',
  Colors: 'palette', 'Faux Materials': 'material', 'DTF / Sublimation': 'production', 'Sizing & Fit': 'sizing',
}
