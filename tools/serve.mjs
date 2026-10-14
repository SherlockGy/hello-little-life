// 本地预览服务器：node tools/serve.mjs [端口]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ttf': 'font/ttf', '.m4a': 'audio/mp4', '.json': 'application/json', '.png': 'image/png', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { const idx = path.join(p, 'index.html'); if (fs.existsSync(idx)) return send(idx, req, res); res.writeHead(404); return res.end('not found'); }
  send(p, req, res);
}).listen(+(process.argv[2] || 8765), () => console.log('http://localhost:' + (process.argv[2] || 8765)));
function send(p, req, res) {
  const size = fs.statSync(p).size, type = TYPES[path.extname(p)] || 'application/octet-stream';
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) { const a = +m[1] || 0, b = m[2] ? +m[2] : size - 1; res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 }); fs.createReadStream(p, { start: a, end: b }).pipe(res); }
  else { res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); fs.createReadStream(p).pipe(res); }
}
