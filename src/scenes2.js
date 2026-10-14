/* 场景（下）：生命线 → 片尾 */

/* ---------- 小道具 ---------- */
function badge(ctx, x, y, r, a, drawIcon) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
  glow(ctx, 0, 0, r * 1.6, PAL.gold, 0.2);
  circle(ctx, 0, 0, r); ctx.fillStyle = 'rgba(40,14,34,0.82)'; ctx.fill(); ctx.strokeStyle = hexA(PAL.gold, 0.6); ctx.lineWidth = 3; ctx.stroke();
  drawIcon(); ctx.restore();
}
function crossMark(ctx, r) { ctx.strokeStyle = '#ff6b7f'; ctx.lineWidth = r * 0.14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.55, -r * 0.55); ctx.lineTo(r * 0.55, r * 0.55); ctx.moveTo(r * 0.55, -r * 0.55); ctx.lineTo(-r * 0.55, r * 0.55); ctx.stroke(); }
function bowlIcon(ctx, r) {
  ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.55, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#ffd9a8'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.5, Math.PI, 0); ctx.fillStyle = '#fffaf0'; ctx.fill();
  ctx.strokeStyle = '#a0704a'; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.7); ctx.lineTo(r * 0.55, -r * 0.2); ctx.moveTo(r * 0.25, -r * 0.75); ctx.lineTo(r * 0.65, -r * 0.3); ctx.stroke();
}
function windIcon(ctx, r) {
  ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = r * 0.1; ctx.lineCap = 'round';
  for (const [y, l] of [[-0.3, 0.9], [0, 1.1], [0.3, 0.7]]) { ctx.beginPath(); ctx.moveTo(-r * 0.6, y * r); ctx.lineTo(r * (l - 0.6), y * r); ctx.arc(r * (l - 0.6), (y - 0.15) * r, r * 0.15, Math.PI / 2, -Math.PI, true); ctx.stroke(); }
}
function drawDonut(ctx, x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x, y, r * 0.36, 0, TAU, true); ctx.fillStyle = '#d99a5a'; ctx.fill('evenodd');
  ctx.beginPath(); for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU; const rr = r * (0.9 + 0.06 * Math.sin(i * 2.7)); ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.arc(x, y, r * 0.42, 0, TAU, true); ctx.fillStyle = '#ff9ec0'; ctx.fill('evenodd');
  const R = rng(3); const cols = ['#fff', '#8fe8df', '#ffd27a', '#a8b8ff'];
  for (let i = 0; i < 16; i++) { const an = R() * TAU, d = r * (0.5 + R() * 0.35); ctx.save(); ctx.translate(x + Math.cos(an) * d, y + Math.sin(an) * d); ctx.rotate(R() * 3); ctx.fillStyle = cols[i % 4]; ctx.fillRect(-r * 0.06, -r * 0.015, r * 0.12, r * 0.03); ctx.restore(); }
  ctx.restore();
}
FRUIT.garlic = (ctx, x, y, s) => {
  ctx.beginPath(); ctx.moveTo(x, y - s * 0.45); ctx.bezierCurveTo(x + s * 0.1, y - s * 0.2, x + s * 0.45, y - s * 0.1, x + s * 0.4, y + s * 0.2);
  ctx.bezierCurveTo(x + s * 0.35, y + s * 0.42, x - s * 0.35, y + s * 0.42, x - s * 0.4, y + s * 0.2);
  ctx.bezierCurveTo(x - s * 0.45, y - s * 0.1, x - s * 0.1, y - s * 0.2, x, y - s * 0.45); ctx.closePath();
  ctx.fillStyle = '#fbf3ea'; ctx.fill(); ctx.strokeStyle = '#d9c3b0'; ctx.lineWidth = s * 0.02; ctx.stroke();
  for (const k of [-0.2, 0, 0.2]) { ctx.beginPath(); ctx.moveTo(x + k * s * 0.3, y - s * 0.3); ctx.quadraticCurveTo(x + k * s * 1.4, y, x + k * s * 0.9, y + s * 0.35); ctx.stroke(); }
};
function flavorDots(ctx, t, t0, fromX, fromY, toX, toY, col, n = 18, seed = 1) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const d = R() * 1.6, sp = 0.25 + R() * 0.15, off = (R() - 0.5) * 160;
    const u = clamp((t - t0 - d) * sp);
    if (u <= 0 || u >= 1) continue;
    const x = lerp(fromX, toX, u) + Math.sin(u * 7 + i) * off * (1 - u), y = lerp(fromY, toY, E.inOut(u)) + Math.cos(u * 5 + i) * 30 * (1 - u);
    glow(ctx, x, y, 16, col, 0.6 * Math.sin(u * Math.PI)); circle(ctx, x, y, 4); ctx.fillStyle = hexA(col, Math.sin(u * Math.PI)); ctx.fill();
  }
}

/* ---------- 第七章 生命线 ---------- */
SCENE_WEEK.lifeline = (t, S) => ({ week: 11, text: '孕 10–12 周', alpha: 1 - seg(t, S.cues.navel - 0.4, S.cues.navel + 0.4) });
SCENES.lifeline = (ctx, t, S) => {
  const C = S.cues;
  const navel = E.inOut(seg(t, C.navel - 0.2, C.navel + 1.0));
  if (navel < 1) {
    bgInside(ctx, t, { cx: 700, c0: '#6a2040', motes: 30 });
    const sx = 700, sy = 520, sr = 360;
    // 子宫壁
    ctx.save(); circle(ctx, sx, sy, sr + 48); ctx.lineWidth = 96; const wg = ctx.createRadialGradient(sx, sy, sr, sx, sy, sr + 96); wg.addColorStop(0, '#d9607a'); wg.addColorStop(1, '#6a1a32'); ctx.strokeStyle = wg; ctx.stroke(); ctx.restore();
    label(ctx, '妈妈的子宫', sx - sr - 40, sy + 250, { size: 24, alpha: win(t, 2.5, C.flow, 0.8), weight: 500, align: 'right' });
    drawSac(ctx, sx, sy, sr, t);
    const th = -2.3, pr = 175;
    const px = sx + Math.cos(th) * (sr - 24), py = sy + Math.sin(th) * (sr - 24), prot = th + Math.PI / 2;
    const flowOn = fadeIn(t, C.flow - 0.5, 1);
    drawPlacenta(ctx, px, py, pr, prot, t, flowOn * (0.6 + 0.4 * Math.sin(t * 3)));
    const ins = [px - Math.sin(prot) * pr * 0.3, py + Math.cos(prot) * pr * 0.3];
    const bob = Math.sin(t * 0.8) * 8;
    // 先算胎儿位置以得到脐部
    const fx = 790, fy = 570 + bob;
    const probe = { navel: [fx + 0.1 * 380, fy + 0.16 * 380] };
    const cord = cordPath(ins, probe.navel, t, 0.8);
    const cordHi = win(t, C.cord - 0.2, C.navel, 0.5);
    if (cordHi > 0) { ctx.save(); ctx.globalAlpha = cordHi * (0.6 + 0.4 * Math.sin(t * 4)); ctx.shadowColor = PAL.gold; ctx.shadowBlur = 30; drawCord(ctx, cord, 30, t); ctx.restore(); }
    drawCord(ctx, cord, 26, t);
    drawFetus(ctx, fx, fy, 380, t, { g: 0.2 });
    // 物质流动
    if (flowOn > 0) {
      ctx.save(); ctx.globalAlpha = flowOn;
      for (let k = 0; k < 14; k++) {
        const u = ((t - C.flow) * 0.28 + k / 14) % 1;
        const p = pointOnPath(cord, u);
        glow(ctx, p[0], p[1], 20, k % 2 ? PAL.gold : '#ff5d6e', 0.8); circle(ctx, p[0], p[1], 6); ctx.fillStyle = k % 2 ? '#fff0b0' : '#ff8a98'; ctx.fill();
        const q = pointOnPath(cord, 1 - ((t - C.flow) * 0.22 + k / 14 + 0.03) % 1);
        circle(ctx, q[0] + 9, q[1] + 6, 5); ctx.fillStyle = '#b39cff'; ctx.fill();
      }
      ctx.restore();
      label(ctx, '氧气 + 营养 → 宝宝', 1080, 290, { size: 26, color: PAL.gold, alpha: flowOn * win(t, C.flow + 0.8, C.cord - 0.4, 0.5), align: 'left' });
      label(ctx, '废物 → 胎盘', 1080, 340, { size: 26, color: '#c7b6ff', alpha: flowOn * win(t, C.flow + 2, C.cord - 0.4, 0.5), align: 'left' });
    }
    label(ctx, '胎盘', px - 40, py - 120, { size: 30, font: FONT_TITLE, weight: 400, alpha: fadeIn(t, C.flow - 0.2), pill: 'rgba(255,93,110,0.25)', border: hexA('#ff8a98', 0.7) });
    if (cordHi > 0) { const m = pointOnPath(cord, 0.55); label(ctx, '脐带', m[0] + 70, m[1] - 40, { size: 30, font: FONT_TITLE, weight: 400, alpha: cordHi, pill: 'rgba(255,210,122,0.22)', border: hexA(PAL.gold, 0.7) }); }
    // 放大镜：胎盘里的交换
    const lensA = win(t, Ls(S, 1) + 4.2, C.cord - 0.3, 0.6);
    if (lensA > 0) {
      const lx = 290, ly = 640, lr = 165;
      ctx.save(); ctx.globalAlpha = lensA;
      ctx.strokeStyle = hexA(PAL.cream, 0.5); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(px - 60, py + 40); ctx.lineTo(lx + 60, ly - lr + 10); ctx.stroke(); ctx.setLineDash([]);
      circle(ctx, lx, ly, lr); ctx.save(); ctx.clip();
      ctx.fillStyle = '#7a1a30'; ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      const R = rng(9);
      for (let i = 0; i < 26; i++) { const x = lx - lr + ((R() * lr * 2 + t * 30 * (0.5 + R())) % (lr * 2)); const y = ly - lr + R() * lr * 2; ellipse(ctx, x, y, 11, 8, R() * 3); ctx.fillStyle = '#e8465e'; ctx.fill(); }
      // 绒毛（胎儿一侧）
      ctx.strokeStyle = '#ffc7c0'; ctx.lineCap = 'round'; ctx.lineWidth = 46;
      ctx.beginPath(); ctx.moveTo(lx, ly - lr - 10); ctx.lineTo(lx, ly + 10); ctx.quadraticCurveTo(lx, ly + 60, lx - 60, ly + 90); ctx.moveTo(lx, ly + 10); ctx.quadraticCurveTo(lx, ly + 60, lx + 70, ly + 80); ctx.stroke();
      ctx.lineWidth = 8; ctx.strokeStyle = '#ff6b80'; ctx.beginPath(); ctx.moveTo(lx - 8, ly - lr); ctx.lineTo(lx - 8, ly + 20); ctx.stroke();
      ctx.strokeStyle = '#7f9cff'; ctx.beginPath(); ctx.moveTo(lx + 9, ly - lr); ctx.lineTo(lx + 9, ly + 20); ctx.stroke();
      // 箭头：进与出
      const ar = (x0, y0, x1, y1, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); const an = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(an - 0.5) * 14, y1 - Math.sin(an - 0.5) * 14); ctx.lineTo(x1 - Math.cos(an + 0.5) * 14, y1 - Math.sin(an + 0.5) * 14); ctx.closePath(); ctx.fill(); };
      const pp = (t * 0.8) % 1;
      ar(lx - 120 + pp * 20, ly - 40, lx - 40 + pp * 20, ly - 40, PAL.gold); ar(lx - 120 + pp * 20, ly + 10, lx - 40 + pp * 20, ly + 10, PAL.gold);
      ar(lx + 40 - pp * 0 + pp * 20, ly - 20, lx + 120 + pp * 20, ly - 20, '#c7b6ff');
      ctx.restore();
      circle(ctx, lx, ly, lr); ctx.lineWidth = 8; ctx.strokeStyle = '#ffe9d6'; ctx.stroke();
      ctx.restore();
      label(ctx, '妈妈的血', lx - 95, ly + lr - 30, { size: 20, alpha: lensA, weight: 500 });
      label(ctx, '宝宝的血管', lx + 70, ly - lr + 40, { size: 20, alpha: lensA, weight: 500 });
      label(ctx, '隔着薄膜交换，血液不混合', lx, ly + lr + 36, { size: 22, alpha: lensA, color: PAL.gold });
    }
    // 不能吃饭、不能呼吸
    const ia = win(t, Ls(S, 0) + 2.2, Le(S, 0) + 1.2, 0.5);
    if (ia > 0) {
      badge(ctx, 1170, 330, 70, E.outBack(ia) * (ia > 0.99 ? 1 : ia), () => { bowlIcon(ctx, 70); ctx.globalAlpha *= seg(t, Ls(S, 0) + 2.8, Ls(S, 0) + 3.2); crossMark(ctx, 70); });
      badge(ctx, 1170, 540, 70, clamp(E.outBack(seg(t, Ls(S, 0) + 3.8, Ls(S, 0) + 4.4))) * ia, () => { windIcon(ctx, 70); ctx.globalAlpha *= seg(t, Ls(S, 0) + 4.4, Ls(S, 0) + 4.8); crossMark(ctx, 70); });
    }
    vignette(ctx, 0.5);
  }
  if (navel > 0) { // 肚脐特写
    ctx.save(); ctx.globalAlpha = navel;
    const g = ctx.createRadialGradient(760, 520, 50, 760, 520, 1100); g.addColorStop(0, '#ffe0cc'); g.addColorStop(1, '#e89a86'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 衣服下摆
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(W + 10, -10); ctx.lineTo(W + 10, 230); for (let x = W; x >= -10; x -= 40) ctx.lineTo(x, 230 + Math.sin(x * 0.02) * 12 + 10 * ((x / 40) % 2)); ctx.closePath();
    ctx.fillStyle = '#35507a'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#5f86b8'; for (let y = -10; y < 260; y += 70) ctx.fillRect(0, y, W, 24); ctx.restore();
    glow(ctx, 760, 540, 300, '#ffffff', 0.25);
    // 肚脐
    const nx = 760, ny = 540;
    glow(ctx, nx, ny + 30, 160, '#c77a66', 0.25);
    ellipse(ctx, nx, ny, 95, 70); const ng = ctx.createRadialGradient(nx, ny - 20, 8, nx, ny, 96); ng.addColorStop(0, '#9a4a3c'); ng.addColorStop(0.55, 'rgba(190,105,88,0.8)'); ng.addColorStop(1, 'rgba(230,160,140,0)'); ctx.fillStyle = ng; ctx.fill();
    ctx.beginPath(); ctx.arc(nx, ny + 18, 70, Math.PI * 1.12, Math.PI * 1.88); ctx.lineWidth = 11; ctx.strokeStyle = '#8f4436'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(nx, ny - 4, 64, Math.PI * 0.15, Math.PI * 0.85); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,230,215,0.7)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(nx + 4, ny - 4, 26, 0.3, Math.PI * 1.5); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(120,50,40,0.75)'; ctx.stroke();
    for (let k = 0; k < 10; k++) { const an = k / 10 * TAU + t * 0.6; drawSparkle(ctx, nx + Math.cos(an) * 150, ny + Math.sin(an) * 110, 10 + 4 * Math.sin(t * 3 + k), fadeIn(t, C.navel + 0.8)); }
    ctx.restore();
    label(ctx, '肚脐 —— 脐带留下的小纪念', 760, 780, { size: 44, font: FONT_TITLE, weight: 400, color: '#7a2a3a', shadow: false, alpha: navel * fadeIn(t, C.navel + 1.2) });
  }
};

/* ---------- 第八章 一天天长大 ---------- */
const GROW = { 8: ['raspberry', '1.6 厘米', '1 克'], 12: ['lime', '5.4 厘米', '14 克'], 20: ['banana', '25 厘米', '300 克'], 24: ['corn', '30 厘米', '600 克'], 28: ['eggplant', '37 厘米', '1 千克'], 36: ['honeydew', '47 厘米', '2.6 千克'], 40: ['watermelon', '51 厘米', '3.4 千克'] };
function growWeek(t, C) { const w = C.w; let v = w[0].w; for (let k = 1; k < w.length; k++) v = lerp(v, w[k].w, E.inOut(seg(t, w[k].t - 0.7, w[k].t + 0.7))); return v; }
SCENE_WEEK.grow = (t, S) => { const w = growWeek(t, S.cues); return { week: w, text: `孕 ${Math.round(w)} 周` }; };
SCENES.grow = (ctx, t, S) => {
  const C = S.cues, WK = C.w;
  bgInside(ctx, t, { cx: 700, c0: '#6e2442', motes: 36 });
  const week = growWeek(t, C);
  const g = clamp((week - 8) / 32);
  const size = 170 + 330 * Math.pow(g, 0.8);
  const fx = 560, fy = 510;
  // 各阶段的动作
  const L = i => Ls(S, i);
  const kick = t > L(3) && t < L(4) ? Math.pow(Math.max(0, Math.sin((t - L(3)) * 2.6)), 3) : 0;
  const eye = seg(t, L(5) + 0.8, L(5) + 1.3) * (1 - seg(t, L(6) + 1, L(6) + 1.5));
  const blink = Math.exp(-Math.pow((((t - L(5)) % 2.6) - 2.2) / 0.08, 2));
  const rot = Math.PI * 0.94 * E.inOut(seg(t, L(6) + 1.6, L(6) + 4.4));
  const sr = size * (0.86 - 0.28 * g) * (1 + 0.02 * kick);
  drawSac(ctx, fx, fy, sr, t);
  const bob = Math.sin(t * 0.9) * 6;
  // 小尺寸时画脐带更短
  drawFetus(ctx, fx + (1 - g) * 10, fy + bob, size, t, { g, kick, eyeOpen: eye * (1 - blink), rot });
  // 踢腿“咚！”
  if (kick > 0.6) label(ctx, '咚！', fx + sr * 0.9, fy + 40 - kick * 20, { size: 44, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: kick });
  // 听见声音
  const ha = win(t, L(4) + 0.5, L(5) - 0.8, 0.6);
  if (ha > 0) {
    soundWaves(ctx, 200, 220, 170, t, Math.atan2(fy - 220, fx - 200), ha);
    for (let k = 0; k < 4; k++) { const p = ((t * 0.35 + k / 4) % 1); musicNote(ctx, lerp(230, fx - 120, p) + Math.sin(p * 9 + k) * 20, lerp(200, fy - 200, p), 34, ha * Math.sin(p * Math.PI), k % 2 ? PAL.gold : PAL.pink); }
  }
  // 足月闪光
  const fa = fadeIn(t, L(7) + 0.5);
  for (let k = 0; k < 12; k++) { const an = k / 12 * TAU + t * 0.3; drawSparkle(ctx, fx + Math.cos(an) * (sr + 40), fy + Math.sin(an) * (sr + 40), 8 + 4 * Math.sin(t * 3 + k), fa * (0.5 + 0.5 * Math.sin(t * 2 + k))); }
  // 水果
  let stage = 0; for (let k = 1; k < WK.length; k++) if (t >= WK[k].t - 0.1) stage = k;
  const info = GROW[WK[stage].w];
  const next = stage + 1 < WK.length ? WK[stage + 1].t : 1e9;
  const pop = stage === 0 ? bounceIn(t, 1.8, 0.8) : bounceIn(t, WK[stage].t - 0.1, 0.7);
  const out = 1 - E.in(seg(t, next - 0.6, next - 0.1));
  const fs = size * 0.9 * pop * out;
  const frX = 1090, frY = 480;
  if (fs > 1) { glow(ctx, frX, frY, fs * 1.1, PAL.gold, 0.2); FRUIT[info[0]](ctx, frX, frY, fs); }
  const ia = fadeIn(t, 2.2) * out;
  label(ctx, `孕 ${WK[stage].w} 周`, frX, 770, { size: 54, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: ia });
  label(ctx, `像${FRUIT_NAME[info[0]]}那么大`, frX, 835, { size: 30, alpha: ia });
  label(ctx, `约 ${info[1]} · ${info[2]}`, frX, 880, { size: 24, alpha: ia * 0.85, weight: 500, color: PAL.peach });
  vignette(ctx, 0.5);
};

/* ---------- 第九章 羊水里的小世界 ---------- */
SCENE_WEEK.womb = () => ({ week: 30, text: '孕中晚期' });
SCENES.womb = (ctx, t, S) => {
  const C = S.cues;
  bgInside(ctx, t, { cx: 760, cy: 380, c0: '#8a3450', c1: '#4a1830', motes: 60, dy: 6, moteA: 0.8 });
  // 透过肚皮的光
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) {
    const x0 = 900 + k * 180 + Math.sin(t * 0.3 + k) * 40;
    const g = ctx.createLinearGradient(x0, 0, x0 - 400, H); g.addColorStop(0, 'rgba(255,190,150,0.10)'); g.addColorStop(1, 'rgba(255,190,150,0)');
    ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x0 + 90, -10); ctx.lineTo(x0 - 300, H); ctx.lineTo(x0 - 480, H); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  }
  ctx.restore();
  // 妈妈的心跳（背景里的低沉脉动）
  const mb = heartbeat(t, 72);
  glow(ctx, 60, 100, 380 + mb * 60, '#ff5d6e', 0.12 + mb * 0.12);
  drawSac(ctx, 740, 540, 640, t);
  let hic = 0; for (const d of [0, 0.9, 1.8]) { const h = C.hic + d; if (t > h) hic = Math.max(hic, Math.exp(-(t - h) * 9)); }
  const thumb = E.inOut(seg(t, C.thumb - 0.4, C.thumb + 0.8)) * (1 - E.inOut(seg(t, C.taste - 0.6, C.taste + 0.4)));
  const br = t > C.breathe ? Math.sin((t - C.breathe) * 2.2) * 0.012 * win(t, C.breathe, C.taste, 0.5) : 0;
  const fx = 700, fy = 540 + Math.sin(t * 0.7) * 12;
  ctx.save(); ctx.translate(fx, fy); ctx.scale(1 + br, 1 + br); ctx.translate(-fx, -fy);
  const info = drawFetus(ctx, fx, fy, 720, t, { g: 0.82, thumb, hic, rot: Math.sin(t * 0.4) * 0.05 });
  ctx.restore();
  // 嗝！
  [0, 0.9, 1.8].forEach((d, k) => { const h = C.hic + d; const a = win(t, h, h + 0.7, 0.15); if (a > 0) label(ctx, '嗝~', info.head[0] + 230 + k * 40, info.head[1] - 150 - (t - h) * 60, { size: 46, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: a }); });
  label(ctx, '吮吸大拇指', info.head[0] + 280, info.head[1] + 120, { size: 28, alpha: win(t, C.thumb + 0.6, C.hic - 0.3, 0.4) });
  label(ctx, '练习呼吸', info.head[0] + 280, info.head[1] + 120, { size: 28, alpha: win(t, C.breathe + 0.6, Le(S, 1) + 1, 0.4) });
  // 味道
  const ta = win(t, C.taste - 0.5, S.dur, 0.6);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha = ta;
    const bx = 1200, by = 230 + Math.sin(t) * 10;
    FRUIT.carrot(ctx, bx, by, 110 * bounceIn(t, C.taste - 0.5)); FRUIT.garlic(ctx, bx + 100, by + 40, 80 * bounceIn(t, C.taste - 0.2));
    ctx.restore();
    const mouth = [info.head[0] + info.hr * 0.75, info.head[1] + info.hr * 0.4];
    flavorDots(ctx, t, C.taste, bx, by, mouth[0], mouth[1], '#ffa04a', 16, 3);
    flavorDots(ctx, t, C.taste + 0.8, bx + 100, by + 40, mouth[0], mouth[1], '#e8f0b0', 12, 8);
    label(ctx, '妈妈吃的味道，会进到羊水里', 1160, 360, { size: 24, alpha: fadeIn(t, C.taste + 0.8) * ta, color: PAL.gold });
  }
  vignette(ctx, 0.55);
};

/* ---------- 第十章 妈妈的身体 ---------- */
SCENE_WEEK.mom = (t, S) => { const b = momBelly(t, S); return { week: lerp(6, 40, b), text: `孕 ${Math.round(lerp(6, 40, b))} 周` }; };
function momBelly(t, S) { const C = S.cues; return lerp(0.08 + 0.12 * seg(t, 2, 7), 1, E.inOut(seg(t, C.grow0, C.grow1))); }
function organ(ctx, x, y, rx, ry, col, rot = 0) { ellipse(ctx, x, y, rx, ry, rot); const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 2, x, y, Math.max(rx, ry)); g.addColorStop(0, mix(col, '#ffffff', 0.4)); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke(); }
SCENES.mom = (ctx, t, S) => {
  const C = S.cues;
  bgInside(ctx, t, { cx: 620, c0: '#5e2040', motes: 30 });
  const mx = 720, my = 150, mh = 830;
  const b = momBelly(t, S), B = E.inOut(b);
  const P = (px, py) => [mx + px * mh, my + py * mh];
  drawMother(ctx, mx, my, mh, b, t, {});
  // X 光：身体内部
  const xr = fadeIn(t, 3.5, 1.2);
  ctx.save(); motherBodyPath(ctx, mx, my, mh, b); ctx.clip();
  ctx.globalAlpha = xr;
  const og = fadeIn(t, C.organs - 0.3, 0.8);
  if (og > 0) {
    ctx.save(); ctx.globalAlpha = xr * og;
    const [lx, ly] = P(0.0, 0.225);
    organ(ctx, lx - 0.02 * mh, ly, 0.035 * mh, lerp(0.055, 0.042, B) * mh, '#e88a9a', 0.15);
    organ(ctx, lx + 0.045 * mh, ly, 0.03 * mh, lerp(0.055, 0.042, B) * mh, '#e88a9a', -0.15);
    const hb = heartbeat(t, 95);
    const [hx, hy] = P(0.02, 0.255);
    drawHeart(ctx, hx, hy, 0.045 * mh * (1 + hb * 0.15), '#ff4d6d');
    const [sx2, sy2] = P(0.035 + B * 0.02, lerp(0.33, 0.3, B));
    organ(ctx, sx2, sy2, 0.035 * mh, lerp(0.024, 0.016, B) * mh, '#f2b37a', -0.3);
    const [bx2, by2] = P(0.035, 0.51);
    organ(ctx, bx2, by2, lerp(0.028, 0.03, B) * mh, lerp(0.022, 0.011, B) * mh, '#f2d27a');
    ctx.restore();
  }
  // 子宫与宝宝
  const [ux, uy] = P(0.02 + B * 0.075, lerp(0.455, 0.42, B));
  const urx = lerp(0.03, 0.118, B) * mh, ury = lerp(0.04, 0.125, B) * mh;
  glow(ctx, ux, uy, ury * 1.8, '#ff6e7a', 0.4);
  ellipse(ctx, ux, uy, urx, ury, -0.15); ctx.fillStyle = '#d9506a'; ctx.fill();
  ellipse(ctx, ux, uy, urx * 0.84, ury * 0.86, -0.15); ctx.fillStyle = '#ffd0c0'; ctx.fill();
  drawFetus(ctx, ux, uy, ury * 1.55, t, { g: lerp(0.05, 1, B), rot: Math.PI * 0.9 * seg(B, 0.75, 1) });
  ctx.restore();
  drawMotherArm(ctx, mx, my, mh, b, {});
  // 器官标签（左侧）
  if (og > 0) {
    const tag = (txt, px, py, lx, ly2, col = PAL.cream) => { const [x, y] = P(px, py); ctx.save(); ctx.globalAlpha = og; ctx.strokeStyle = hexA(PAL.cream, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx + 10, ly2); ctx.stroke(); circle(ctx, x, y, 5); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.restore(); label(ctx, txt, lx, ly2, { size: 26, align: 'right', alpha: og, color: col }); };
    tag('肺', 0.0, 0.215, 500, 300);
    tag('心脏：更忙了', 0.02, 0.255, 500, 360, '#ff9db0');
    tag('胃：被挤到上面', 0.035 + B * 0.02, 0.3, 500, 420, '#ffd0a0');
    tag('膀胱：被压扁', 0.035, 0.51, 500, 600, '#fff0a0');
    const bl = seg(t, C.organs + 2.4, C.organs + 3.2);
    if (bl > 0) label(ctx, '血液 +40~50%', 500, 500, { size: 26, align: 'right', color: '#ff7d95', alpha: bl, pill: 'rgba(40,12,28,0.7)' });
  }
  // 梨 → 西瓜
  const pa = win(t, C.grow0 - 0.3, C.organs - 0.2, 0.6);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    FRUIT.pear(ctx, 1150, 330, 110 * bounceIn(t, C.grow0 - 0.3));
    label(ctx, '原来：梨子大小', 1150, 420, { size: 24 });
    const wa = seg(t, C.grow1 - 1.6, C.grow1 - 0.6);
    if (wa > 0) { ctx.globalAlpha = pa * wa; FRUIT.watermelon(ctx, 1150, 600, 190 * E.outBack(wa)); label(ctx, '最后：西瓜那么大', 1150, 730, { size: 24 }); label(ctx, '↓', 1150, 470, { size: 40, color: PAL.gold }); }
    ctx.restore();
  }
  // 累了
  const za = win(t, Ls(S, 2) + 5.5, Le(S, 2) + 1.2, 0.6);
  if (za > 0) {
    const [hx, hy] = P(0.12, 0.0);
    ctx.save(); ctx.globalAlpha = za; ctx.beginPath(); ctx.arc(hx + 60, hy - 10, 34, 0, TAU); ctx.arc(hx + 76, hy - 22, 30, 0, TAU, true); ctx.fillStyle = PAL.gold; ctx.fill('evenodd'); ctx.restore();
    ['Z', 'z', 'z'].forEach((z, k) => label(ctx, z, hx + 120 + k * 34, hy - 30 - k * 34 - ((t * 20) % 20), { size: 40 - k * 8, font: FONT_TITLE, weight: 400, alpha: za * (0.6 + 0.4 * Math.sin(t * 3 + k)) }));
  }
  // 孩子来抱抱妈妈
  const hug = E.inOut(seg(t, C.hug - 2.2, C.hug));
  if (hug > 0) {
    const kx = lerp(1500, 1100, hug), ky = 560;
    ctx.save(); ctx.translate(kx, ky); ctx.scale(-1, 1); drawKid(ctx, 0, 0, 380, t, { reach: seg(t, C.hug - 0.3, C.hug + 0.6), shirt: '#ffd27a' }); ctx.restore();
    for (let k = 0; k < 7; k++) { const p = ((t - C.hug) * 0.3 + k / 7) % 1; if (t > C.hug) drawHeart(ctx, 1010 + Math.sin(k * 3 + p * 6) * 60, 600 - p * 320, 36 * (1 - p * 0.4), '#ff6b8a', Math.sin(p * Math.PI) * fadeIn(t, C.hug)); }
    const big = bounceIn(t, Le(S, 3) - 1.4, 0.8);
    if (big > 0) drawHeart(ctx, 1010, 260, 150 * big, '#ff5d7a', 1 - seg(t, S.dur - 1.5, S.dur));
  }
  vignette(ctx, 0.5);
};

/* ---------- 第十一章 出发！ ---------- */
function birthUterus(ctx, t, cx, cy, sq, dil) {
  const k = 1 - sq * 0.035;
  const T = (x, y) => [cx + x * k, cy + y * k];
  const outer = [[-330, 0], [-300, -190], [-190, -320], [0, -365], [190, -320], [300, -190], [330, 0], [300, 170], [210, 300], [100, 380], [95, 470], [-95, 470], [-100, 380], [-210, 300], [-300, 170]].map(p => T(p[0], p[1]));
  const wall = 62 + sq * 18, cw = lerp(10, 150, dil) / 2;
  const inner = [[-330 + wall, 0], [-300 + wall * 0.9, -190 + wall * 0.4], [-190 + wall * 0.5, -320 + wall * 0.8], [0, -365 + wall], [190 - wall * 0.5, -320 + wall * 0.8], [300 - wall * 0.9, -190 + wall * 0.4], [330 - wall, 0], [300 - wall, 160], [200 - wall * 0.8, 280], [cw + 10, 355], [cw, 480], [-cw, 480], [-cw - 10, 355], [-200 + wall * 0.8, 280], [-300 + wall, 160]].map(p => T(p[0], p[1]));
  glow(ctx, cx, cy, 560, '#ff6e7a', 0.22 + sq * 0.25);
  ctx.beginPath(); smoothPath(ctx, outer, true, 0.5);
  const g = ctx.createRadialGradient(cx, cy - 60, 60, cx, cy, 420); g.addColorStop(0, '#e8708a'); g.addColorStop(1, mix('#b33a55', '#e0506a', sq)); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = `rgba(255,200,200,${0.18 + sq * 0.3})`; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, (300 + i * 5) * k, (330 + i * 5) * k, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } ctx.restore();
  const inPath = new Path2D(); { const c2 = { moveTo: (...a) => inPath.moveTo(...a), bezierCurveTo: (...a) => inPath.bezierCurveTo(...a), closePath: () => inPath.closePath() }; smoothPath(c2, inner, true, 0.5); }
  const ig = ctx.createRadialGradient(cx - 60, cy - 100, 30, cx, cy, 380); ig.addColorStop(0, '#ffeee4'); ig.addColorStop(1, '#ffb9a8');
  ctx.fillStyle = ig; ctx.fill(inPath); ctx.lineWidth = 4; ctx.strokeStyle = '#ff9eaa'; ctx.stroke(inPath);
  // 产道（向下延伸出画面）
  ctx.fillStyle = '#ffb9a8'; ctx.fillRect(cx - cw * k, cy + 470 * k, cw * 2 * k, 300);
  return inPath;
}
function drawPelvis(ctx, cx, cy, a) {
  ctx.save(); ctx.globalAlpha = a;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(cx + sd * 400, cy + 120); ctx.bezierCurveTo(cx + sd * 470, cy + 260, cx + sd * 330, cy + 380, cx + sd * 180, cy + 420);
    ctx.bezierCurveTo(cx + sd * 150, cy + 460, cx + sd * 170, cy + 520, cx + sd * 220, cy + 560); ctx.lineWidth = 46; ctx.strokeStyle = 'rgba(255,240,220,0.75)'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(200,160,130,0.6)'; ctx.stroke();
  }
  ctx.restore();
}
function contraction(t, cs) { let s = 0; for (const c of cs) if (t > c && t < c + 2.3) s = Math.max(s, Math.pow(Math.sin((t - c) / 2.3 * Math.PI), 2)); return s; }
SCENE_WEEK.birth = () => ({ week: 40, text: '孕 40 周左右' });
SCENES.birth = (ctx, t, S) => {
  const C = S.cues;
  const cs = [0, 1, 2, 3].map(k => Ls(S, 1) + 0.4 + k * 2.6);
  const two = E.inOut(seg(t, C.csec - 0.4, C.csec + 0.8));
  if (two < 1) {
    bgInside(ctx, t, { cx: 720, c0: '#5a1a36', motes: 26 });
    const sq = contraction(t, cs);
    const done = cs.filter(c => t > c + 2.3).length;
    const dil = clamp(done / 4 + (t > cs[3] ? 0 : 0)) * (1) + 0 * sq;
    const cx = 720, cy = 430;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(0.92, 0.92); ctx.translate(-cx, -cy);
    const inPath = birthUterus(ctx, t, cx, cy, sq, E.inOut(dil));
    // 宝宝：头朝下，随宫缩下降，最后穿过产道
    const exit = E.in(seg(t, Ls(S, 2) + 3.5, Le(S, 2) + 1.6));
    const descent = done * 22 + sq * 14 + E.inOut(seg(t, Ls(S, 2), Ls(S, 2) + 3.5)) * 90 + exit * 700;
    ctx.save(); ctx.clip(inPath); ctx.beginPath(); ctx.rect(cx - 400, cy + 380, 800, 800); ctx.clip(); ctx.restore();
    ctx.save();
    const clip = new Path2D(inPath); clip.rect(cx - 90, cy + 400, 180, 900);
    ctx.clip(clip);
    drawFetus(ctx, cx + 10, cy - 30 + descent, 590, t, { g: 1, rot: Math.PI * 0.95 + Math.sin(t * 0.8) * 0.02 * (1 - sq) });
    ctx.restore();
    ctx.restore();
    // 宫缩箭头
    if (sq > 0.05) {
      ctx.save(); ctx.globalAlpha = sq; ctx.fillStyle = PAL.gold;
      for (const [x, y, an] of [[720, 30, Math.PI / 2], [390, 190, 0.6], [1050, 190, Math.PI - 0.6]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-10, -24); ctx.lineTo(-10, -10); ctx.lineTo(-40, -10); ctx.lineTo(-40, 10); ctx.lineTo(-10, 10); ctx.lineTo(-10, 24); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.restore();
      label(ctx, '宫缩！', 1120, 120, { size: 40, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: sq });
    }
    // 宫口开大量表
    const ga = win(t, Ls(S, 1) + 0.2, Ls(S, 2) + 1.5, 0.6);
    if (ga > 0) {
      const gx = 210, gy = 690, cm = Math.round(clamp((t - cs[0]) / (cs[3] + 2.3 - cs[0])) * 10);
      const rr = 14 + cm * 9;
      ctx.save(); ctx.globalAlpha = ga;
      rrect(ctx, gx - 150, gy - 170, 300, 330, 24); ctx.fillStyle = 'rgba(30,8,20,0.7)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,214,180,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      circle(ctx, gx, gy - 20, 104); ctx.strokeStyle = 'rgba(255,240,230,0.2)'; ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);
      circle(ctx, gx, gy - 20, rr); ctx.lineWidth = 10; ctx.strokeStyle = '#ff8fa3'; ctx.stroke();
      ctx.restore();
      label(ctx, `宫口 ${cm} 厘米`, gx, gy + 118, { size: 28, color: PAL.gold, alpha: ga });
      if (cm >= 10) { drawDonut(ctx, gx + 110, gy - 130, 38, ga * bounceIn(t, cs[3] + 2.3)); label(ctx, '≈ 甜甜圈', gx + 110, gy - 70, { size: 20, alpha: ga * fadeIn(t, cs[3] + 2.6) }); }
    }
    // 放大镜：会“变形”的头骨
    const la = win(t, Ls(S, 2) + 0.3, Le(S, 2) + 0.8, 0.6);
    if (la > 0) {
      const lx = 250, ly = 330, lr = 170, ov = E.inOut(seg(t, Ls(S, 2) + 2, Ls(S, 2) + 3.5)) * (1 - seg(t, Le(S, 2), Le(S, 2) + 0.6));
      ctx.save(); ctx.globalAlpha = la;
      circle(ctx, lx, ly, lr); ctx.fillStyle = '#ffe3d6'; ctx.fill();
      ctx.save(); circle(ctx, lx, ly, lr); ctx.clip();
      const sk = (px, py, rx, ry, rot) => { ellipse(ctx, px, py, rx, ry, rot); ctx.fillStyle = '#fff4ea'; ctx.fill(); ctx.strokeStyle = '#c9a58a'; ctx.lineWidth = 3; ctx.stroke(); };
      const o = ov * 10;
      sk(lx - 42 + o, ly - 60 + o * 0.5, 50, 62, 0.3); sk(lx + 42 - o, ly - 60 + o * 0.5, 50, 62, -0.3);
      sk(lx - 50 + o, ly + 40, 58, 72, -0.1); sk(lx + 50 - o, ly + 40, 58, 72, 0.1);
      sk(lx, ly + 132 - o, 70, 40, 0);
      ctx.beginPath(); ctx.moveTo(lx, ly - 40 + o); ctx.lineTo(lx + 22 - o, ly - 6); ctx.lineTo(lx, ly + 22 - o); ctx.lineTo(lx - 22 + o, ly - 6); ctx.closePath();
      ctx.fillStyle = hexA('#ff9db0', 0.8); ctx.fill();
      ctx.restore();
      circle(ctx, lx, ly, lr); ctx.lineWidth = 8; ctx.strokeStyle = '#ffe9d6'; ctx.stroke();
      ctx.restore();
      label(ctx, '宝宝的头顶：骨头之间有缝', lx, ly + lr + 34, { size: 22, alpha: la });
      label(ctx, '囟门', lx + 150, ly - 120, { size: 28, color: '#ff9db0', alpha: la, pill: 'rgba(40,12,28,0.7)' });
    }
    // 出生瞬间的光
    const burst = win(t, Le(S, 2) + 0.8, C.csec, 0.6);
    if (burst > 0) glow(ctx, 720, 1000, 900, '#fff3e0', burst * 0.9);
    vignette(ctx, 0.5);
  }
  if (two > 0) {
    ctx.save(); ctx.globalAlpha = two;
    bgInside(ctx, t, { cx: 760, c0: '#6a2a48', motes: 30 });
    const card = (x, y, ttl, drawIt, t0) => {
      const b = bounceIn(t, t0, 0.8);
      ctx.save(); ctx.translate(x, y); ctx.scale(b, b);
      rrect(ctx, -220, -230, 440, 460, 36); ctx.fillStyle = 'rgba(40,14,34,0.72)'; ctx.fill(); ctx.strokeStyle = hexA(PAL.gold, 0.45); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.save(); rrect(ctx, -218, -228, 436, 370, 34); ctx.clip(); drawIt(); ctx.restore(); ctx.restore();
      label(ctx, ttl, x, y + 180, { size: 40, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: clamp(b) });
    };
    card(380, 470, '顺产', () => {
      ctx.save(); ctx.scale(0.36, 0.36); birthUterus(ctx, t, 0, -120, 0.3, 0.8); drawFetus(ctx, 10, -120, 560, t, { g: 1, rot: Math.PI * 0.95 }); ctx.restore();
      ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(-22, 118); ctx.lineTo(22, 118); ctx.closePath(); ctx.fill();
    }, C.csec + 0.2);
    card(900, 470, '剖宫产', () => {
      // 躺着的妈妈（侧面），腹部下方虚线切口，宝宝被抱出
      rrect(ctx, -200, 96, 400, 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
      ctx.fillStyle = '#ffe3d4'; rrect(ctx, -150, 58, 330, 40, 20); ctx.fill();
      ctx.beginPath(); ctx.ellipse(10, 60, 100, 72, 0, Math.PI, TAU); ctx.fill();
      circle(ctx, -170, 64, 32); ctx.fill(); circle(ctx, -196, 58, 20); ctx.fillStyle = '#6b2c3e'; ctx.fill();
      ctx.fillStyle = '#f59ab0'; rrect(ctx, -140, 56, 110, 44, 16); ctx.fill();
      ctx.setLineDash([8, 8]); ctx.strokeStyle = '#e0457a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, 20); ctx.lineTo(60, 20); ctx.stroke(); ctx.setLineDash([]);
      const up = E.inOut(seg(t, C.csec + 1.5, C.csec + 3.5)) * 90;
      drawNewborn(ctx, 10, -40 - up, 150, t, { rot: -0.3 });
      ctx.fillStyle = '#9fd6ff';
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(10 + sd * 70, -20 - up, 26, 18, sd * 0.6, 0, TAU); ctx.fill(); }
      ctx.fillStyle = PAL.gold; ctx.beginPath(); ctx.moveTo(150, -150); ctx.lineTo(128, -118); ctx.lineTo(172, -118); ctx.closePath(); ctx.fill();
    }, C.csec + 1.0);
    const hb = bounceIn(t, Ls(S, 3) + 6.0, 0.8);
    if (hb > 0) { drawHeart(ctx, 640, 470, 110 * hb * (1 + 0.06 * Math.sin(t * 4))); label(ctx, '都是了不起的出生！', 640, 820, { size: 50, font: FONT_TITLE, weight: 400, color: PAL.cream, alpha: clamp(hb) }); }
    ctx.restore();
    vignette(ctx, 0.5);
  }
};

/* ---------- 第十二章 第一口气 ---------- */
SCENE_WEEK.breath = () => ({ week: 40, text: '出生啦！' });
SCENES.breath = (ctx, t, S) => {
  const C = S.cues;
  const g = ctx.createRadialGradient(700, 500, 50, 700, 500, 1300); g.addColorStop(0, '#ffe9d9'); g.addColorStop(0.5, '#f6b6a6'); g.addColorStop(1, '#8a3a52');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  motes(ctx, t, { motes: 30, moteCol: '#ffffff', moteA: 0.6 });
  const side = E.inOut(seg(t, C.lungs - 0.6, C.lungs + 0.8));
  const bx = lerp(760, 460, side), by = lerp(560, 600, side), bs = lerp(760, 560, side);
  const cryOn = t > C.cry && t < Ls(S, 1) + 1.5;
  const cry = cryOn ? 0.6 + 0.4 * Math.abs(Math.sin((t - C.cry) * 4)) : 0;
  drawNewborn(ctx, bx, by, bs, t, { cry: cry > 0 ? cry : 0, eyeOpen: t > Ls(S, 2) + 2 ? 1 : 0.0, rot: -0.12 });
  if (cryOn) {
    const w = bounceIn(t, C.cry, 0.5);
    ctx.save(); ctx.translate(bx + bs * 0.55, by - bs * 0.32); ctx.rotate(-0.12 + Math.sin(t * 10) * 0.03); ctx.scale(w, w);
    ctx.strokeStyle = hexA(PAL.gold, 0.8); ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 7; k++) { const an = -Math.PI * 0.9 + k * 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 130, Math.sin(an) * 110); ctx.lineTo(Math.cos(an) * 170, Math.sin(an) * 145); ctx.stroke(); }
    ctx.font = `400 150px ${FONT_TITLE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 12; ctx.strokeStyle = '#8a2a48'; ctx.strokeText('哇！', 0, 0); ctx.fillStyle = '#fff6e0'; ctx.fillText('哇！', 0, 0);
    ctx.restore();
  }
  // 肺
  const la = win(t, C.lungs - 0.4, Ls(S, 2) + 0.6, 0.6);
  if (la > 0) {
    const fill = E.out(seg(t, C.lungs, C.lungs + 2.5)) * (0.85 + 0.15 * Math.sin((t - C.lungs) * 2));
    ctx.save(); ctx.globalAlpha = la; drawLungs(ctx, 1050, 520, 460, fill, t);
    for (let k = 0; k < 16; k++) { const p = ((t - C.lungs) * 0.6 + k / 16) % 1; if (t < C.lungs) break; const x = 1050 + Math.sin(k * 2.1) * 12, y = 180 + p * 190; circle(ctx, x, y, 7 * (1 - p)); ctx.fillStyle = '#e6f6ff'; ctx.fill(); }
    ctx.restore();
    label(ctx, '空气进来啦！', 1050, 850, { size: 34, font: FONT_TITLE, weight: 400, color: '#3a6aa0', shadow: false, alpha: la * fadeIn(t, C.lungs + 0.8) });
  }
  // 心脏的“小门”
  const da = fadeIn(t, Ls(S, 2) - 0.2, 0.8);
  if (da > 0) {
    const hx = 1050, hy = 500;
    ctx.save(); ctx.globalAlpha = da;
    heartPath(ctx, hx, hy, 560); ctx.fillStyle = '#ff7d8e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    ctx.strokeStyle = '#ffe3e8'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy - 120); ctx.lineTo(hx, hy - 38); ctx.moveTo(hx, hy + 12); ctx.lineTo(hx, hy + 170); ctx.moveTo(hx - 220, hy + 20); ctx.lineTo(hx + 220, hy + 20); ctx.stroke();
    const shut = E.outBack(seg(t, C.door - 0.1, C.door + 0.4));
    ctx.save(); ctx.translate(hx, hy - 38); ctx.rotate(-1.1 * (1 - shut)); ctx.strokeStyle = PAL.gold; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 50); ctx.stroke(); ctx.restore();
    circle(ctx, hx, hy - 38, 9); ctx.fillStyle = PAL.gold; ctx.fill();
    // 血流箭头
    const arrowAlong = (pts, col, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore(); };
    arrowAlong([[hx - 120, hy - 60], [hx - 30, hy - 20], [hx + 30, hy - 20], [hx + 120, hy - 60]], '#7f9cff', 1 - shut);
    arrowAlong([[hx - 120, hy - 60], [hx - 100, hy - 170], [hx - 40, hy - 260]], '#7f9cff', shut);
    ctx.restore();
    label(ctx, '心脏里的“小门”（卵圆孔）', hx, hy + 250, { size: 28, color: '#7a2a3a', shadow: false, alpha: da });
    label(ctx, shut > 0.9 ? '关上啦！血液改走去肺的新路线' : '出生前：血液从这里抄近路', hx, hy + 300, { size: 24, color: '#7a2a3a', shadow: false, weight: 500, alpha: da });
  }
  vignette(ctx, 0.35);
  const fl = 1 - seg(t, 0, 1.6);
  if (fl > 0) { ctx.fillStyle = `rgba(255,246,236,${fl})`; ctx.fillRect(0, 0, W, H); }
};

/* ---------- 尾声 你好呀 ---------- */
const JOURNEY = [
  ['受精卵', (ctx, s, t) => drawEgg(ctx, 0, 0, s * 0.42, t, { corona: 0, pronuclei: 1 })],
  ['2 个细胞', (ctx, s, t) => drawCleavage(ctx, 0, 0, s * 0.4, 1, t)],
  ['桑葚胚', (ctx, s, t) => drawCleavage(ctx, 0, 0, s * 0.4, 5, t)],
  ['囊胚', (ctx, s, t) => drawCleavage(ctx, 0, 0, s * 0.4, 6, t)],
  ['胚胎', (ctx, s, t) => drawEmbryo(ctx, 0, 0, s * 0.95, t, { beat: heartbeat(t, 120) })],
  ['胎儿', (ctx, s, t) => drawFetus(ctx, 0, 0, s * 0.9, t, { g: 0.3 })],
  ['足月', (ctx, s, t) => drawFetus(ctx, 0, 0, s * 1.0, t, { g: 1, rot: Math.PI * 0.94 })],
  ['出生！', (ctx, s, t) => drawNewborn(ctx, 0.15 * s, 0, s * 0.95, t, { rot: -0.2 })],
];
SCENES.hello = (ctx, t, S) => {
  const C = S.cues;
  const rec = E.inOut(seg(t, C.stars - 0.8, C.stars + 0.6));
  if (rec < 1) {
    const g = ctx.createRadialGradient(760, 420, 50, 760, 420, 1200); g.addColorStop(0, '#ffe2cf'); g.addColorStop(0.55, '#e59a92'); g.addColorStop(1, '#6a2a48');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    motes(ctx, t, { motes: 30, moteCol: '#ffffff', moteA: 0.7 });
    // 妈妈（面朝左，前倾），宝宝在怀里
    ctx.save(); ctx.translate(1180, 120); ctx.scale(-1, 1); ctx.translate(0, 0.5 * 1500); ctx.rotate(0.14); ctx.translate(0, -0.5 * 1500);
    drawMother(ctx, 0, 0, 1500, 0, t, { dressCol: '#f59ab0' });
    const mEye = ctx.getTransform().transformPoint(new DOMPoint(0.056 * 1500, 0.062 * 1500));
    const mMouth = ctx.getTransform().transformPoint(new DOMPoint(0.08 * 1500, 0.1 * 1500));
    ctx.restore();
    const bx = 800, by = 600, brot = -0.5;
    // 托着宝宝的前臂（在襁褓后面）
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1170, 480); ctx.quadraticCurveTo(1160, 760, 900, 760); ctx.quadraticCurveTo(700, 760, 560, 690);
    ctx.lineWidth = 80; ctx.strokeStyle = '#ffb49a'; ctx.stroke(); ctx.lineWidth = 72; ctx.strokeStyle = '#ffe3d4'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1175, 470); ctx.quadraticCurveTo(1172, 560, 1165, 620); ctx.lineWidth = 84; ctx.strokeStyle = '#f7a9bb'; ctx.stroke();
    ctx.restore();
    drawNewborn(ctx, bx, by, 440, t, { rot: brot, eyeOpen: 1 });
    ctx.save(); ctx.beginPath(); ctx.ellipse(610, 650, 46, 34, -0.5, 0, TAU); ctx.fillStyle = '#ffe3d4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffb49a'; ctx.stroke(); ctx.restore();
    const cs = Math.cos(brot), sn = Math.sin(brot);
    const bEye = [bx + (0.14 * cs + 0.01 * sn) * 440, by + (0.14 * sn - 0.01 * cs) * 440];
    // 20–30 厘米
    const da = win(t, Ls(S, 0) + 3.5, Ls(S, 1) - 0.3, 0.6);
    if (da > 0) {
      ctx.save(); ctx.globalAlpha = da; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 20;
      ctx.beginPath(); ctx.moveTo(bEye[0], bEye[1]); ctx.lineTo(mEye.x, mEye.y); ctx.stroke(); ctx.restore();
      label(ctx, '20–30 厘米', (bEye[0] + mEye.x) / 2 - 110, (bEye[1] + mEye.y) / 2, { size: 30, color: PAL.gold, alpha: da, pill: 'rgba(40,12,28,0.65)' });
    }
    // 宝宝眼中的世界：远处模糊
    const fog = win(t, Ls(S, 0) + 5, Le(S, 0) + 0.5, 0.8);
    if (fog > 0) {
      const fx = (bEye[0] + mEye.x) / 2, fy = (bEye[1] + mEye.y) / 2;
      const fg = ctx.createRadialGradient(fx, fy, 180, fx, fy, 700); fg.addColorStop(0, 'rgba(255,236,226,0)'); fg.addColorStop(1, `rgba(255,236,226,${0.85 * fog})`);
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      label(ctx, '宝宝眼中的世界：只有近处是清楚的', 560, 150, { size: 26, color: '#7a2a3a', shadow: false, alpha: fog });
    }
    // 妈妈的声音
    const va = win(t, Ls(S, 1) - 0.2, Le(S, 1) + 1.2, 0.6);
    if (va > 0) {
      soundWaves(ctx, mMouth.x, mMouth.y, 150, t, Math.atan2(bEye[1] - mMouth.y, bEye[0] - mMouth.x), va, PAL.gold);
      for (let k = 0; k < 3; k++) { const p = ((t * 0.4 + k / 3) % 1); musicNote(ctx, lerp(mMouth.x - 40, bEye[0] + 40, p), lerp(mMouth.y + 20, bEye[1] - 60, p) - Math.sin(p * Math.PI) * 60, 30, va * Math.sin(p * Math.PI), k % 2 ? PAL.pink : PAL.gold); }
      drawHeart(ctx, bEye[0] - 30, bEye[1] - 150, 60 * bounceIn(t, Ls(S, 1) + 2.5), '#ff6b8a', va);
    }
    vignette(ctx, 0.4);
    if (rec > 0) { ctx.fillStyle = `rgba(20,8,20,${rec})`; ctx.fillRect(0, 0, W, H); }
  }
  if (rec > 0) {
    ctx.save(); ctx.globalAlpha = rec;
    starfield(ctx, t, { top: '#140a22', bot: '#3a1430' });
    // 旅程回顾
    const ja = 1 - seg(t, C.you - 0.8, C.you + 0.2);
    if (ja > 0) {
      const n = JOURNEY.length, pts = JOURNEY.map((_, k) => [170 + k * (1580 / (n - 1)), 680 - Math.sin(k / (n - 1) * Math.PI) * 220]);
      ctx.save(); ctx.globalAlpha = rec * ja;
      ctx.strokeStyle = hexA(PAL.gold, 0.5); ctx.lineWidth = 3; ctx.setLineDash([4, 12]);
      const shown = clamp((t - C.stars) / (0.75 * (n - 1)));
      ctx.beginPath(); for (let k = 0; k <= 60 * shown; k++) { const u = k / 60 * (n - 1); const i = Math.min(n - 2, Math.floor(u)); const f = u - i; const x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
      JOURNEY.forEach(([name, fn], k) => {
        const b = bounceIn(t, C.stars + k * 0.75, 0.7); if (b <= 0) return;
        const [x, y] = pts[k];
        glow(ctx, x, y, 150, PAL.gold, 0.25 * b);
        ctx.save(); ctx.translate(x, y); ctx.scale(b, b); fn(ctx, 170, t); ctx.restore();
        label(ctx, name, x, y + 130, { size: 26, alpha: clamp(b), color: k === n - 1 ? PAL.gold : PAL.cream });
      });
      ctx.restore();
    }
    // 包括你
    const ya = fadeIn(t, C.you - 0.3, 1);
    if (ya > 0) {
      ctx.save(); ctx.globalAlpha = rec * ya;
      glow(ctx, W / 2, 700, 420, PAL.gold, 0.35);
      drawKid(ctx, W / 2 - 40, 560, 380, t, { shirt: '#8fe8df', reach: 0.4 + 0.2 * Math.sin(t * 2) });
      drawSparkle(ctx, W / 2 + 180, 360 - Math.sin(t * 1.5) * 12, 40, 1);
      for (let k = 0; k < 14; k++) { const an = k / 14 * TAU + t * 0.25; drawSparkle(ctx, W / 2 + Math.cos(an) * 330, 700 + Math.sin(an) * 250, 8, 0.4 + 0.4 * Math.sin(t * 3 + k)); }
      ctx.restore();
    }
    // 欢迎来到这个世界
    const wt = C.welcome;
    if (t > wt - 0.2) {
      const title = '欢迎来到这个世界！';
      ctx.save(); ctx.font = `400 104px ${FONT_TITLE}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      const chars = [...title], wsum = ctx.measureText(title).width; let xx = W / 2 - wsum / 2;
      chars.forEach((ch, k) => {
        const w = ctx.measureText(ch).width; const b = bounceIn(t, wt + k * 0.08, 0.6);
        ctx.save(); ctx.translate(xx + w / 2, 230 + Math.sin(t * 2 + k * 0.7) * 6); ctx.scale(b, b); ctx.globalAlpha = rec * clamp(b * 1.5);
        ctx.shadowColor = 'rgba(255,190,120,0.8)'; ctx.shadowBlur = 36; ctx.fillStyle = k % 3 === 1 ? PAL.gold : PAL.cream; ctx.fillText(ch, 0, 0); ctx.restore(); xx += w;
      });
      ctx.restore();
      // 彩色小星星与爱心飘落
      const R = rng(99);
      for (let k = 0; k < 40; k++) {
        const x0 = R() * W, sp = 60 + R() * 90, ph = R() * 10, col = [PAL.gold, PAL.pink, PAL.teal, PAL.cream][k % 4];
        const y = ((t - wt) * sp + ph * 60) % (H + 100) - 50; const x = x0 + Math.sin(t + k) * 30;
        if (k % 3) drawSparkle(ctx, x, y, 7 + (k % 5), rec * 0.8 * fadeIn(t, wt), col); else drawHeart(ctx, x, y, 22, '#ff7d95', rec * 0.8 * fadeIn(t, wt));
      }
    }
    ctx.restore();
  }
};

/* ---------- 片尾 ---------- */
SCENES.credits = (ctx, t, S) => {
  starfield(ctx, t, { top: '#0e0716', bot: '#2a0f22', alpha: 0.7 });
  const M = TIMELINE.meta;
  const out = 1 - seg(t, S.dur - 2, S.dur - 0.2);
  ctx.save(); ctx.globalAlpha = out;
  label(ctx, M.title, W / 2, 190, { size: 84, font: FONT_TITLE, weight: 400, alpha: fadeIn(t, 0.6, 1) });
  label(ctx, M.subtitle, W / 2, 270, { size: 30, color: PAL.peach, weight: 500, alpha: fadeIn(t, 1.2, 1) });
  const na = fadeIn(t, 2.2, 1);
  if (na > 0) {
    ctx.save(); ctx.globalAlpha *= na;
    rrect(ctx, W / 2 - 560, 350, 1120, 210, 28); ctx.fillStyle = 'rgba(255,210,122,0.08)'; ctx.fill(); ctx.strokeStyle = hexA(PAL.gold, 0.4); ctx.lineWidth = 2; ctx.stroke();
    label(ctx, '给大人的话', W / 2, 395, { size: 28, color: PAL.gold });
    ctx.font = `400 32px ${FONT_BODY}`; const rows = wrapText(ctx, M.note, 1000);
    rows.forEach((r, k) => label(ctx, r, W / 2, 455 + k * 48, { size: 32, weight: 400 }));
    ctx.restore();
  }
  M.credits.forEach(([k, v], i) => {
    const a = fadeIn(t, 4.5 + i * 0.6, 0.8);
    label(ctx, k, W / 2 - 30, 650 + i * 62, { size: 26, align: 'right', color: PAL.gold, alpha: a, weight: 500 });
    label(ctx, v, W / 2 + 10, 650 + i * 62, { size: 26, align: 'left', alpha: a, weight: 400 });
  });
  ctx.restore();
};
