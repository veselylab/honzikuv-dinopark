// Honzíkův Dinopark – kreslení dinosaurů
const DINO = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
  function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  function shade(c, amt) { return amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt); }
  function rgba(c, a) { const [r, g, b] = hex2rgb(c); return `rgba(${r},${g},${b},${a})`; }

  function spline(p, pts, closed) {
    const n = pts.length;
    p.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)];
      const p1 = pts[i], p2 = pts[(i + 1) % n];
      const p3 = closed ? pts[(i + 2) % n] : pts[Math.min(n - 1, i + 2)];
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closed) p.closePath();
    return p;
  }
  function poly(ctx, pts) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); }
  function seeded(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function hashStr(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  const SPECIES = {
    rex: {
      id: 'rex', name: 'Tyrannosaurus', short: 'T-rex', prefix: 'Rex', suffix: 'rex', diet: 'maso', size: 1,
      body: 'thero', spine: [[-138, -74, 1.5], [-105, -78, 6], [-70, -82, 12], [-35, -85, 20], [0, -83, 24], [26, -79, 22], [44, -80, 18], [56, -90, 16], [62, -98, 15]],
      legs: [{ x: -4, y: -70, len: 70, w: 1.15 }], arm: [40, -66], head: 'rex', headScale: 1.2, headAngle: 0.08,
      colors: { base: '#7c5b3b', belly: '#dcc7a2', pattern: '#3f2b17', accent: '#a5402c', eye: '#f2c14e' }, pattern: 'stripes',
      features: {}, stats: { hp: 120, atk: 30, spd: 10 }, ability: 'crush'
    },
    raptor: {
      id: 'raptor', name: 'Velociraptor', short: 'Raptor', prefix: 'Velo', suffix: 'raptor', diet: 'maso', size: 0.62,
      body: 'thero', spine: [[-124, -62, 1], [-92, -64, 4], [-60, -66, 8], [-30, -67, 13], [0, -65, 15], [22, -63, 13], [36, -66, 9], [46, -76, 7], [52, -86, 7]],
      legs: [{ x: -2, y: -60, len: 64, w: 0.8 }], arm: [34, -58], head: 'raptor', headScale: 1.0, headAngle: 0.05,
      colors: { base: '#b98a4e', belly: '#f0ddb6', pattern: '#5c3a1b', accent: '#2f78a8', eye: '#f7d23a' }, pattern: 'stripes',
      features: { feathers: true }, stats: { hp: 80, atk: 23, spd: 30 }, ability: 'double'
    },
    spino: {
      id: 'spino', name: 'Spinosaurus', short: 'Spino', prefix: 'Spino', suffix: 'spinus', diet: 'maso', size: 1.05,
      body: 'thero', spine: [[-140, -76, 1.5], [-105, -80, 7], [-70, -84, 13], [-35, -87, 19], [0, -85, 21], [26, -81, 19], [44, -82, 13], [58, -92, 10], [66, -102, 9]],
      legs: [{ x: -2, y: -72, len: 72, w: 0.95 }], arm: [40, -68], head: 'croc', headScale: 1.05, headAngle: 0.12,
      colors: { base: '#3e6d68', belly: '#d2dac4', pattern: '#1f3d3a', accent: '#d4643c', eye: '#f2c14e' }, pattern: 'spots',
      features: { sail: true }, stats: { hp: 110, atk: 27, spd: 14 }, ability: 'roar'
    },
    tri: {
      id: 'tri', name: 'Triceratops', short: 'Tri', prefix: 'Trice', suffix: 'ceratops', diet: 'rostliny', size: 0.95,
      body: 'quad', spine: [[-118, -44, 1.5], [-92, -52, 6], [-62, -62, 13], [-30, -68, 23], [0, -68, 27], [30, -62, 25], [48, -58, 17], [60, -58, 14]],
      legs: [{ x: -32, y: -60, len: 60, w: 30 }, { x: 30, y: -52, len: 52, w: 24, front: true }], head: 'beak', headScale: 1.15, headAngle: 0.1,
      colors: { base: '#6f7f45', belly: '#d6d3a6', pattern: '#3b4720', accent: '#cc7a38', eye: '#e9b44c' }, pattern: 'bands',
      features: { frill: true, horns: true }, stats: { hp: 130, atk: 22, spd: 12 }, ability: 'ram'
    },
    stego: {
      id: 'stego', name: 'Stegosaurus', short: 'Stego', prefix: 'Stego', suffix: 'stegus', diet: 'rostliny', size: 0.95,
      body: 'quad', spine: [[-120, -50, 1.5], [-92, -62, 6], [-62, -76, 13], [-30, -86, 23], [0, -82, 26], [28, -68, 22], [46, -54, 13], [58, -48, 9]],
      legs: [{ x: -30, y: -76, len: 76, w: 30 }, { x: 30, y: -56, len: 56, w: 22, front: true }], head: 'small', headScale: 1.0, headAngle: 0.15,
      colors: { base: '#9b7b3c', belly: '#e8d6a4', pattern: '#5a4420', accent: '#c4442e', eye: '#e2b04a' }, pattern: 'spots',
      features: { plates: true, spikes: true }, stats: { hp: 120, atk: 21, spd: 11 }, ability: 'spikes'
    },
    ankylo: {
      id: 'ankylo', name: 'Ankylosaurus', short: 'Ankylo', prefix: 'Ankylo', suffix: 'kylos', diet: 'rostliny', size: 0.9,
      body: 'quad', spine: [[-118, -36, 2], [-90, -40, 6], [-62, -46, 12], [-30, -52, 20], [0, -54, 23], [30, -50, 21], [46, -46, 13], [58, -44, 10]],
      legs: [{ x: -30, y: -44, len: 44, w: 26 }, { x: 30, y: -42, len: 42, w: 22, front: true }], head: 'small', headScale: 1.25, headAngle: 0.05,
      colors: { base: '#7c6954', belly: '#cfc1a8', pattern: '#4a3d30', accent: '#e2d6bc', eye: '#d9a441' }, pattern: 'none',
      features: { armor: true, club: true }, stats: { hp: 150, atk: 18, spd: 8 }, ability: 'club'
    },
    brachio: {
      id: 'brachio', name: 'Brachiosaurus', short: 'Brachio', prefix: 'Brachio', suffix: 'chius', diet: 'rostliny', size: 1.2,
      body: 'quad', spine: [[-140, -92, 2.5], [-110, -100, 9], [-75, -108, 17], [-35, -116, 26], [0, -122, 30], [32, -128, 27], [50, -148, 13], [62, -180, 10], [70, -212, 8], [76, -236, 7]],
      legs: [{ x: -30, y: -106, len: 106, w: 23 }, { x: 34, y: -116, len: 116, w: 21, front: true }], head: 'small', headScale: 1.25, headAngle: -0.15,
      colors: { base: '#6a7e94', belly: '#d4dae0', pattern: '#44546a', accent: '#a7bbcf', eye: '#e2b04a' }, pattern: 'spots',
      features: {}, stats: { hp: 170, atk: 16, spd: 6 }, ability: 'quake'
    },
    parasaur: {
      id: 'parasaur', name: 'Parasaurolophus', short: 'Parasaur', prefix: 'Para', suffix: 'lophus', diet: 'rostliny', size: 0.95,
      body: 'quad', spine: [[-130, -62, 1.5], [-100, -68, 6], [-68, -76, 13], [-34, -82, 22], [0, -78, 24], [28, -68, 20], [44, -64, 13], [56, -72, 10], [64, -84, 9]],
      legs: [{ x: -30, y: -74, len: 74, w: 25 }, { x: 30, y: -54, len: 54, w: 12, front: true }], head: 'duck', headScale: 1.0, headAngle: 0.08,
      colors: { base: '#5f7d8c', belly: '#e5dcc3', pattern: '#2f4a58', accent: '#d9822b', eye: '#e9b44c' }, pattern: 'bands',
      features: { tube: true }, stats: { hp: 115, atk: 17, spd: 16 }, ability: 'quake'
    },
    pachy: {
      id: 'pachy', name: 'Pachycephalosaurus', short: 'Pachy', prefix: 'Pachy', suffix: 'cephalus', diet: 'rostliny', size: 0.75,
      body: 'thero', spine: [[-118, -64, 1.5], [-90, -66, 5], [-60, -68, 11], [-30, -70, 17], [0, -68, 19], [22, -66, 16], [36, -70, 11], [46, -80, 10], [52, -90, 10]],
      legs: [{ x: -2, y: -62, len: 64, w: 0.9 }], arm: [34, -60], head: 'dome', headScale: 1.05, headAngle: 0.12,
      colors: { base: '#8a6b4a', belly: '#e9d7b4', pattern: '#4a3420', accent: '#f0e2c0', eye: '#e2b04a' }, pattern: 'spots',
      features: {}, stats: { hp: 95, atk: 24, spd: 20 }, ability: 'ram'
    },
    dilo: {
      id: 'dilo', name: 'Dilophosaurus', short: 'Dilo', prefix: 'Dilo', suffix: 'dilos', diet: 'maso', size: 0.85,
      body: 'thero', spine: [[-128, -66, 1], [-96, -68, 4], [-62, -70, 9], [-30, -71, 14], [0, -69, 16], [22, -67, 14], [36, -70, 10], [46, -80, 8], [53, -90, 8]],
      legs: [{ x: -2, y: -64, len: 66, w: 0.85 }], arm: [34, -60], head: 'raptor', headScale: 1.05, headAngle: 0.05,
      colors: { base: '#c2a03e', belly: '#f2e6c4', pattern: '#6a4a1a', accent: '#d24a2a', eye: '#f7d23a' }, pattern: 'stripes',
      features: { crest: true }, stats: { hp: 90, atk: 25, spd: 22 }, ability: 'double'
    },
    carno: {
      id: 'carno', name: 'Carnotaurus', short: 'Carno', prefix: 'Carno', suffix: 'taurus', diet: 'maso', size: 0.9,
      body: 'thero', spine: [[-136, -78, 1.5], [-102, -80, 6], [-68, -84, 11], [-34, -86, 18], [0, -84, 20], [26, -80, 18], [42, -82, 14], [54, -92, 12], [60, -102, 11]],
      legs: [{ x: -2, y: -76, len: 76, w: 1.0 }], arm: [40, -68], head: 'carno', headScale: 1.05, headAngle: 0.05,
      colors: { base: '#a8442e', belly: '#e8c9a8', pattern: '#5a1f12', accent: '#3a2a20', eye: '#f2c14e' }, pattern: 'spots',
      features: { horns: true }, stats: { hp: 105, atk: 28, spd: 20 }, ability: 'ram'
    },
    allo: {
      id: 'allo', name: 'Allosaurus', short: 'Allo', prefix: 'Allo', suffix: 'allus', diet: 'maso', size: 0.95,
      body: 'thero', spine: [[-138, -74, 1.5], [-104, -77, 6], [-70, -80, 11], [-35, -82, 18], [0, -80, 21], [26, -76, 19], [42, -78, 15], [54, -88, 13], [60, -98, 12]],
      legs: [{ x: -2, y: -70, len: 70, w: 1.0 }], arm: [40, -66], head: 'allo', headScale: 1.1, headAngle: 0.06,
      colors: { base: '#6b6f3a', belly: '#dcd6b0', pattern: '#3a3d1c', accent: '#b04a2a', eye: '#f2c14e' }, pattern: 'stripes',
      features: { ridge: true }, stats: { hp: 115, atk: 29, spd: 14 }, ability: 'crush'
    },
    diplo: {
      id: 'diplo', name: 'Diplodocus', short: 'Diplo', prefix: 'Diplo', suffix: 'docus', diet: 'rostliny', size: 1.1,
      body: 'quad', spine: [[-196, -58, 1], [-164, -66, 3], [-128, -78, 7], [-88, -92, 15], [-42, -102, 25], [0, -106, 28], [34, -102, 24], [60, -106, 13], [90, -114, 9], [118, -122, 7], [140, -128, 6]],
      legs: [{ x: -34, y: -94, len: 94, w: 22 }, { x: 30, y: -90, len: 90, w: 20, front: true }], head: 'small', headScale: 1.1, headAngle: 0.18,
      colors: { base: '#8a7f6a', belly: '#ddd5c2', pattern: '#5a5040', accent: '#b8ac90', eye: '#e2b04a' }, pattern: 'bands',
      features: {}, stats: { hp: 180, atk: 15, spd: 5 }, ability: 'quake'
    },
    galli: {
      id: 'galli', name: 'Gallimimus', short: 'Galli', prefix: 'Galli', suffix: 'mimus', diet: 'rostliny', size: 0.8,
      body: 'thero', spine: [[-110, -72, 1.5], [-84, -74, 4], [-56, -76, 9], [-28, -78, 14], [0, -76, 16], [18, -74, 14], [30, -82, 10], [40, -98, 8], [46, -114, 7.5], [52, -126, 7]],
      legs: [{ x: -2, y: -72, len: 76, w: 0.7 }], arm: [30, -68], head: 'bird', headScale: 0.95, headAngle: 0.15,
      colors: { base: '#c79a5a', belly: '#f3e7cc', pattern: '#7a5530', accent: '#8a5a3a', eye: '#f2c14e' }, pattern: 'none',
      features: { feathers: true }, stats: { hp: 70, atk: 14, spd: 34 }, ability: 'double'
    },
    styraco: {
      id: 'styraco', name: 'Styracosaurus', short: 'Styraco', prefix: 'Styraco', suffix: 'styrax', diet: 'rostliny', size: 0.9,
      body: 'quad', spine: [[-116, -44, 1.5], [-90, -52, 6], [-60, -62, 13], [-30, -68, 23], [0, -68, 26], [30, -62, 24], [48, -58, 17], [60, -58, 14]],
      legs: [{ x: -32, y: -60, len: 60, w: 28 }, { x: 30, y: -52, len: 52, w: 23, front: true }], head: 'beak', headScale: 1.1, headAngle: 0.08,
      colors: { base: '#7a5a3a', belly: '#e1cfa8', pattern: '#4a3420', accent: '#d8a64a', eye: '#e9b44c' }, pattern: 'bands',
      features: { frill: true, spikefrill: true, nosehorn: true }, stats: { hp: 125, atk: 23, spd: 12 }, ability: 'ram'
    },
    iguano: {
      id: 'iguano', name: 'Iguanodon', short: 'Iguano', prefix: 'Iguano', suffix: 'odon', diet: 'rostliny', size: 1.0,
      body: 'quad', spine: [[-128, -62, 1.5], [-98, -70, 7], [-66, -80, 15], [-32, -86, 24], [0, -82, 27], [28, -72, 23], [44, -68, 15], [56, -76, 12], [64, -86, 11]],
      legs: [{ x: -30, y: -76, len: 76, w: 27 }, { x: 30, y: -58, len: 58, w: 15, front: true }], head: 'duck', headScale: 1.05, headAngle: 0.12,
      colors: { base: '#4f6a3a', belly: '#d9d6aa', pattern: '#2a3a1a', accent: '#e8dcc0', eye: '#e9b44c' }, pattern: 'stripes',
      features: { thumb: true }, stats: { hp: 130, atk: 20, spd: 12 }, ability: 'spikes'
    }
  };

  const ABILITIES = {
    crush: { name: 'Drtivý stisk', desc: 'Silné kousnutí, 1,8× útok', mult: 1.8, cd: 3 },
    double: { name: 'Dvojitý výpad', desc: 'Dva rychlé zásahy po 0,75×', mult: 0.75, hits: 2, cd: 2 },
    roar: { name: 'Řev', desc: 'Soupeř ztratí 30 % útoku na 2 kola', mult: 0.5, debuff: 0.3, cd: 3 },
    ram: { name: 'Beranidlo', desc: '1,4× útok, 35% šance omráčit', mult: 1.4, stun: 0.35, cd: 2 },
    spikes: { name: 'Ocasní bodce', desc: '1,3× útok + krvácení 2 kola', mult: 1.3, bleed: 7, cd: 2 },
    club: { name: 'Kyj', desc: '1,2× útok, 45% šance omráčit', mult: 1.2, stun: 0.45, cd: 2 },
    quake: { name: 'Zemětřesení', desc: '1,2× útok, 30% šance omráčit', mult: 1.2, stun: 0.3, cd: 2 }
  };

  function hybrid(A, B) {
    const sp = JSON.parse(JSON.stringify(A));
    sp.id = A.id + '-' + B.id;
    sp.name = A.prefix + B.suffix;
    sp.short = sp.name;
    sp.hybrid = true;
    sp.parents = [A.id, B.id];
    sp.head = B.head;
    sp.headScale = B.headScale * (A.body === B.body ? 1 : (A.body === 'thero' ? 0.9 : 1.05));
    sp.headAngle = (A.headAngle + B.headAngle) / 2;
    sp.colors = {
      base: mix(A.colors.base, B.colors.base, 0.5),
      belly: mix(A.colors.belly, B.colors.belly, 0.5),
      pattern: B.colors.pattern, accent: B.colors.accent, eye: B.colors.eye
    };
    sp.pattern = B.pattern === 'none' ? A.pattern : B.pattern;
    sp.features = Object.assign({}, A.features, B.features);
    sp.diet = (A.diet === 'maso' || B.diet === 'maso') ? 'maso' : 'rostliny';
    sp.stats = {
      hp: Math.round((A.stats.hp * 0.6 + B.stats.hp * 0.4) * 1.12),
      atk: Math.round((A.stats.atk * 0.4 + B.stats.atk * 0.6) * 1.12),
      spd: Math.round((A.stats.spd * 0.6 + B.stats.spd * 0.4) * 1.05)
    };
    sp.abilities = A.ability === B.ability ? [A.ability] : [A.ability, B.ability];
    return sp;
  }

  function legPath(leg, thero) {
    const L = leg.len;
    if (thero) {
      const k = L / 66, w = leg.w;
      const pts = [[-15, -10], [12, -12], [19, 8], [15, 26], [9, 46], [8, 56], [22, 60], [25, 66], [-6, 66], [-7, 58], [-3, 48], [-9, 30], [-18, 12]];
      return pts.map(([x, y]) => [x * w * (y < 30 ? 1 : 0.95), y * k]);
    }
    const w = leg.w / 2;
    return [[-w, -8], [w, -8], [w * 0.98, L * 0.45], [w * 0.88, L - 8], [w * 1.08, L], [-w * 1.08, L], [-w * 0.9, L - 8], [-w * 0.98, L * 0.45]];
  }

  function drawLeg(ctx, leg, thero, angle, fill, dark, far) {
    ctx.save();
    ctx.translate(leg.x, leg.y);
    ctx.rotate(angle);
    const pts = legPath(leg, thero);
    const path = spline(new Path2D(), pts, true);
    const g = ctx.createLinearGradient(0, -10, 0, leg.len);
    g.addColorStop(0, fill); g.addColorStop(1, shade(fill, -0.22));
    ctx.fillStyle = g; ctx.fill(path);
    ctx.lineWidth = 2.2; ctx.strokeStyle = dark; ctx.stroke(path);
    ctx.fillStyle = far ? shade('#e9dfc7', -0.3) : '#ece2c9';
    if (thero) {
      const k = leg.len / 66;
      for (let i = 0; i < 2; i++) { poly(ctx, [[16 + i * 5, 63 * k], [23 + i * 5, 66 * k], [18 + i * 5, 66 * k]]); ctx.fill(); }
    } else {
      const w = leg.w / 2;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(i * w * 0.62, leg.len - 2, w * 0.24, 3.2, 0, Math.PI, TAU); ctx.fill(); }
    }
    ctx.restore();
  }

  function headShape(type) {
    switch (type) {
      case 'rex': return {
        up: [[-10, -16], [12, -23], [36, -19], [54, -11], [62, -3], [58, 4], [30, 6], [6, 8], [-8, 4]],
        jaw: [[-2, 4], [30, 6], [54, 6], [52, 12], [30, 17], [8, 17], [-4, 10]],
        eye: [17, -11, 3.6], nose: [52, -7], teeth: [10, 54, 5], slit: true, brow: true
      };
      case 'raptor': return {
        up: [[-8, -12], [12, -17], [34, -13], [52, -5], [55, 0], [30, 3], [4, 6], [-8, 2]],
        jaw: [[-2, 3], [30, 4], [50, 3], [46, 8], [22, 11], [0, 9]],
        eye: [15, -8, 3.4], nose: [49, -3], teeth: [10, 50, 4], slit: true, brow: true
      };
      case 'croc': return {
        up: [[-10, -12], [10, -17], [26, -13], [58, -6], [76, -4], [80, 0], [62, 2], [28, 4], [0, 6], [-10, 2]],
        jaw: [[-2, 4], [30, 4], [74, 2], [72, 7], [30, 10], [2, 10]],
        eye: [13, -8, 3.2], nose: [56, -6], teeth: [12, 74, 4.5], slit: true, brow: true
      };
      case 'beak': return {
        up: [[-12, -14], [8, -21], [30, -15], [44, -6], [56, 3], [50, 11], [38, 14], [22, 16], [4, 18], [-10, 12]],
        jaw: [[0, 10], [30, 14], [44, 13], [40, 20], [20, 22], [2, 18]],
        eye: [13, -6, 3.2], nose: [42, -3], beak: true
      };
      case 'duck': return {
        up: [[-10, -12], [8, -17], [28, -13], [46, -7], [60, -2], [64, 4], [56, 9], [30, 9], [6, 11], [-10, 6]],
        jaw: [[0, 8], [30, 11], [56, 10], [52, 15], [28, 17], [4, 15]],
        eye: [12, -6, 3], nose: [50, -3], beakTip: [[50, -4], [64, 3], [60, 10], [50, 9]], beakCol: '#d6c79c'
      };
      case 'dome': return {
        up: [[-8, -10], [4, -14], [22, -12], [36, -5], [42, 1], [38, 6], [20, 8], [2, 8], [-8, 4]],
        jaw: [[0, 6], [20, 8], [38, 7], [34, 11], [16, 12], [2, 10]],
        eye: [16, -5, 3], nose: [38, -1], dome: true
      };
      case 'bird': return {
        up: [[-6, -8], [8, -11], [22, -7], [36, -2], [40, 1], [30, 4], [10, 6], [-6, 5]],
        jaw: [[0, 4], [24, 5], [38, 2], [34, 6], [14, 9], [0, 8]],
        eye: [10, -4, 3], nose: [32, -2], beakTip: [[26, -4], [40, 1], [34, 6], [24, 4]], beakCol: '#3d3a33'
      };
      case 'carno': return {
        up: [[-10, -16], [10, -22], [30, -18], [44, -10], [48, -2], [44, 4], [24, 6], [4, 8], [-8, 4]],
        jaw: [[-2, 4], [24, 6], [44, 6], [42, 12], [24, 16], [6, 16], [-4, 10]],
        eye: [16, -10, 3.4], nose: [42, -6], teeth: [8, 44, 5], slit: true, brow: true
      };
      case 'allo': return {
        up: [[-10, -14], [10, -20], [34, -17], [56, -9], [64, -2], [60, 4], [30, 6], [6, 8], [-8, 4]],
        jaw: [[-2, 4], [30, 6], [58, 6], [56, 11], [30, 15], [8, 15], [-4, 9]],
        eye: [18, -10, 3.4], nose: [56, -5], teeth: [10, 58, 5], slit: true, brow: true
      };
      default: return {
        up: [[-8, -9], [9, -12], [24, -7], [32, 0], [28, 6], [10, 8], [-6, 7]],
        jaw: [[0, 5], [24, 6], [27, 9], [12, 12], [0, 10]],
        eye: [10, -4, 2.4], nose: [27, -3]
      };
    }
  }

  function drawEye(ctx, e, C, slit, t) {
    const [x, y, r] = e;
    const blink = (t % 4.3) < 0.12 ? 0.15 : 1;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, blink);
    ctx.fillStyle = '#fbf4dc'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = C.eye; ctx.beginPath(); ctx.arc(r * 0.15, 0, r * 0.78, 0, TAU); ctx.fill();
    ctx.fillStyle = '#120c06'; ctx.beginPath();
    if (slit) ctx.ellipse(r * 0.2, 0, r * 0.22, r * 0.7, 0, 0, TAU); else ctx.arc(r * 0.2, 0, r * 0.42, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.35, r * 0.25, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.dark; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  }

  function drawFrill(ctx, C, spiky) {
    const pts = [];
    const cx = -8, cy = -20;
    for (let i = 0; i <= 22; i++) {
      const a = -2.75 + i * (3.5 / 22);
      const rr = (i % 2 ? 36 : 32);
      pts.push([cx + Math.cos(a) * rr * 0.85, cy + Math.sin(a) * rr]);
    }
    pts.push([4, 2], [-6, 8]);
    if (spiky) {
      for (let i = 0; i < 6; i++) {
        const a = -2.65 + i * 0.36, len = 30 + Math.sin(i / 5 * Math.PI) * 14;
        const bx = cx + Math.cos(a) * 30 * 0.85, by = cy + Math.sin(a) * 30;
        const tx = cx + Math.cos(a) * (30 + len) * 0.85, ty = cy + Math.sin(a) * (30 + len);
        const nx = -Math.sin(a) * 4, ny = Math.cos(a) * 4;
        poly(ctx, [[bx + nx, by + ny], [tx, ty], [bx - nx, by - ny]]);
        ctx.fillStyle = bone(ctx, ty, by); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.6; ctx.stroke();
      }
    }
    const p = spline(new Path2D(), pts, true);
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 38);
    g.addColorStop(0, shade(C.accent, 0.25)); g.addColorStop(0.7, C.accent); g.addColorStop(1, shade(C.accent, -0.25));
    ctx.fillStyle = g; ctx.fill(p);
    ctx.lineWidth = 2.2; ctx.strokeStyle = C.dark; ctx.stroke(p);
    ctx.strokeStyle = rgba(shade(C.accent, -0.45), 0.55); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy, 20, 24, 0.2, -2.6, 0.6); ctx.stroke();
    ctx.fillStyle = shade(C.accent, 0.4);
    for (let i = 0; i < 22; i += 2) {
      const a = -2.75 + i * (3.5 / 22);
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 30, cy + Math.sin(a) * 34 * 1.05, 1.6, 0, TAU); ctx.fill();
    }
  }

  function bone(ctx, y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#f6eed7'); g.addColorStop(1, '#bfa978'); return g; }

  function drawHead(ctx, sp, C, o, t) {
    const H = headShape(sp.head);
    const f = sp.features || {};
    const jawA = (o.jaw ?? 0.06) * 0.65;
    if (f.frill) drawFrill(ctx, C, f.spikefrill);
    if (f.crest) {
      ctx.strokeStyle = C.dark; ctx.lineWidth = 1.8;
      const cp = [[0, -12], [8, -34], [26, -38], [36, -20], [40, -10]];
      const p2 = spline(new Path2D(), cp.map(([x, y]) => [x + 5, y - 3]), true);
      ctx.fillStyle = shade(C.accent, -0.3); ctx.fill(p2); ctx.stroke(p2);
      const p = spline(new Path2D(), cp, true);
      ctx.fillStyle = C.accent; ctx.fill(p); ctx.stroke(p);
      ctx.strokeStyle = rgba(shade(C.accent, -0.5), 0.5); ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(8 + k * 8, -12); ctx.lineTo(10 + k * 7, -30 + Math.abs(k - 1.5) * 3); ctx.stroke(); }
    }
    if (f.tube) {
      const tp = spline(new Path2D(), [[4, -12], [-6, -24], [-30, -38], [-50, -43], [-53, -37], [-32, -28], [-8, -14], [6, -6]], true);
      const tg = ctx.createLinearGradient(0, -44, 0, -6); tg.addColorStop(0, shade(C.accent, 0.25)); tg.addColorStop(1, shade(C.accent, -0.2));
      ctx.fillStyle = tg; ctx.fill(tp); ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke(tp);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4, -20); ctx.quadraticCurveTo(-26, -34, -46, -40); ctx.stroke();
    }
    if (f.horns && sp.head === 'beak') {
      ctx.save(); ctx.translate(5, -3);
      const hp = spline(new Path2D(), [[8, -13], [18, -18], [40, -34], [62, -50], [44, -28], [22, -11]], true);
      ctx.fillStyle = shade('#d9c99d', -0.25); ctx.fill(hp); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.8; ctx.stroke(hp);
      ctx.restore();
    }
    const jp = spline(new Path2D(), H.jaw, true);
    ctx.save(); ctx.translate(0, 5); ctx.rotate(jawA); ctx.translate(0, -5);
    ctx.fillStyle = shade(C.belly, -0.08); ctx.fill(jp);
    ctx.fillStyle = 'rgba(120,30,30,0.85)';
    if (jawA > 0.08) { ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(H.jaw[2][0] - 6, 7); ctx.lineTo(H.jaw[2][0] - 10, 10); ctx.lineTo(6, 11); ctx.fill(); }
    if (H.teeth) {
      ctx.fillStyle = '#f6f0de';
      for (let x = H.teeth[0] + 3; x < H.teeth[1] - 2; x += 6) { poly(ctx, [[x, 7], [x + 2, 2], [x + 4, 7]]); ctx.fill(); }
    }
    ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke(jp);
    ctx.restore();
    if (H.teeth) {
      ctx.fillStyle = '#f6f0de'; ctx.strokeStyle = rgba(C.dark, 0.6); ctx.lineWidth = 0.6;
      for (let x = H.teeth[0]; x < H.teeth[1]; x += H.teeth[2] + 1) {
        const y = sp.head === 'croc' ? 3 : 5;
        poly(ctx, [[x, y - 2], [x + H.teeth[2] * 0.5, y + 5], [x + H.teeth[2], y - 2]]); ctx.fill(); ctx.stroke();
      }
    }
    const up = spline(new Path2D(), H.up, true);
    const g = ctx.createLinearGradient(0, -22, 0, 14);
    g.addColorStop(0, shade(C.base, 0.16)); g.addColorStop(0.6, C.base); g.addColorStop(1, shade(C.belly, -0.05));
    ctx.fillStyle = g; ctx.fill(up);
    if (sp.pattern !== 'none') {
      ctx.save(); ctx.clip(up); ctx.fillStyle = rgba(C.pattern, 0.35);
      for (let x = -6; x < 40; x += 12) { poly(ctx, [[x, -26], [x + 5, -26], [x + 2, -8], [x - 1, -8]]); ctx.fill(); }
      ctx.restore();
    }
    if (H.beak) {
      ctx.fillStyle = '#3d3a33';
      const bp = spline(new Path2D(), [[38, -5], [50, -2], [57, 4], [51, 12], [42, 9]], true);
      ctx.fill(bp);
    }
    if (H.beakTip) { ctx.fillStyle = H.beakCol; ctx.fill(spline(new Path2D(), H.beakTip, true)); }
    ctx.strokeStyle = C.dark; ctx.lineWidth = 2.2; ctx.stroke(up);
    ctx.save(); ctx.clip(up); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2.5; ctx.translate(0, 2.5);
    ctx.stroke(spline(new Path2D(), H.up.slice(0, 5), false)); ctx.restore();
    if (H.dome) {
      const dg = ctx.createRadialGradient(8, -24, 2, 14, -16, 20); dg.addColorStop(0, '#fbf3dc'); dg.addColorStop(1, shade(C.accent, -0.3));
      ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(13, -14, 21, 16, -0.15, Math.PI * 0.95, Math.PI * 2.08); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = shade(C.accent, -0.15);
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(-4 + k * 7, -6 - Math.sin(k / 5 * Math.PI) * 6, 2, 0, TAU); ctx.fill(); ctx.stroke(); }
    }
    if (f.ridge) {
      ctx.fillStyle = shade(C.base, 0.25); ctx.strokeStyle = C.dark; ctx.lineWidth = 1;
      for (let x = 28; x <= 54; x += 6) { const y = -17 + (x - 34) * 0.36; ctx.beginPath(); ctx.arc(x, y - 1, 2.3, Math.PI, TAU); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(H.eye[0] - 2, H.eye[1] - 5); ctx.lineTo(H.eye[0] + 2, H.eye[1] - 13); ctx.lineTo(H.eye[0] + 8, H.eye[1] - 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (H.brow) { ctx.strokeStyle = C.dark; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(H.eye[0] - 6, H.eye[1] - 4); ctx.quadraticCurveTo(H.eye[0], H.eye[1] - 8, H.eye[0] + 7, H.eye[1] - 4); ctx.stroke(); }
    drawEye(ctx, H.eye, C, H.slit, t + (sp.id.length * 0.37));
    ctx.fillStyle = C.dark; ctx.beginPath(); ctx.ellipse(H.nose[0], H.nose[1], 2, 1.2, -0.3, 0, TAU); ctx.fill();
    if (f.nosehorn && sp.head === 'beak') {
      const nh = spline(new Path2D(), [[34, -7], [42, -30], [46, -48], [50, -28], [52, -6]], true);
      ctx.fillStyle = bone(ctx, -48, -6); ctx.fill(nh); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.8; ctx.stroke(nh);
    }
    if (f.horns && sp.head === 'beak') {
      const hp = spline(new Path2D(), [[6, -13], [16, -18], [38, -34], [60, -50], [42, -28], [20, -10]], true);
      ctx.fillStyle = bone(ctx, -50, -10); ctx.fill(hp); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.8; ctx.stroke(hp);
      const np = spline(new Path2D(), [[38, -7], [44, -22], [50, -6]], true);
      ctx.fillStyle = bone(ctx, -22, -6); ctx.fill(np); ctx.stroke(np);
    } else if (f.horns) {
      ctx.fillStyle = bone(ctx, -30, -10); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.6;
      const hp = spline(new Path2D(), [[H.eye[0] - 4, H.eye[1] - 5], [H.eye[0] + 2, H.eye[1] - 22], [H.eye[0] + 8, H.eye[1] - 5]], true);
      ctx.fill(hp); ctx.stroke(hp);
    }
    if (o.stun) {
      for (let i = 0; i < 3; i++) {
        const a = t * 4 + i * TAU / 3;
        star(ctx, 12 + Math.cos(a) * 22, -30 + Math.sin(a) * 6, 5, '#ffd84a');
      }
    }
  }

  function star(ctx, x, y, r, c) {
    ctx.fillStyle = c; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }

  function palette(c, hurt) {
    const k = clamp(hurt || 0, 0, 1);
    const f = x => k ? mix(x, '#fff3f0', k * 0.75) : x;
    return { base: f(c.base), belly: f(c.belly), pattern: f(c.pattern), accent: f(c.accent), eye: c.eye, dark: shade(c.base, -0.62) };
  }

  function draw(ctx, sp, o = {}) {
    const t = o.t || 0, walk = o.walk || 0, ph = o.phase || 0;
    const s = (o.scale || 1) * (sp.size || 1);
    const C = palette(sp.colors, o.hurt);
    const thero = sp.body === 'thero';
    const f = sp.features || {};
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.shadow !== false) {
      ctx.fillStyle = 'rgba(25,18,8,0.26)';
      ctx.beginPath(); ctx.ellipse((o.flip ? 10 : -10) * s, 0, 92 * s, 11 * s, 0, 0, TAU); ctx.fill();
    }
    ctx.scale(o.flip ? -s : s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const bob = -Math.abs(Math.sin(ph)) * 3 * walk + Math.sin(t * 2.1) * 0.8 * (1 - walk) + (o.dy || 0);
    const breath = 1 + Math.sin(t * 2.2) * 0.022;
    const sw = Math.sin(t * 1.7 + ph * 0.5) * (3 + walk * 4);
    const headBob = Math.sin(t * 1.3) * 1.2 + (o.headDy || 0);
    const n = sp.spine.length;
    const sx = o.lunge || 0;
    const spine = sp.spine.map(([x, y, th], i) => {
      const tailF = x < -40 ? (-40 - x) / 100 : 0;
      const neckF = i >= n - 3 ? (i - (n - 3)) / 2 : 0;
      return [x + (x > 20 ? sx * 0.4 : 0), y + bob + sw * tailF * tailF * 2 + neckF * headBob, th * breath];
    });
    const top = spine.map(([x, y, th]) => [x, y - th]);
    const bot = spine.map(([x, y, th]) => [x, y + th + Math.max(0, 1 - Math.abs(x) / 45) * th * 0.22]).reverse();
    const torsoPts = top.concat(bot);
    const torso = spline(new Path2D(), torsoPts, true);
    const minY = Math.min(...top.map(p => p[1])), maxY = Math.max(...bot.map(p => p[1]));
    const legsA = 0.42 * walk, quadA = 0.28 * walk;
    const farFill = shade(C.base, -0.28);

    if (f.sail) {
      const base = top.filter(p => p[0] > -55 && p[0] < 42);
      const H = 62;
      const tip = base.map(([x, y]) => [x - 4, y - H * Math.sin(Math.PI * clamp((x + 55) / 97, 0, 1)) - 4]).reverse();
      const sp2 = spline(new Path2D(), base.map(([x, y]) => [x, y + 6]).concat(tip), true);
      const g = ctx.createLinearGradient(0, minY - H, 0, minY + 10);
      g.addColorStop(0, shade(C.accent, 0.2)); g.addColorStop(1, shade(C.accent, -0.3));
      ctx.fillStyle = g; ctx.fill(sp2);
      ctx.save(); ctx.clip(sp2);
      ctx.strokeStyle = rgba(shade(C.accent, -0.5), 0.55); ctx.lineWidth = 1.4;
      for (let x = -48; x < 38; x += 8) {
        const b = top.reduce((a, p) => Math.abs(p[0] - x) < Math.abs(a[0] - x) ? p : a);
        ctx.beginPath(); ctx.moveTo(x, b[1] + 4); ctx.lineTo(x - 4, b[1] - H * Math.sin(Math.PI * clamp((x + 55) / 97, 0, 1)) + 2); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = C.dark; ctx.lineWidth = 2.2; ctx.stroke(sp2);
    }
    if (f.plates) {
      for (let row = 0; row < 2; row++) {
        for (let x = -84; x <= 34; x += 14) {
          const xx = x + row * 7;
          const b = interpY(top, xx);
          const h = 8 + 26 * Math.sin(Math.PI * clamp((xx + 92) / 132, 0, 1));
          const pts = [[xx - 8, b + 6], [xx - 7, b - h * 0.5], [xx - 1, b - h], [xx + 7, b - h * 0.45], [xx + 8, b + 6]];
          const pp = spline(new Path2D(), pts, true);
          const g = ctx.createLinearGradient(0, b - h, 0, b);
          const col = row ? C.accent : shade(C.accent, -0.3);
          g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, shade(col, -0.25));
          ctx.fillStyle = g; ctx.fill(pp); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.8; ctx.stroke(pp);
        }
      }
    }
    if (f.spikes) {
      const tp = spine[1];
      for (let i = 0; i < 2; i++) {
        for (let k = 0; k < 2; k++) {
          const bx = tp[0] + 2 + i * 13, by = tp[1] - tp[2];
          const sp3 = [[bx - 4, by + 4], [bx - 22 - k * 8, by - 30 + k * 10], [bx + 5, by + 3]];
          poly(ctx, sp3); ctx.fillStyle = k ? shade('#cdbb8c', -0.3) : bone(ctx, by - 26, by); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
    }
    sp.legs.forEach(leg => {
      const a = thero ? Math.sin(ph + Math.PI) * legsA : Math.sin(ph + (leg.front ? 0 : Math.PI)) * quadA;
      drawLeg(ctx, { ...leg, x: leg.x - 8, y: leg.y + bob - 2 }, thero, a, farFill, C.dark, true);
    });
    if (thero && sp.arm) drawArm(ctx, sp.arm[0] - 6, sp.arm[1] + bob - 2, farFill, C.dark, t, f, C);

    const g = ctx.createLinearGradient(0, minY, 0, maxY);
    g.addColorStop(0, shade(C.base, 0.14)); g.addColorStop(0.55, C.base); g.addColorStop(0.82, mix(C.base, C.belly, 0.6)); g.addColorStop(1, C.belly);
    ctx.fillStyle = g; ctx.fill(torso);
    ctx.save(); ctx.clip(torso);
    const rnd = seeded(hashStr(sp.id));
    const midY = (minY + maxY) / 2;
    if (sp.pattern === 'stripes' || sp.pattern === 'bands') {
      ctx.fillStyle = rgba(C.pattern, sp.pattern === 'bands' ? 0.32 : 0.42);
      const step = sp.pattern === 'bands' ? 22 : 14, w = sp.pattern === 'bands' ? 9 : 5;
      for (let x = -130; x < 70; x += step) {
        const b = interpY(top, x);
        poly(ctx, [[x - 2, b - 4], [x + w, b - 4], [x + w * 0.4 - 4, b + 26], [x - 6, b + 24]]); ctx.fill();
      }
    } else if (sp.pattern === 'spots') {
      ctx.fillStyle = rgba(C.pattern, 0.38);
      for (let i = 0; i < 26; i++) {
        const x = -110 + rnd() * 170, b = interpY(top, x);
        ctx.beginPath(); ctx.ellipse(x, b + 4 + rnd() * 22, 2 + rnd() * 3.5, 1.6 + rnd() * 2.5, rnd(), 0, TAU); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath(); ctx.ellipse(0, maxY + 4, 70, 14, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.dark; ctx.lineWidth = 2.4; ctx.stroke(torso);
    ctx.save(); ctx.clip(torso); ctx.translate(0, 3); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
    ctx.stroke(spline(new Path2D(), top.slice(1, -1), false)); ctx.restore();

    if (f.armor) {
      for (let row = 0; row < 3; row++) {
        for (let x = -70 + row * 5; x < 44; x += 10) {
          const b = interpY(top, x) + 5 + row * 9;
          if (b > midY + 6) continue;
          ctx.fillStyle = shade(C.base, 0.22 - row * 0.08); ctx.strokeStyle = rgba(C.dark, 0.8); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(x, b, 4 - row * 0.6, 3 - row * 0.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
        }
      }
      for (let x = -56; x < 34; x += 15) {
        const b = interpY(bot.slice().reverse(), x) - 9;
        poly(ctx, [[x - 4, b - 4], [x - 10, b + 9], [x + 4, b - 2]]); ctx.fillStyle = bone(ctx, b - 4, b + 9); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.2; ctx.stroke();
      }
    }
    sp.legs.forEach(leg => {
      const a = thero ? Math.sin(ph) * legsA : Math.sin(ph + (leg.front ? Math.PI : 0)) * quadA;
      drawLeg(ctx, { ...leg, y: leg.y + bob }, thero, a, C.base, C.dark, false);
    });
    if (f.thumb) {
      const fl = sp.legs.find(l => l.front);
      if (fl) { const x = fl.x + fl.w / 2, y = fl.y + bob + fl.len * 0.55; poly(ctx, [[x - 2, y - 4], [x + 11, y - 2], [x - 2, y + 3]]); ctx.fillStyle = bone(ctx, y - 4, y + 3); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.4; ctx.stroke(); }
    }
    if (f.club) {
      const tp = spine[0];
      const cg = ctx.createRadialGradient(tp[0] - 3, tp[1] - 4, 2, tp[0], tp[1], 14);
      cg.addColorStop(0, shade(C.base, 0.3)); cg.addColorStop(1, shade(C.base, -0.2));
      ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(tp[0] - 4, tp[1], 14, 10, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.dark; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(tp[0] - 2, tp[1] - 2, 6, 4, 0, 0, TAU); ctx.strokeStyle = rgba(C.dark, 0.5); ctx.lineWidth = 1; ctx.stroke();
    }
    if (f.feathers) {
      ctx.lineWidth = 2.4;
      for (let x = -60; x < 32; x += 6) {
        const b = interpY(top, x);
        ctx.strokeStyle = (Math.round(x / 6) % 3) ? C.accent : shade(C.accent, 0.35);
        ctx.beginPath(); ctx.moveTo(x, b + 2); ctx.quadraticCurveTo(x - 6, b - 6, x - 10, b - 4 + Math.sin(t * 3 + x) * 0.8); ctx.stroke();
      }
      const tp = spine[0], tp2 = spine[1];
      for (let k = -2; k <= 2; k++) {
        ctx.strokeStyle = k % 2 ? C.accent : shade(C.accent, -0.25); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tp2[0], tp2[1]); ctx.quadraticCurveTo(tp[0], tp[1] + k * 3, tp[0] - 16, tp[1] + k * 6 + Math.sin(t * 2) * 1.5); ctx.stroke();
      }
    }
    if (thero && sp.arm) drawArm(ctx, sp.arm[0], sp.arm[1] + bob, C.base, C.dark, t, f, C);

    const hp = spine[n - 1];
    ctx.save();
    ctx.translate(hp[0] - 2, hp[1]);
    ctx.rotate((sp.headAngle || 0) + Math.sin(t * 1.1) * 0.03 + (o.headTilt || 0));
    ctx.scale(sp.headScale || 1, sp.headScale || 1);
    drawHead(ctx, sp, C, o, t);
    ctx.restore();
    ctx.restore();
  }

  function drawArm(ctx, x, y, fill, dark, t, f, C) {
    const a = Math.sin(t * 2) * 0.1;
    const ex = x + 6, ey = y + 11 + a * 10, hx = x + 15, hy = y + 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = dark; ctx.lineWidth = 7.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = '#ece2c9'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 4, hy + 3); ctx.moveTo(hx, hy); ctx.lineTo(hx + 2, hy + 5); ctx.stroke();
    if (f.feathers) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(ex - 2 + i * 3, ey); ctx.lineTo(ex - 6 + i * 3, ey + 8); ctx.stroke(); } }
  }

  function interpY(pts, x) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      if ((x >= x0 && x <= x1) || (x <= x0 && x >= x1)) { const k = (x - x0) / ((x1 - x0) || 1); return y0 + (y1 - y0) * k; }
    }
    return x < pts[0][0] ? pts[0][1] : pts[pts.length - 1][1];
  }

  function portrait(canvas, sp, opts = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const ext = bounds(sp);
    const k = Math.min((w * 0.86) / ext.w, (h * 0.8) / ext.h);
    draw(ctx, sp, Object.assign({ x: w / 2 - (ext.cx) * k, y: h * 0.9, scale: k / (sp.size || 1), t: opts.t || 0, shadow: true }, opts.o || {}));
  }

  function bounds(sp) {
    let minX = 1e9, maxX = -1e9, minY = 0;
    sp.spine.forEach(([x, y, th]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y - th); });
    const head = 60 * (sp.headScale || 1);
    maxX += head; minY -= (sp.features.sail ? 60 : sp.features.plates ? 30 : 0);
    const last = sp.spine[sp.spine.length - 1];
    minY = Math.min(minY, last[1] - 30 * (sp.headScale || 1) - (sp.features.frill ? (sp.features.spikefrill ? 70 : 40) : 0) - (sp.features.tube || sp.features.crest ? 30 : 0));
    return { w: (maxX - minX + 20), h: (-minY + 10), cx: ((minX + maxX) / 2) };
  }

  return { SPECIES, ABILITIES, draw, hybrid, portrait, bounds, mix, shade, rgba, spline, seeded, hashStr, star };
})();
