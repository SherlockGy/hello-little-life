// 由时间轴生成字幕文件 output/你好小生命.srt
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/timeline.json'), 'utf8'));
const ts = s => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
let n = 0, out = '';
for (const s of TL.scenes) for (const l of s.lines) { out += `${++n}\n${ts(s.start + l.start)} --> ${ts(s.start + l.end + 0.3)}\n${l.t}\n\n`; }
fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'output/你好小生命.srt'), out);
console.log(`${n} 条字幕`);
