// 用法：node tools/snap.mjs [--page test.html] [--scale 0.5] 时间1 时间2 ...  → output/snaps/*.png
import { launch } from './browser.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let page = 'index.html', scale = 0.5, outDir = process.env.SNAP_DIR || path.join(ROOT, 'output/snaps');
const times = [];
for (let i = 0; i < args.length; i++) { if (args[i] === '--page') page = args[++i]; else if (args[i] === '--scale') scale = +args[++i]; else if (args[i] === '--out') outDir = args[++i]; else times.push(args[i]); }
const out = outDir; fs.mkdirSync(out, { recursive: true });
const b = await launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text()); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(pathToFileURL(path.join(ROOT, page)).href + '?render=1');
await p.evaluate(() => window.ready);
for (const t of times) {
  const t0 = Date.now();
  const ok = await p.evaluate(T => { try { window.renderAt(+T); return 'ok'; } catch (e) { return e.stack; } }, t);
  if (ok !== 'ok') { console.log('ERR at', t, ok); continue; }
  const f = path.join(out, `t_${String(t).replace('.', '_')}.png`);
  await p.locator('canvas').screenshot({ path: f });
  console.log(f, (Date.now() - t0) + 'ms');
}
await b.close();
