export const compositionLibrary = {
  'Centered hero graphic':'one strong central silhouette with clear distance readability', 'Badge composition':'a compact emblem with controlled internal hierarchy', 'Dynamic diagonal composition':'a diagonal action path with balanced counterweight',
  'Stacked vertical':'a tall stacked hierarchy suited to narrow placement', Circular:'a circular rhythm with a clear center', 'Split composition':'two coordinated zones with intentional visual dialogue',
  'Layered sticker collage':'a controlled layered cluster with one dominant focal element', 'Mascot + type':'a readable mascot and type lockup with neither competing', 'Character breaking through type':'the character crosses selected letter planes without harming phrase legibility',
  'Character with wrapped typography':'type frames and wraps the character while remaining exact and readable', 'Type as architecture':'letterforms create the compositional structure', 'Object-led design':'one requested object drives the hierarchy',
  'Negative-space design':'intentional open space defines the focal shape', 'Repeated character rhythm':'purposeful repeated poses with no accidental duplicates', 'Storybook scene':'a concise narrative scene with apparel-scale clarity',
  'Fashion-poster layout':'editorial youth hierarchy with clear type and figure balance', 'Sticker-cluster composition':'a curated cluster with controlled overlap', 'Asymmetrical layout':'balanced asymmetry with a stable visual anchor',
  'Large back graphic with small front accent':'a dominant back statement and restrained coordinated front mark', 'All-over composition':'an edge-to-edge repeat or scene with controlled density',
}

export const artStyleLibrary = {
  'Graffiti pop':'original energetic mark-making with clean apparel-ready contours', 'Polished cartoon':'refined original cartoon forms and clean expressive silhouettes', 'Chibi-inspired original':'compact original proportions without copying recognizable characters',
  Storybook:'warm narrative illustration and gentle texture', 'Retro cartoon':'original vintage-inspired shapes without copying period characters', 'Cut-paper collage':'layered cut-paper simulation with clean separations',
  'Crayon texture':'controlled waxy texture within clean forms', 'Marker art':'expressive marker texture with deliberate edges', Watercolor:'controlled watercolor washes with readable silhouettes', Comic:'original comic energy with clean panels and marks',
  'Pop art':'bold graphic color fields and original halftone energy', 'Fashion illustration':'expressive youth-fashion drawing with believable construction', 'Sticker art':'crisp sticker-like silhouettes and controlled clustering',
  'Screen-print texture':'limited-color print texture and clean trapping', Patchwork:'visually simulated fabric-piece construction', 'Mixed media':'controlled combination of two complementary media', 'Vector-like graphic':'clean scalable-looking shapes and precise edges',
  'Soft baby illustration':'gentle rounded forms and low visual complexity', 'Bold tween editorial':'youth editorial confidence without adult styling', 'Teen streetwear editorial':'under-18 streetwear editorial energy without adult glamour',
  'Soft 3D cartoon':'soft dimensional cartoon lighting while retaining print-readable shapes', 'Classic cartoon':'clear original cartoon drawing', 'Fashion editorial illustration':'age-appropriate youth editorial illustration', 'Sticker collage':'controlled sticker-style layering', 'Playful doodle':'intentional doodle language with clean hierarchy', 'Retro kids':'original retro youth graphic language', 'Bold graphic':'strong simplified graphic shapes',
}

export const typographyLibrary = {
  'Playful bubble type':'rounded bubble lettering with open counters', 'Chunky block':'heavy block lettering with strong counters', 'Stacked bold type':'stacked type with deliberate line breaks', 'Curved badge type':'curved badge lettering with even rhythm',
  Arch:'an arch with balanced baseline', 'Original varsity lettering':'original athletic-inspired lettering without team identifiers', 'Original graffiti lettering':'original graffiti-inspired lettering without tags or copied handstyles', 'Hand-drawn lettering':'purposeful hand-drawn lettering',
  'Comic lettering':'energetic comic lettering', 'Playful serif':'friendly expressive serif lettering', 'Retro groovy':'original groovy curves with legibility', 'Dimensional type':'simulated dimensional lettering with controlled depth',
  'Faux chenille type':'visually simulated chenille lettering', 'Puff type':'visually simulated puff lettering', 'Type behind subject':'exact type behind the subject with readable exposed forms', 'Type crossing foreground':'exact type crosses the foreground without obscuring faces',
  'Type wrapping':'exact type wraps the focal subject', 'Type weaving':'exact type weaves through selected layers without broken reading order', 'Badge typography':'compact badge hierarchy', 'No typography':'no lettering',
}

export const paletteLibrary = {
  'Neon cyan, pink, purple, and yellow':['cyan','pink and purple','yellow','black','none'], 'Primary pop':['red','blue and yellow','white','black','none'], 'Soft baby pastels':['powder blue','blush and lavender','butter yellow','warm cream','none'],
  'Warm playground brights':['orange','sunny yellow and coral','aqua','warm cream','none'], 'Earthy modern':['terracotta','olive and sand','cobalt','charcoal','none'], 'Retro muted':['rust','mustard and dusty teal','cream','brown-black','none'],
  'Sporty primary':['royal blue','red and white','yellow','black','none'], 'Candy brights':['hot pink','aqua and grape','lemon','white','none'], 'Jewel pop':['emerald','amethyst and sapphire','magenta','black','gold'],
  'Street neon':['electric cyan','acid yellow and hot pink','violet','black','silver'], 'Monochrome + electric accent':['black','charcoal and white','electric cyan','gray','silver'], 'Soft neutral + bright accent':['warm cream','sand and taupe','coral','soft brown','none'],
  'Sunset tones':['coral','orange and magenta','golden yellow','deep plum','gold'], 'Cool blues + citrus':['cobalt','aqua and navy','citrus yellow','white','silver'],
  'Bright primary colors':['red','blue and yellow','white','black','none'], 'Soft pastels':['powder blue','blush and lavender','butter yellow','cream','none'], 'Rainbow brights':['cyan','pink, orange, green and purple','yellow','white','none'],
  'Jewel tones':['emerald','amethyst and sapphire','magenta','black','gold'], 'Black with neon accents':['black','charcoal','neon cyan and pink','white','silver'], 'Warm sunset brights':['coral','orange and magenta','yellow','plum','gold'],
  'Cool aqua and violet':['aqua','violet and blue','pink','black','silver'], 'Earthy modern colors':['terracotta','olive and sand','cobalt','charcoal','none'],
}

export function paletteDirection(name) { const custom = paletteLibrary[name] || [name || 'balanced color','coordinated supporting tones','one controlled bright accent','a grounding neutral','none']; const [dominant,support,accent,neutral,metallic='none'] = custom; return `dominant ${dominant}; support ${support}; accent ${accent}; neutral ${neutral}${metallic !== 'none' ? `; optional ${metallic} metallic simulation` : ''}` }

export const materialLibrary = {
  'Faux chenille':['looped yarn-like surface','soft stitched edge','medium raised depth','soft directional highlights','stitched patch cue','headline type or one focal motif'], 'Faux puff ink':['smooth inflated surface','rounded clean edge','low-medium raised depth','soft top highlight','expanded ink cue','headline or selected shapes'],
  'Faux embroidery':['thread-like directional surface','clean satin-stitch edge','low relief','fine directional sheen','stitched construction cue','small focal details'], 'Faux rhinestones':['faceted points','crisp isolated edge','tiny raised depth','controlled sparkle','set-stone cue','small accent zones only'],
  'Faux sequins':['overlapping disc surface','scalloped edge','low relief','controlled shimmer','stitched disc cue','selected accents'], 'Faux holographic':['smooth film surface','crisp edge','flat depth','spectral shift','applied-film cue','one controlled zone'],
  'Faux reflective':['smooth technical surface','clean edge','flat depth','bright directional response','applied-film cue','trim or accent'], 'Faux flock velvet':['soft matte nap','soft clean edge','low raised depth','light-absorbing response','flocked cue','type or silhouette zone'],
  'Faux felt':['dense matte fiber surface','cut patch edge','low-medium depth','soft diffuse light','layered patch cue','badge or motif'], 'Faux leather':['subtle grain','clean cut edge','medium depth','controlled sheen','appliqué cue','small patches'],
  'Faux rubber silicone':['smooth flexible surface','rounded molded edge','medium depth','soft specular response','molded patch cue','badge or small motif'], 'Faux foil metallic':['smooth metallic surface','crisp edge','flat depth','directional metallic shine','heat-applied foil cue','type or selected accents'],
  'Cracked ink effect':['distressed ink surface','irregular printed edge','flat depth','matte response','aged print cue','broad graphic zones'], 'Neon glow effect':['solid bright core','soft controlled halo','flat printed simulation','emissive illusion','printed glow cue','outline or focal accent'],
  'Gel jelly effect':['translucent glossy surface','rounded edge','medium depth','wet specular highlight','gel patch cue','small focal accents'], None:['clean printed surface','clean edge','flat','matte','standard print cue','full graphic'],
}

export function materialDirection(name, production) { const fallback=[`a controlled ${String(name || 'printed').toLowerCase()} visual surface`,'clean isolated edges','print-simulated depth','controlled highlights','clearly simulated construction','one focal zone or selected accents']; const [surface,edge,depth,light,construction,zones] = materialLibrary[name] || fallback; return `${name}: ${surface}, ${edge}, ${depth}, ${light}, and ${construction}, confined to ${zones}; render as a ${production === 'DTF' ? 'flat DTF-safe visual simulation with printable separations' : 'sublimation-safe visual simulation integrated into the print'}, not a claim of real material` }
