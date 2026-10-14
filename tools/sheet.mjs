// 把截图目录按时间排序拼成 2x2 联系表：node tools/sheet.mjs <dir>
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => /^t_.*\.png$/.test(f)).sort((a, b) => parseFloat(a.slice(2).replace('_', '.')) - parseFloat(b.slice(2).replace('_', '.')));
for (let i = 0; i < files.length; i += 4) {
  const g = files.slice(i, i + 4); const args = [];
  g.forEach(f => args.push('-i', path.join(dir, f)));
  let fc = g.map((f, k) => `[${k}]scale=960:540,drawtext=text='${f.slice(2, -4).replace('_', '.')}':x=10:y=10:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.5[v${k}]`).join(';');
  for (let k = g.length; k < 4; k++) fc += `;color=black:s=960x540:d=1[v${k}]`;
  fc += ';[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0';
  const out = path.join(dir, `sheet_${String(i / 4).padStart(2, '0')}.jpg`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', fc, '-frames:v', '1', '-q:v', '3', out]);
  console.log(out);
}
