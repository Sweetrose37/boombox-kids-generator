import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { defaultSizingState, describeDimensions, proportionalResize } from '../production/sizing.js'
import { appendProductionGuidance, buildProductionGuidance, matchMiniSizingGuidance, outfitPlacementGuidance, printRangeForAge, productionMethodGuidance, typographyWarnings, validZones, zoneHierarchy } from '../production/guidance.js'

test('dimension calculator recognizes common ratios, orientation, and physical size', () => {
  const portrait=describeDimensions(3000,3600,300)
  assert.equal(portrait.ratio,'5:6')
  assert.equal(portrait.orientation,'Portrait')
  assert.equal(portrait.physicalWidth,10)
  assert.equal(portrait.physicalHeight,12)
  assert.equal(describeDimensions(4800,2700,300).ratio,'16:9')
  assert.equal(describeDimensions(3000,3000,150).orientation,'Square')
  assert.deepEqual([describeDimensions(3600,4800,300).physicalWidth,describeDimensions(3600,4800,300).physicalHeight],[12,16])
  assert.deepEqual([describeDimensions(3000,4500,300).physicalWidth,describeDimensions(3000,4500,300).physicalHeight],[10,15])
  assert.deepEqual([describeDimensions(3600,3600,300).physicalWidth,describeDimensions(3600,3600,300).physicalHeight],[12,12])
  assert.equal(describeDimensions(2700,4800,300).ratio,'9:16')
})

test('PPI changes physical size without changing pixel ratio', () => {
  const low=describeDimensions(3000,3600,150), high=describeDimensions(3000,3600,300)
  assert.equal(low.ratio,high.ratio)
  assert.equal(low.physicalWidth,20)
  assert.equal(high.physicalWidth,10)
})

test('proportional resize works from either target dimension', () => {
  assert.deepEqual(proportionalResize(3000,3600,1500,''),{width:1500,height:1800})
  assert.deepEqual(proportionalResize(3000,3600,'',1800),{width:1500,height:1800})
})

test('calculators reject invalid values clearly', () => {
  assert.throws(()=>describeDimensions(0,3600,300),/greater than zero/)
  assert.throws(()=>describeDimensions(3000,3600,72),/150, 200, or 300/)
  assert.throws(()=>describeDimensions(100001,3600,300),/unreasonably large/)
  assert.throws(()=>proportionalResize(3000,3600,'',''),/target width or height/)
})

test('age-aware starting widths cover newborn through teens', () => {
  assert.equal(printRangeForAge('Newborn'),'2.5–4 in')
  assert.equal(printRangeForAge('6–12 Months'),'3–5 in')
  assert.equal(printRangeForAge('Toddler'),'5–7 in')
  assert.equal(printRangeForAge('Little Kids'),'6–8 in')
  assert.equal(printRangeForAge('Big Kids'),'7–9.5 in')
  assert.equal(printRangeForAge('Tweens'),'8–10.5 in')
  assert.equal(printRangeForAge('Teens 13–17'),'9–12 in')
})

test('garment zones and hierarchy reject invalid placements and avoid duplicate zones', () => {
  assert.ok(validZones('Hoodie').includes('hood'))
  assert.ok(validZones('Skirt').includes('hem border'))
  assert.ok(validZones('Joggers').includes('side leg'))
  const plan=zoneHierarchy('T-shirt',['center front','center front','sleeve','hood'])
  assert.deepEqual(plan.map((item)=>item.role),['HERO','SUPPORT'])
  assert.deepEqual(plan.map((item)=>item.zone),['center front','sleeve'])
})

test('outfit and Match Mini guidance scale each garment or wearer independently', () => {
  assert.match(outfitPlacementGuidance('Hoodie + joggers'),/Hoodie: hero placement/i)
  const match=matchMiniSizingGuidance([{age:'Toddler',product:'T-shirt'},{age:'Teens 13–17',product:'Hoodie'}])
  assert.match(match,/5–7 in/)
  assert.match(match,/9–12 in/)
})

test('DTF, sublimation, faux materials, and exact typography receive production cautions', () => {
  assert.match(productionMethodGuidance('DTF','Bodysuit','Newborn'),/heavy ink coverage/i)
  assert.match(productionMethodGuidance('Sublimation','T-shirt','Big Kids'),/vendor’s exact blank, manufacturer template/i)
  const guidance=buildProductionGuidance({age:'Toddler',product:'T-shirt',production:'DTF',material:'Faux chenille',zones:['center front'],phrase:'THIS EXACT LONG PHRASE MUST NEVER CHANGE',typography:'Thin script'})
  assert.match(guidance.material,/visual|loops/i)
  assert.ok(typographyWarnings('THIS EXACT LONG PHRASE MUST NEVER CHANGE','Thin script').length>=2)
  assert.match(guidance.text,/planning guidance/i)
  for (const material of ['Faux chenille','Faux rhinestones','Faux puff ink','Faux embroidery']) {
    assert.match(buildProductionGuidance({age:'Toddler',product:'T-shirt',material}).material,/small|scale|broad|larger|bold|visible|simplified/i)
  }
})

test('adding production guidance creates a modified copy and leaves source untouched', () => {
  const original='Create an original kids apparel graphic.'
  const guidance=buildProductionGuidance({age:'Toddler',product:'T-shirt',production:'DTF',zones:['center front']})
  const updated=appendProductionGuidance(original,guidance)
  assert.equal(original,'Create an original kids apparel graphic.')
  assert.match(updated,/PRODUCTION PLANNING GUIDANCE/)
  assert.match(updated,/confirm final specifications/i)
})

test('reset defaults affect sizing selections only', () => {
  const source={age:'Tweens',product:'Hoodie',production:'Sublimation',material:'Faux embroidery',unrelated:'locked'}
  const reset=defaultSizingState(source)
  assert.equal(reset.age,'Tweens')
  assert.equal(reset.product,'Hoodie')
  assert.equal(source.unrelated,'locked')
  assert.equal(reset.pixelWidth,3000)
})

test('Production Center UI is wired, responsive, accessible, and keeps BooBoo in flow', async () => {
  const [ui,css]=await Promise.all([readFile(new URL('../ui/workspace.js',import.meta.url),'utf8'),readFile(new URL('../styles.css',import.meta.url),'utf8')])
  assert.match(ui,/SIZING & PRODUCTION CENTER/)
  assert.match(ui,/data-production-prompt/)
  assert.match(ui,/ADD GUIDANCE TO COPY/)
  assert.match(ui,/COPY SIZING RESULTS/)
  assert.match(ui,/aria-live="polite"/)
  assert.match(css,/\.production-booboo\{position:static\}/)
  assert.match(css,/@media\(max-width:820px\).*production-grid/s)
  assert.match(css,/@media\(max-width:520px\).*production-center/s)
})
