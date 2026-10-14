// 逐帧跑一遍渲染（不截图），报告所有异常：node tools/check.mjs [fps]
import { launch } from './browser.mjs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fps = +(process.argv[2] || 30);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '?render=1'); await p.evaluate(() => window.ready);
const t0 = Date.now();
const errs = await p.evaluate(fps => { window.__errors = []; const D = TIMELINE.duration; for (let f = 0; f < D * fps; f++) window.renderAt(f / fps); return window.__errors; }, fps);
console.log(`检查完成 ${((Date.now() - t0) / 1000).toFixed(0)}s，异常 ${errs.length} 个`); errs.slice(0, 30).forEach(e => console.log('  ' + e));
await b.close();
