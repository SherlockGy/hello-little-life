/* 美术库：所有角色与道具都用代码绘制（无位图素材） */

/* ---------- 背景 ---------- */
function bgInside(ctx, t, o = {}) {
  const cx = o.cx ?? W * 0.42, cy = o.cy ?? H * 0.45;
  const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, o.r ?? 1250);
  g.addColorStop(0, o.c0 || '#6b2340'); g.addColorStop(0.55, o.c1 || '#3a1127'); g.addColorStop(1, o.c2 || '#16060f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(o.seed || 7);
  const cols = o.blobCols || [PAL.coral, PAL.rose, PAL.gold, PAL.pink];
  for (let i = 0; i < 7; i++) {
    const bx = r() * W, by = r() * H, br = 260 + r() * 360;
    glow(ctx, bx + wob(t * 0.15, i) * 90, by + wob(t * 0.12, i + 9) * 70, br, cols[i % cols.length], o.blob ?? 0.09);
  }
  if (o.motes !== 0) motes(ctx, t, o);
}
function motes(ctx, t, o = {}) {
  const r = rng(o.mseed || 11); const n = o.motes ?? 46;
  const col = o.moteCol || PAL.peach;
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 200), y0 = r() * (H + 200), sz = 1 + r() * 3.2, sp = 0.3 + r() * 0.9, ph = r() * TAU;
    const x = ((x0 + t * sp * (o.dx ?? 8) + wob(t * 0.3, i) * 30) % (W + 200) + W + 200) % (W + 200) - 100;
    const y = ((y0 - t * sp * (o.dy ?? 12) + wob(t * 0.25, i + 40) * 30) % (H + 200) + H + 200) % (H + 200) - 100;
    const a = (0.25 + 0.5 * Math.pow(Math.sin(t * 0.7 * sp + ph), 2)) * (o.moteA ?? 1);
    glow(ctx, x, y, sz * 7, col, a * 0.35);
    circle(ctx, x, y, sz * 0.8); ctx.fillStyle = hexA(PAL.cream, a * 0.7); ctx.fill();
  }
}
function starfield(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, o.top || '#0b0716'); g.addColorStop(1, o.bot || '#241026');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(ctx, W * 0.5, H * 1.1, 900, '#6b2a55', 0.35);
  const r = rng(o.seed || 3);
  for (let i = 0; i < (o.n || 260); i++) {
    const x = r() * W, y = r() * H, s = r() * r() * 2.6 + 0.4, ph = r() * TAU, sp = 0.5 + r() * 2;
    const tw = 0.45 + 0.55 * Math.pow(Math.sin(t * sp + ph), 2);
    const a = tw * (o.alpha ?? 1);
    if (s > 1.8) glow(ctx, x, y, s * 7, i % 5 ? '#ffe9d6' : '#bcd6ff', a * 0.4);
    circle(ctx, x, y, s * 0.7); ctx.fillStyle = `rgba(255,244,236,${a * 0.9})`; ctx.fill();
  }
}

/* ---------- 卵子 ---------- */
function drawEgg(ctx, x, y, r, t, o = {}) {
  const corona = o.corona ?? 1, flash = o.flash ?? 0;
  glow(ctx, x, y, r * 2.6, PAL.coral, 0.22 + flash * 0.4);
  if (corona > 0) {
    const R = rng(5), baseA = ctx.globalAlpha;
    for (let i = 0; i < 120; i++) {
      const a = R() * TAU, d = r * (1.2 + Math.pow(R(), 1.8) * 0.45), cr = r * (0.028 + R() * 0.03);
      const dd = d * (1 + (1 - corona) * 0.8) + wob(t * 0.4, i) * r * 0.02;
      const aa = a + wob(t * 0.1, i + 3) * 0.02;
      ctx.globalAlpha = baseA * corona * (0.15 + R() * 0.3) * (1.2 - (d / r - 1.2) * 1.4);
      ellipse(ctx, x + Math.cos(aa) * dd, y + Math.sin(aa) * dd, cr * 1.25, cr, aa);
      ctx.fillStyle = '#ffd9c4'; ctx.fill();
      ctx.globalAlpha = baseA;
    }
  }
  // 透明带
  ctx.beginPath(); ctx.arc(x, y, r * 1.15, 0, TAU); ctx.arc(x, y, r * 1.0, 0, TAU, true);
  const zg = ctx.createRadialGradient(x, y, r, x, y, r * 1.15);
  zg.addColorStop(0, `rgba(255,236,226,${0.18 + flash * 0.3})`); zg.addColorStop(0.5, `rgba(255,236,226,${0.38 + flash * 0.4})`); zg.addColorStop(1, 'rgba(255,236,226,0.12)');
  ctx.fillStyle = zg; ctx.fill();
  circle(ctx, x, y, r * 1.15); ctx.strokeStyle = `rgba(255,245,240,${0.4 + flash * 0.5})`; ctx.lineWidth = 2; ctx.stroke();
  // 胞质
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, o.core || '#ffe8d6'); g.addColorStop(0.55, '#ffbea4'); g.addColorStop(1, '#ee8a82');
  circle(ctx, x, y, r * 0.985); ctx.fillStyle = g; ctx.fill();
  const R2 = rng(9);
  for (let i = 0; i < 110; i++) {
    const a = R2() * TAU, d = Math.sqrt(R2()) * r * 0.9;
    circle(ctx, x + Math.cos(a) * d + wob(t * 0.3, i) * 2, y + Math.sin(a) * d, r * (0.008 + R2() * 0.014));
    ctx.fillStyle = `rgba(190,80,90,${0.12 + R2() * 0.18})`; ctx.fill();
  }
  if (o.pronuclei !== undefined) drawPronuclei(ctx, x, y, r, t, o.pronuclei);
  else { circle(ctx, x + r * 0.18, y + r * 0.1, r * 0.2); ctx.fillStyle = 'rgba(200,90,110,0.18)'; ctx.fill(); }
  ellipse(ctx, x - r * 0.42, y - r * 0.48, r * 0.22, r * 0.12, -0.6); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill();
  if (flash > 0) glow(ctx, x, y, r * 1.6, '#fff3d6', flash * 0.9);
}
function drawPronuclei(ctx, x, y, r, t, m) { // m: 0 分开 → 1 融合
  const d = r * 0.3 * (1 - E.inOut(m));
  const pr = r * lerp(0.2, 0.28, m);
  const pa = 0.55 + 0.2 * Math.sin(t * 2);
  glow(ctx, x - d, y, pr * 2.2, PAL.pink, 0.5 * pa);
  glow(ctx, x + d, y, pr * 2.2, PAL.teal, 0.5 * pa);
  circle(ctx, x - d, y, pr); ctx.fillStyle = hexA('#ff8fb4', 0.55); ctx.fill();
  circle(ctx, x + d, y, pr); ctx.fillStyle = hexA('#6fd9d0', 0.5); ctx.fill();
  if (m > 0.55) {
    const k = seg(m, 0.55, 1);
    glow(ctx, x, y, pr * 3, PAL.gold, 0.5 * k);
    const ng = ctx.createRadialGradient(x - pr * 0.3, y - pr * 0.3, pr * 0.1, x, y, pr * 1.1);
    ng.addColorStop(0, hexA('#fff2d6', k)); ng.addColorStop(1, hexA('#ffb0a0', k));
    circle(ctx, x, y, pr * 1.08); ctx.fillStyle = ng; ctx.fill();
  }
}

/* ---------- 精子 ---------- */
function drawSperm(ctx, x, y, ang, s, phase, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const a = o.alpha ?? 1; ctx.globalAlpha *= a;
  const col = o.col || '#dff6f4';
  const N = 26, len = o.len ?? 90;
  let px = -9, py = 0;
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    const nx = -9 - u * len, ny = Math.sin(phase - u * 7.5) * (1.5 + u * 9) * (o.amp ?? 1);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny);
    ctx.lineWidth = lerp(3.6, 0.6, u); ctx.strokeStyle = hexA(col, lerp(0.95, 0.35, u)); ctx.lineCap = 'round'; ctx.stroke();
    px = nx; py = ny;
  }
  if (o.glow !== false) glow(ctx, 0, 0, 26, PAL.teal, 0.35);
  ellipse(ctx, 0, 0, 10, 6.8);
  const g = ctx.createLinearGradient(-10, -6, 8, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9e6e0');
  ctx.fillStyle = g; ctx.fill();
  ellipse(ctx, 4, 0, 5, 5.2); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
  ctx.restore();
}

/* ---------- 卵裂 ---------- */
const CLEAVE = (() => {
  const R = rng(42); const rad = [1, 0.62, 0.5, 0.4, 0.31, 0.245];
  const gens = [[{ x: 0, y: 0, bx: 0, by: 0, px: 0, py: 0, ax: 1, ay: 0 }]];
  for (let g = 1; g <= 5; g++) {
    const rr = rad[g], cur = [];
    gens[g - 1].forEach(p => {
      const a = R() * TAU, c = Math.cos(a), s = Math.sin(a), d = rr * 0.55;
      [1, -1].forEach(k => cur.push({ x: p.x + c * d * k, y: p.y + s * d * k, px: p.x, py: p.y, ax: c * k, ay: s * k, z: R() }));
    });
    for (let it = 0; it < 500; it++) {
      for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
        const A = cur[i], B = cur[j]; let dx = B.x - A.x, dy = B.y - A.y; const dd = Math.hypot(dx, dy) || 1e-4; const mn = rr * 2 * 0.84;
        if (dd < mn) { const k = (mn - dd) / 2 / dd; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k; }
      }
      const lim = 1 - rr * 0.92;
      cur.forEach(p => { const l = Math.hypot(p.x, p.y); if (l > lim) { p.x *= lim / l; p.y *= lim / l; } });
    }
    gens.push(cur);
  }
  // 囊胚目标：上方 10 个细胞成为内细胞团，其余排成外圈
  const g5 = gens[5].map((p, i) => ({ ...p, i }));
  const byTop = [...g5].sort((a, b) => a.y - b.y);
  const icm = byTop.slice(0, 10), ring = byTop.slice(10).sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
  const blast = [];
  ring.forEach((p, k) => { const a = -Math.PI / 2 + (k + 0.5) / ring.length * TAU; blast[p.i] = { x: Math.cos(a) * 0.84, y: Math.sin(a) * 0.84, rx: 0.14, ry: 0.075, rot: a + Math.PI / 2 }; });
  icm.forEach((p, k) => { const a = k / 10 * TAU; const rr2 = k < 3 ? 0.06 : 0.17; blast[p.i] = { x: Math.cos(a * 1.0) * rr2 * 1.35, y: -0.56 + Math.sin(a) * rr2 * 0.6, rx: 0.13, ry: 0.12, rot: 0 }; });
  return { gens, rad, blast };
})();

function drawBlastomere(ctx, x, y, rx, ry, rot, o = {}) {
  const r = Math.max(rx, ry);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, r * 0.05, 0, 0, r);
  g.addColorStop(0, o.c0 || '#fff0e4'); g.addColorStop(0.6, o.c1 || '#ffc0a6'); g.addColorStop(1, o.c2 || '#ee8f86');
  ellipse(ctx, 0, 0, rx, ry); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = Math.max(1.2, r * 0.045); ctx.strokeStyle = 'rgba(255,238,232,0.6)'; ctx.stroke();
  ellipse(ctx, rx * 0.06, ry * 0.08, rx * 0.3, ry * 0.3); ctx.fillStyle = 'rgba(196,84,108,0.22)'; ctx.fill();
  ellipse(ctx, -rx * 0.38, -ry * 0.42, rx * 0.2, ry * 0.11, -0.5); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  ctx.restore();
}
// level: 0..5 卵裂代数，5..6 桑葚胚→囊胚
function drawCleavage(ctx, x, y, R, level, t, o = {}) {
  const zona = o.zona ?? 1;
  glow(ctx, x, y, R * 2.2, PAL.coral, 0.25);
  const cells = [];
  const L = clamp(level, 0, 6);
  if (L >= 5) {
    const b = E.inOut(L - 5);
    if (b > 0.05) { // 囊胚腔
      circle(ctx, x, y, R * 0.86); const cg = ctx.createRadialGradient(x, y + R * 0.2, R * 0.1, x, y, R * 0.9);
      cg.addColorStop(0, `rgba(255,232,214,${0.35 * b})`); cg.addColorStop(1, `rgba(255,190,170,${0.25 * b})`); ctx.fillStyle = cg; ctx.fill();
    }
    CLEAVE.gens[5].forEach((p, i) => {
      const q = CLEAVE.blast[i], r0 = CLEAVE.rad[5];
      cells.push({ x: lerp(p.x, q.x, b), y: lerp(p.y, q.y, b), rx: lerp(r0, q.rx, b), ry: lerp(r0, q.ry, b), rot: lerp(0, q.rot, b), z: p.z });
    });
  } else {
    const g = Math.floor(L), q = L - g;
    if (q < 1e-3 || g >= 5) {
      const r0 = CLEAVE.rad[g];
      CLEAVE.gens[g].forEach(p => cells.push({ x: p.x, y: p.y, rx: r0, ry: r0, rot: 0, z: p.z || 0 }));
    } else {
      const rp = CLEAVE.rad[g], rc = CLEAVE.rad[g + 1];
      const q1 = E.inOut(seg(q, 0, 0.3)), q2 = E.inOut(seg(q, 0.25, 1));
      CLEAVE.gens[g + 1].forEach(p => {
        const off = lerp(0, rp * 0.3, q1);
        const sx = p.px + p.ax * off, sy = p.py + p.ay * off;
        const r = lerp(lerp(rp, rp * 0.76, q1), rc, q2);
        cells.push({ x: lerp(sx, p.x, q2), y: lerp(sy, p.y, q2), rx: r, ry: r, rot: 0, z: p.z || 0 });
      });
    }
  }
  cells.sort((a, b) => a.z - b.z);
  cells.forEach(c => drawBlastomere(ctx, x + c.x * R, y + c.y * R, c.rx * R, c.ry * R, c.rot));
  if (zona > 0) {
    ctx.save(); ctx.globalAlpha *= zona;
    ctx.beginPath(); ctx.arc(x, y, R * 1.16, 0, TAU); ctx.arc(x, y, R * 1.03, 0, TAU, true);
    ctx.fillStyle = 'rgba(255,236,226,0.26)'; ctx.fill();
    circle(ctx, x, y, R * 1.16); ctx.strokeStyle = 'rgba(255,245,240,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
}

/* ---------- 染色体 & DNA ---------- */
function drawChromosome(ctx, x, y, len, col, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const w = len * 0.24, cen = o.cen ?? -0.1;
  if (o.glow !== false) glow(ctx, 0, 0, len * 0.9, col, 0.25);
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * w * 0.95, -len / 2 + w / 2);
    ctx.quadraticCurveTo(s * w * 0.18, len * cen, s * w * 0.95, len / 2 - w / 2);
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
    ctx.lineWidth = w * 0.28; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.moveTo(s * w * 0.95 - w * 0.12, -len / 2 + w * 0.7); ctx.quadraticCurveTo(s * w * 0.1, len * cen, s * w * 0.8, len / 2 - w * 0.8); ctx.stroke();
  }
  // 条带
  ctx.fillStyle = 'rgba(60,20,40,0.18)';
  for (const f of [-0.32, -0.2, 0.12, 0.26]) ctx.fillRect(-w * 1.5, len * f, w * 3, len * 0.035);
  ctx.restore();
}
const BASE_COLS = ['#ff8fa3', '#ffd27a', '#8fe8df', '#a8b8ff'];
function drawHelix(ctx, x0, x1, cy, amp, phase, o = {}) {
  const step = o.step || 26, a = o.alpha ?? 1;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  const pts = [];
  for (let x = x0; x <= x1; x += step) {
    const th = (x - x0) * 0.022 + phase;
    pts.push({ x, y1: cy + Math.sin(th) * amp, y2: cy + Math.sin(th + Math.PI) * amp, z: Math.cos(th), k: Math.floor((x - x0) / step) });
  }
  const strand = (key, front) => {
    ctx.beginPath();
    pts.forEach((p, i) => { const y = p[key]; i ? ctx.lineTo(p.x, y) : ctx.moveTo(p.x, y); });
    ctx.lineWidth = front ? 9 : 7; ctx.strokeStyle = front ? (o.c1 || '#ffe1d2') : 'rgba(255,210,195,0.45)'; ctx.stroke();
  };
  strand('y2', false);
  pts.forEach(p => {
    const R = rng(p.k * 13 + 1);
    ctx.lineWidth = 6; ctx.strokeStyle = hexA(BASE_COLS[Math.floor(R() * 4)], 0.55 + 0.4 * Math.abs(p.z));
    ctx.beginPath(); ctx.moveTo(p.x, p.y1); ctx.lineTo(p.x, p.y2); ctx.stroke();
  });
  strand('y1', true);
  ctx.restore();
}

/* ---------- 形状组：先描边再填充，得到统一轮廓 ---------- */
function shapePath(ctx, s, grow) {
  ctx.beginPath();
  if (s.type === 'c') ctx.arc(s.x, s.y, s.r + grow, 0, TAU);
  else if (s.type === 'e') ctx.ellipse(s.x, s.y, s.rx + grow, s.ry + grow, s.rot || 0, 0, TAU);
  else if (s.type === 'p') { smoothPath(ctx, s.pts, true, s.ten ?? 0.5); }
}
function drawShapeGroup(ctx, shapes, fill, outline, ow) {
  // 描边层
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of shapes) {
    if (s.type === 'l') { limbPath(ctx, s.pts); ctx.lineWidth = s.w + ow * 2; ctx.strokeStyle = s.outline || outline; ctx.stroke(); }
    else if (s.type === 'p') { shapePath(ctx, s, 0); ctx.lineWidth = ow * 2; ctx.strokeStyle = s.outline || outline; ctx.stroke(); }
    else { shapePath(ctx, s, ow); ctx.fillStyle = s.outline || outline; ctx.fill(); }
  }
  for (const s of shapes) {
    if (s.type === 'l') { limbPath(ctx, s.pts); ctx.lineWidth = s.w; ctx.strokeStyle = s.fill || fill; ctx.stroke(); }
    else { shapePath(ctx, s, 0); ctx.fillStyle = s.fill || fill; ctx.fill(); }
  }
}
function limbPath(ctx, p) {
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  if (p.length === 2) ctx.lineTo(p[1][0], p[1][1]);
  else if (p.length === 3) ctx.quadraticCurveTo(p[1][0], p[1][1], p[2][0], p[2][1]);
  else smoothPath(ctx, p, false, 0.5, false);
}

/* ---------- 胚胎（5–6 周，C 形） ---------- */
function drawEmbryo(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const beat = o.beat ?? 0;
  const P = u => { const th = -0.32 * Math.PI - u * 1.38 * Math.PI; const rr = 0.36 * (1 - 0.5 * smooth((u - 0.55) / 0.45)); return [0.02 + Math.cos(th) * rr, 0.04 + Math.sin(th) * rr]; };
  const Wd = u => u < 0.12 ? lerp(0.16, 0.22, u / 0.12) : u < 0.25 ? lerp(0.22, 0.13, (u - 0.12) / 0.13) : u < 0.55 ? lerp(0.13, 0.15, (u - 0.25) / 0.3) : lerp(0.15, 0.015, (u - 0.55) / 0.45);
  const outer = [], inner = [], N = 40;
  for (let i = 0; i <= N; i++) {
    const u = i / N, p = P(u), q = P(Math.min(1, u + 0.01)), p0 = P(Math.max(0, u - 0.01));
    let tx = q[0] - p0[0], ty = q[1] - p0[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const nx = -ty, ny = tx; // 指向 C 的外侧（背部）
    const w = Wd(u);
    outer.push([p[0] + nx * w, p[1] + ny * w]); inner.push([p[0] - nx * w, p[1] - ny * w]);
  }
  glow(ctx, 0, 0, 0.9, '#ff9c8a', 0.35);
  const body = new Path2D();
  const all = outer.concat(inner.reverse());
  body.moveTo(all[0][0], all[0][1]); all.forEach(p => body.lineTo(p[0], p[1])); body.closePath();
  const hp = P(0.06);
  const head = new Path2D(); head.arc(hp[0] + 0.02, hp[1] + 0.02, 0.23, 0, TAU);
  const heartP = P(0.3);
  const g = ctx.createRadialGradient(-0.15, -0.3, 0.02, 0, 0, 0.7);
  g.addColorStop(0, 'rgba(255,222,210,0.95)'); g.addColorStop(1, 'rgba(240,140,135,0.92)');
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.025; ctx.strokeStyle = 'rgba(255,240,235,0.7)';
  ctx.stroke(body); ctx.stroke(head);
  ctx.fillStyle = g; ctx.fill(body); ctx.fill(head);
  // 体节
  for (let u = 0.24; u < 0.86; u += 0.045) {
    const i = Math.round(u * N); const p = outer[Math.min(N, i)];
    circle(ctx, lerp(p[0], P(u)[0], 0.25), lerp(p[1], P(u)[1], 0.25), 0.018 * (1 - u * 0.6)); ctx.fillStyle = 'rgba(200,90,100,0.28)'; ctx.fill();
  }
  // 肢芽
  const limb = (u, len, ang) => { const p = P(u); ellipse(ctx, p[0] + Math.cos(ang) * 0.1, p[1] + Math.sin(ang) * 0.1, len, len * 0.55, ang); ctx.fillStyle = 'rgba(255,200,188,0.95)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,240,235,0.6)'; ctx.lineWidth = 0.012; ctx.stroke(); };
  limb(0.42, 0.06 * (o.limbs ?? 1), 0.3); limb(0.66, 0.055 * (o.limbs ?? 1), -0.9);
  // 心脏
  const hr = 0.075 * (1 + beat * 0.22);
  glow(ctx, heartP[0] + 0.11, heartP[1] + 0.02, 0.28, '#ff3d5a', 0.35 + beat * 0.55);
  circle(ctx, heartP[0] + 0.1, heartP[1] + 0.02, hr); ctx.fillStyle = mix('#e8475f', '#ff7d8e', beat); ctx.fill();
  // 眼点
  circle(ctx, hp[0] + 0.1, hp[1] + 0.05, 0.035); ctx.fillStyle = 'rgba(70,20,40,0.75)'; ctx.fill();
  ctx.restore();
}

/* ---------- 胎儿（g: 0=孕 8 周 → 1=足月） ---------- */
function drawFetus(ctx, x, y, s, t, o = {}) {
  const g = clamp(o.g ?? 0.5);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.flip) ctx.scale(-1, 1);
  const hic = o.hic || 0;
  ctx.translate(0, -hic * 0.02);
  const kick = o.kick || 0, thumb = o.thumb || 0;
  const hr = lerp(0.3, 0.215, g);
  const H0 = { x: 0.1 + (1 - g) * 0.02, y: -0.28 + (0.3 - hr) * 0.45 };
  const bodyC = lerp(0.8, 1, g);
  const tw = lerp(0.15, 0.245, g), th = lerp(0.24, 0.3, g);
  const legW = lerp(0.055, 0.115, g), armW = lerp(0.045, 0.085, g);
  const skin = mix('#f39c93', '#f7b8a2', g), dark = mix('#c9606a', '#d98470', g);
  const far = mix(skin, '#b85a5e', 0.25);
  const hip = [-0.03, 0.28 * bodyC];
  const knee = [0.24 + kick * 0.1, 0.1 - kick * 0.06];
  const ankle = [0.13 + kick * 0.2, 0.37 - kick * 0.02];
  const toe = [0.24 + kick * 0.22, 0.4 - kick * 0.06];
  const sh = [0.02, -0.03];
  const elbow = [0.17, 0.12 - thumb * 0.03];
  const hand = [lerp(0.25, H0.x + hr * 0.72, thumb), lerp(-0.04, H0.y + hr * 0.42, thumb)];
  // 远侧肢体
  const farShapes = [
    { type: 'l', pts: [[-0.02, 0.26], [0.2, 0.06], [0.07, 0.33]], w: legW * 0.9, fill: far },
    { type: 'e', x: 0.12, y: 0.37, rx: legW * 0.75, ry: legW * 0.45, rot: 0.2, fill: far },
    { type: 'l', pts: [[-0.02, -0.02], [0.1, 0.13], [0.2, 0.0]], w: armW * 0.9, fill: far },
  ];
  drawShapeGroup(ctx, farShapes, far, dark, 0.011);
  // 主体
  const grad = ctx.createRadialGradient(H0.x - 0.12, H0.y - 0.12, 0.02, 0, 0.05, 0.85);
  grad.addColorStop(0, mix(skin, '#fff1e8', 0.55)); grad.addColorStop(0.5, skin); grad.addColorStop(1, mix(skin, dark, 0.6));
  const shapes = [
    { type: 'e', x: -0.05, y: 0.08 * bodyC, rx: tw, ry: th, rot: -0.35 },
    { type: 'c', x: -0.1, y: 0.3 * bodyC, r: lerp(0.12, 0.19, g) },
    { type: 'c', x: 0.02, y: -0.08, r: lerp(0.1, 0.14, g) },
    { type: 'l', pts: [hip, knee, ankle], w: legW },
    { type: 'e', x: (ankle[0] + toe[0]) / 2, y: (ankle[1] + toe[1]) / 2, rx: legW * 0.85, ry: legW * 0.5, rot: Math.atan2(toe[1] - ankle[1], toe[0] - ankle[0]) },
    { type: 'c', x: H0.x, y: H0.y, r: hr },
    { type: 'c', x: H0.x + hr * 0.97, y: H0.y + hr * 0.2, r: hr * 0.1 },
    { type: 'l', pts: [sh, elbow, hand], w: armW },
    { type: 'c', x: hand[0], y: hand[1], r: armW * 0.75 },
  ];
  if (g < 0.12) shapes.push({ type: 'l', pts: [[-0.18, 0.36], [-0.14, 0.44], [-0.06, 0.45]], w: 0.03 * (1 - g / 0.12) }); // 残余小尾巴
  glow(ctx, 0, 0, 0.9, '#ffb39c', 0.28);
  drawShapeGroup(ctx, shapes, grad, dark, 0.012);
  drawShapeGroup(ctx, [shapes[3], shapes[4], shapes[7], shapes[8]], grad, hexA(dark, 0.45), 0.006);
  // 面部
  const ex = H0.x + hr * 0.5, ey = H0.y + hr * 0.08;
  const eyeOpen = o.eyeOpen || 0;
  if (eyeOpen > 0.05) {
    ellipse(ctx, ex, ey, hr * 0.1, hr * 0.12 * eyeOpen); ctx.fillStyle = '#3a1a24'; ctx.fill();
    circle(ctx, ex + hr * 0.03, ey - hr * 0.04 * eyeOpen, hr * 0.03); ctx.fillStyle = '#fff'; ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(ex, ey - hr * 0.06, hr * 0.13, 0.25 * Math.PI, 0.8 * Math.PI);
    ctx.lineWidth = Math.max(0.008, hr * 0.045); ctx.strokeStyle = g < 0.25 ? 'rgba(80,30,45,0.55)' : '#6b3140'; ctx.lineCap = 'round'; ctx.stroke();
    if (g < 0.3) { circle(ctx, ex, ey, hr * 0.11); ctx.fillStyle = `rgba(70,25,40,${0.25 * (1 - g / 0.3)})`; ctx.fill(); }
  }
  // 嘴
  ctx.beginPath();
  if (o.cry) { ellipse(ctx, H0.x + hr * 0.78, H0.y + hr * 0.5, hr * 0.12, hr * 0.14 * o.cry); ctx.fillStyle = '#8a3442'; ctx.fill(); }
  else { ctx.arc(H0.x + hr * 0.74, H0.y + hr * 0.38, hr * 0.1, 0.15 * Math.PI, 0.75 * Math.PI); ctx.lineWidth = hr * 0.035; ctx.strokeStyle = '#8a4550'; ctx.stroke(); }
  // 耳朵
  ctx.beginPath(); ctx.arc(H0.x - hr * 0.12, H0.y + hr * 0.18, hr * 0.15, -0.6 * Math.PI, 0.6 * Math.PI);
  ctx.lineWidth = hr * 0.05; ctx.strokeStyle = hexA(dark, 0.8); ctx.stroke();
  // 腮红
  glow(ctx, H0.x + hr * 0.45, H0.y + hr * 0.4, hr * 0.28, '#ff7f8f', 0.35);
  // 头发
  if (g > 0.6) {
    ctx.strokeStyle = hexA('#8a4a3c', (g - 0.6) * 1.2); ctx.lineWidth = hr * 0.03;
    for (let k = 0; k < 5; k++) { const a = -2.3 + k * 0.28; ctx.beginPath(); ctx.arc(H0.x, H0.y, hr * 0.98, a, a + 0.18); ctx.stroke(); }
  }
  // 手指
  if (g > 0.15) {
    ctx.strokeStyle = hexA(dark, 0.55); ctx.lineWidth = armW * 0.12;
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(hand[0] + armW * 0.2, hand[1] + k * armW * 0.3); ctx.lineTo(hand[0] + armW * 0.6, hand[1] + k * armW * 0.32); ctx.stroke(); }
  }
  // 早期透明皮肤下的血管
  if (g < 0.35) {
    ctx.strokeStyle = `rgba(200,60,80,${0.3 * (1 - g / 0.35)})`; ctx.lineWidth = 0.006;
    ctx.beginPath(); ctx.moveTo(H0.x - hr * 0.5, H0.y - hr * 0.3); ctx.quadraticCurveTo(H0.x - hr * 0.1, H0.y - hr * 0.65, H0.x + hr * 0.3, H0.y - hr * 0.5); ctx.stroke();
  }
  ctx.restore();
  // 返回脐带连接点（世界坐标）
  const cs = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0);
  const lx = (o.flip ? -1 : 1) * 0.1 * s, ly = 0.16 * s;
  return { navel: [x + lx * cs - ly * sn, y + lx * sn + ly * cs], head: [x + ((o.flip ? -1 : 1) * H0.x * cs - H0.y * sn) * s, y + ((o.flip ? -1 : 1) * H0.x * sn + H0.y * cs) * s], hr: hr * s };
}

/* ---------- 羊膜囊 / 脐带 / 胎盘 ---------- */
function drawSac(ctx, x, y, r, t, o = {}) {
  glow(ctx, x, y, r * 1.5, '#ff9d86', 0.25);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, 'rgba(255,220,200,0.20)'); g.addColorStop(0.8, 'rgba(255,170,150,0.12)'); g.addColorStop(1, 'rgba(255,200,185,0.32)');
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; const rr = r * (1 + 0.012 * Math.sin(a * 3 + t * 0.8) + 0.008 * Math.sin(a * 5 - t)); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,230,220,0.4)'; ctx.stroke();
  ellipse(ctx, x - r * 0.45, y - r * 0.55, r * 0.22, r * 0.08, -0.7); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
}
function cordPath(a, b, t, wav = 1) {
  const pts = []; const N = 30;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= N; i++) { const u = i / N; const w = Math.sin(u * Math.PI) * (L * 0.12 * Math.sin(u * 5 + t * 0.6) * wav + L * 0.08); pts.push([a[0] + dx * u + nx * w, a[1] + dy * u + ny * w]); }
  return pts;
}
function drawCord(ctx, pts, w, t, o = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (col, lw) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); };
  line('rgba(120,40,60,0.5)', w + 5);
  line('#f3c9c0', w);
  // 螺旋血管：一条静脉（红，富氧）+ 两条动脉（蓝）
  const vessel = (col, ph, lw) => {
    ctx.beginPath();
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1]; const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const off = Math.sin(i * 0.9 + ph) * w * 0.28;
      const X = p[0] - dy / l * off, Y = p[1] + dx / l * off; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
    }
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke();
  };
  vessel('#e0455e', 0, w * 0.34); vessel('#6f8fe0', 2.1, w * 0.2); vessel('#6f8fe0', 4.2, w * 0.2);
  line('rgba(255,255,255,0.18)', w * 0.25);
  ctx.restore();
}
function pointOnPath(pts, u) {
  const f = clamp(u) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i;
  return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
}
function drawPlacenta(ctx, x, y, r, rot, t, glowA = 0) {
  // 局部坐标：y<0 一侧贴着子宫壁，y>0 一侧朝向胎儿；脐带从 (0, r*0.28) 伸出
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  glow(ctx, 0, 0, r * 1.7, '#ff5d6e', 0.3 + glowA * 0.4);
  ctx.beginPath();
  const N = 56;
  for (let i = 0; i <= N; i++) {
    const a = i / N * TAU; const bump = a > 0 && a < Math.PI ? 1 + 0.05 * Math.sin(i * 2.3 + t * 0.5) : 1;
    ctx.lineTo(Math.cos(a) * r * bump, Math.sin(a) * r * 0.36 * bump);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, r * 0.1, r * 0.05, 0, 0, r);
  g.addColorStop(0, '#d9546b'); g.addColorStop(0.7, '#a52a47'); g.addColorStop(1, '#7a1a35');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,190,200,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
  // 分叶纹理
  ctx.strokeStyle = 'rgba(90,10,30,0.35)'; ctx.lineWidth = 2;
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * r * 0.26, -r * 0.3 * Math.sqrt(1 - Math.pow(k * 0.26, 2))); ctx.lineTo(k * r * 0.22, r * 0.05); ctx.stroke(); }
  // 胎儿面血管
  ctx.lineCap = 'round';
  for (let k = 0; k < 8; k++) {
    const ex = (k - 3.5) / 3.5 * r * 0.85, ey = r * 0.2 * Math.sqrt(1 - Math.pow((k - 3.5) / 3.5 * 0.85, 2));
    ctx.beginPath(); ctx.moveTo(0, r * 0.3); ctx.quadraticCurveTo(ex * 0.5, r * 0.3, ex, ey);
    ctx.strokeStyle = k % 2 ? 'rgba(130,160,255,0.75)' : 'rgba(255,120,140,0.85)'; ctx.lineWidth = 3.2; ctx.stroke();
  }
  if (glowA > 0) glow(ctx, 0, r * 0.1, r * 0.9, '#ffd27a', glowA * 0.45);
  ctx.restore();
}

/* ---------- 心形 / 图标 ---------- */
function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.1, y + s * 0.25, x - s * 0.55, y + s * 0.05, x - s * 0.5, y - s * 0.22);
  ctx.bezierCurveTo(x - s * 0.45, y - s * 0.5, x - s * 0.08, y - s * 0.52, x, y - s * 0.25);
  ctx.bezierCurveTo(x + s * 0.08, y - s * 0.52, x + s * 0.45, y - s * 0.5, x + s * 0.5, y - s * 0.22);
  ctx.bezierCurveTo(x + s * 0.55, y + s * 0.05, x + s * 0.1, y + s * 0.25, x, y + s * 0.35);
  ctx.closePath();
}
function drawHeart(ctx, x, y, s, col = '#ff5d7a', a = 1) {
  if (!(s > 0.5) || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  glow(ctx, x, y, s * 1.3, col, 0.5);
  heartPath(ctx, x, y, s);
  const g = ctx.createRadialGradient(x - s * 0.2, y - s * 0.2, s * 0.05, x, y, s * 0.6);
  g.addColorStop(0, mix(col, '#ffffff', 0.45)); g.addColorStop(1, col);
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}
function drawSparkle(ctx, x, y, s, a = 1, col = PAL.gold) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  glow(ctx, 0, 0, s * 2, col, 0.6);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.22 : s; const an = i / 8 * TAU - Math.PI / 2; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  ctx.closePath(); ctx.fillStyle = '#fffaf0'; ctx.fill();
  ctx.restore();
}
function soundWaves(ctx, x, y, r, t, ang, a = 1, col = PAL.gold) {
  ctx.save(); ctx.lineCap = 'round'; const baseA = ctx.globalAlpha;
  for (let k = 0; k < 3; k++) {
    const p = ((t * 0.8 + k / 3) % 1);
    ctx.globalAlpha = baseA * a * (1 - p) * 0.9;
    ctx.beginPath(); ctx.arc(x, y, r * (0.4 + p), ang - 0.6, ang + 0.6);
    ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  }
  ctx.restore();
}
function musicNote(ctx, x, y, s, a = 1, col = PAL.gold) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = s * 0.12;
  ellipse(ctx, x, y, s * 0.3, s * 0.22, -0.4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + s * 0.27, y - s * 0.05); ctx.lineTo(x + s * 0.27, y - s * 1.0); ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.8, x + s * 0.62, y - s * 0.5); ctx.stroke();
  ctx.restore();
}

/* ---------- 水果（高度约 s） ---------- */
const FRUIT = {
  raspberry(ctx, x, y, s) {
    const r = s * 0.1; const R = rng(21);
    const rows = [[0, -0.28, 3], [0, -0.1, 4], [0, 0.08, 4], [0, 0.25, 3], [0, 0.38, 2]];
    rows.forEach(([_, yy, n], ri) => { for (let i = 0; i < n; i++) { const xx = (i - (n - 1) / 2) * r * 1.75; const cx = x + xx, cy = y + yy * s;
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r * 1.1); g.addColorStop(0, '#ff7b95'); g.addColorStop(1, '#b3143a');
      circle(ctx, cx, cy, r * (0.95 + R() * 0.1)); ctx.fillStyle = g; ctx.fill(); circle(ctx, cx - r * 0.3, cy - r * 0.3, r * 0.22); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill(); } });
    ctx.fillStyle = '#5aa64a';
    for (let k = 0; k < 5; k++) { ellipse(ctx, x + (k - 2) * r * 0.9, y - s * 0.42, r * 0.8, r * 0.3, (k - 2) * 0.4); ctx.fill(); }
  },
  lime(ctx, x, y, s) {
    const g = ctx.createRadialGradient(x - s * 0.15, y - s * 0.15, s * 0.05, x, y, s * 0.55);
    g.addColorStop(0, '#c8f06a'); g.addColorStop(1, '#4f9a2a');
    ellipse(ctx, x, y, s * 0.5, s * 0.44); ctx.fillStyle = g; ctx.fill();
    ellipse(ctx, x + s * 0.5, y, s * 0.05, s * 0.04); ctx.fillStyle = '#6fa83a'; ctx.fill();
    ellipse(ctx, x - s * 0.18, y - s * 0.2, s * 0.12, s * 0.06, -0.5); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
  },
  banana(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2);
    ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.1);
    ctx.quadraticCurveTo(0, s * 0.45, s * 0.5, -s * 0.12);
    ctx.quadraticCurveTo(s * 0.05, s * 0.18, -s * 0.5, -s * 0.1); ctx.closePath();
    const g = ctx.createLinearGradient(0, -s * 0.1, 0, s * 0.25); g.addColorStop(0, '#fff08a'); g.addColorStop(1, '#f2b82c');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = s * 0.012; ctx.strokeStyle = '#c98e1c'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.06); ctx.quadraticCurveTo(0, s * 0.3, s * 0.4, -s * 0.08); ctx.strokeStyle = 'rgba(200,140,30,0.5)'; ctx.stroke();
    circle(ctx, -s * 0.5, -s * 0.1, s * 0.025); ctx.fillStyle = '#5a3b1a'; ctx.fill();
    ctx.lineWidth = s * 0.04; ctx.lineCap = 'round'; ctx.strokeStyle = '#7a6a2a'; ctx.beginPath(); ctx.moveTo(s * 0.5, -s * 0.12); ctx.lineTo(s * 0.56, -s * 0.2); ctx.stroke();
    ctx.restore();
  },
  corn(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.25);
    ellipse(ctx, 0, 0, s * 0.16, s * 0.48); const g = ctx.createLinearGradient(-s * 0.16, 0, s * 0.16, 0); g.addColorStop(0, '#f2b52a'); g.addColorStop(0.5, '#ffe27a'); g.addColorStop(1, '#e09a1a');
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(200,120,20,0.35)';
    for (let yy = -0.42; yy < 0.42; yy += 0.06) for (let xx = -2; xx <= 2; xx++) { const w = Math.sqrt(1 - Math.pow(yy / 0.48, 2)); ellipse(ctx, xx * s * 0.055 * w, yy * s, s * 0.022 * w, s * 0.024); ctx.fill(); }
    ctx.fillStyle = '#6cb04a';
    ctx.beginPath(); ctx.moveTo(0, s * 0.5); ctx.quadraticCurveTo(-s * 0.35, s * 0.1, -s * 0.12, -s * 0.3); ctx.quadraticCurveTo(-s * 0.1, s * 0.2, 0, s * 0.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, s * 0.5); ctx.quadraticCurveTo(s * 0.32, s * 0.15, s * 0.14, -s * 0.2); ctx.quadraticCurveTo(s * 0.08, s * 0.25, 0, s * 0.5); ctx.fillStyle = '#4f9a3a'; ctx.fill();
    ctx.restore();
  },
  eggplant(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.moveTo(0, -s * 0.42);
    ctx.bezierCurveTo(s * 0.18, -s * 0.42, s * 0.16, -s * 0.1, s * 0.26, s * 0.15);
    ctx.bezierCurveTo(s * 0.34, s * 0.4, s * 0.1, s * 0.52, 0, s * 0.52);
    ctx.bezierCurveTo(-s * 0.1, s * 0.52, -s * 0.34, s * 0.4, -s * 0.26, s * 0.15);
    ctx.bezierCurveTo(-s * 0.16, -s * 0.1, -s * 0.18, -s * 0.42, 0, -s * 0.42); ctx.closePath();
    const g = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0); g.addColorStop(0, '#8d4bc0'); g.addColorStop(0.4, '#5b2382'); g.addColorStop(1, '#3a1458');
    ctx.fillStyle = g; ctx.fill();
    ellipse(ctx, -s * 0.12, s * 0.15, s * 0.04, s * 0.16, 0.1); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
    ctx.fillStyle = '#5a9e3c';
    ctx.beginPath(); ctx.moveTo(-s * 0.16, -s * 0.3); ctx.quadraticCurveTo(0, -s * 0.5, s * 0.16, -s * 0.3); ctx.quadraticCurveTo(0, -s * 0.22, -s * 0.16, -s * 0.3); ctx.fill();
    ctx.fillRect(-s * 0.025, -s * 0.56, s * 0.05, s * 0.16);
    ctx.restore();
  },
  honeydew(ctx, x, y, s) {
    ellipse(ctx, x, y, s * 0.38, s * 0.5, 0.3);
    const g = ctx.createRadialGradient(x - s * 0.12, y - s * 0.2, s * 0.05, x, y, s * 0.55); g.addColorStop(0, '#fff3a6'); g.addColorStop(1, '#c9b24a');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ellipse(ctx, x, y, s * 0.38, s * 0.5, 0.3); ctx.clip();
    ctx.strokeStyle = 'rgba(245,236,200,0.75)'; ctx.lineWidth = s * 0.012; ctx.lineJoin = 'round';
    for (const dir of [1, -1]) for (let k = -8; k <= 8; k++) {
      ctx.beginPath();
      for (let j = 0; j <= 14; j++) { const u = j / 14 - 0.5; const px = x + k * s * 0.07 + dir * u * s * 0.5 + Math.sin(j * 2.3 + k) * s * 0.012; const py = y + u * s * 1.05; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
    ellipse(ctx, x - s * 0.14, y - s * 0.26, s * 0.08, s * 0.14, 0.3); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
  },
  watermelon(ctx, x, y, s) {
    ellipse(ctx, x, y, s * 0.52, s * 0.46);
    const g = ctx.createRadialGradient(x - s * 0.15, y - s * 0.15, s * 0.05, x, y, s * 0.55); g.addColorStop(0, '#6fd46a'); g.addColorStop(1, '#2d7a2c');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ellipse(ctx, x, y, s * 0.52, s * 0.46); ctx.clip();
    ctx.strokeStyle = '#1f5a22'; ctx.lineWidth = s * 0.05; ctx.lineJoin = 'round';
    for (let k = -3; k <= 3; k++) { ctx.beginPath(); for (let j = 0; j <= 16; j++) { const yy = y - s * 0.5 + j * s / 16; const xx = x + k * s * 0.15 * Math.sqrt(Math.max(0, 1 - Math.pow((yy - y) / (s * 0.5), 2))) + (j % 2 ? s * 0.018 : -s * 0.018); j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    ctx.restore();
    ellipse(ctx, x - s * 0.2, y - s * 0.22, s * 0.12, s * 0.06, -0.6); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
    ctx.strokeStyle = '#6b8a3a'; ctx.lineWidth = s * 0.02; ctx.beginPath(); ctx.moveTo(x, y - s * 0.46); ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.56, x + s * 0.12, y - s * 0.54); ctx.stroke();
  },
  pear(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.42);
    ctx.bezierCurveTo(x + s * 0.16, y - s * 0.42, x + s * 0.12, y - s * 0.12, x + s * 0.3, y + s * 0.12);
    ctx.bezierCurveTo(x + s * 0.44, y + s * 0.34, x + s * 0.2, y + s * 0.5, x, y + s * 0.5);
    ctx.bezierCurveTo(x - s * 0.2, y + s * 0.5, x - s * 0.44, y + s * 0.34, x - s * 0.3, y + s * 0.12);
    ctx.bezierCurveTo(x - s * 0.12, y - s * 0.12, x - s * 0.16, y - s * 0.42, x, y - s * 0.42); ctx.closePath();
    const g = ctx.createRadialGradient(x - s * 0.1, y, s * 0.05, x, y + s * 0.1, s * 0.5); g.addColorStop(0, '#fff09a'); g.addColorStop(1, '#c9b43a');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = s * 0.03; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - s * 0.42); ctx.lineTo(x + s * 0.04, y - s * 0.55); ctx.stroke();
  },
  sesame(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.5); ctx.quadraticCurveTo(x + s * 0.4, y, x, y + s * 0.5); ctx.quadraticCurveTo(x - s * 0.4, y, x, y - s * 0.5); ctx.closePath();
    const g = ctx.createLinearGradient(x - s * 0.2, 0, x + s * 0.2, 0); g.addColorStop(0, '#fff6e0'); g.addColorStop(1, '#d9c39a');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(150,120,80,0.6)'; ctx.lineWidth = s * 0.03; ctx.stroke();
  },
  carrot(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.5);
    ctx.beginPath(); ctx.moveTo(-s * 0.14, -s * 0.3); ctx.quadraticCurveTo(0, -s * 0.36, s * 0.14, -s * 0.3); ctx.lineTo(0, s * 0.5); ctx.closePath();
    ctx.fillStyle = '#ff8c2a'; ctx.fill();
    ctx.strokeStyle = 'rgba(180,80,20,0.5)'; ctx.lineWidth = s * 0.02; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.1 + k * s * 0.13); ctx.lineTo(s * 0.02, -s * 0.12 + k * s * 0.13); ctx.stroke(); }
    ctx.fillStyle = '#5cb04a'; for (let k = -1; k <= 1; k++) { ellipse(ctx, k * s * 0.08, -s * 0.45, s * 0.05, s * 0.16, k * 0.4); ctx.fill(); }
    ctx.restore();
  },
};
const FRUIT_NAME = { raspberry: '树莓', lime: '青柠檬', banana: '香蕉', corn: '玉米', eggplant: '茄子', honeydew: '哈密瓜', watermelon: '小西瓜' };

/* ---------- 妈妈侧影（面朝右，h = 身高像素，b = 孕肚 0..1） ---------- */
function motherPoints(b) {
  const B = E.inOut(b);
  return [
    [0.000, 0.000], [0.040, 0.010], [0.064, 0.036], [0.072, 0.060], [0.086, 0.079], [0.075, 0.088], [0.078, 0.098], [0.071, 0.108], [0.066, 0.119],
    [0.046, 0.130], [0.040, 0.150], [0.052, 0.178], [0.072, 0.212], [0.094, 0.250], [0.086, 0.285],
    [0.074 + B * 0.012, 0.302], [0.070 + B * 0.075, 0.338], [0.068 + B * 0.13, 0.382], [0.066 + B * 0.152, 0.425], [0.060 + B * 0.125, 0.468], [0.052 + B * 0.055, 0.503],
    [0.046, 0.530], [0.054, 0.600], [0.044, 0.700], [0.040, 0.760], [0.034, 0.870], [0.030, 0.950], [0.080, 0.985], [0.072, 1.0], [-0.030, 1.0], [-0.030, 0.955],
    [-0.046, 0.840], [-0.034, 0.740], [-0.054, 0.640], [-0.078 - B * 0.01, 0.540], [-0.072 - B * 0.012, 0.470], [-0.042 + B * 0.004, 0.405], [-0.050, 0.320], [-0.056, 0.240], [-0.046, 0.190],
    [-0.020, 0.150], [-0.040, 0.112], [-0.058, 0.060], [-0.044, 0.018],
  ];
}
function motherBodyPath(ctx, x, y, h, b) {
  const pts = motherPoints(b).map(p => [x + p[0] * h, y + p[1] * h]);
  ctx.beginPath(); smoothPath(ctx, pts, true, 0.45);
}
function drawMother(ctx, x, y, h, b, t, o = {}) {
  const fill = o.fill || '#ffe3d4', edge = o.edge || '#ffb49a';
  ctx.save();
  glow(ctx, x + 0.02 * h, y + 0.45 * h, h * 0.55, PAL.coral, 0.18);
  // 发髻
  circle(ctx, x - 0.066 * h, y + 0.04 * h, 0.036 * h); ctx.fillStyle = o.hair || '#6b2c3e'; ctx.fill();
  motherBodyPath(ctx, x, y, h, b);
  const g = ctx.createLinearGradient(x - 0.1 * h, 0, x + 0.2 * h, 0);
  g.addColorStop(0, hexA(fill, o.alpha ?? 0.92)); g.addColorStop(1, hexA(mix(fill, '#ffffff', 0.3), o.alpha ?? 0.92));
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = Math.max(2, h * 0.004); ctx.strokeStyle = edge; ctx.stroke();
  if (o.dress !== false) { // 连衣裙
    ctx.save(); motherBodyPath(ctx, x, y, h, b); ctx.clip();
    ctx.beginPath(); ctx.moveTo(x - 0.2 * h, y + 0.19 * h); ctx.lineTo(x + 0.01 * h, y + 0.185 * h);
    ctx.quadraticCurveTo(x + 0.05 * h, y + 0.215 * h, x + 0.12 * h, y + 0.175 * h);
    ctx.lineTo(x + 0.4 * h, y + 0.17 * h); ctx.lineTo(x + 0.4 * h, y + 0.72 * h);
    ctx.quadraticCurveTo(x, y + 0.745 * h, x - 0.2 * h, y + 0.72 * h); ctx.closePath();
    const dg = ctx.createLinearGradient(x - 0.08 * h, 0, x + 0.25 * h, 0);
    const dc = o.dressCol || '#f59ab0';
    dg.addColorStop(0, hexA(mix(dc, '#7a2a48', 0.25), o.alpha ?? 0.95)); dg.addColorStop(1, hexA(mix(dc, '#ffffff', 0.15), o.alpha ?? 0.95));
    ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = hexA('#ffffff', 0.25); ctx.lineWidth = h * 0.003;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 0.05 * h + k * 0.03 * h, y + 0.52 * h); ctx.quadraticCurveTo(x - 0.03 * h + k * 0.035 * h, y + 0.62 * h, x - 0.06 * h + k * 0.04 * h, y + 0.72 * h); ctx.stroke(); }
    ctx.restore();
    motherBodyPath(ctx, x, y, h, b); ctx.lineWidth = Math.max(2, h * 0.004); ctx.strokeStyle = edge; ctx.stroke();
  }
  // 头发
  ctx.beginPath(); ctx.moveTo(x - 0.004 * h, y - 0.002 * h);
  ctx.bezierCurveTo(x + 0.05 * h, y + 0.0, x + 0.07 * h, y + 0.03 * h, x + 0.066 * h, y + 0.05 * h);
  ctx.bezierCurveTo(x + 0.03 * h, y + 0.03 * h, x + 0.0, y + 0.05 * h, x - 0.02 * h, y + 0.1 * h);
  ctx.bezierCurveTo(x - 0.05 * h, y + 0.1 * h, x - 0.065 * h, y + 0.06 * h, x - 0.004 * h, y - 0.002 * h);
  ctx.fillStyle = o.hair || '#6b2c3e'; ctx.fill();
  // 眼睛与腮红
  ctx.beginPath(); ctx.arc(x + 0.056 * h, y + 0.062 * h, 0.006 * h, 0.1 * Math.PI, 0.9 * Math.PI); ctx.lineWidth = Math.max(1.5, h * 0.0035); ctx.strokeStyle = '#6b2c3e'; ctx.stroke();
  glow(ctx, x + 0.052 * h, y + 0.085 * h, 0.018 * h, '#ff8f9a', 0.4);
  ctx.restore();
}
function drawMotherArm(ctx, x, y, h, b, o = {}) {
  const B = E.inOut(b);
  const sh = [x - 0.004 * h, y + 0.2 * h], el = [x - 0.014 * h, y + 0.33 * h];
  const hd = [x + (0.045 + B * 0.1) * h, y + (0.4 - B * 0.03) * h];
  const w = 0.032 * h, ow = Math.max(2, h * 0.004);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg2 = (a, c, col, lw) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); };
  seg2(sh, el, o.edge || '#ffb49a', w + ow * 2); seg2(el, hd, o.edge || '#ffb49a', w * 0.85 + ow * 2);
  circle(ctx, hd[0], hd[1], w * 0.6 + ow); ctx.fillStyle = o.edge || '#ffb49a'; ctx.fill();
  seg2(el, hd, o.fill || '#ffe3d4', w * 0.85); circle(ctx, hd[0], hd[1], w * 0.6); ctx.fillStyle = o.fill || '#ffe3d4'; ctx.fill();
  seg2(sh, [lerp(sh[0], el[0], 0.55), lerp(sh[1], el[1], 0.55)], o.sleeve || '#f7a9bb', w * 1.05); // 短袖
  seg2([lerp(sh[0], el[0], 0.55), lerp(sh[1], el[1], 0.55)], el, o.fill || '#ffe3d4', w);
  ctx.restore();
}

/* ---------- 小孩侧影（面朝右） ---------- */
function drawKid(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const shirt = o.shirt || '#7fc8f8';
  ctx.lineCap = 'round';
  // 腿
  ctx.strokeStyle = '#4a5a8a'; ctx.lineWidth = 0.1;
  ctx.beginPath(); ctx.moveTo(-0.04, 0.55); ctx.lineTo(-0.06, 0.92); ctx.moveTo(0.06, 0.55); ctx.lineTo(0.08, 0.92); ctx.stroke();
  // 身体
  rrect(ctx, -0.16, 0.2, 0.32, 0.4, 0.12); ctx.fillStyle = shirt; ctx.fill();
  // 手臂（向前伸）
  const reach = o.reach ?? 0;
  ctx.strokeStyle = shirt; ctx.lineWidth = 0.09;
  ctx.beginPath(); ctx.moveTo(0.05, 0.28); ctx.quadraticCurveTo(0.2, 0.36 - reach * 0.05, 0.28 + reach * 0.12, 0.3 - reach * 0.02); ctx.stroke();
  circle(ctx, 0.3 + reach * 0.12, 0.3 - reach * 0.02, 0.05); ctx.fillStyle = PAL.skin; ctx.fill();
  // 头
  circle(ctx, 0.02, 0.02, 0.2); ctx.fillStyle = '#ffd3bd'; ctx.fill();
  ctx.beginPath(); ctx.arc(0.0, -0.01, 0.205, Math.PI * 0.95, Math.PI * 2.1); ctx.fillStyle = '#4a2a2a'; ctx.fill();
  ctx.beginPath(); ctx.arc(0.1, 0.03, 0.028, 0.1 * Math.PI, 0.9 * Math.PI); ctx.lineWidth = 0.018; ctx.strokeStyle = '#4a2a2a'; ctx.stroke();
  glow(ctx, 0.1, 0.1, 0.07, '#ff8f9a', 0.5);
  ctx.beginPath(); ctx.arc(0.16, 0.1, 0.035, 0.1 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.restore();
}

/* ---------- 新生儿（襁褓，面朝右上） ---------- */
function drawNewborn(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  // 襁褓
  ctx.beginPath(); ctx.ellipse(-0.35, 0.12, 0.55, 0.3, 0.12, 0, TAU);
  const g = ctx.createLinearGradient(-0.8, 0, 0.2, 0.4); g.addColorStop(0, '#fff3c9'); g.addColorStop(1, '#ffd98f');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 0.015; ctx.strokeStyle = 'rgba(200,150,60,0.6)'; ctx.stroke();
  ctx.strokeStyle = 'rgba(200,150,60,0.35)'; ctx.lineWidth = 0.012;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-0.15 - k * 0.2, 0.12, 0.25, -0.9, 0.9); ctx.stroke(); }
  // 头
  const hg = ctx.createRadialGradient(-0.05, -0.08, 0.02, 0.02, 0.02, 0.3);
  hg.addColorStop(0, '#ffe3d4'); hg.addColorStop(1, '#f2a890');
  circle(ctx, 0.05, 0.0, 0.24); ctx.fillStyle = hg; ctx.fill();
  ctx.lineWidth = 0.012; ctx.strokeStyle = '#d98470'; ctx.stroke();
  // 帽子：头顶一顶针织小帽
  ctx.save(); circle(ctx, 0.05, 0.0, 0.245); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-0.3, 0.2); ctx.lineTo(0.06, -0.3); ctx.lineTo(0.5, -0.5); ctx.lineTo(-0.5, -0.5); ctx.closePath();
  ctx.beginPath(); ctx.moveTo(-0.25, 0.16); ctx.quadraticCurveTo(-0.02, -0.08, 0.2, -0.2); ctx.lineTo(0.4, -0.5); ctx.lineTo(-0.5, -0.5); ctx.lineTo(-0.5, 0.3); ctx.closePath();
  ctx.fillStyle = o.hat || '#ffb3c6'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.012;
  for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-0.25 - k * 0.03, 0.16 - k * 0.07); ctx.quadraticCurveTo(-0.02 - k * 0.03, -0.08 - k * 0.07, 0.2 - k * 0.03, -0.2 - k * 0.07); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-0.25, 0.16); ctx.quadraticCurveTo(-0.02, -0.08, 0.2, -0.2); ctx.lineWidth = 0.05; ctx.strokeStyle = mix(o.hat || '#ffb3c6', '#ffffff', 0.35); ctx.lineCap = 'round'; ctx.stroke();
  circle(ctx, -0.14, -0.24, 0.06); ctx.fillStyle = mix(o.hat || '#ffb3c6', '#ffffff', 0.5); ctx.fill();
  // 脸
  const eo = o.eyeOpen ?? 1;
  if (o.cry) {
    ctx.strokeStyle = '#6b3140'; ctx.lineWidth = 0.02; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0.1, -0.02); ctx.lineTo(0.16, 0.0); ctx.moveTo(0.1, 0.02); ctx.lineTo(0.16, 0.0); ctx.stroke();
    ellipse(ctx, 0.2, 0.1, 0.05, 0.06 * o.cry); ctx.fillStyle = '#9a3a4a'; ctx.fill();
  } else {
    if (eo > 0.1) { ellipse(ctx, 0.14, -0.01, 0.028, 0.034 * eo); ctx.fillStyle = '#3a1a24'; ctx.fill(); circle(ctx, 0.15, -0.02, 0.009); ctx.fillStyle = '#fff'; ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0.14, -0.02, 0.03, 0.2 * Math.PI, 0.8 * Math.PI); ctx.lineWidth = 0.014; ctx.strokeStyle = '#6b3140'; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0.2, 0.08, 0.035, 0.1 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 0.012; ctx.strokeStyle = '#8a4550'; ctx.stroke();
  }
  circle(ctx, 0.28, 0.02, 0.025); ctx.fillStyle = '#f2a890'; ctx.fill();
  glow(ctx, 0.14, 0.08, 0.07, '#ff7f8f', 0.45);
  ctx.restore();
}

/* ---------- 肺 ---------- */
function drawLungs(ctx, x, y, s, fill, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const k = lerp(0.72, 1, fill);
  ctx.strokeStyle = '#ffd8cc'; ctx.lineWidth = 0.05; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -0.55); ctx.lineTo(0, -0.2); ctx.moveTo(0, -0.2); ctx.lineTo(-0.18, -0.05); ctx.moveTo(0, -0.2); ctx.lineTo(0.18, -0.05); ctx.stroke();
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.translate(sd * 0.28, 0.08); ctx.scale(k, k);
    ctx.beginPath(); ctx.moveTo(sd * -0.08, -0.4);
    ctx.bezierCurveTo(sd * 0.2, -0.45, sd * 0.3, 0.1, sd * 0.24, 0.35);
    ctx.bezierCurveTo(sd * 0.16, 0.48, sd * -0.1, 0.45, sd * -0.12, 0.3);
    ctx.bezierCurveTo(sd * -0.14, 0.1, sd * -0.12, -0.2, sd * -0.08, -0.4); ctx.closePath();
    const g = ctx.createRadialGradient(sd * 0.05, -0.1, 0.02, 0, 0, 0.5);
    g.addColorStop(0, mix('#e67d8a', '#bfe6ff', fill)); g.addColorStop(1, mix('#b0485a', '#7fb4ff', fill));
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 0.02; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
    // 支气管树
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.018;
    ctx.beginPath(); ctx.moveTo(sd * -0.05, -0.2); ctx.lineTo(sd * 0.05, 0.05); ctx.lineTo(sd * 0.12, 0.25); ctx.moveTo(sd * 0.05, 0.05); ctx.lineTo(sd * 0.16, 0.0); ctx.moveTo(sd * 0.0, -0.05); ctx.lineTo(sd * -0.06, 0.2); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/* ---------- 子宫剖面（分娩） ---------- */
function uterusPts(cx, cy, s, sq, open) {
  // 外轮廓（倒梨形）: 顶部宽，底部收窄到宫颈
  const o = [], inn = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (i / N) * TAU;
    const c = Math.cos(a), sn = Math.sin(a);
    // 基础椭圆 + 下半部收窄
    const narrow = sn > 0 ? 1 - 0.42 * Math.pow(sn, 2.2) : 1;
    const rx = s * 0.5 * narrow * (1 - sq * 0.04), ry = s * 0.58 * (1 - sq * 0.03);
    o.push([cx + c * rx, cy + sn * ry]);
    const w = s * (0.1 + sq * 0.035);
    const rxi = Math.max(0, rx - w * (sn > 0.85 ? 0.3 : 1)), ryi = ry - w;
    inn.push([cx + c * rxi, cy + sn * ryi]);
  }
  return { o, inn };
}
function drawUterusSection(ctx, cx, cy, s, t, o = {}) {
  const sq = o.squeeze || 0;
  const { o: out, inn } = uterusPts(cx, cy, s, sq, o.open || 0);
  glow(ctx, cx, cy, s * 0.9, '#ff6e7a', 0.25 + sq * 0.2);
  ctx.beginPath(); smoothPath(ctx, out, true);
  const g = ctx.createRadialGradient(cx, cy - s * 0.1, s * 0.1, cx, cy, s * 0.62);
  g.addColorStop(0, '#e36a7a'); g.addColorStop(1, mix('#b8384f', '#d9455e', sq));
  ctx.fillStyle = g; ctx.fill();
  // 肌纤维
  ctx.save(); ctx.clip();
  ctx.strokeStyle = `rgba(255,190,190,${0.18 + sq * 0.2})`; ctx.lineWidth = 3;
  for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.ellipse(cx, cy, s * (0.44 + k * 0.01), s * (0.52 + k * 0.01), 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); smoothPath(ctx, inn, true);
  ctx.fillStyle = '#ffd2c2'; ctx.fill();
  const ig = ctx.createRadialGradient(cx - s * 0.1, cy - s * 0.15, s * 0.05, cx, cy, s * 0.5);
  ig.addColorStop(0, 'rgba(255,236,224,0.9)'); ig.addColorStop(1, 'rgba(255,170,150,0.7)');
  ctx.fillStyle = ig; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#ff9eaa'; ctx.stroke();
}
