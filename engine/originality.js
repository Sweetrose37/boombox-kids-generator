const tracked = ['age','character','mascot','hairstyle','fashion','pose','composition','artStyle','typography','palette','material','phrase','product']
export const signature = (state) => tracked.map((key) => state[key] || '').join('|')
export function noveltyScore(candidate, recent=[]) {
  if (!recent.length) return 1
  const values = tracked.map((key) => candidate[key])
  return Math.min(...recent.map((item) => values.reduce((score,value,index) => score + (value !== item[index] ? 1 : 0),0) / tracked.length))
}
export function remember(candidate, recent, limit=12) { recent.unshift(tracked.map((key) => candidate[key])); recent.splice(limit); return recent }
