// 生成旁白音频（macOS say）并据此排出整部片子的时间轴 → src/timeline.js
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src/script.js'), 'utf8'), ctx);
const FILM = ctx.FILM;
const VOICE_DIR = path.join(ROOT, 'assets/voice');
fs.mkdirSync(VOICE_DIR, { recursive: true });

const dur = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const cachePath = path.join(VOICE_DIR, 'cache.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

// 估算一句话中某个短语开始的时刻（按字数加权，标点算停顿）
const weight = ch => ('，。！？：；、'.includes(ch) ? 2.2 : '…—'.includes(ch) ? 1.2 : ch === ' ' ? 0 : 1);
const wsum = s => [...s].reduce((a, c) => a + weight(c), 0);

// 旁白文本 → 合成引擎的输入
const V = FILM.voice;
const MM = V.engine === 'minimax';
function ttsText(ln) {
  if (!MM) return (ln.say ?? ln.t).replace(/——/g, '，');
  return (ln.mm ?? ln.t).replace(/——！/g, '！<#0.4#>').replace(/——/g, '，').replace(/\[\[slnc (\d+)\]\]/g, (_, ms) => `<#${(ms / 1000).toFixed(1)}#>`);
}
const fileFor = (sc, i, ln) => {
  const key = MM ? `mm|${V.voice}|${V.speed}|${ttsText(ln)}` : `${V.name}|${V.rate}|${ttsText(ln)}`;
  return `${sc.id}_${i}_${crypto.createHash('md5').update(key).digest('hex').slice(0, 10)}.${MM ? 'mp3' : 'aiff'}`;
};
// 先并行生成所有缺失的音频
{
  const jobs = [];
  for (const sc of FILM.scenes) sc.lines.forEach((ln, i) => { const f = path.join(VOICE_DIR, fileFor(sc, i, ln)); if (!fs.existsSync(f)) jobs.push([f, ttsText(ln)]); });
  if (jobs.length) console.log(`需要合成 ${jobs.length} 句旁白…`);
  if (MM) {
    const { tts } = await import('./minimax_tts.mjs');
    let k = 0;
    await Promise.all([...Array(1)].map(async () => { while (k < jobs.length) { const [f, text] = jobs[k++]; await tts(text, f, { voice: V.voice, speed: V.speed }); process.stdout.write('.'); } }));
    if (jobs.length) console.log();
  } else for (const [f, text] of jobs) execFileSync('say', ['-v', V.name, '-r', String(V.rate), '-o', f, text]);
}

let T = 0;
const scenes = [];
const sfx = [];
for (const sc of FILM.scenes) {
  const start = T;
  const lines = [];
  let cur = sc.pre ?? 2;
  sc.lines.forEach((ln, i) => {
    const file = fileFor(sc, i, ln);
    const fp = path.join(VOICE_DIR, file);
    const d = cache[file] ?? (cache[file] = dur(fp));
    lines.push({ t: ln.t, start: cur, end: cur + d, file, ...(ln.nosub ? { nosub: true } : {}) });
    cur += d + (ln.gap ?? sc.gap ?? 1.2);
  });
  let d = lines.length ? lines[lines.length - 1].end + (sc.post ?? 2) : 0;
  d = Math.max(d, sc.minDur ?? 0);
  const S = {
    dur: d,
    L: i => lines[i],
    at: (i, phrase) => {
      const ln = lines[i];
      const idx = ln.t.indexOf(phrase);
      if (idx < 0) throw new Error(`phrase "${phrase}" not in ${sc.id}#${i}`);
      return ln.start + (ln.end - ln.start) * (wsum(ln.t.slice(0, idx)) / wsum(ln.t));
    },
  };
  const cards = (sc.cards || []).map((c, k, arr) => ({
    title: c.title, text: c.text,
    start: lines[c.at].start - 0.2,
    end: c.until !== undefined ? lines[c.until].start - 0.6 : k + 1 < arr.length ? lines[arr[k + 1].at].start - 0.6 : d - 0.8,
  }));
  const cues = sc.cues ? sc.cues(S) : {};
  (sc.sfx ? sc.sfx(S, cues) : []).forEach(e => sfx.push({ ...e, t: +(start + e.t).toFixed(3) }));
  scenes.push({ id: sc.id, chapter: sc.chapter || null, num: sc.num || 0, mood: sc.mood, start: +start.toFixed(3), dur: +d.toFixed(3), lines, cards, cues });
  T += d;
}
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
// 清理不再使用的旧音频
const used = new Set(scenes.flatMap(s => s.lines.map(l => l.file)));
for (const f of fs.readdirSync(VOICE_DIR)) if (/\.(aiff|mp3)$/.test(f) && !used.has(f)) fs.unlinkSync(path.join(VOICE_DIR, f));

const timeline = { duration: +T.toFixed(3), fade: FILM.fade, meta: { title: FILM.title, subtitle: FILM.subtitle, note: FILM.note, credits: FILM.credits }, scenes, sfx };
fs.writeFileSync(path.join(ROOT, 'src/timeline.js'), '/* 自动生成：node tools/build_voice.mjs */\nwindow.TIMELINE = ' + JSON.stringify(timeline) + ';\n');
fs.writeFileSync(path.join(ROOT, 'tools/timeline.json'), JSON.stringify(timeline, null, 1));
console.log(`总时长 ${Math.floor(T / 60)}分${(T % 60).toFixed(1)}秒，${scenes.length} 幕`);
for (const s of scenes) console.log(`  ${s.id.padEnd(10)} @${s.start.toFixed(1).padStart(6)}  ${s.dur.toFixed(1)}s`);
