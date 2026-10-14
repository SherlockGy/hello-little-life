// MiniMax 语音合成（同步 HTTP 接口）。只从环境变量读取 MINIMAX_API_KEY / MINIMAX_API_HOST，不打印密钥。
import fs from 'node:fs';
const HOSTS = [process.env.MINIMAX_API_HOST, 'https://api.minimax.cn', 'https://api.minimaxi.com'].filter(Boolean);
export const TONE = ['着床/(zhuo2)(chuang2)', '长长/(chang2)(chang2)', '长大/(zhang3)(da4)'];
export async function tts(text, out, { voice, model = 'speech-2.8-hd', speed = 0.95, pitch = 0, vol = 1, emotion } = {}) {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error('没有找到环境变量 MINIMAX_API_KEY');
  const body = {
    model, text, stream: false,
    voice_setting: { voice_id: voice, speed, vol, pitch, ...(emotion ? { emotion } : {}) },
    pronunciation_dict: { tone: TONE },
    audio_setting: { sample_rate: 44100, bitrate: 128000, format: 'mp3', channel: 1 },
  };
  let lastErr;
  for (const host of HOSTS) {
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const r = await fetch(`${host}/v1/t2a_v2`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json();
        if (j?.base_resp?.status_code !== 0 || !j?.data?.audio) throw new Error(`MiniMax 返回错误：${j?.base_resp?.status_code} ${j?.base_resp?.status_msg}`);
        fs.writeFileSync(out, Buffer.from(j.data.audio, 'hex'));
        return j.extra_info;
      } catch (e) { lastErr = e; if (/1004|2049|invalid api key|鉴权/i.test(e.message)) break; await new Promise(r => setTimeout(r, /1002|rate limit/i.test(e.message) ? 15000 : 1500 * (attempt + 1))); }
    }
  }
  throw lastErr;
}
