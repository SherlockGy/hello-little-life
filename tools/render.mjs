// 逐帧渲染整部片子并合成 MP4
// 用法：node tools/render.mjs [--fps 30] [--workers 5] [--from 0] [--to 秒] [--out output/你好小生命.mp4]
import { launch } from './browser.mjs';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/timeline.json'), 'utf8'));
const FPS = +arg('fps', 30), WORKERS = +arg('workers', 5);
const FROM = +arg('from', 0), TO = +arg('to', TL.duration);
const OUT = path.resolve(ROOT, arg('out', 'output/你好小生命.mp4'));
const TMP = path.join(ROOT, 'output/.segments');
fs.mkdirSync(TMP, { recursive: true });
const total = Math.round((TO - FROM) * FPS);
const per = Math.ceil(total / WORKERS);
const t0 = Date.now();
let done = 0;

async function worker(k, browser) {
  const a = k * per, b = Math.min(total, a + per);
  if (a >= b) return null;
  const seg = path.join(TMP, `seg_${String(k).padStart(2, '0')}.mp4`);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error(`[w${k}]`, e.message));
  await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href + '?render=1');
  await page.evaluate(() => window.ready);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const T = FROM + f / FPS;
    const url = await page.evaluate(T => window.grab(T, 0.94), T);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    done++;
    if (done % 150 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`${done}/${total} 帧  已用 ${el.toFixed(0)}s  预计剩余 ${(el / done * (total - done)).toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
  return seg;
}

const browser = await launch();
const segs = (await Promise.all([...Array(WORKERS).keys()].map(k => worker(k, browser)))).filter(Boolean);
await browser.close();
const list = path.join(TMP, 'list.txt');
fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(FROM), '-t', String(TO - FROM), '-i', path.join(ROOT, 'assets/soundtrack.m4a'),
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-movflags', '+faststart',
  '-metadata', 'title=你好，小生命', '-metadata', 'comment=一个细胞变成宝宝的奇妙旅程', '-shortest', OUT], { stdio: 'inherit' });
console.log(`完成：${OUT}  用时 ${((Date.now() - t0) / 1000).toFixed(0)}s`);
