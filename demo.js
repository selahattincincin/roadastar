// Mini Roadastar: oyundaki otoyolun tarayıcıya sığan kesiti — şerit değiştir, araçların üstünden zıpla.
// Sabitler oyundan: başlangıç 25 m/sn, zıplama 2,5 m, yerçekimi 28 × √(hız/25), trafik 10 m/sn ilerler.
// Tır üstünden atlanmaz (oyunda basılı tutup uçmak gerekir); takla, uçuş, AIR ve modlar yalnızca oyunda.
// Başlamadan önce otomatik pilot sürer (vitrin); "Hareketi azalt" açıksa tek kare çizilir.
(function () {
  'use strict';
  const canvas = document.getElementById('demo');
  if (!canvas) return;
  const script = document.currentScript;
  const text = (key) => script.dataset[key] || '';
  const ctx = canvas.getContext('2d');

  const W = 360, H = 560, HY = 196, BASE = 486, CX = 180, LANE_PX = 92, F = 9;
  const PX_PER_M = LANE_PX / 3.5, PLAYER_HALF = 1.6, TRAFFIC_SPEED = 10, JUMP_H = 2.5, SPAWN_Z = 150;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WORLDS = [
    { name: 'SUNSET HIGHWAY', sky: ['#2a1a5e', '#7a2d7c', '#e0567a', '#ff9a62'], sun: ['#ffe27a', '#ff5f7e'], hills: '#3a1546',
      ground: '#1d1036', grid: 'rgba(255,79,163,0.5)', edge: '#ff4fa3', stars: 0.25, shape: 'hills' },
    { name: 'SALT FLATS', sky: ['#05081c', '#101a46', '#25306c', '#4a4a86'], sun: ['#ffffff', '#b9c2ff'], hills: '#141a3c',
      ground: '#1a2040', grid: 'rgba(160,185,255,0.42)', edge: '#9fb4ff', stars: 1, shape: 'mesas' },
    { name: 'NEON CITY', sky: ['#0d0024', '#33094f', '#7e1784', '#ff3d9a'], sun: ['#5fe3f0', '#c86dd7'], hills: '#160829',
      ground: '#0d0820', grid: 'rgba(95,227,240,0.55)', edge: '#5fe3f0', stars: 0.5, shape: 'city' },
  ];
  const WORLD_LENGTH = 700;
  const CAR_COLORS = ['#e9e7f2', '#ff5d5d', '#4f8bff', '#ffd36e', '#3a3a4e', '#7be08a', '#ff9a5c'];

  // Tohumlu rastgele: ufuk çizgileri her açılışta aynı
  function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const rnd = seeded(7);
  const stars = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: rnd() * (HY - 20), r: rnd() < 0.2 ? 1.4 : 0.8 }));
  const skylines = {
    hills: Array.from({ length: 13 }, (_, i) => ({ x: i * 30 - 10, h: 14 + rnd() * 26 })),
    mesas: Array.from({ length: 6 }, (_, i) => ({ x: i * 70 - 30 + rnd() * 30, w: 40 + rnd() * 40, h: 12 + rnd() * 22 })),
    city: Array.from({ length: 22 }, (_, i) => ({ x: i * 17 - 4, w: 13 + rnd() * 8, h: 14 + rnd() * 44, lit: rnd() })),
  };

  const scaleAt = (z) => F / (z + F);
  const yAt = (z) => HY + (BASE - HY) * scaleAt(z);
  const xAt = (lane, z) => CX + lane * LANE_PX * scaleAt(z);

  let state = 'attract';
  let dist, speed, score, bonus, lane, px, ph, vh, traffic, popups, nextRow, safeLane, shake, crashT, worldIndex, best = 0;
  try { best = Number(localStorage.getItem('roadastar.demo.best')) || 0; } catch (e) { best = 0; }

  const el = (id) => document.getElementById(id);
  const scoreEl = el('dScore'), bestEl = el('dBest'), speedEl = el('dSpeed'), msgEl = el('dMsg'), startBtn = el('dStart'), ctaEl = el('dCta');

  function reset() {
    dist = 0; speed = 25; score = 0; bonus = 0; lane = 0; px = 0; ph = 0; vh = 0;
    traffic = []; popups = []; nextRow = 40; safeLane = 0; shake = 0; crashT = 0; worldIndex = 0;
  }

  function start() {
    reset();
    state = 'run';
    canvas.classList.add('live');
    canvas.focus({ preventScroll: true });
    msgEl.textContent = text('go');
    startBtn.textContent = text('again');
    ctaEl.classList.remove('show');
    kick();
  }

  function crash() {
    state = 'crashed';
    shake = 1;
    crashT = 0;
    canvas.classList.remove('live');
    if (score > best) {
      best = score;
      try { localStorage.setItem('roadastar.demo.best', String(best)); } catch (e) { /* özel sekme */ }
    }
    msgEl.textContent = text('crash').replace('{score}', score.toLocaleString());
    ctaEl.classList.add('show');
    panel(true);
  }

  // ---------- Kontroller ----------

  function steer(dir) { if (state === 'run' || state === 'attract') lane = Math.max(-1, Math.min(1, lane + dir)); }
  function jump() {
    if (ph > 0.01) return;
    vh = Math.sqrt(2 * gravity() * JUMP_H);
    ph = 0.011;
  }
  const gravity = () => 28 * Math.sqrt(speed / 25);

  window.addEventListener('keydown', (e) => {
    if (state !== 'run') {
      if (document.activeElement === canvas && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); }
      return;
    }
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { steer(-1); e.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { steer(1); e.preventDefault(); }
    else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { jump(); e.preventDefault(); }
  });

  let touch = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'run') { start(); return; }
    canvas.setPointerCapture(e.pointerId);
    touch = { x: e.clientX, y: e.clientY, swiped: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!touch || state !== 'run') return;
    const dx = e.clientX - touch.x;
    if (Math.abs(dx) > 26) { steer(Math.sign(dx)); touch.x = e.clientX; touch.y = e.clientY; touch.swiped = true; }
  });
  const release = (e) => {
    if (!touch) return;
    if (!touch.swiped && state === 'run') jump();
    touch = null;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', () => { touch = null; });
  startBtn.addEventListener('click', start);

  // ---------- Dünya ----------

  function spawnRow() {
    safeLane = Math.max(-1, Math.min(1, safeLane + Math.round(rnd() * 2 - 1)));
    const lanes = [-1, 0, 1].filter((l) => l !== safeLane).sort(() => rnd() - 0.5);
    const count = rnd() < 0.35 + Math.min(0.35, dist / 5000) ? 2 : 1;
    for (const l of lanes.slice(0, count)) {
      const truck = rnd() < 0.22;
      traffic.push({
        lane: l, z: SPAWN_Z + rnd() * 6, truck,
        len: truck ? 9 : 3.6, w: truck ? 2.5 : 1.9, h: truck ? 3.4 : 1.35, hit: truck ? 3.4 : 0.95,
        color: truck ? '#d9dbe8' : CAR_COLORS[Math.floor(rnd() * CAR_COLORS.length)],
        cleared: false, scored: false,
      });
    }
    nextRow = dist + (32 + rnd() * 22) * (0.8 + 0.2 * 25 / speed);
  }

  function popup(label, value, color) {
    popups.push({ text: value ? `${label} +${value}` : label, color, t: 0 });
  }

  // Vitrin: önündeki araç yaklaşınca en açık şeride geçer, kaçamıyorsa üstünden zıplar
  function autopilot() {
    const ahead = (l) => {
      let d = 999, o = null;
      for (const v of traffic) if (Math.abs(v.lane - l) < 0.5 && v.z - v.len / 2 > -1 && v.z - v.len / 2 < d) { d = v.z - v.len / 2; o = v; }
      return { d, o };
    };
    const busy = (l) => traffic.some((v) => Math.abs(v.lane - l) < 0.5 && Math.abs(v.z) < v.len / 2 + PLAYER_HALF + 3);
    const cur = ahead(lane);
    if (cur.d > 30) return;
    const options = [lane - 1, lane + 1].filter((l) => l >= -1 && l <= 1 && !busy(l)).map((l) => ({ l, d: ahead(l).d }));
    options.sort((a, b) => b.d - a.d);
    if (options.length && options[0].d > cur.d + 8) { lane = options[0].l; return; }
    const rel = speed - TRAFFIC_SPEED;
    if (cur.o && !cur.o.truck && cur.d - PLAYER_HALF < rel * 0.2) jump();
  }

  function update(dt) {
    for (const p of popups) p.t += dt;
    popups = popups.filter((p) => p.t < 1.1);
    shake = Math.max(0, shake - dt * 2.5);
    if (state === 'crashed') { crashT += dt; return; }

    speed = 25 + 32 * (1 - Math.exp(-dist / 1800));
    const rel = speed - TRAFFIC_SPEED;
    dist += speed * dt;
    if (dist >= nextRow) spawnRow();
    if (state === 'attract') autopilot();

    const w = Math.floor(dist / WORLD_LENGTH) % WORLDS.length;
    if (w !== worldIndex) { worldIndex = w; popup(WORLDS[w].name, 0, WORLDS[w].edge); }

    px += Math.max(-dt * 9, Math.min(dt * 9, lane - px));
    if (ph > 0) {
      vh -= gravity() * dt;
      ph += vh * dt;
      if (ph <= 0) { ph = 0; vh = 0; }
    }

    for (const v of traffic) {
      v.z -= rel * dt;
      const overlapZ = Math.abs(v.z) < v.len / 2 + PLAYER_HALF;
      const side = Math.abs(v.lane - px);
      if (overlapZ && side < 0.5) {
        if (ph < v.hit) {
          if (state === 'attract') { reset(); return; }
          crash();
          return;
        }
        if (!v.cleared) { v.cleared = true; v.scored = true; bonus += 50; popup(text('clear'), 50, '#5fe3f0'); }
      }
      if (!v.scored && v.z < -(v.len / 2 + PLAYER_HALF)) {
        v.scored = true;
        if (side < 1.15 && ph < v.hit && state === 'run') { bonus += 25; popup(text('near'), 25, '#ffd36e'); }
      }
    }
    traffic = traffic.filter((v) => v.z > -12);
    score = Math.floor(dist) + bonus;
  }

  // ---------- Çizim ----------

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  function drawSky(world) {
    const sky = ctx.createLinearGradient(0, 0, 0, HY);
    world.sky.forEach((c, i) => sky.addColorStop(i / (world.sky.length - 1), c));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, HY);
    ctx.fillStyle = '#fff';
    for (const s of stars) {
      ctx.globalAlpha = world.stars * (0.5 + 0.5 * Math.sin(s.x + dist * 0.01));
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    // Çizgili retro güneş; çizgiler gökyüzünün kendi rengiyle kesilir
    const sun = ctx.createLinearGradient(0, HY - 120, 0, HY);
    sun.addColorStop(0, world.sun[0]);
    sun.addColorStop(1, world.sun[1]);
    ctx.save();
    ctx.shadowColor = world.sun[1];
    ctx.shadowBlur = 30;
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(CX, HY - 18, 62, Math.PI, 0);
    ctx.lineTo(CX + 62, HY);
    ctx.lineTo(CX - 62, HY);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = sky;
    for (let i = 0; i < 5; i++) ctx.fillRect(CX - 70, HY - 46 + i * 9, 140, 2 + i * 0.8);
    // Ufuk silueti
    ctx.fillStyle = world.hills;
    const line = skylines[world.shape];
    if (world.shape === 'hills') {
      ctx.beginPath();
      ctx.moveTo(0, HY);
      for (const p of line) ctx.lineTo(p.x, HY - p.h);
      ctx.lineTo(W, HY);
      ctx.fill();
    } else if (world.shape === 'mesas') {
      for (const m of line) {
        ctx.beginPath();
        ctx.moveTo(m.x, HY);
        ctx.lineTo(m.x + 8, HY - m.h);
        ctx.lineTo(m.x + m.w - 8, HY - m.h);
        ctx.lineTo(m.x + m.w, HY);
        ctx.fill();
      }
    } else {
      for (const b of line) {
        ctx.fillStyle = world.hills;
        ctx.fillRect(b.x, HY - b.h, b.w, b.h);
        ctx.fillStyle = b.lit > 0.5 ? 'rgba(95,227,240,0.7)' : 'rgba(255,79,163,0.7)';
        for (let y = HY - b.h + 4; y < HY - 3; y += 6) ctx.fillRect(b.x + 3, y, b.w - 6, 1.5);
      }
    }
  }

  function drawGround(world) {
    ctx.fillStyle = world.ground;
    ctx.fillRect(0, HY, W, H - HY);
    ctx.strokeStyle = world.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const offset = dist % 10;
    for (let k = 0; k < 26; k++) {
      const z = k * 10 - offset;
      if (z < -6) continue;
      const y = yAt(z);
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    for (let l = -12; l <= 12; l++) {
      const lx = l < 0 ? l - 1 : l + 1;
      ctx.moveTo(xAt(lx, 400), yAt(400));
      ctx.lineTo(xAt(lx, -6), yAt(-6));
    }
    ctx.stroke();
    // Yol
    const far = 400, near = -6;
    ctx.fillStyle = '#17112a';
    ctx.beginPath();
    ctx.moveTo(xAt(-1.5, far), yAt(far));
    ctx.lineTo(xAt(1.5, far), yAt(far));
    ctx.lineTo(xAt(1.5, near), yAt(near));
    ctx.lineTo(xAt(-1.5, near), yAt(near));
    ctx.fill();
    ctx.save();
    ctx.strokeStyle = world.edge;
    ctx.shadowColor = world.edge;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    for (const side of [-1.5, 1.5]) {
      ctx.beginPath();
      ctx.moveTo(xAt(side, far), yAt(far));
      ctx.lineTo(xAt(side, near), yAt(near));
      ctx.stroke();
    }
    ctx.restore();
    // Şerit çizgileri (akan)
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    const dash = dist % 12;
    for (let k = 0; k < 24; k++) {
      // Kameranın arkasına (z ≤ −F) taşan parça ters izdüşer: −6'da kırpılır
      const z1 = k * 12 - dash + 4, z0 = Math.max(-6, z1 - 4);
      if (z1 <= -6) continue;
      for (const l of [-0.5, 0.5]) {
        const w0 = 2.2 * scaleAt(z0), w1 = 2.2 * scaleAt(z1);
        ctx.beginPath();
        ctx.moveTo(xAt(l, z0) - w0, yAt(z0));
        ctx.lineTo(xAt(l, z0) + w0, yAt(z0));
        ctx.lineTo(xAt(l, z1) + w1, yAt(z1));
        ctx.lineTo(xAt(l, z1) - w1, yAt(z1));
        ctx.fill();
      }
    }
  }

  function drawVehicle(v) {
    // −6 m'den geride araç ekranın altında kalır; z ≤ −F'de ölçek negatife döner
    if (v.z < -6) return;
    const s = scaleAt(v.z), x = xAt(v.lane, v.z), y = yAt(v.z);
    const w = v.w * PX_PER_M * s, h = v.h * PX_PER_M * s;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x - w * 0.55, y - 2 * s, w * 1.1, 4 * s);
    if (v.truck) {
      rr(x - w / 2, y - h, w, h * 0.92, 3 * s);
      ctx.fillStyle = v.color;
      ctx.fill();
      ctx.fillStyle = 'rgba(40,40,60,0.35)';
      for (let i = 1; i < 4; i++) ctx.fillRect(x - w / 2 + (w / 4) * i - 0.5 * s, y - h + 4 * s, 1 * s, h * 0.8);
      ctx.fillStyle = '#2b2b3a';
      ctx.fillRect(x - w / 2, y - h * 0.1, w, h * 0.1);
    } else {
      ctx.fillStyle = v.color;
      rr(x - w / 2, y - h * 0.6, w, h * 0.5, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#1b1830';
      rr(x - w * 0.38, y - h, w * 0.76, h * 0.42, 5 * s);
      ctx.fill();
      ctx.fillStyle = '#26243a';
      ctx.fillRect(x - w / 2, y - h * 0.14, w, h * 0.14);
    }
    ctx.save();
    ctx.fillStyle = '#ff3d5a';
    ctx.shadowColor = '#ff3d5a';
    ctx.shadowBlur = 8 * s;
    const ly = v.truck ? y - h * 0.22 : y - h * 0.42;
    ctx.fillRect(x - w / 2 + 2 * s, ly, w * 0.18, 3 * s);
    ctx.fillRect(x + w / 2 - 2 * s - w * 0.18, ly, w * 0.18, 3 * s);
    ctx.restore();
  }

  // Oyuncunun roadster'ı arkadan: beyaz gövde, mavi şerit, kanat, LED stop şeridi; havadayken alt iticiler yanar
  function drawPlayer() {
    const x = xAt(px, 0), lift = ph * PX_PER_M, y = BASE - lift;
    const shadow = Math.max(0.35, 1 - ph / 4);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, BASE + 3, 34 * shadow, 6 * shadow, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((lane - px) * 0.18 + (state === 'crashed' ? Math.sin(crashT * 30) * 0.05 : 0));
    if (ph > 0.02) {
      const flame = ctx.createLinearGradient(0, 0, 0, 26);
      flame.addColorStop(0, 'rgba(160,250,255,0.95)');
      flame.addColorStop(1, 'rgba(95,227,240,0)');
      ctx.fillStyle = flame;
      for (const fx of [-18, -6, 6, 18]) {
        ctx.beginPath();
        ctx.moveTo(fx - 4, -2);
        ctx.lineTo(fx + 4, -2);
        ctx.lineTo(fx, 14 + Math.random() * 10);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#0b0a12';
    ctx.fillRect(-30, -12, 10, 12);
    ctx.fillRect(20, -12, 10, 12);
    ctx.fillStyle = '#f4f6ff';
    ctx.beginPath();
    ctx.moveTo(-31, -6);
    ctx.lineTo(31, -6);
    ctx.lineTo(25, -26);
    ctx.lineTo(-25, -26);
    ctx.fill();
    ctx.fillStyle = '#2f6bff';
    ctx.fillRect(-5, -26, 10, 20);
    ctx.fillStyle = '#141224';
    ctx.beginPath();
    ctx.moveTo(-17, -26);
    ctx.lineTo(17, -26);
    ctx.lineTo(12, -36);
    ctx.lineTo(-12, -36);
    ctx.fill();
    ctx.fillStyle = '#f4f6ff';
    ctx.fillRect(-32, -33, 64, 3.5);
    ctx.fillRect(-20, -30, 3, 5);
    ctx.fillRect(17, -30, 3, 5);
    ctx.save();
    ctx.fillStyle = '#ff2d4d';
    ctx.shadowColor = '#ff2d4d';
    ctx.shadowBlur = 14;
    ctx.fillRect(-24, -18, 48, 3);
    ctx.restore();
    ctx.restore();
  }

  function drawOverlay() {
    ctx.textAlign = 'center';
    ctx.font = 'italic 900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    if (state !== 'attract') {
      ctx.font = '800 22px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.fillText(score.toLocaleString(), CX, 34);
    } else {
      ctx.font = '900 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText('DEMO', CX, 26);
    }
    popups.forEach((p, i) => {
      ctx.globalAlpha = Math.max(0, 1 - p.t / 1.1);
      ctx.fillStyle = p.color;
      ctx.font = 'italic 900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(p.text, CX, 300 - p.t * 40 - i * 24);
    });
    ctx.globalAlpha = 1;
    if (state === 'crashed') {
      ctx.fillStyle = `rgba(255,61,90,${Math.max(0, 0.35 - crashT * 0.5)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'italic 900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('CRASHED', CX, 250);
    }
  }

  function render() {
    const world = WORLDS[worldIndex];
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 10 * shake);
    drawSky(world);
    drawGround(world);
    const sorted = traffic.slice().sort((a, b) => b.z - a.z);
    for (const v of sorted) if (v.z >= 0) drawVehicle(v);
    drawPlayer();
    for (const v of sorted) if (v.z < 0) drawVehicle(v);
    ctx.restore();
    drawOverlay();
  }

  // ---------- Panel ve döngü ----------

  let panelAt = 0;
  function panel(force) {
    const now = performance.now();
    if (!force && now - panelAt < 120) return;
    panelAt = now;
    scoreEl.textContent = state === 'attract' ? '0' : score.toLocaleString();
    bestEl.textContent = best.toLocaleString();
    speedEl.textContent = state === 'attract' ? '0' : Math.round(speed * 3.6).toString();
  }

  let visible = true, rafId = 0, last = 0;
  const shouldRun = () => visible && !document.hidden && !(reduceMotion && state === 'attract');
  function frame(t) {
    rafId = 0;
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    update(dt);
    render();
    panel(false);
    if (shouldRun() && !(state === 'crashed' && crashT > 1.2)) rafId = requestAnimationFrame(frame);
  }
  function kick() {
    if (rafId || !shouldRun()) return;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) kick();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', kick);

  reset();
  if (reduceMotion) {
    for (let i = 0; i < 90; i++) update(1 / 30);
  }
  render();
  panel(true);
  kick();
})();
