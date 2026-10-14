import { tts } from './minimax_tts.mjs'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'output/配音试听'); fs.mkdirSync(dir, { recursive: true });
const text = '你知道吗？很久很久以前，你比一粒沙子还要小。<#0.6#>小到……只是一个小小的细胞。<#0.8#>小球轻轻地钻进墙里，安顿下来。这叫做“着床”。';
const V = [['1_温柔学姐', 'Chinese (Mandarin)_Gentle_Senior'], ['2_甜美女声', 'Chinese (Mandarin)_Sweet_Lady'], ['3_温暖闺蜜', 'Chinese (Mandarin)_Warm_Bestie'],
  ['4_阅历姐姐', 'Chinese (Mandarin)_Wise_Women'], ['5_花甲奶奶', 'Chinese (Mandarin)_Kind-hearted_Elder'], ['6_温润男声', 'Chinese (Mandarin)_Gentleman']];
for (const [name, voice] of V) {
  try { const info = await tts(text, path.join(dir, name + '.mp3'), { voice }); console.log('✓', name, info?.audio_length ? (info.audio_length / 1000).toFixed(1) + 's' : ''); }
  catch (e) { console.log('✗', name, e.message); }
}
