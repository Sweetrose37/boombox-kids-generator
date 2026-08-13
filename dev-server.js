import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = new URL('.', import.meta.url).pathname.replace(/^\/(.:)/, '$1')
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.json':'application/json' }

createServer((request,response) => {
  const requested = request.url.split('?')[0] === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '')
  const path = normalize(join(root, requested))
  if (!path.startsWith(normalize(root)) || !existsSync(path) || statSync(path).isDirectory()) { response.writeHead(404); response.end('Not found'); return }
  response.writeHead(200,{ 'Content-Type':types[extname(path)] || 'application/octet-stream', 'Cache-Control':'no-store' })
  createReadStream(path).pipe(response)
}).listen(4173,'127.0.0.1',() => console.log('BOOMBOX KIDS running at http://127.0.0.1:4173/'))
