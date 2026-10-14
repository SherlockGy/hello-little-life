"""合成整部片子的声音：旁白 + 算法作曲的配乐 + 音效 + 环境声 → assets/soundtrack.wav / .m4a
依赖：numpy、ffmpeg。用法：python3 tools/build_audio.py
"""
import json, os, subprocess, math
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'tools/timeline.json'), encoding='utf-8'))
DUR = TL['duration'] + 1.0
N = int(DUR * SR)
rng = np.random.default_rng(7)

def secs(x): return int(round(x * SR))
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

def load_voice(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def add(buf, x, t0, gain=1.0, pan=0.0):
    """把单声道或立体声片段叠加到 buf（2×N）的 t0 秒处，pan -1..1"""
    i0 = secs(t0)
    if x.ndim == 1:
        l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        x = np.vstack([x * l * 1.414, x * r * 1.414])
    if i0 < 0: x = x[:, -i0:]; i0 = 0
    n = min(x.shape[1], buf.shape[1] - i0)
    if n > 0: buf[:, i0:i0 + n] += x[:, :n] * gain

def fft_filter(x, lo=None, hi=None, order=2):
    """零相位频域带通（适合短片段与中等长度环境声）"""
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * g, n)

def conv_ola(x, ir, block=1 << 17):
    """分块 FFT 卷积（长信号混响）"""
    m = len(ir); nfft = 1 << int(np.ceil(np.log2(block + m - 1)))
    IR = np.fft.rfft(ir, nfft); y = np.zeros(len(x) + m - 1)
    for s in range(0, len(x), block):
        seg = x[s:s + block]; Y = np.fft.irfft(np.fft.rfft(seg, nfft) * IR, nfft)[:len(seg) + m - 1]
        y[s:s + len(seg) + m - 1] += Y
    return y[:len(x)]

def make_ir(sec, decay, seed, bright=6000):
    r = np.random.default_rng(seed); n = secs(sec); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * decay)
    ir = fft_filter(ir, hi=bright, order=1); ir[:secs(0.012)] *= np.linspace(0, 1, secs(0.012))
    return ir / np.sqrt(np.sum(ir ** 2))

# ------------------------------------------------------------------ 乐器
def env(n, a, r, hold=None):
    e = np.ones(n); na = max(1, secs(a)); nr = max(1, secs(r))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr < n: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e

def pad_note(f, dur, amp, bright=1.0, att=1.2, rel=1.6):
    n = secs(dur + rel); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ch, det in enumerate((0.9985, 1.0015)):
        x = np.zeros(n)
        for h in range(1, 7):
            x += (1 / h ** (2.2 - 0.6 * bright)) * np.sin(2 * np.pi * f * det * h * t + h * 1.3 + ch)
        vib = 1 + 0.08 * np.sin(2 * np.pi * 0.3 * t + ch)
        out[ch] = x * vib
    return out * env(n, att, rel) * amp

def bell(f, amp, dec=1.0, dur=2.6):
    n = secs(dur); t = np.arange(n) / SR; x = np.zeros(n)
    for k, (m, a) in enumerate([(1, 1), (2.0, 0.32), (3.0, 0.1), (4.16, 0.08), (5.43, 0.05)]):
        x += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (1.6 + k * 1.8) / dec)
    x[:secs(0.004)] *= np.linspace(0, 1, secs(0.004))
    return x * amp

def marimba(f, amp):
    n = secs(0.9); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 22) + 0.06 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    x[:secs(0.003)] *= np.linspace(0, 1, secs(0.003))
    return x * amp

def bass_note(f, dur, amp):
    n = secs(dur + 0.5); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return x * env(n, 0.04, 0.5) * np.exp(-t * 0.35) * amp

# ------------------------------------------------------------------ 和声与曲风
CH = {
    'F': ([53, 57, 60, 65], 41), 'Fmaj7': ([53, 57, 60, 64], 41), 'F/A': ([53, 57, 60, 65], 45),
    'Dm': ([50, 53, 57, 62], 38), 'Dm9': ([50, 53, 57, 60, 64], 38), 'Am': ([52, 57, 60, 64], 45),
    'Bb': ([53, 58, 62, 65], 46), 'Bbmaj7': ([53, 57, 58, 62], 46), 'C': ([52, 55, 60, 64], 48),
    'Csus': ([53, 55, 60, 65], 48), 'Gm': ([50, 55, 58, 62], 43),
}
SCALE = [0, 2, 4, 7, 9]  # F 大调五声：F G A C D（相对 F）
MOOD = {
    #            和弦进行                                   BPM  pad  旋律音色  节奏型（拍）                       旋律音量 低音  琶音
    'mystery':  (['Dm9', 'Bbmaj7', 'Fmaj7', 'Csus'],         64, .16, 'bell', [0, 3],                            .10, .05, 0),
    'wonder':   (['F', 'Am', 'Bb', 'C'],                     72, .15, 'bell', [0, 1.5, 2, 3],                    .10, .07, 0),
    'adventure':(['Dm', 'Bb', 'F', 'C'],                     92, .13, 'marimba', [0, .5, 1, 1.5, 2, 2.5, 3, 3.5], .09, .10, 1),
    'playful':  (['F', 'C', 'Dm', 'Bb'],                     96, .12, 'marimba', [0, .5, 1, 2, 2.5, 3],          .10, .09, 0),
    'tender':   (['Bb', 'F/A', 'Gm', 'C'],                   68, .16, 'bell', [0, 2, 3],                         .09, .07, 0),
    'heart':    (['Dm9', 'Bbmaj7'],                          60, .12, 'bell', [0],                               .06, .04, 0),
    'dream':    (['Fmaj7', 'Bbmaj7'],                        56, .15, 'bell', [0, 2.5],                          .07, .05, 0),
    'build':    (['Dm', 'Bb', 'F', 'C'],                     84, .15, 'marimba', [0, 1, 2, 3],                   .08, .11, 1),
    'joy':      (['F', 'C', 'Bb', 'F'],                      100, .14, 'marimba', [0, .5, 1, 1.5, 2, 3],        .10, .09, 1),
    'finale':   (['F', 'Am', 'Bb', 'C', 'Dm', 'Bb', 'Csus', 'F'], 72, .17, 'bell', [0, 1, 2, 3],                .10, .09, 0),
}

# 主题摇篮曲（8 小节，F 大调）：(拍位, MIDI, 时值拍)
THEME = [
    [(0, 72, 1), (1, 69, 1), (2, 65, 1), (3, 69, 1)],
    [(0, 72, 2), (2, 74, 1), (3, 72, 1)],
    [(0, 74, 1), (1, 72, 1), (2, 69, 1), (3, 65, 1)],
    [(0, 67, 3)],
    [(0, 72, 1), (1, 69, 1), (2, 65, 1), (3, 69, 1)],
    [(0, 72, 2), (2, 76, 1), (3, 74, 1)],
    [(0, 74, 1), (1, 72, 1), (2, 69, 1), (3, 67, 1)],
    [(0, 65, 3)],
]
THEME_PROG = ['F', 'Am', 'Bb', 'C', 'F', 'Am', 'Bb', 'F']
THEME_MOODS = {'lullaby': (66, .15, .13, .07), 'finale': (72, .17, .14, .09)}  # BPM, pad, 旋律, 低音

def render_theme_music(sc, out):
    bpm, pad_amp, mel_amp, bass_amp = THEME_MOODS[sc['mood']]
    beat = 60 / bpm; bar = 4 * beat
    t0 = sc['start'] - 0.8; t1 = sc['start'] + sc['dur'] + 1.2
    seg = np.zeros((2, secs(t1 - t0 + 4)))
    nbars = int(np.ceil((t1 - t0) / bar)) + 1
    for b in range(nbars):
        chord = THEME_PROG[b % 8]; notes, bs = CH[chord]; tb = b * bar
        for k, n in enumerate(notes):
            add(seg, pad_note(midi(n), bar, pad_amp / len(notes) * 1.6, bright=0.8), tb, pan=(k / (len(notes) - 1) - 0.5) * 0.6)
        add(seg, bass_note(midi(bs), bar * 0.9, bass_amp), tb)
        # 分解和弦（八分音符，轻）
        for i in range(8):
            n = notes[[0, 2, 1, 3, 2, 1, 3, 2][i] % len(notes)] + 12
            add(seg, bell(midi(n), 0.022, dec=0.5, dur=1.2), tb + i * beat / 2, pan=((i % 4) - 1.5) * 0.35)
        # 主题：第一遍只奏前四小节的轮廓，之后完整；每 16 小节升八度一次作变化
        if b % 16 >= 8 or b < 8:
            for (bt, m, ln) in THEME[b % 8]:
                oct_up = 12 if (b // 8) % 2 == 1 else 0
                add(seg, bell(midi(m + oct_up), mel_amp * (0.85 if oct_up else 1), dec=1.3 + ln * 0.3, dur=2.8), tb + bt * beat, pan=0.1)
                if sc['mood'] == 'finale' and b >= 8:  # 低八度的温暖和声
                    add(seg, bell(midi(m - 12), mel_amp * 0.35, dec=1.2, dur=2.4), tb + bt * beat, pan=-0.2)
    n = min(seg.shape[1], secs(t1 - t0)); seg = seg[:, :n]
    fin, fout = secs(1.6), secs(1.8)
    seg[:, :fin] *= np.linspace(0, 1, fin) ** 1.5
    seg[:, -fout:] *= np.linspace(1, 0, fout) ** 1.5
    add(out, seg, t0)

def melody_pitch(chord, deg_seed, prev):
    notes, _ = CH[chord]; root = notes[0] % 12
    cands = [65 + 12 * o + s for o in (0, 1) for s in SCALE if 72 <= 65 + 12 * o + s <= 89]
    tones = set(n % 12 for n in notes)
    w = np.array([(3.0 if c % 12 in tones else 1.0) / (1 + abs(c - prev) / 3) for c in cands])
    r = np.random.default_rng(deg_seed); return int(r.choice(cands, p=w / w.sum()))

def render_scene_music(sc, out, seed):
    prog, bpm, pad_amp, inst, rhythm, mel_amp, bass_amp, arp = MOOD[sc['mood']]
    beat = 60 / bpm; bar = 4 * beat
    t0 = sc['start'] - 0.8; t1 = sc['start'] + sc['dur'] + 1.2
    seg = np.zeros((2, secs(t1 - t0 + 4)))
    nbars = int(np.ceil((t1 - t0) / bar)) + 1
    prev = 77; motif = {}
    for b in range(nbars):
        chord = prog[b % len(prog)]; notes, bs = CH[chord]; tb = b * bar
        for k, n in enumerate(notes):
            add(seg, pad_note(midi(n), bar, pad_amp / len(notes) * 1.6, bright=0.8), tb, pan=(k / (len(notes) - 1) - 0.5) * 0.6)
        if bass_amp: add(seg, bass_note(midi(bs), bar * 0.9, bass_amp), tb)
        if arp:
            for i in range(8):
                n = notes[i % len(notes)] + 12
                add(seg, marimba(midi(n), 0.035), tb + i * beat / 2, pan=((i % 4) - 1.5) * 0.3)
        # 旋律：两小节动机重复 + 变化
        key = b % 2
        if b >= 1 and (b % 4) != 3:
            for j, rb in enumerate(rhythm):
                if key in motif and j < len(motif[key]) and b % 4 == 2:
                    p = motif[key][j]
                else:
                    p = melody_pitch(chord, seed * 1000 + b * 17 + j, prev)
                    motif.setdefault(key, []).append(p)
                prev = p
                vel = mel_amp * (0.8 + 0.2 * (j == 0))
                x = bell(midi(p), vel, dec=1.2 if inst == 'bell' else 0.5) if inst == 'bell' else marimba(midi(p), vel * 1.2)
                add(seg, x, tb + rb * beat, pan=0.25 * math.sin(b + j))
    # 场景内淡入淡出，与相邻场景交叉
    n = min(seg.shape[1], secs(t1 - t0)); seg = seg[:, :n]
    fin, fout = secs(1.6), secs(1.8)
    seg[:, :fin] *= np.linspace(0, 1, fin) ** 1.5
    seg[:, -fout:] *= np.linspace(1, 0, fout) ** 1.5
    add(out, seg, t0)

# ------------------------------------------------------------------ 音效
def noise(sec, seed=0): return np.random.default_rng(seed).standard_normal(secs(sec))

def sfx_sparkle(seed):
    r = np.random.default_rng(seed); out = np.zeros((2, secs(1.6)))
    for i in range(7):
        f = midi(84 + int(r.choice(SCALE)) + 12 * int(r.integers(0, 2)))
        add(out, bell(f, 0.05, dec=0.35, dur=0.9), i * 0.07, pan=r.uniform(-0.7, 0.7))
    return out
def sfx_pop(seed):
    n = secs(0.18); t = np.arange(n) / SR; f = 320 + 900 * (1 - np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30); return x * 0.35
def sfx_swish(seed, sec=0.7):
    x = noise(sec, seed); n = len(x); t = np.arange(n) / SR
    x = fft_filter(x, lo=900, hi=5000); e = np.sin(np.pi * t / sec) ** 2; return x * e * 0.12
def sfx_bloom(seed):
    n = secs(1.6); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * midi(m) * t * (1 + 0.004 * t)) for m in (65, 72, 77)) / 3
    return x * np.sin(np.pi * np.clip(t / 1.6, 0, 1)) ** 2 * 0.18
def sfx_thump(seed):
    n = secs(0.5); t = np.arange(n) / SR; out = np.zeros(n)
    for d, a in ((0, 1.0), (0.17, 0.6)):
        i = secs(d); tt = t[:n - i]; f = 75 * np.exp(-tt * 6) + 38
        out[i:] += a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22)
    sw = fft_filter(noise(0.5, seed), hi=500) * np.exp(-t * 9) * 0.25
    return (out + sw) * 0.5
def sfx_boing(seed):
    n = secs(0.5); t = np.arange(n) / SR; f = 260 + 220 * t / 0.5 + 40 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.16
def sfx_hic(seed):
    n = secs(0.25); t = np.arange(n) / SR
    x = fft_filter(noise(0.25, seed), lo=700, hi=2500) * np.exp(-t * 40) * 0.4
    f = 520 + 380 * np.exp(-t * 25); x += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.25
    return x
def sfx_squeeze(seed):
    n = secs(2.4); t = np.arange(n) / SR; e = np.sin(np.pi * t / 2.4) ** 2
    x = fft_filter(noise(2.4, seed), hi=260) * 0.6 + 0.5 * np.sin(2 * np.pi * 55 * t)
    return x * e * 0.22
def sfx_crack(seed):
    out = np.zeros(secs(0.6)); r = np.random.default_rng(seed)
    for i in range(6):
        k = secs(r.uniform(0, 0.4)); c = fft_filter(noise(0.03, seed + i), lo=1500) * np.exp(-np.arange(secs(0.03)) / SR * 150)
        out[k:k + len(c)] += c * r.uniform(0.1, 0.25)
    return out
def sfx_chime(seed):
    out = np.zeros((2, secs(3))); add(out, bell(midi(84), 0.09, 1.2, 2.8), 0, pan=-0.2); add(out, bell(midi(89), 0.08, 1.2, 2.8), 0.18, pan=0.2); return out
def sfx_click(seed):
    n = secs(0.3); t = np.arange(n) / SR; x = np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 90) * 0.3
    out = np.zeros((2, secs(2))); add(out, x, 0); add(out, bell(midi(81), 0.06, 0.8, 1.8), 0.05); return out
def sfx_fert(seed):
    out = np.zeros((2, secs(5)))
    n = secs(3.5); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t * 1.5) + 40) / SR) * np.exp(-t * 2.2) * 0.45
    add(out, boom, 0)
    for i, m in enumerate([65, 69, 72, 77, 81, 84, 89]):
        add(out, bell(midi(m), 0.07, 1.6, 3.5), i * 0.06, pan=(i / 6 - 0.5))
    add(out, sfx_sparkle(seed), 0.3)
    return out
def sfx_title(seed):
    out = np.zeros((2, secs(6)))
    for m in (53, 60, 65, 69, 72):
        add(out, pad_note(midi(m), 3.0, 0.05, att=0.8, rel=2.0), 0)
    for i, m in enumerate([72, 77, 81, 84, 89]):
        add(out, bell(midi(m), 0.06, 1.4, 3), 0.4 + i * 0.12, pan=(i / 4 - 0.5) * 0.8)
    return out
def sfx_burst(seed):
    out = np.zeros((2, secs(5)))
    sw = fft_filter(noise(1.2, seed), lo=400, hi=8000); t = np.arange(len(sw)) / SR
    add(out, sw * (t / 1.2) ** 2 * np.exp(-np.maximum(0, t - 1.0) * 20) * 0.12, -1.0)
    for i, m in enumerate([77, 81, 84, 89, 93]):
        add(out, bell(midi(m), 0.07, 1.2, 3), i * 0.05, pan=(i / 4 - 0.5))
    return out

SFX = {'sparkle': sfx_sparkle, 'pop': sfx_pop, 'swish': sfx_swish, 'bloom': sfx_bloom, 'thump': sfx_thump, 'boing': sfx_boing,
       'hic': sfx_hic, 'squeeze': sfx_squeeze, 'crack': sfx_crack, 'chime': sfx_chime, 'click': sfx_click, 'fert': sfx_fert,
       'title': sfx_title, 'burst': sfx_burst}
SFX_GAIN = {'thump': 1.2, 'pop': 0.9, 'hic': 1.0, 'squeeze': 1.0}

# ------------------------------------------------------------------ 环境声
def womb_ambience(sec, seed, level):
    n = secs(sec); t = np.arange(n) / SR
    x = fft_filter(noise(sec, seed), lo=25, hi=320, order=2)
    x /= np.std(x) + 1e-9
    p = (t * 72 / 60) % 1  # 妈妈的心跳 72 次/分：每拍一次“呼——”
    beat = np.exp(-((p - 0.05) / 0.09) ** 2) + 0.6 * np.exp(-((p - 0.3) / 0.09) ** 2)
    y = x * (0.35 + 0.9 * beat) * level
    f = secs(1.5); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y
def tube_ambience(sec, seed, level):
    n = secs(sec); t = np.arange(n) / SR
    x = fft_filter(noise(sec, seed), lo=120, hi=900); x /= np.std(x) + 1e-9
    y = x * (0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t)) * level
    f = secs(1.5); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y
AMB = {'implant': ('womb', .030), 'heart': ('womb', .030), 'lifeline': ('womb', .028), 'grow': ('womb', .022), 'womb': ('womb', .060), 'birth': ('womb', .032),
       'meet': ('tube', .016), 'divide': ('tube', .014)}

# ------------------------------------------------------------------ 合成
def main():
    voice = np.zeros(N)
    for sc in TL['scenes']:
        for ln in sc['lines']:
            x = load_voice(os.path.join(ROOT, 'assets/voice', ln['file']))
            rms = np.sqrt(np.mean(x ** 2)) + 1e-9
            x = x * (0.11 / rms)
            i0 = secs(sc['start'] + ln['start']); n = min(len(x), N - i0)
            voice[i0:i0 + n] += x[:n]
    # 轻微房间感
    voice = voice + 0.07 * conv_ola(voice, make_ir(0.5, 9, 3, 5000))
    print('旁白完成')

    music = np.zeros((2, N))
    for k, sc in enumerate(TL['scenes']):
        if sc['mood'] in THEME_MOODS: render_theme_music(sc, music)
        else: render_scene_music(sc, music, seed=k + 1)
    print('配乐完成')
    # 特殊时刻：受精前音乐屏息；分娩末尾渐弱
    def dip(t_center, a, b, depth):
        i0, i1 = secs(t_center - a), secs(t_center + b)
        e = np.ones(i1 - i0); m = len(e)
        e *= 1 - depth * np.sin(np.linspace(0, np.pi, m)) ** 2
        music[:, i0:i1] *= e
    sc = {s['id']: s for s in TL['scenes']}
    dip(sc['meet']['start'] + sc['meet']['cues']['fert'] - 0.4, 2.2, 1.2, 0.85)
    L2 = sc['birth']['lines'][2]
    dip(sc['birth']['start'] + L2['end'] + 0.8, 2.0, 2.2, 0.8)

    fx = np.zeros((2, N))
    for i, e in enumerate(TL['sfx']):
        fn = SFX.get(e['type'])
        if not fn: continue
        x = fn(i + 11)
        add(fx, x, e['t'], gain=SFX_GAIN.get(e['type'], 1.0), pan=0.0 if x.ndim == 2 else float(np.sin(i * 1.7)) * 0.3)
    amb = np.zeros((2, N))
    for s in TL['scenes']:
        if s['id'] in AMB:
            kind, lvl = AMB[s['id']]
            y = (womb_ambience if kind == 'womb' else tube_ambience)(s['dur'] + 1.5, sum(map(ord, s['id'])), lvl)
            add(amb, y, s['start'] - 0.5)
    print('音效与环境声完成')

    # 旁白压低配乐（侧链闪避）
    envv = np.abs(voice); k = secs(0.25)
    cs = np.concatenate([[0], np.cumsum(envv)]); envv = (cs[k:] - cs[:-k]) / k
    envv = np.concatenate([np.zeros(k // 2), envv, np.zeros(k - k // 2 - 1)])[:N]
    envv = np.minimum(1, envv / 0.05)
    # 平滑释放
    k2 = secs(0.6); hw = np.hanning(k2); envv = np.roll(conv_ola(envv, hw / hw.sum()), -k2 // 2)
    duck = 1 - 0.55 * envv
    music *= duck; amb *= (1 - 0.3 * envv)

    # 音乐与音效共用一个温暖的混响
    ir = make_ir(2.2, 2.6, 5, 5500)
    wet = np.vstack([conv_ola(music[0] + fx[0] * 0.6, ir), conv_ola(music[1] + fx[1] * 0.6, np.roll(ir, 37))])
    mix = music * 0.6 + wet * 0.25 + fx * 0.85 + amb + np.vstack([voice, voice]) * 0.72
    if os.environ.get('STATS'):
        db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
        for s in TL['scenes']:
            i0, i1 = secs(s['start']), secs(s['start'] + s['dur'])
            vm = np.abs(voice[i0:i1]) > 0.01
            print(f"{s['id']:9s} voice {db(voice[i0:i1][vm]*0.72):6.1f}  music {db((music[0]*0.85+wet[0]*0.35)[i0:i1]):6.1f}  fx {db(fx[0][i0:i1]):6.1f}  amb {db(amb[0][i0:i1]):6.1f}")
    # 柔和限幅 + 归一
    peak = np.max(np.abs(mix)); print('原始峰值', round(peak, 3))
    mix = mix / max(peak, 1e-9) * 1.25
    mix = np.tanh(mix) / np.tanh(1.25) * 0.89
    fo = secs(2.5); mix[:, -fo:] *= np.linspace(1, 0, fo)
    wav = os.path.join(ROOT, 'assets/soundtrack.wav')
    pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', wav], input=pcm, check=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '192k', os.path.join(ROOT, 'assets/soundtrack.m4a')], check=True)
    print('写出', wav)

if __name__ == '__main__':
    main()
