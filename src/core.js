/* 核心：数学工具、文字排版、时间轴调度、全局叠加层（字幕 / 知识卡 / 章节标题 / 孕周进度） */
const W = 1920, H = 1080;
const TAU = Math.PI * 2;
const FONT_TITLE = '"ZCOOL KuaiLe", "PingFang SC", "Noto Sans SC", sans-serif';
const FONT_BODY = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';

const PAL = {
  ink: '#140810', plum: '#2a0f1f', wine: '#4a1630', rose: '#8a2a48',
  coral: '#ff8c7a', peach: '#ffc3a6', cream: '#fff4ea', gold: '#ffd27a',
  teal: '#8fe8df', sky: '#9cc9ff', pink: '#ff9cc0', mint: '#b6f0c8',
  skin: '#f6b59e', skinLight: '#ffd9c6', skinDark: '#c9725f',
};

/* ---------- 数学 ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const E = {
  inOut: t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  out: t => 1 - Math.pow(1 - clamp(t), 3),
  in: t => Math.pow(clamp(t), 3),
  outBack: t => { t = clamp(t); if (t <= 0) return 0; const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outElastic: t => { t = clamp(t); return t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * TAU / 3) + 1; },
};
// 淡入淡出窗口：在 [a,b] 内为 1，两端各用 f 秒过渡
const win = (t, a, b, f = 0.5) => Math.min(smooth((t - a) / f + 1), smooth((b - t) / f + 1)) * (t >= a - f && t <= b + f ? 1 : 0);
const fadeIn = (t, a, f = 0.6) => smooth((t - a) / f);
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// 平滑噪声（几组正弦叠加，保证逐帧可复现）
const wob = (t, k = 0) => Math.sin(t * 1.13 + k * 7.1) * 0.5 + Math.sin(t * 0.71 + k * 3.3) * 0.3 + Math.sin(t * 2.37 + k * 1.7) * 0.2;
const pulse = (t, bpm) => { const p = (t * bpm / 60) % 1; return Math.exp(-p * 9) + 0.55 * Math.exp(-Math.pow((p - 0.28) * 9, 2) * 1.2) * 0; };
function heartbeat(t, bpm) { // 双峰“扑通”曲线 0..1
  const p = ((t * bpm / 60) % 1 + 1) % 1;
  return Math.max(Math.exp(-Math.pow(p / 0.07, 2)), 0.7 * Math.exp(-Math.pow((p - 0.2) / 0.07, 2)));
}

/* ---------- 画布工具 ---------- */
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}
function mix(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp(a >> 16 & 255, b >> 16 & 255, t)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}
function glow(ctx, x, y, r, color, a = 1) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a)); g.addColorStop(0.35, hexA(color, a * 0.45)); g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.01, r), 0, TAU); }
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
// Catmull-Rom 平滑路径
function smoothPath(ctx, pts, closed = true, tension = 0.5, move = true) {
  const n = pts.length;
  const P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  if (move) ctx.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const k = tension / 3;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function vignette(ctx, a = 0.6) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,2,6,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* ---------- 文字 ---------- */
const NO_START = '，。！？：；、）》”’…—';
function wrapText(ctx, text, maxW) {
  const rows = []; let row = '';
  // 连续的数字/字母（如 0.4、hCG、110–160）作为不可拆分的整体
  const toks = text.match(/[0-9A-Za-z.%+–\-~]+|[\s\S]/g) || [];
  for (const ch of toks) {
    if (ctx.measureText(row + ch).width > maxW && row && !NO_START.includes(ch[0])) { rows.push(row.replace(/\s+$/, '')); row = ch.trim() ? ch : ''; }
    else row += ch;
  }
  if (row) rows.push(row);
  // 避免最后一行只有一两个字
  if (rows.length > 1 && [...rows[rows.length - 1]].length <= 2) {
    const prev = [...rows[rows.length - 2]]; const mv = prev.splice(-2).join('');
    rows[rows.length - 2] = prev.join(''); rows[rows.length - 1] = mv + rows[rows.length - 1];
  }
  return rows;
}
function balancedRows(ctx, text, maxW) { // 把字幕均匀分成若干行
  const total = ctx.measureText(text).width;
  const n = Math.ceil(total / maxW);
  if (n <= 1) return [text];
  return wrapText(ctx, text, total / n + ctx.measureText('字').width * 1.5);
}
function label(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 600} ${o.size || 30}px ${o.font || FONT_BODY}`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha *= o.alpha ?? 1;
  if (o.pill) {
    const w = ctx.measureText(text).width + (o.size || 30) * 1.1, h = (o.size || 30) * 1.7;
    const bx = o.align === 'left' ? x - (o.size || 30) * 0.55 : o.align === 'right' ? x - w + (o.size || 30) * 0.55 : x - w / 2;
    rrect(ctx, bx, y - h / 2, w, h, h / 2);
    ctx.fillStyle = o.pill; ctx.fill();
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(20,4,12,0.55)'; ctx.shadowBlur = 10; }
  ctx.fillStyle = o.color || PAL.cream;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* ---------- 时间轴与场景调度 ---------- */
const SCENES = {}; // 由 scenes.js 填充：id -> draw(ctx, t, S)
let _buf = null;
function sceneAt(T) {
  const sc = TIMELINE.scenes;
  for (let i = sc.length - 1; i >= 0; i--) if (T >= sc[i].start) return i;
  return 0;
}
function drawScene(ctx, i, T) {
  const S = TIMELINE.scenes[i];
  const fn = SCENES[S.id];
  ctx.save();
  try { if (fn) fn(ctx, T - S.start, S, T); else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } }
  catch (e) { (window.__errors = window.__errors || []).push(`${S.id} @${T.toFixed(3)}: ${e.message}`); }
  ctx.restore();
}
function renderFrame(ctx, T, opt = {}) {
  const F = TIMELINE.fade;
  T = clamp(T, 0, TIMELINE.duration - 1e-3);
  const i = sceneAt(T);
  const S = TIMELINE.scenes[i];
  const next = TIMELINE.scenes[i + 1];
  let a = -1, b = -1, k = 0;
  if (i > 0 && T < S.start + F) { a = i - 1; b = i; k = smooth((T - (S.start - F)) / (2 * F)); }
  else if (next && T > next.start - F) { a = i; b = i + 1; k = smooth((T - (next.start - F)) / (2 * F)); }
  if (a < 0) drawScene(ctx, i, T);
  else {
    drawScene(ctx, a, T);
    if (!_buf) { _buf = document.createElement('canvas'); _buf.width = W; _buf.height = H; }
    const bctx = _buf.getContext('2d');
    bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, W, H);
    drawScene(bctx, b, T);
    ctx.save(); ctx.globalAlpha = k; ctx.drawImage(_buf, 0, 0); ctx.restore();
  }
  drawOverlays(ctx, T, i, opt);
}

/* ---------- 叠加层 ---------- */
function drawOverlays(ctx, T, i, opt) {
  const S = TIMELINE.scenes[i];
  const t = T - S.start;
  if (S.num) drawChapter(ctx, t, S);
  const wk = SCENE_WEEK[S.id] ? SCENE_WEEK[S.id](t, S) : null;
  if (wk) drawWeekTracker(ctx, t, wk, S);
  if (opt.cards !== false) for (const c of S.cards) { const a = win(t, c.start, c.end, 0.6); if (a > 0) drawCard(ctx, c, a, t - c.start); }
  if (opt.subs !== false) for (const l of S.lines) { if (l.nosub) continue; const a = win(t, l.start - 0.1, l.end + 0.35, 0.25); if (a > 0) drawSubtitle(ctx, l.t, a); }
}
const SCENE_WEEK = {}; // id -> (t,S) => {week, day?}

const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三'];
function drawChapter(ctx, t, S) {
  // 开场大标题
  const a = win(t, 0.5, 2.6, 0.6);
  if (a > 0) {
    ctx.save();
    ctx.globalAlpha = a;
    const rise = (1 - E.out(seg(t, 0.0, 1.2))) * 24;
    ctx.fillStyle = 'rgba(20,6,14,0.35)';
    const g = ctx.createRadialGradient(W / 2, 470, 10, W / 2, 470, 520);
    g.addColorStop(0, 'rgba(20,6,14,0.55)'); g.addColorStop(1, 'rgba(20,6,14,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    label(ctx, S.id === 'hello' ? '尾 声' : `第${CN_NUM[S.num]}章`, W / 2, 400 + rise, { size: 34, color: PAL.gold, weight: 500, font: FONT_TITLE });
    label(ctx, S.chapter, W / 2, 490 + rise, { size: 96, font: FONT_TITLE, weight: 400, color: PAL.cream });
    // 小花饰
    ctx.strokeStyle = hexA(PAL.gold, 0.8); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const wv = 160 * E.out(seg(t, 0.4, 1.6));
    ctx.beginPath(); ctx.moveTo(W / 2 - wv, 570 + rise); ctx.lineTo(W / 2 - 18, 570 + rise); ctx.moveTo(W / 2 + 18, 570 + rise); ctx.lineTo(W / 2 + wv, 570 + rise); ctx.stroke();
    circle(ctx, W / 2, 570 + rise, 6); ctx.fillStyle = PAL.gold; ctx.fill();
    ctx.restore();
  }
  // 常驻角标
  const b = fadeIn(t, 2.7, 0.8) * (1 - seg(t, S.dur - 1.0, S.dur - 0.2));
  if (b > 0) {
    ctx.save(); ctx.globalAlpha = b * 0.9;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
    ctx.font = `700 28px ${FONT_BODY}`;
    const tag = S.id === 'hello' ? '尾声' : String(S.num).padStart(2, '0');
    ctx.fillStyle = PAL.gold; ctx.fillText(tag, 72, 70);
    const tw = ctx.measureText(tag).width;
    ctx.font = `400 30px ${FONT_TITLE}`;
    ctx.fillStyle = PAL.cream; ctx.fillText(S.chapter, 72 + tw + 16, 70);
    ctx.restore();
  }
}

function drawWeekTracker(ctx, t, wk, S) {
  const a = fadeIn(t, 2.9, 0.8) * (1 - seg(t, S.dur - 1.0, S.dur - 0.2)) * (wk.alpha ?? 1);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const x0 = 74, y0 = 128, gap = 13.5;
  for (let k = 1; k <= 40; k++) {
    const x = x0 + (k - 1) * gap + Math.floor((k - 1) / 10) * 8;
    const on = clamp(wk.week - (k - 1));
    circle(ctx, x, y0, 4.2);
    ctx.fillStyle = on >= 1 ? PAL.gold : 'rgba(255,240,230,0.2)'; ctx.fill();
    if (on > 0 && on < 1) { circle(ctx, x, y0, 4.2 * on); ctx.fillStyle = PAL.gold; ctx.fill(); }
  }
  const cur = x0 + (clamp(wk.week, 1, 40) - 1) * gap + Math.floor((clamp(wk.week, 1, 40) - 1) / 10) * 8;
  glow(ctx, cur, y0, 22, PAL.gold, 0.7);
  ctx.font = `600 26px ${FONT_BODY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
  ctx.fillStyle = PAL.cream;
  const txt = wk.text || `孕 ${Math.floor(wk.week)} 周`;
  ctx.fillText(txt, x0 - 4, y0 + 36);
  ctx.restore();
}

function drawCard(ctx, c, a, lt) {
  ctx.save();
  ctx.font = `500 27px ${FONT_BODY}`;
  const x = 1348, w = 500, pad = 34;
  const rows = wrapText(ctx, c.text, w - pad * 2);
  const h = 128 + rows.length * 44 + 18;
  const y = 170;
  const slide = (1 - E.out(clamp(lt / 0.7))) * 30;
  ctx.globalAlpha = a;
  ctx.translate(slide, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30;
  rrect(ctx, x, y, w, h, 26);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, 'rgba(46,16,34,0.78)'); g.addColorStop(1, 'rgba(26,8,20,0.78)');
  ctx.fillStyle = g; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,214,180,0.28)'; ctx.lineWidth = 1.5; ctx.stroke();
  // 顶部标签
  circle(ctx, x + pad + 9, y + 42, 9); ctx.fillStyle = PAL.gold; ctx.fill();
  glow(ctx, x + pad + 9, y + 42, 24, PAL.gold, 0.5);
  ctx.font = `600 21px ${FONT_BODY}`; ctx.fillStyle = hexA(PAL.gold, 0.95); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText('给大人的小知识', x + pad + 28, y + 43);
  ctx.font = `700 34px ${FONT_BODY}`; ctx.fillStyle = PAL.cream;
  ctx.fillText(c.title, x + pad, y + 95);
  ctx.font = `400 27px ${FONT_BODY}`; ctx.fillStyle = 'rgba(255,240,230,0.9)';
  rows.forEach((r, k) => ctx.fillText(r, x + pad, y + 150 + k * 44));
  ctx.restore();
}

function drawSubtitle(ctx, text, a) {
  ctx.save();
  ctx.font = `600 46px ${FONT_BODY}`;
  const rows = balancedRows(ctx, text, 1240);
  const lh = 64, y0 = H - 78 - (rows.length - 1) * lh;
  // 底部柔和暗带
  const g = ctx.createLinearGradient(0, y0 - 90, 0, H);
  g.addColorStop(0, 'rgba(10,3,8,0)'); g.addColorStop(1, `rgba(10,3,8,${0.55 * a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0 - 90, W, H - y0 + 90);
  ctx.globalAlpha = a;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(30,8,18,0.55)';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
  rows.forEach((r, k) => { ctx.strokeText(r, W / 2, y0 + k * lh); });
  ctx.shadowBlur = 0; ctx.fillStyle = '#fffaf4';
  rows.forEach((r, k) => { ctx.fillText(r, W / 2, y0 + k * lh); });
  ctx.restore();
}
