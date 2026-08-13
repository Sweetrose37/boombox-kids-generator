export const PPI_OPTIONS = [150, 200, 300]

export const referenceSizes = [
  { label:'5:6 · 10 × 12 in', width:3000, height:3600 },
  { label:'3:4 · 12 × 16 in', width:3600, height:4800 },
  { label:'2:3 · 10 × 15 in', width:3000, height:4500 },
  { label:'1:1 · 12 × 12 in', width:3600, height:3600 },
  { label:'5:6 · 15 × 18 in', width:4500, height:5400 },
]

const commonRatios = [[1,1],[2,3],[3,4],[4,5],[5,6],[16,9]]
const positive = (value, label) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be greater than zero.`)
  if (number > 100000) throw new Error(`${label} is unreasonably large; use 100,000 or less.`)
  return number
}
const rounded = (value, places=2) => Number(value.toFixed(places))

export function describeDimensions(width, height, ppi=300) {
  const w=positive(width,'Pixel width'), h=positive(height,'Pixel height'), density=positive(ppi,'PPI')
  const ratio=w/h
  if (!PPI_OPTIONS.includes(density)) throw new Error('PPI must be 150, 200, or 300.')
  const candidates=commonRatios.flatMap(([rw,rh])=>rw===rh?[[rw,rh]]:[[rw,rh],[rh,rw]])
  const common=candidates.find(([rw,rh])=>Math.abs(ratio-(rw/rh))<0.004)
  const ratioLabel=common ? `${common[0]}:${common[1]}` : `${rounded(ratio,3)}:1 actual`
  return {
    width:w, height:h, ppi:density, ratio:ratioLabel,
    orientation:w===h?'Square':w>h?'Landscape':'Portrait',
    physicalWidth:rounded(w/density), physicalHeight:rounded(h/density),
  }
}

export function proportionalResize(width, height, targetWidth='', targetHeight='') {
  const w=positive(width,'Original width'), h=positive(height,'Original height')
  if (targetWidth !== '' && targetWidth != null) {
    const nextWidth=positive(targetWidth,'Target width')
    return { width:rounded(nextWidth), height:rounded(nextWidth*(h/w)) }
  }
  if (targetHeight !== '' && targetHeight != null) {
    const nextHeight=positive(targetHeight,'Target height')
    return { width:rounded(nextHeight*(w/h)), height:rounded(nextHeight) }
  }
  throw new Error('Enter a target width or height.')
}

export function defaultSizingState(source={}) {
  const pixelWidth=Number(source.pixelWidth)||3000,pixelHeight=Number(source.pixelHeight)||3600
  return { pixelWidth, pixelHeight, ppi:[150,200,300].includes(Number(source.ppi))?Number(source.ppi):300, originalWidth:pixelWidth, originalHeight:pixelHeight, targetWidth:2400, targetHeight:'', age:source.age || 'Toddler', product:source.product || 'T-shirt', production:source.production || 'DTF', material:source.material || 'None', zones:Array.isArray(source.zones)?[...source.zones]:[] }
}
