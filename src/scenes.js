/* 场景（上）：序章 → 扑通扑通。每个场景是 t（场景内秒数）的纯函数，任意一帧都可独立渲染。 */
const Ls = (S, i) => S.lines[i].start, Le = (S, i) => S.lines[i].end;
function withCam(ctx, cx, cy, z, fx = W / 2, fy = H / 2) { ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
function bounceIn(t, t0, d = 0.6) { return E.outBack(seg(t, t0, t0 + d)); }

/* ---------- 小道具 ---------- */
function drawSandGrain(ctx, x, y, r, t) {
  const R = rng(77); const pts = [];
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU; pts.push([x + Math.cos(a) * r * (0.8 + R() * 0.3), y + Math.sin(a) * r * (0.72 + R() * 0.3)]); }
  glow(ctx, x, y, r * 2.2, PAL.gold, 0.18);
  ctx.beginPath(); smoothPath(ctx, pts, true, 0.35);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, '#fbe3b0'); g.addColorStop(0.6, '#d9aa66'); g.addColorStop(1, '#8e6534');
  ctx.fillStyle = g; ctx.fill();
  const R2 = rng(5);
  ctx.save(); ctx.clip();
  for (let i = 0; i < 70; i++) { circle(ctx, x + (R2() - 0.5) * r * 2, y + (R2() - 0.5) * r * 2, r * (0.01 + R2() * 0.03)); ctx.fillStyle = `rgba(${R2() > 0.5 ? '255,255,240' : '110,70,30'},${0.2 + R2() * 0.3})`; ctx.fill(); }
  ctx.restore();
}
function drawFace(ctx, x, y, r, kind, t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const skin = '#ffd9c6';
  const hair = kind === 'dad' ? '#3a2630' : kind === 'mom' ? '#6b2c3e' : '#5a3030';
  glow(ctx, x, y, r * 1.8, kind === 'dad' ? PAL.teal : kind === 'mom' ? PAL.pink : PAL.gold, 0.35);
  if (kind === 'mom') { circle(ctx, x, y - r * 0.95, r * 0.38); ctx.fillStyle = hair; ctx.fill(); }
  circle(ctx, x, y, r); ctx.fillStyle = skin; ctx.fill();
  ctx.beginPath();
  if (kind === 'dad') { ctx.arc(x, y - r * 0.1, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(x, y - r * 0.55, x - r * 1.0, y - r * 0.2); }
  else if (kind === 'mom') { ctx.arc(x, y, r * 1.04, Math.PI * 0.85, Math.PI * 2.15); ctx.quadraticCurveTo(x + r * 0.2, y - r * 0.7, x - r * 0.95, y + r * 0.35); }
  else { ctx.arc(x, y - r * 0.05, r * 1.03, Math.PI * 1.0, Math.PI * 2.0); for (let k = 0; k <= 6; k++) ctx.lineTo(x + r * (1 - k / 3), y - r * 0.4 - (k % 2) * r * 0.18); }
  ctx.closePath(); ctx.fillStyle = hair; ctx.fill();
  if (kind === 'kid') { for (let k = 0; k < 5; k++) { circle(ctx, x - r * 0.8 + k * r * 0.4, y - r * 0.95, r * 0.22); ctx.fillStyle = hair; ctx.fill(); } }
  const eye = kind === 'dad' ? '#2a1a20' : '#3a1a24';
  for (const s of [-1, 1]) {
    ellipse(ctx, x + s * r * 0.36, y + r * 0.1, r * 0.1, r * 0.13); ctx.fillStyle = eye; ctx.fill();
    circle(ctx, x + s * r * 0.36 + r * 0.03, y + r * 0.05, r * 0.035); ctx.fillStyle = '#fff'; ctx.fill();
    glow(ctx, x + s * r * 0.55, y + r * 0.4, r * 0.25, '#ff8f9a', 0.45);
  }
  ctx.beginPath(); ctx.arc(x, y + r * 0.35, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = r * 0.07; ctx.strokeStyle = '#9a4a55'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}
// 输卵管壁（上下两侧），camX 为横向滚动
function drawTubeWalls(ctx, t, camX, o = {}) {
  const top = o.top ?? 170, bot = o.bot ?? 900, a = o.alpha ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  for (const side of [-1, 1]) {
    const edge = x => (side < 0 ? top : bot) + side * (-1) * (38 * Math.sin((x + camX) * 0.004) + 22 * Math.sin((x + camX) * 0.011 + 1.3));
    ctx.beginPath();
    ctx.moveTo(-20, side < 0 ? -20 : H + 20);
    for (let x = -20; x <= W + 20; x += 20) ctx.lineTo(x, edge(x));
    ctx.lineTo(W + 20, side < 0 ? -20 : H + 20); ctx.closePath();
    const g = ctx.createLinearGradient(0, side < 0 ? 0 : H, 0, side < 0 ? top + 60 : bot - 60);
    g.addColorStop(0, '#5a1428'); g.addColorStop(0.75, '#b5405a'); g.addColorStop(1, '#ec8a92');
    ctx.fillStyle = g; ctx.fill();
    // 褶皱
    ctx.strokeStyle = 'rgba(255,190,190,0.18)'; ctx.lineWidth = 3;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) { const yy = edge(x) + side * k * 38 + side * 10 * Math.sin((x + camX) * 0.02 + k); x < 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    // 纤毛
    ctx.strokeStyle = 'rgba(255,215,210,0.55)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    const off = ((camX % 14) + 14) % 14;
    for (let x = -off; x <= W + 20; x += 14) {
      const y0 = edge(x); const wx = x + camX; const ang = Math.sin(t * 7 - wx * 0.05) * 0.55;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + Math.sin(ang) * 22, y0 - side * Math.cos(ang) * 22); ctx.stroke();
    }
  }
  ctx.restore();
}
// 生殖系统小地图：卵巢—输卵管—子宫
function drawMiniMap(ctx, x, y, s, u, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -1.25, -0.72, 2.5, 1.52, 0.16); ctx.fillStyle = 'rgba(30,8,20,0.7)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,214,180,0.3)'; ctx.lineWidth = 0.012; ctx.stroke();
  // 子宫
  ctx.beginPath(); ctx.moveTo(-0.32, -0.3); ctx.quadraticCurveTo(0, -0.42, 0.32, -0.3); ctx.quadraticCurveTo(0.34, 0.12, 0.1, 0.34); ctx.lineTo(0.1, 0.55); ctx.lineTo(-0.1, 0.55); ctx.lineTo(-0.1, 0.34); ctx.quadraticCurveTo(-0.34, 0.12, -0.32, -0.3); ctx.closePath();
  ctx.fillStyle = '#e0677b'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-0.2, -0.22); ctx.quadraticCurveTo(0, -0.28, 0.2, -0.22); ctx.quadraticCurveTo(0.18, 0.08, 0.02, 0.28); ctx.lineTo(-0.02, 0.28); ctx.quadraticCurveTo(-0.18, 0.08, -0.2, -0.22); ctx.closePath(); ctx.fillStyle = '#ffc2b8'; ctx.fill();
  // 输卵管
  ctx.lineCap = 'round'; ctx.strokeStyle = '#e0677b'; ctx.lineWidth = 0.07;
  const tube = sd => { ctx.beginPath(); ctx.moveTo(sd * 0.3, -0.3); ctx.bezierCurveTo(sd * 0.6, -0.5, sd * 0.95, -0.45, sd * 0.98, -0.12); ctx.stroke(); };
  tube(-1); tube(1);
  for (const sd of [-1, 1]) { ellipse(ctx, sd * 0.8, 0.02, 0.13, 0.08, sd * 0.4); ctx.fillStyle = '#f2a0a8'; ctx.fill(); }
  // 路线点
  const P = uu => { // 从右侧输卵管壶腹部到子宫腔
    if (uu < 0.75) { const k = uu / 0.75; const bx = (p0, p1, p2, p3) => Math.pow(1 - k, 3) * p0 + 3 * Math.pow(1 - k, 2) * k * p1 + 3 * (1 - k) * k * k * p2 + k * k * k * p3; return [bx(0.9, 0.8, 0.5, 0.3), bx(-0.3, -0.48, -0.5, -0.3)]; }
    const k = (uu - 0.75) / 0.25; return [lerp(0.3, 0.02, k), lerp(-0.3, -0.05, k)];
  };
  ctx.setLineDash([0.03, 0.03]); ctx.strokeStyle = 'rgba(255,240,200,0.7)'; ctx.lineWidth = 0.015;
  ctx.beginPath(); for (let k = 0; k <= 30; k++) { const p = P(k / 30); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); ctx.setLineDash([]);
  const p = P(clamp(u));
  glow(ctx, p[0], p[1], 0.14, PAL.gold, 0.9); circle(ctx, p[0], p[1], 0.035); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
  label(ctx, '输卵管', x + 0.72 * s, y - 0.56 * s, { size: 20, alpha: a, weight: 500 });
  label(ctx, '卵巢', x + 0.8 * s, y + 0.2 * s, { size: 20, alpha: a, weight: 500 });
  label(ctx, '子宫', x, y + 0.66 * s, { size: 20, alpha: a, weight: 500 });
}
function countPill(ctx, text, a, x = 74, y = 132) { if (a > 0) label(ctx, text, x, y, { size: 26, align: 'left', pill: 'rgba(40,12,28,0.7)', border: 'rgba(255,214,180,0.35)', alpha: a, color: PAL.gold }); }

/* ---------- 序章 ---------- */
SCENES.opening = (ctx, t, S) => {
  starfield(ctx, t, { alpha: fadeIn(t, 0, 2) });
  const zoom = E.inOut(seg(t, Ls(S, 1) - 0.3, Ls(S, 1) + 3.2));
  // 沙粒与细胞（真实比例约 5:1）
  const sandA = fadeIn(t, Ls(S, 0) + 0.3, 1.2) * (1 - zoom);
  const cellX = lerp(1040, W / 2, zoom), cellY = lerp(500, 470, zoom) + 230 * E.inOut(seg(t, S.cues.title - 0.8, S.cues.title + 1.2));
  if (sandA > 0) {
    ctx.save(); ctx.globalAlpha = sandA;
    const sx = lerp(820, -400, zoom);
    ctx.globalAlpha = sandA * (1 - seg(zoom, 0, 0.5));
    drawSandGrain(ctx, sx, 500, 150 + zoom * 600, t);
    label(ctx, '一粒沙子', sx, 700, { size: 30, alpha: seg(t, Ls(S, 0) + 1.2, Ls(S, 0) + 2) });
    ctx.restore();
  }
  const sinkT = E.inOut(seg(t, S.cues.title - 0.8, S.cues.title + 1.2));
  const cr = lerp(26, 210, E.in(zoom) * 0.35 + zoom * 0.65) * (1 - 0.35 * sinkT);
  const ca = fadeIn(t, 0.8, 1.6);
  const breath = 1 + 0.03 * Math.sin(t * 1.6);
  ctx.save(); ctx.globalAlpha = ca;
  glow(ctx, cellX, cellY, cr * 4 * breath, PAL.gold, 0.35);
  drawEgg(ctx, cellX, cellY, cr * breath, t, { corona: 0, pronuclei: 1, core: '#fff1e2' });
  // 细胞里的“未来”——宝宝的影子
  const ghost = win(t, Ls(S, 2) + 1.2, Le(S, 2) - 0.2, 1.2) * 0.5;
  if (ghost > 0) { ctx.globalAlpha = ca * ghost; drawFetus(ctx, cellX, cellY + cr * 0.05, cr * 1.25, t, { g: 1 }); }
  ctx.restore();
  if (sandA > 0) label(ctx, '你（一个细胞）', cellX, cellY + 70, { size: 26, alpha: sandA * seg(t, Ls(S, 0) + 2.2, Ls(S, 0) + 3), color: PAL.gold });
  // 星光粒子
  for (let k = 0; k < 14; k++) {
    const R = rng(k + 100); const a0 = R() * TAU, sp = 0.3 + R() * 0.4;
    const ph = (t * sp + R()) % 1; const rr = cr * (1.3 + ph * 1.8);
    drawSparkle(ctx, cellX + Math.cos(a0 + t * 0.1) * rr, cellY + Math.sin(a0 + t * 0.1) * rr, 5 + R() * 8, zoom * Math.sin(ph * Math.PI) * 0.9);
  }
  // 片名
  const tt = S.cues.title;
  if (t > tt - 0.2) {
    const title = '你好，小生命';
    ctx.save(); ctx.font = `400 150px ${FONT_TITLE}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    const chars = [...title], wsum = ctx.measureText(title).width; let xx = W / 2 - wsum / 2;
    const up = E.inOut(seg(t, tt - 0.3, tt + 1.4));
    chars.forEach((ch, k) => {
      const w = ctx.measureText(ch).width; const b = bounceIn(t, tt + k * 0.12, 0.7);
      ctx.save(); ctx.translate(xx + w / 2, 300 - (1 - b) * 40 + Math.sin(t * 2 + k) * 4); ctx.scale(b, b);
      ctx.globalAlpha = clamp(b * 1.5);
      ctx.shadowColor = 'rgba(255,190,120,0.8)'; ctx.shadowBlur = 40;
      ctx.fillStyle = k === 2 ? PAL.gold : PAL.cream; ctx.fillText(ch, 0, 0);
      ctx.restore(); xx += w;
    });
    ctx.restore();
    label(ctx, '一个细胞变成宝宝的奇妙旅程', W / 2, 420, { size: 38, color: PAL.peach, weight: 500, alpha: fadeIn(t, tt + 1.2, 1) });
    ctx.globalAlpha = 1;
    // 细胞在标题出现后下沉成“太阳”
    void up;
  }
  vignette(ctx, 0.7);
};

/* ---------- 第一章 两个细胞 ---------- */
SCENES.twoCells = (ctx, t, S) => {
  bgInside(ctx, t, { cx: 700 });
  const C = S.cues;
  const ex = 540, ey = 480, er = 190;
  const eggA = E.out(seg(t, C.egg - 0.4, C.egg + 1.2));
  // 预示：两颗光点
  const orbA = win(t, 1.0, C.egg, 0.8);
  glow(ctx, ex, ey, 120, PAL.pink, orbA * (0.8 + 0.2 * Math.sin(t * 3)));
  glow(ctx, 1030, ey, 90, PAL.teal, win(t, 1.0, C.sperm, 0.8) * (0.8 + 0.2 * Math.sin(t * 3 + 1)));
  if (eggA > 0) {
    ctx.save(); ctx.globalAlpha = clamp(eggA * 1.4);
    const bob = Math.sin(t * 0.8) * 6;
    drawEgg(ctx, ex, ey + bob, er * lerp(0.4, 1, E.outBack(seg(t, C.egg - 0.4, C.egg + 1.2))), t, {});
    ctx.restore();
    label(ctx, '卵子', ex, ey - er - 150, { size: 44, font: FONT_TITLE, weight: 400, alpha: fadeIn(t, C.egg + 0.6), pill: 'rgba(255,143,180,0.28)', border: hexA(PAL.pink, 0.7) });
    label(ctx, '来自妈妈', ex, ey - er - 92, { size: 24, alpha: fadeIn(t, C.egg + 1.0), color: PAL.pink, weight: 500 });
    // 比例尺
    const sb = fadeIn(t, C.egg + 3.5, 0.8);
    if (sb > 0) {
      ctx.save(); ctx.globalAlpha = sb; ctx.strokeStyle = PAL.cream; ctx.lineWidth = 2.5;
      const yb = ey + er + 118, w = er * 2 * E.out(seg(t, C.egg + 3.5, C.egg + 4.3));
      ctx.beginPath(); ctx.moveTo(ex - w / 2, yb); ctx.lineTo(ex + w / 2, yb); ctx.moveTo(ex - w / 2, yb - 10); ctx.lineTo(ex - w / 2, yb + 10); ctx.moveTo(ex + w / 2, yb - 10); ctx.lineTo(ex + w / 2, yb + 10); ctx.stroke();
      ctx.restore();
      label(ctx, '约 0.1 毫米', ex, ey + er + 150, { size: 24, alpha: sb, weight: 500 });
    }
  }
  // 精子：与卵子保持真实比例（总长约为卵子直径的一半）
  const spA = E.out(seg(t, C.sperm - 0.3, C.sperm + 0.8));
  if (spA > 0) {
    const lt = t - C.sperm;
    const sp = 1 + 1.4 * seg(t, Ls(S, 2) + 4.5, Ls(S, 2) + 5.5);
    const ph = lt * 0.9 * sp;
    const cx = 1030 + Math.sin(ph) * 150, cy = ey + Math.sin(ph * 2) * 80;
    const dx = Math.cos(ph) * 150, dy = Math.cos(ph * 2) * 160;
    const ang = Math.atan2(dy, dx);
    ctx.save(); ctx.globalAlpha = spA;
    glow(ctx, cx, cy, 70, PAL.teal, 0.4);
    drawSperm(ctx, cx, cy, ang, 1.75, t * 14 * sp, {});
    // 速度线
    const fast = seg(t, Ls(S, 2) + 4.5, Ls(S, 2) + 5.5);
    if (fast > 0) { ctx.strokeStyle = hexA(PAL.teal, 0.5 * fast); ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(cx - Math.cos(ang) * (190 + k * k * 20) - Math.sin(ang) * k * 22, cy - Math.sin(ang) * (190 + k * k * 20) + Math.cos(ang) * k * 22); ctx.lineTo(cx - Math.cos(ang) * (250 + k * k * 20) - Math.sin(ang) * k * 22, cy - Math.sin(ang) * (250 + k * k * 20) + Math.cos(ang) * k * 22); ctx.stroke(); } }
    ctx.restore();
    label(ctx, '精子', 1030, ey - 260, { size: 44, font: FONT_TITLE, weight: 400, alpha: fadeIn(t, C.sperm + 0.6), pill: 'rgba(143,232,223,0.22)', border: hexA(PAL.teal, 0.7) });
    label(ctx, '来自爸爸', 1030, ey - 202, { size: 24, alpha: fadeIn(t, C.sperm + 1.0), color: PAL.teal, weight: 500 });
  }
  vignette(ctx, 0.55);
};

/* ---------- 第二章 奇妙的相遇 ---------- */
const RACE = (() => {
  const R = rng(2024), arr = [];
  for (let i = 0; i < 90; i++) arr.push({ bx: 60 + R() * 1150, by: 250 + R() * 560, ph: R() * TAU, drop: R(), s: 0.95 + R() * 0.3, sp: 0.6 + R() * 0.8 });
  const order = arr.map((p, i) => i).sort((x, y) => arr[y].drop - arr[x].drop);
  order.forEach((i, r) => { arr[i].rank = r; });
  return arr;
})();
const RACE_SURV = 26;
SCENES.meet = (ctx, t, S) => {
  const C = S.cues, F = C.fert;
  const arriveAt = u => E.inOut(seg(u, F - 9, F - 3.2));
  const arrive = arriveAt(t);
  // 相机位移 = 速度积分（抵达时减速）
  let camX = 0; { const n = 40; for (let k = 0; k < n; k++) { const u = (k + 0.5) / n * t; camX += 260 * (1 - 0.9 * arriveAt(u)) * t / n; } }
  const zoom = 1 + 0.55 * E.inOut(seg(t, F + 1.0, F + 5));
  bgInside(ctx, t, { cx: 900, c0: '#7a2640', motes: 30, dx: -40 - 200 * (1 - arrive) });
  ctx.save();
  withCam(ctx, 820, 520, zoom, 820, 520);
  drawTubeWalls(ctx, t, camX, { alpha: 1 - seg(t, F + 0.5, F + 3) });
  const ex = lerp(W + 420, 820, arrive), ey = 520, er = 200;
  const flash = t > F ? Math.exp(-(t - F) * 1.6) : 0;
  const t0 = Ls(S, 1) - 0.5, t1 = F - 5;
  const eggA = fadeIn(t, F - 9, 1);
  if (eggA > 0) {
    ctx.save(); ctx.globalAlpha = eggA;
    drawEgg(ctx, ex, ey, er, t, { flash: flash * 0.8, corona: 1 - 0.8 * seg(t, F + 0.5, F + 5), pronuclei: t > F + 2.5 ? E.inOut(seg(t, Ls(S, 2) + 1.5, Ls(S, 3))) : undefined });
    ctx.restore();
  }
  let champ = null;
  RACE.forEach((p, i) => {
    const r = p.rank;
    let a = fadeIn(t, 0.2 + (i % 9) * 0.12, 0.8);
    // 自由游动（屏幕坐标）
    let x = p.bx + Math.sin(t * p.sp + p.ph) * 50 + Math.sin(t * 0.3 + i) * 30;
    let y = p.by + Math.sin(t * 1.3 + p.ph) * 22;
    let ang = Math.sin(t * 2.5 + p.ph) * 0.18;
    if (r >= RACE_SURV) { // 掉队
      const tc = lerp(t0, t1, (90 - r) / (90 - RACE_SURV));
      const k = seg(t, tc, tc + 1.6);
      a *= 1 - k; x -= E.in(k) * 420; y += (p.by > 530 ? 1 : -1) * k * 120; ang += (p.by > 530 ? 1 : -1) * k * 0.6;
    } else { // 幸存者游向卵子四周
      const th = Math.PI + (r % 2 ? 1 : -1) * Math.ceil(r / 2) * (0.84 * Math.PI / 13);
      const q = E.inOut(seg(t, F - 7 + (r % 7) * 0.25, F - 3.4 + (r % 7) * 0.2));
      const rr = er * (1.42 + (r % 3) * 0.07);
      let sx = ex + Math.cos(th) * rr, sy = ey + Math.sin(th) * rr;
      if (r === 0) { const cin = E.inOut(seg(t, F - 1.6, F)); sx = ex + Math.cos(th) * er * lerp(1.42, 0.96, cin); sy = ey + Math.sin(th) * er * lerp(1.42, 0.96, cin); }
      x = lerp(x, sx, q); y = lerp(y, sy, q);
      ang = lerp(ang, th + Math.PI + (r ? Math.sin(t * 5 + p.ph) * 0.15 : 0), q);
      if (t > F) {
        if (r === 0) a *= 1 - seg(t, F, F + 1.2);
        else { const k = E.out(seg(t, F, F + 2.2)); x += Math.cos(th) * k * 260; y += Math.sin(th) * k * 260; a *= 1 - k; }
      }
      if (r === 0) champ = { x, y };
    }
    if (a > 0.01 && x > -150 && x < W + 150) drawSperm(ctx, x, y, ang, 0.95 * p.s, t * 16 + p.ph, { alpha: a, glow: r === 0 || i % 4 === 0 });
  });
  if (champ && t > F - 2 && t < F + 1) glow(ctx, champ.x, champ.y, 90, PAL.gold, 0.6 * win(t, F - 2, F + 0.5, 0.4));
  // 受精瞬间的光环（皮质反应）
  if (t > F) {
    const k = seg(t, F, F + 1.8);
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#fff4d6'; ctx.lineWidth = 10 * (1 - k) + 2;
    circle(ctx, ex, ey, er * (1.15 + k * 0.9)); ctx.stroke(); ctx.restore();
    glow(ctx, ex, ey, er * 3, '#fff3d6', (1 - k) * 0.7);
  }
  ctx.restore();
  if (t > F) {
    label(ctx, '受精卵', ex, ey - er * 1.18 * zoom - 44, { size: 46, font: FONT_TITLE, weight: 400, alpha: fadeIn(t, Ls(S, 2) + 2.5), pill: 'rgba(255,210,122,0.22)', border: hexA(PAL.gold, 0.7) });
    for (let k = 0; k < 10; k++) { const R = rng(k * 7 + 3); const a0 = R() * TAU; const ph = (t * 0.4 + R()) % 1; drawSparkle(ctx, ex + Math.cos(a0) * er * zoom * (1.3 + ph), ey + Math.sin(a0) * er * zoom * (1.3 + ph), 6 + R() * 8, fadeIn(t, Ls(S, 3) - 0.5) * Math.sin(ph * Math.PI)); }
  }
  const alive = t < t0 + 1 ? '好几亿个' : t < F - 5 ? '越来越少……' : t < F - 0.2 ? '最后几十个' : '只有 1 个！';
  countPill(ctx, `比赛中的精子：${alive}`, win(t, Ls(S, 1) - 0.3, F + 3.5, 0.5));
  vignette(ctx, 0.5);
};
SCENE_WEEK.meet = (t, S) => t > S.cues.fert + 2.5 ? { week: 2, text: '孕 2 周 · 受精日', alpha: fadeIn(t, S.cues.fert + 4) } : null;

/* ---------- 第三章 生命说明书 ---------- */
const KARYO = (() => { const a = []; for (let i = 0; i < 23; i++) { const R = rng(i * 31 + 7); a.push({ len: i < 22 ? lerp(96, 36, i / 21) : 72, sx: (R() - 0.5), sy: (R() - 0.5), r1: R() * TAU, r2: R() * TAU }); } return a; })();
SCENE_WEEK.dna = () => ({ week: 2, text: '孕 2 周 · 受精日' });
SCENES.dna = (ctx, t, S) => {
  const C = S.cues;
  bgInside(ctx, t, { c0: '#4a1a50', c1: '#2a0d30', c2: '#12060f', blobCols: [PAL.pink, PAL.teal, '#a8b8ff', PAL.gold], cx: 760 });
  // 开场：钻进细胞核
  const enter = E.inOut(seg(t, 0, 2.6));
  if (enter < 1) { ctx.save(); ctx.globalAlpha = 1 - enter; drawEgg(ctx, 760, 480, 200 * (1 + enter * 5), t, { corona: 0.2, pronuclei: 1 }); ctx.restore(); }
  // 细胞核边界
  const nucA = seg(t, 1.2, 2.8) * (1 - seg(t, C.helix - 0.3, C.helix + 1));
  if (nucA > 0) { ctx.save(); ctx.globalAlpha = nucA * 0.5; ctx.strokeStyle = '#ffd3e6'; ctx.lineWidth = 3; ctx.setLineDash([6, 12]); circle(ctx, 760, 480, 470 + Math.sin(t) * 6); ctx.stroke(); ctx.restore(); }
  // 46 条染色体：散开 → 配对
  const chrA = fadeIn(t, 2.2, 1.2) * (1 - seg(t, C.helix, C.helix + 1.2));
  const pairK = E.inOut(seg(t, C.pair, C.pair + 2.6));
  if (chrA > 0) {
    ctx.save(); ctx.globalAlpha = chrA;
    KARYO.forEach((c, i) => {
      const row = i < 8 ? 0 : i < 16 ? 1 : 2, col = row < 2 ? i - row * 8 : i - 16;
      const n = row < 2 ? 8 : 7;
      const gx = 760 + (col - (n - 1) / 2) * 118, gy = 290 + row * 175;
      const hue = [PAL.pink, PAL.teal];
      [0, 1].forEach(side => {
        const sx = 760 + (side ? 1 : -1) * (200 + (c.sx + 0.5) * 260) + Math.sin(t * 0.7 + i) * 12;
        const sy = 480 + c.sy * 560 + Math.cos(t * 0.6 + i * 1.3) * 12;
        const x = lerp(sx, gx + (side ? 22 : -22), pairK), y = lerp(sy, gy, pairK);
        const rot = lerp(side ? c.r2 : c.r1, 0, pairK) + Math.sin(t + i) * 0.05 * (1 - pairK);
        let len = c.len * 0.85;
        const isSex = i === 22 && side === 1;
        drawChromosome(ctx, x, y, isSex ? len * 0.55 : len, side ? '#5fd6cc' : '#ff8fb4', rot, { glow: false, cen: isSex ? 0.2 : -0.1 });
      });
    });
    ctx.restore();
    if (pairK > 0.5) {
      label(ctx, '来自妈妈', 380, 170, { size: 28, color: PAL.pink, alpha: seg(t, C.pair + 1.5, C.pair + 2.5) * chrA });
      label(ctx, '来自爸爸', 1140, 170, { size: 28, color: PAL.teal, alpha: seg(t, C.pair + 1.5, C.pair + 2.5) * chrA });
      label(ctx, '23 对 = 46 条', 760, 800, { size: 34, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: seg(t, C.pair + 2.2, C.pair + 3) * chrA });
      const xy = seg(t, Ls(S, 1) + 3.2, Ls(S, 1) + 4) * chrA;
      if (xy > 0) { const gx = 760 + 3 * 118, gy = 290 + 2 * 175; ctx.save(); ctx.globalAlpha = xy; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; rrect(ctx, gx - 60, gy - 70, 120, 140, 18); ctx.stroke(); ctx.restore(); label(ctx, 'X / Y', gx, gy + 92, { size: 22, color: PAL.gold, alpha: xy }); }
    }
  }
  // DNA 双螺旋 + 性状气泡
  const hx = seg(t, C.helix, C.helix + 2.2);
  if (hx > 0) {
    const fam = seg(t, Ls(S, 3) - 0.6, Ls(S, 3) + 0.6);
    const x1 = lerp(150, 1290, E.inOut(hx));
    drawHelix(ctx, 150, x1, lerp(480, 250, E.inOut(fam)), lerp(70, 45, fam), t * 1.4, { alpha: 1 - fam * 0.3 });
    const bub = (bx, by, t0, drawIcon, txt) => {
      const b = bounceIn(t, t0, 0.7) * (1 - fam);
      if (b <= 0) return;
      ctx.save(); ctx.translate(bx, by); ctx.scale(b, b);
      glow(ctx, 0, 0, 130, PAL.gold, 0.25);
      circle(ctx, 0, 0, 82); ctx.fillStyle = 'rgba(40,14,34,0.8)'; ctx.fill(); ctx.strokeStyle = hexA(PAL.gold, 0.7); ctx.lineWidth = 3; ctx.stroke();
      drawIcon(); ctx.restore();
      label(ctx, txt, bx, by + 112, { size: 26, alpha: b });
    };
    bub(470, 720, S.at ? 0 : Ls(S, 2) + 1.0, () => { // 眼睛
      const cols = ['#5a3a22', '#2a1a14', '#7a5a2a', '#4a6a8a'], k = Math.floor(t * 1.2) % 4, f = (t * 1.2) % 1;
      ellipse(ctx, 0, 0, 58, 34); ctx.fillStyle = '#fff'; ctx.fill();
      circle(ctx, 0, 0, 26); ctx.fillStyle = mix(cols[k], cols[(k + 1) % 4], smooth((f - 0.7) / 0.3)); ctx.fill();
      circle(ctx, 0, 0, 11); ctx.fillStyle = '#111'; ctx.fill(); circle(ctx, 8, -8, 6); ctx.fillStyle = '#fff'; ctx.fill();
    }, '眼睛的颜色');
    bub(930, 720, Ls(S, 2) + 2.6, () => { // 头发：直 ↔ 卷
      const curl = 0.5 + 0.5 * Math.sin(t * 2);
      ctx.strokeStyle = '#6b3a2a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) { const u = j / 20; const xx = k * 16 + Math.sin(u * 12) * 10 * curl; const yy = -45 + u * 90; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    }, '直发还是卷发');
    // 一家三口
    if (fam > 0) {
      const fa = E.out(fam);
      drawFace(ctx, 380, 600, 90, 'dad', t, fa); drawFace(ctx, 1140, 600, 90, 'mom', t, fa);
      const kb = bounceIn(t, Ls(S, 3) + 2.8, 0.8);
      if (kb > 0) { ctx.save(); ctx.translate(760, 590); ctx.scale(kb, kb); drawFace(ctx, 0, 0, 110, 'kid', t, 1); ctx.restore(); }
      label(ctx, '爸爸', 380, 730, { size: 28, color: PAL.teal, alpha: fa }); label(ctx, '妈妈', 1140, 730, { size: 28, color: PAL.pink, alpha: fa });
      label(ctx, '独一无二的你', 760, 760, { size: 36, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: seg(t, Ls(S, 3) + 3.4, Ls(S, 3) + 4.2) });
      ctx.save(); ctx.globalAlpha = fa * 0.8; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
      ctx.beginPath(); ctx.moveTo(480, 600); ctx.lineTo(630, 595); ctx.moveTo(1040, 600); ctx.lineTo(890, 595); ctx.stroke(); ctx.restore();
      for (let k = 0; k < 8; k++) { const a0 = k / 8 * TAU + t * 0.4; drawSparkle(ctx, 760 + Math.cos(a0) * 170, 590 + Math.sin(a0) * 150, 8, kb * (0.5 + 0.5 * Math.sin(t * 3 + k))); }
    }
  }
  vignette(ctx, 0.55);
};

/* ---------- 第四章 一变二，二变四 ---------- */
function cleaveLevel(t, C) {
  const ks = [C.d1, C.d2, C.d3, C.d4, C.d5];
  let L = 0; ks.forEach(k => { L += E.inOut(seg(t, k, k + 0.9)); });
  return L + E.inOut(seg(t, C.blast, C.blast + 2.2));
}
SCENE_WEEK.divide = (t, S) => {
  const C = S.cues; const day = t < C.d1 ? 1 : t < C.d3 ? 2 : t < C.d5 ? 3 : t < C.blast - 3 ? 4 : 5;
  return { week: 2 + day / 7, text: `受精后第 ${day} 天` };
};
SCENES.divide = (ctx, t, S) => {
  const C = S.cues;
  const inUterus = E.inOut(seg(t, Ls(S, 2) + 0.5, Ls(S, 2) + 4));
  bgInside(ctx, t, { c0: mix('#7a2640', '#8a3350', inUterus), cx: 760, motes: 36, dx: -30 });
  const speed = 40 + 120 * win(t, C.travel, Ls(S, 2) + 2, 1.5);
  const camX = t * 40 + 120 * Math.max(0, t - C.travel) * (1 - 0.5 * seg(t, Ls(S, 2), Ls(S, 2) + 3));
  void speed;
  drawTubeWalls(ctx, t, camX, { top: lerp(150, -120, inUterus), bot: lerp(920, 1200, inUterus), alpha: 1 - inUterus * 0.9 });
  const L = cleaveLevel(t, C);
  const cx = 760, cy = 470 + Math.sin(t * 0.9) * 8;
  drawCleavage(ctx, cx, cy, 160, L, t);
  // 分裂时的闪光
  [C.d1, C.d2, C.d3, C.d4, C.d5].forEach(k => { const a = win(t, k + 0.2, k + 0.5, 0.3); if (a > 0) glow(ctx, cx, cy, 320, PAL.gold, a * 0.35); });
  // 细胞计数
  const counts = ['1 个细胞', '2 个细胞', '4 个细胞', '8 个细胞', '16 个细胞', '32 个细胞…', '囊胚：100 多个细胞'];
  const idx = L >= 5.5 ? 6 : Math.round(clamp(L, 0, 5));
  const ca = fadeIn(t, 2.5);
  label(ctx, counts[idx], cx, cy + 250, { size: 36, font: FONT_TITLE, weight: 400, color: PAL.gold, alpha: ca, pill: 'rgba(40,12,28,0.6)' });
  if (L >= 4.6 && L < 5.5) label(ctx, '像一颗桑葚', cx, cy - 245, { size: 28, alpha: win(t, C.d5 - 0.4, C.blast - 1, 0.4) });
  if (L >= 5.6) {
    const a = fadeIn(t, C.blast + 1.8);
    label(ctx, '将来长成宝宝', cx + 330, cy - 150, { size: 24, alpha: a, align: 'left', color: PAL.cream });
    label(ctx, '将来参与形成胎盘', cx + 330, cy + 110, { size: 24, alpha: a, align: 'left', color: PAL.cream });
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = hexA(PAL.cream, 0.7); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + 320, cy - 150); ctx.lineTo(cx + 40, cy - 95); ctx.moveTo(cx + 320, cy + 110); ctx.lineTo(cx + 150, cy + 60); ctx.stroke(); ctx.restore();
  }
  // 小地图
  const ma = win(t, C.travel - 0.5, S.dur, 0.8);
  if (ma > 0) drawMiniMap(ctx, 270, 690, 140, E.inOut(seg(t, C.travel, Ls(S, 2) + 3.5)), ma);
  vignette(ctx, 0.5);
};

/* ---------- 第五章 一张软软的床 ---------- */
function drawEndometrium(ctx, t, surf, o = {}) {
  // surf(x) 返回内膜表面 y
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-10, H + 10);
  for (let x = -10; x <= W + 10; x += 16) ctx.lineTo(x, surf(x));
  ctx.lineTo(W + 10, H + 10); ctx.closePath();
  const g = ctx.createLinearGradient(0, 520, 0, H);
  g.addColorStop(0, '#ff9ea4'); g.addColorStop(0.25, '#e0647a'); g.addColorStop(1, '#6a1a32');
  ctx.fillStyle = g; ctx.fill();
  ctx.clip();
  // 腺体与螺旋小动脉
  const R = rng(88);
  for (let i = 0; i < 26; i++) {
    const x = R() * W, y0 = surf(x) + 30 + R() * 40, len = 120 + R() * 200;
    ctx.beginPath(); ctx.moveTo(x, y0);
    for (let k = 0; k <= 12; k++) ctx.lineTo(x + Math.sin(k * 1.3 + i) * 10, y0 + k / 12 * len);
    ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,200,200,0.22)'; ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const x = R() * W, y0 = H + 20;
    ctx.beginPath(); ctx.moveTo(x, y0);
    for (let k = 0; k <= 30; k++) { const yy = y0 - k * 12; ctx.lineTo(x + Math.sin(k * 0.8 + i + t * 0.5) * 14, yy); if (yy < surf(x) + 60) break; }
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,30,60,0.55)'; ctx.stroke();
  }
  // 表层柔光
  ctx.beginPath(); for (let x = -10; x <= W + 10; x += 16) ctx.lineTo(x, surf(x) + 4);
  ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(255,220,215,0.35)'; ctx.stroke();
  ctx.restore();
}
function drawTestStick(ctx, x, y, s, lines, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(-0.25); ctx.scale(s, s);
  rrect(ctx, -0.5, -0.12, 1, 0.24, 0.12); ctx.fillStyle = '#fbfbff'; ctx.fill();
  rrect(ctx, -0.5, -0.12, 0.3, 0.24, [0.12, 0, 0, 0.12]); ctx.fillStyle = '#9cc9ff'; ctx.fill();
  rrect(ctx, 0.0, -0.06, 0.3, 0.12, 0.03); ctx.fillStyle = '#eee'; ctx.fill();
  ctx.fillStyle = '#e0457a';
  if (lines > 0) ctx.fillRect(0.2, -0.055, 0.025, 0.11);
  if (lines > 1) { ctx.globalAlpha *= clamp(lines - 1); ctx.fillRect(0.08, -0.055, 0.025, 0.11); }
  ctx.restore();
}
SCENE_WEEK.implant = () => ({ week: 3, text: '受精后第 6–12 天' });
SCENES.implant = (ctx, t, S) => {
  const C = S.cues;
  bgInside(ctx, t, { cx: 760, cy: 300, c0: '#7a2a44', motes: 30 });
  const bx = 760;
  const drop = E.inOut(seg(t, 0.5, C.nest + 0.4));
  const sink = E.inOut(seg(t, C.nest - 0.2, C.nest + 3.5));
  const by = lerp(230, 560, drop) + sink * 70 + Math.sin(t * 1.1) * 6 * (1 - sink);
  const R = 110;
  const surf = x => 640 + 22 * Math.sin(x * 0.006 + 0.8) + 10 * Math.sin(x * 0.02 + t * 0.4) + (Math.exp(-Math.pow((x - bx) / 140, 2)) * sink * 50);
  drawEndometrium(ctx, t, surf);
  // 囊胚
  const hatch = seg(t, C.hatch, C.hatch + 2.2);
  ctx.save();
  drawCleavage(ctx, bx, by, R, 6, t, { zona: hatch > 0 ? 0 : 1 });
  if (hatch > 0) { // 透明带裂开漂走
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.globalAlpha = 1 - hatch; ctx.translate(bx + sd * hatch * 160, by - hatch * 120); ctx.rotate(sd * hatch * 0.8);
      ctx.beginPath(); ctx.arc(0, 0, R * 1.16, sd > 0 ? -1.2 : Math.PI - 1.9, sd > 0 ? 1.9 : Math.PI + 1.2); ctx.lineWidth = R * 0.13; ctx.strokeStyle = 'rgba(255,236,226,0.4)'; ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
  // 内膜包裹：在囊胚下半部盖一层半透明组织
  if (sink > 0) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(bx - 260, H);
    for (let x = bx - 260; x <= bx + 260; x += 8) ctx.lineTo(x, surf(x) - Math.exp(-Math.pow((x - bx) / 120, 2)) * sink * 120);
    ctx.lineTo(bx + 260, H); ctx.closePath();
    ctx.fillStyle = `rgba(232,110,130,${0.75 * sink})`; ctx.fill(); ctx.restore();
    glow(ctx, bx, by, 260, PAL.gold, 0.3 * sink);
  }
  label(ctx, '子宫内膜', 300, 800, { size: 30, alpha: win(t, 2.5, C.hatch, 0.8) });
  // 信号：hCG
  const sig = seg(t, C.signal, C.signal + 1);
  if (sig > 0) {
    for (let k = 0; k < 4; k++) { const p = ((t - C.signal) * 0.5 + k / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.7 * sig; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 4; circle(ctx, bx, by, 120 + p * 520); ctx.stroke(); ctx.restore(); }
    const R2 = rng(12);
    for (let k = 0; k < 40; k++) { const a0 = -Math.PI * (0.1 + R2() * 0.8); const p = ((t - C.signal) * (0.2 + R2() * 0.2) + R2()) % 1; circle(ctx, bx + Math.cos(a0) * p * 600, by + Math.sin(a0) * p * 520, 4); ctx.fillStyle = hexA(PAL.gold, (1 - p) * sig); ctx.fill(); }
    drawTestStick(ctx, 360, 300, 260, 1 + seg(t, C.signal + 1.6, C.signal + 2.6), fadeIn(t, C.signal + 0.6));
    label(ctx, 'hCG 信号', bx, by - 190, { size: 30, color: PAL.gold, alpha: fadeIn(t, C.signal + 0.8) });
  }
  vignette(ctx, 0.5);
};

/* ---------- 第六章 扑通，扑通 ---------- */
function beatPulse(t, beats) { let p = 0; for (const b of beats) { if (b > t) break; const d = t - b; p = Math.max(p, Math.exp(-d * 9), 0.55 * Math.exp(-Math.pow((d - 0.16) * 14, 2))); } return p; }
SCENE_WEEK.heart = () => ({ week: 5.5, text: '孕 5–6 周' });
SCENES.heart = (ctx, t, S) => {
  const C = S.cues;
  bgInside(ctx, t, { cx: 700, c0: '#5e1a36', motes: 34 });
  const beat = t > C.beat ? beatPulse(t, C.beats) : 0;
  const ex = 700, ey = 460;
  drawSac(ctx, ex, ey, 330, t);
  // 卵黄囊
  circle(ctx, ex + 250, ey + 170, 62); const yg = ctx.createRadialGradient(ex + 235, ey + 155, 5, ex + 250, ey + 170, 62); yg.addColorStop(0, '#fff2c2'); yg.addColorStop(1, '#f2b86a'); ctx.fillStyle = yg; ctx.fill();
  ctx.strokeStyle = '#f5c98a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex + 80, ey + 70); ctx.quadraticCurveTo(ex + 170, ey + 120, ex + 200, ey + 150); ctx.stroke();
  glow(ctx, ex, ey, 400, '#ff3d5a', beat * 0.18);
  drawEmbryo(ctx, ex - 10, ey, 470 * (1 + beat * 0.008), t, { beat });
  label(ctx, '卵黄囊', ex + 250, ey + 262, { size: 22, alpha: win(t, 3, Ls(S, 1), 0.8), weight: 500 });
  // 芝麻对比
  const sa = win(t, Ls(S, 0) + 1.5, Ls(S, 1) + 2.5, 0.7);
  if (sa > 0) {
    ctx.save(); ctx.globalAlpha = sa; FRUIT.sesame(ctx, 1160, 440, 300 * bounceIn(t, Ls(S, 0) + 1.5)); ctx.restore();
    label(ctx, '一粒芝麻（约 3 毫米）', 1160, 640, { size: 26, alpha: sa });
    label(ctx, '≈', 985, 450, { size: 70, alpha: sa, font: FONT_TITLE, weight: 400 });
  }
  // 心电图
  const ea = fadeIn(t, C.beat - 0.2);
  if (ea > 0) {
    ctx.save(); ctx.globalAlpha = ea; ctx.lineWidth = 4; ctx.strokeStyle = '#ff7d95'; ctx.shadowColor = '#ff3d5a'; ctx.shadowBlur = 16; ctx.lineJoin = 'round';
    const y0 = 850, x0 = 200, x1 = 1260, span = 3.0;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 4) {
      const tt = t - (x1 - x) / (x1 - x0) * span; let v = 0;
      if (tt > C.beat) for (const b of C.beats) { if (b > tt) break; const d = tt - b; if (d < 0.35) v = Math.max(v, Math.exp(-Math.pow((d - 0.03) / 0.018, 2)) - 0.35 * Math.exp(-Math.pow((d - 0.07) / 0.02, 2)) + 0.2 * Math.exp(-Math.pow((d - 0.22) / 0.04, 2))); }
      const yy = y0 - v * 70; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke(); ctx.restore();
    const b = C.beats.filter(x => x <= t);
    const bpm = b.length > 1 ? Math.round(60 / (b[b.length - 1] - b[b.length - 2])) : 110;
    label(ctx, `♥ ${bpm} 次/分`, 1260, 790, { size: 30, align: 'right', color: '#ff9db0', alpha: ea });
  }
  // 宝宝 vs 大人
  const ha = fadeIn(t, Ls(S, 2) - 0.2, 0.8);
  if (ha > 0) {
    const adult = heartbeat(t, 72);
    drawHeart(ctx, 1030, 330, 120 * (1 + beat * 0.2), '#ff5d7a', ha);
    drawHeart(ctx, 1030, 560, 120 * (1 + adult * 0.12), '#c86a8a', ha * 0.9);
    label(ctx, '宝宝', 1130, 330, { size: 28, align: 'left', alpha: ha });
    label(ctx, '大人', 1130, 560, { size: 28, align: 'left', alpha: ha });
    label(ctx, '约 70 次/分', 1130, 600, { size: 22, align: 'left', alpha: ha, weight: 500, color: PAL.peach });
  }
  vignette(ctx, 0.5);
};
