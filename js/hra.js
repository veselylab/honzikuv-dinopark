// Honzíkův Dinopark – pravidla a průběh hry
(() => {
const S = DINO.SPECIES;
const N = 32, BLK = 8, NB = N / BLK, TW = 64, TH = 32, SIDE = 34;
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
const cam = { x: 0, y: 0, z: 1 };
const $ = id => document.getElementById(id);
const hash = (i, j, k = 0) => { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k + 1, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const pos = (fi, fj) => [(fi - fj) * TW / 2, (fi + fj) * TH / 2];
const GATE = [16, 23];
const VOLC = [2, 2];

// cena, přitažlivost, čas líhnutí, potřebné hvězdy, velký výběh, éra, zajímavost
const CATALOG = [
  { id: 'galli', price: 250, appeal: 5, time: 6, stars: 0, era: 'Křída · před 70 mil. let · Mongolsko', fact: 'Jméno znamená „napodobitel slepice“. Běhal rychle jako pštros.' },
  { id: 'tri', price: 300, appeal: 6, time: 7, stars: 0, era: 'Křída · před 68 mil. let · Severní Amerika', fact: 'Rohy nad očima mohly měřit skoro metr.' },
  { id: 'parasaur', price: 320, appeal: 6, time: 7, stars: 0, era: 'Křída · před 75 mil. let · Severní Amerika', fact: 'Dutý hřeben na hlavě mu možná sloužil jako trubka na troubení.' },
  { id: 'stego', price: 350, appeal: 7, time: 8, stars: 0, era: 'Jura · před 152 mil. let · Severní Amerika', fact: 'Bodcům na konci jeho ocasu se říká thagomizer.' },
  { id: 'raptor', price: 450, appeal: 10, time: 8, stars: 0, era: 'Křída · před 73 mil. let · Mongolsko', fact: 'Byl velký asi jako krocan a měl peří.' },
  { id: 'pachy', price: 400, appeal: 8, time: 8, stars: 1.5, era: 'Křída · před 68 mil. let · Severní Amerika', fact: 'Kostěná kopule na jeho hlavě byla silná až 25 cm.' },
  { id: 'iguano', price: 420, appeal: 8, time: 8, stars: 1.5, era: 'Křída · před 125 mil. let · Evropa', fact: 'Patří k prvním pojmenovaným dinosaurům (1825). Na palci měl kostěný bodec.' },
  { id: 'ankylo', price: 450, appeal: 9, time: 8, stars: 1.5, era: 'Křída · před 67 mil. let · Severní Amerika', fact: 'Kostěným kyjem na ocase se bránil i velkým dravcům.' },
  { id: 'dilo', price: 550, appeal: 12, time: 9, stars: 1.5, era: 'Jura · před 190 mil. let · Severní Amerika', fact: 'Měl na hlavě dva tenké hřebeny. Plivání jedu je jen filmový výmysl.' },
  { id: 'styraco', price: 650, appeal: 13, time: 9, stars: 2.5, era: 'Křída · před 75 mil. let · Kanada', fact: 'Z límce mu trčely dlouhé bodce a roh na nose měřil kolem půl metru.' },
  { id: 'brachio', price: 700, appeal: 14, time: 10, stars: 2.5, big: true, era: 'Jura · před 154 mil. let · Severní Amerika', fact: 'Přední nohy měl delší než zadní, takže se nesl jako žirafa.' },
  { id: 'carno', price: 800, appeal: 16, time: 10, stars: 2.5, era: 'Křída · před 70 mil. let · Argentina', fact: 'Jméno znamená „masožravý býk“. Měl rohy a ještě kratší ruce než T-rex.' },
  { id: 'diplo', price: 900, appeal: 17, time: 11, stars: 3.5, big: true, era: 'Jura · před 153 mil. let · Severní Amerika', fact: 'Patří k nejdelším dinosaurům. Měřil 25 metrů i víc.' },
  { id: 'spino', price: 950, appeal: 18, time: 11, stars: 3.5, era: 'Křída · před 95 mil. let · severní Afrika', fact: 'Žil nejspíš napůl ve vodě a lovil ryby.' },
  { id: 'allo', price: 1000, appeal: 19, time: 11, stars: 3.5, era: 'Jura · před 150 mil. let · Severní Amerika', fact: 'Nejobávanější lovec jury. Žil ve stejné době jako stegosaurus.' },
  { id: 'rex', price: 1400, appeal: 25, time: 12, stars: 4.5, era: 'Křída · před 67 mil. let · Severní Amerika', fact: 'Měl jeden z nejsilnějších stisků čelistí ze všech suchozemských zvířat.' }
];
const CAT = Object.fromEntries(CATALOG.map(c => [c.id, c]));
const TOOLS = [
  { id: 'view', name: 'Prohlížet', cost: 0, hint: 'Táhni myší pro posun, kolečkem přibliž. Klikni na líheň nebo na dinosaura.' },
  { id: 'path', name: 'Cesta', cost: 10, label: '10 · most 40', hint: 'Táhni po trávě a kresli cestu. Přes vodu postavíš most. Návštěvníci chodí jen po cestách.' },
  { id: 'pen', name: 'Výběh', cost: 300, hint: 'Výběh 3 × 3 pro 3 dinosaury. Postav ho vedle cesty, ať na ně návštěvníci vidí.' },
  { id: 'bigpen', name: 'Velký výběh', cost: 800, hint: 'Velký výběh 5 × 5 pro 6 dinosaurů. Obři jako brachiosaurus a diplodocus potřebují právě tenhle.' },
  { id: 'hatch', name: 'Líheň', cost: 500, hint: 'Líheň 2 × 2 políčka. Stačí jedna, pak na ni klikni a vyber vejce.' },
  { id: 'tree', name: 'Strom', cost: 25, hint: 'Stromy dělají park hezčí a přidávají kousek hodnocení.' },
  { id: 'land', name: 'Pozemek', cost: 0, label: 'rozšířit', hint: '' },
  { id: 'bull', name: 'Bourat', cost: 0, hint: 'Odstraň cestu, most, strom, kámen nebo prázdný výběh. Výběh vrátí polovinu ceny.' }
];
const ICONS = {
  view: '<svg viewBox="0 0 34 34"><path d="M12 30 Q8 24 7 18 Q7 15 10 16 L12 19 L12 7 Q12 4.5 14.5 4.5 Q17 4.5 17 7 L17 15 L17 6 Q17 3.5 19.5 3.5 Q22 3.5 22 6 L22 15 L22 8 Q22 5.5 24.5 5.5 Q27 5.5 27 8 L27 21 Q27 27 23 30Z" fill="#f6d2b0" stroke="#3b2410" stroke-width="2" stroke-linejoin="round"/></svg>',
  path: '<svg viewBox="0 0 34 34"><path d="M17 4 L31 11 L17 18 L3 11Z" fill="#e3cc94" stroke="#3b2410" stroke-width="2"/><path d="M17 16 L31 23 L17 30 L3 23Z" fill="#e3cc94" stroke="#3b2410" stroke-width="2"/><circle cx="14" cy="11" r="1.6" fill="#b89a5e"/><circle cx="20" cy="23" r="1.6" fill="#b89a5e"/></svg>',
  pen: '<svg viewBox="0 0 34 34"><path d="M4 26 L4 12 M11 29 L11 15 M18 26 L18 12 M25 29 L25 15 M30 26 L30 12" stroke="#6b4421" stroke-width="3" stroke-linecap="round"/><path d="M3 15 L31 15 M3 21 L31 21" stroke="#a36d35" stroke-width="3" stroke-linecap="round"/></svg>',
  bigpen: '<svg viewBox="0 0 34 34"><path d="M2 28 L2 10 M8 31 L8 13 M14 28 L14 10 M20 31 L20 13 M26 28 L26 10 M32 31 L32 13" stroke="#6b4421" stroke-width="2.6" stroke-linecap="round"/><path d="M1 14 L33 14 M1 20 L33 20 M1 26 L33 26" stroke="#a36d35" stroke-width="2.6" stroke-linecap="round"/></svg>',
  hatch: '<svg viewBox="0 0 34 34"><path d="M5 26 Q5 8 17 7 Q29 8 29 26Z" fill="#bfe6f2" stroke="#3b2410" stroke-width="2"/><ellipse cx="17" cy="22" rx="4" ry="5" fill="#f6ecd2" stroke="#3b2410" stroke-width="1.5"/><path d="M3 27 H31" stroke="#3b2410" stroke-width="3" stroke-linecap="round"/></svg>',
  tree: '<svg viewBox="0 0 34 34"><rect x="15" y="20" width="4" height="10" fill="#6b4421"/><circle cx="12" cy="17" r="7" fill="#5aa43a" stroke="#2c5a1e" stroke-width="2"/><circle cx="22" cy="16" r="7" fill="#5aa43a" stroke="#2c5a1e" stroke-width="2"/><circle cx="17" cy="10" r="7" fill="#6fbb47" stroke="#2c5a1e" stroke-width="2"/></svg>',
  land: '<svg viewBox="0 0 34 34"><path d="M17 8 L32 16 L17 24 L2 16Z" fill="#84ba4f" stroke="#3b2410" stroke-width="2"/><rect x="15" y="4" width="3" height="16" fill="#6b4421"/><rect x="8" y="3" width="17" height="9" rx="1.5" fill="#ffd65a" stroke="#3b2410" stroke-width="1.6"/><path d="M12 7.5 H21" stroke="#3b2410" stroke-width="1.6"/></svg>',
  bull: '<svg viewBox="0 0 34 34"><rect x="5" y="14" width="18" height="10" rx="2" fill="#f2a33a" stroke="#3b2410" stroke-width="2"/><rect x="9" y="8" width="9" height="7" rx="1.5" fill="#bfe6f2" stroke="#3b2410" stroke-width="2"/><path d="M23 22 L30 22 L30 14" stroke="#3b2410" stroke-width="2.5" fill="none"/><circle cx="9" cy="26" r="3" fill="#3b2410"/><circle cx="19" cy="26" r="3" fill="#3b2410"/></svg>'
};

let G;
let tool = 'view', hover = null, drag = null, sound = true, AC = null, tNow = 0, pick = null, infoDino = null;
let visitors = [], parts = [], birds = [], clouds = [], smoke = [], unlockedSeen = new Set();
let groundCache = null, groundDirty = true, miniCache = null;

// ---------- ostrov ----------
function newGame() {
  const tiles = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) tiles.push({ g: 'grass', o: null, pen: -1 });
  const owned = Array(NB * NB).fill(false);
  [[1, 1], [1, 2], [2, 1], [2, 2]].forEach(([a, b]) => owned[a * NB + b] = true);
  const Tt = (i, j) => tiles[i * N + j];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const t = Tt(i, j), n = (hash(i, j, 3) - 0.5) * 0.3;
    if (Math.hypot((i - 26.5) / 3.8, (j - 5) / 3.2) + n < 1) t.g = 'water';
    const rc = 26.5 + Math.sin(j * 0.42) * 1.4;
    if (j >= 7 && Math.abs(i + 0.5 - rc) < 0.95) t.g = 'water';
    if (Math.hypot((i - 19.5) / 1.8, (j - 10.5) / 1.5) + n < 1) t.g = 'water';
    if (Math.hypot((i - 7) / 2.4, (j - 27.5) / 1.8) + n < 1) t.g = 'water';
    if (Math.hypot(i - 4, j - 4) < 4.3 && t.g === 'grass') t.g = 'ash';
  }
  for (let j = GATE[1] + 1; j < N; j++) Tt(GATE[0], j).g = 'road';
  for (let k = 0; k < 3; k++) Tt(GATE[0], GATE[1] - k).g = 'path';
  Tt(...GATE).o = { t: 'gate' };
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) Tt(VOLC[0] + a, VOLC[1] + b).o = { t: 'volc' };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const t = Tt(i, j); if (t.o || (t.g !== 'grass' && t.g !== 'ash')) continue;
    const own = owned[Math.floor(i / BLK) * NB + Math.floor(j / BLK)];
    if (Math.abs(i - GATE[0]) <= 2 && j >= GATE[1] - 4) continue;
    if (Math.abs(i - GATE[0]) <= 1 && j > GATE[1]) continue;
    const hills = i < 13 && j < 13, jungle = j >= 24 || i >= 23;
    let p = own ? 0.08 : 0.3;
    if (own && i > 10 && i < 21 && j > 12 && j < 21) p = 0.015;
    if (t.g === 'ash') p = 0.12;
    if (hash(i, j, 7) > p) continue;
    const r = hash(i, j, 9);
    if (hills) t.o = r < 0.45 ? { t: 'rock', v: Math.floor(hash(i, j, 2) * 3) } : { t: 'tree', v: 2 };
    else if (jungle) t.o = { t: 'tree', v: r < 0.55 ? 1 : r < 0.8 ? 3 : 0 };
    else t.o = r < 0.1 ? { t: 'rock', v: Math.floor(hash(i, j, 2) * 3) } : { t: 'tree', v: Math.floor(r * 4) };
  }
  return { coins: 3000, earned: 0, totalVisitors: 0, tiles, owned, bought: 0, pens: [], hatch: null, eggs: [], dinos: [], nextId: 1, quests: [], won: false, giant: false };
}
const T = (i, j) => (i < 0 || j < 0 || i >= N || j >= N) ? null : G.tiles[i * N + j];
const blockOf = (i, j) => [Math.floor(i / BLK), Math.floor(j / BLK)];
const isOwned = (i, j) => i >= 0 && j >= 0 && i < N && j < N && G.owned[Math.floor(i / BLK) * NB + Math.floor(j / BLK)];
const landPrice = () => 500 + G.bought * 400;
function buyable(bi, bj) {
  if (bi < 0 || bj < 0 || bi >= NB || bj >= NB || G.owned[bi * NB + bj]) return false;
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const x = bi + a, y = bj + b; return x >= 0 && y >= 0 && x < NB && y < NB && G.owned[x * NB + y]; });
}

// ---------- zvuk ----------
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f0, f1, dur, type = 'sine', vol = 0.15, delay = 0) {
  if (!sound || !audio()) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.2, freq = 800, delay = 0) {
  if (!sound || !audio()) return;
  const t = AC.currentTime + delay, len = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol; s.buffer = b;
  s.connect(f).connect(g).connect(AC.destination); s.start(t);
}
function roar(pitch) {
  if (!sound || !audio()) return;
  const t = AC.currentTime + 0.3, o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain();
  o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.setValueAtTime(110 * pitch, t); o.frequency.exponentialRampToValueAtTime(70 * pitch, t + 0.9);
  o2.frequency.setValueAtTime(167 * pitch, t); o2.frequency.exponentialRampToValueAtTime(98 * pitch, t + 0.9);
  lfo.frequency.value = 23; lg.gain.value = 18; lfo.connect(lg).connect(o.frequency);
  f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1400, t + 0.25); f.frequency.linearRampToValueAtTime(300, t + 0.95);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0008, t + 1);
  o.connect(f); o2.connect(f); f.connect(g).connect(AC.destination);
  [o, o2, lfo].forEach(x => { x.start(t); x.stop(t + 1.05); });
}
const SFX = {
  click: () => tone(900, 600, 0.05, 'triangle', 0.08),
  place: () => { tone(160, 60, 0.18, 'sine', 0.25); noise(0.12, 0.12, 600); },
  coin: () => { tone(1320, 1320, 0.07, 'square', 0.035); tone(1760, 1760, 0.12, 'square', 0.035, 0.06); },
  bad: () => tone(180, 140, 0.18, 'sawtooth', 0.06),
  hatch: sp => { noise(0.08, 0.25, 3000); noise(0.06, 0.2, 2500, 0.12); roar(S[sp].diet === 'maso' ? 0.9 : S[sp].size > 1 ? 0.7 : 1.3); },
  land: () => [392, 494, 587, 784].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.1, i * 0.08)),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.25, 'triangle', 0.12, i * 0.13))
};

// ---------- UI ----------
function buildToolbar() {
  const tb = $('toolbar');
  tb.innerHTML = TOOLS.map((t, k) => `<button class="tool" id="tool-${t.id}" data-t="${t.id}" aria-pressed="${t.id === tool}" title="${t.name} (${k + 1})">${ICONS[t.id]}<b>${t.name}</b><span>${t.label || (t.cost ? t.cost + ' mincí' : ' ')}</span></button>`).join('');
  tb.querySelectorAll('.tool').forEach(b => b.onclick = () => { setTool(b.dataset.t); SFX.click(); });
}
function toolHint(t) { return t === 'land' ? `Klikni na zarostlý pozemek vedle svého parku a kup ho. Další pozemek stojí ${landPrice().toLocaleString('cs-CZ')} mincí.` : TOOLS.find(x => x.id === t).hint; }
function setTool(t) { if (pick && t !== 'view') endPick(); tool = t; document.querySelectorAll('.tool').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t)); $('hint').textContent = toolHint(t); hideInfo(); }
let toastTimer;
function toast(msg, kind) { const el = $('toast'); el.textContent = msg; el.classList.toggle('bad', kind === 'bad'); el.classList.toggle('gold', kind === 'gold'); el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
function muteIcon() { $('mute').innerHTML = sound ? '<svg viewBox="0 0 24 24"><path d="M4 9 H8 L13 5 V19 L8 15 H4Z" fill="#3b2410"/><path d="M16 8 Q19 12 16 16 M18.5 5.5 Q23 12 18.5 18.5" stroke="#3b2410" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9 H8 L13 5 V19 L8 15 H4Z" fill="#3b2410"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="#d4503f" stroke-width="2.4" stroke-linecap="round"/></svg>'; $('mute').setAttribute('aria-label', sound ? 'Vypnout zvuk' : 'Zapnout zvuk'); }
$('mute').onclick = () => { sound = !sound; muteIcon(); };

const speciesCount = () => new Set(G.dinos.map(d => d.sp)).size;
function stars() {
  const trees = G.tiles.filter((t, k) => t.o && t.o.t === 'tree' && isOwned(Math.floor(k / N), k % N)).length;
  return Math.min(5, (G.dinos.length ? 0.5 : 0) + speciesCount() * 0.5 + Math.min(0.5, trees / 60) + Math.min(0.5, G.dinos.length / 30));
}
const QUESTS = [
  { t: 'Postav výběh pro dinosaury', ok: () => G.pens.length > 0 },
  { t: 'Postav líheň', ok: () => !!G.hatch },
  { t: 'Vylíhni prvního dinosaura', ok: () => G.dinos.length > 0 },
  { t: 'Propoj cestou vchod a výběh', ok: () => connectedPens().size > 0 },
  { t: 'Přivítej 25 návštěvníků', ok: () => G.totalVisitors >= 25 },
  { t: 'Kup nový pozemek', ok: () => G.bought > 0 },
  { t: 'Chovej 4 různé druhy', ok: () => speciesCount() >= 4 },
  { t: 'Vylíhni obra: brachiosaura nebo diplodoka', ok: () => G.dinos.some(d => CAT[d.sp].big) },
  { t: 'Chovej 8 různých druhů', ok: () => speciesCount() >= 8 },
  { t: 'Vydělej celkem 15 000 mincí', ok: () => G.earned >= 15000 }
];
let lastHud = '';
function updateHud() {
  QUESTS.forEach((q, k) => { if (!G.quests[k] && q.ok()) { G.quests[k] = true; toast('Úkol splněn: ' + q.t, 'gold'); SFX.coin(); } });
  const st = stars();
  CATALOG.forEach(c => { if (c.stars > 0 && st >= c.stars && !unlockedSeen.has(c.id)) { unlockedSeen.add(c.id); if (G.dinos.length) setTimeout(() => toast('Odemčen nový druh: ' + S[c.id].name + '!', 'gold'), 1200); } });
  const key = [Math.floor(G.coins), visitors.length, G.dinos.length, st, G.quests.join(), G.bought].join('|');
  if (key === lastHud) return; lastHud = key;
  $('sCoins').textContent = Math.floor(G.coins).toLocaleString('cs-CZ');
  $('sVis').textContent = visitors.length;
  $('sDino').textContent = G.dinos.length;
  $('sSpec').textContent = speciesCount() + ' / ' + CATALOG.length;
  const full = Math.floor(st), half = st - full >= 0.5;
  $('sStars').innerHTML = '★'.repeat(full) + (half ? '<span style="opacity:.55">★</span>' : '') + '<span class="off">' + '★'.repeat(5 - full - (half ? 1 : 0)) + '</span>';
  const done = QUESTS.filter((q, k) => G.quests[k]).length;
  $('qCount').textContent = done + ' / ' + QUESTS.length;
  const firstOpen = QUESTS.findIndex((q, k) => !G.quests[k]);
  $('questList').innerHTML = QUESTS.map((q, k) => `<li class="${G.quests[k] ? 'done' : k === firstOpen ? 'now' : ''}"><span class="ck">${G.quests[k] ? '✓' : ''}</span>${q.t}</li>`).join('');
  if (tool === 'land') $('hint').textContent = toolHint('land');
  if (!G.won && QUESTS.every((q, k) => G.quests[k])) {
    G.won = true; SFX.win(); burst(...pos(GATE[0] + 0.5, GATE[1] + 0.5), 60, true);
    $('wDino').firstChild.nodeValue = G.dinos.length; $('wSpec').firstChild.nodeValue = speciesCount(); $('wVis').firstChild.nodeValue = G.totalVisitors;
    setTimeout(() => $('winModal').classList.add('open'), 900);
  }
}
$('wGo').onclick = () => $('winModal').classList.remove('open');

// ---------- logika ----------
function spend(c) { if (G.coins < c) { toast('Nemáš dost mincí (chybí ' + Math.ceil(c - G.coins) + ').', 'bad'); SFX.bad(); return false; } G.coins -= c; return true; }
function earn(c, x, y) { G.coins += c; G.earned += c; if (x != null) parts.push({ type: 'txt', x, y, vy: -26, life: 1.4, max: 1.4, text: '+' + c }); }
function free(i, j) { const t = T(i, j); return t && t.g === 'grass' && !t.o && isOwned(i, j); }
const penSize = kind => kind === 'bigpen' ? 5 : kind === 'pen' ? 3 : kind === 'hatch' ? 2 : 1;
function canPlace(kind, i, j) {
  if (kind === 'path') { const t = T(i, j); return !!t && isOwned(i, j) && !t.o && (t.g === 'grass' || t.g === 'water' || t.g === 'ash'); }
  if (kind === 'tree') return free(i, j);
  const n = penSize(kind);
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (!free(i + a, j + b)) return false;
  if (kind === 'hatch' && G.hatch) return false;
  return true;
}
function anchor(kind, i, j) { const n = penSize(kind); return n === 3 ? [i - 1, j - 1] : n === 5 ? [i - 2, j - 2] : [i, j]; }
function place(kind, i, j, silent) {
  const tl = TOOLS.find(t => t.id === kind);
  if (kind === 'hatch' && G.hatch) { if (!silent) { toast('Líheň už máš. Klikni na ni a vylíhni vejce.', 'bad'); SFX.bad(); } return; }
  if (!canPlace(kind, i, j)) {
    if (!silent) { toast(!isOwned(i, j) ? 'Tenhle pozemek ještě není tvůj. Kup ho nástrojem Pozemek.' : 'Sem se to nevejde.', 'bad'); SFX.bad(); }
    return;
  }
  const t = T(i, j);
  let cost = tl.cost; if (kind === 'path' && t.g === 'water') cost = 40;
  if (!spend(cost)) return;
  if (kind === 'path') t.g = t.g === 'water' ? 'bridge' : 'path';
  if (kind === 'tree') t.o = { t: 'tree', v: Math.floor(Math.random() * 4) };
  if (kind === 'pen' || kind === 'bigpen') {
    const n = penSize(kind), id = G.pens.length ? Math.max(...G.pens.map(p => p.id)) + 1 : 1;
    G.pens.push({ id, i, j, n });
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { T(i + a, j + b).g = 'pen'; T(i + a, j + b).pen = id; }
  }
  if (kind === 'hatch') {
    G.hatch = { i, j };
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) T(i + a, j + b).o = { t: a === 1 && b === 1 ? 'hatch' : 'hatchpart' };
  }
  groundDirty = true;
  const [x, y] = pos(i + 0.5, j + 0.5);
  burst(x, y, kind === 'path' ? 4 : 14);
  SFX.place();
}
function buyLand(i, j) {
  const [bi, bj] = blockOf(i, j);
  if (bi < 0 || bj < 0 || bi >= NB || bj >= NB) return;
  if (G.owned[bi * NB + bj]) { toast('Tenhle pozemek už je tvůj.', 'bad'); SFX.bad(); return; }
  if (!buyable(bi, bj)) { toast('Kupovat jde jen pozemek, který sousedí s tvým parkem.', 'bad'); SFX.bad(); return; }
  if (!spend(landPrice())) return;
  G.owned[bi * NB + bj] = true; G.bought++; groundDirty = true;
  const [x, y] = pos(bi * BLK + BLK / 2, bj * BLK + BLK / 2); burst(x, y, 50, true);
  SFX.land(); toast('Ostrov se rozrostl! Nový pozemek je tvůj.', 'gold'); saveSoon();
  $('hint').textContent = toolHint('land');
}
function bulldoze(i, j) {
  const t = T(i, j); if (!t || !isOwned(i, j)) return;
  if (t.o && (t.o.t === 'tree' || t.o.t === 'rock')) { t.o = null; SFX.place(); groundDirty = true; return; }
  if (t.o && (t.o.t === 'hatch' || t.o.t === 'hatchpart')) {
    if (G.eggs.length) { toast('V líhni se líhnou vejce. Počkej.', 'bad'); SFX.bad(); return; }
    const h = G.hatch; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) T(h.i + a, h.j + b).o = null; G.hatch = null; G.coins += 250; SFX.place(); groundDirty = true; return;
  }
  if (t.g === 'bridge') { t.g = 'water'; SFX.place(); groundDirty = true; return; }
  if (t.g === 'path') { if (i === GATE[0] && j === GATE[1]) { toast('Vchod zbourat nejde.', 'bad'); SFX.bad(); return; } t.g = 'grass'; SFX.place(); groundDirty = true; return; }
  if (t.g === 'pen') {
    const p = G.pens.find(p => p.id === t.pen);
    if (G.dinos.some(d => d.pen === p.id) || G.eggs.some(e => e.pen === p.id)) { toast('Ve výběhu jsou dinosauři.', 'bad'); SFX.bad(); return; }
    for (let a = 0; a < p.n; a++) for (let b = 0; b < p.n; b++) { T(p.i + a, p.j + b).g = 'grass'; T(p.i + a, p.j + b).pen = -1; }
    G.pens = G.pens.filter(x => x !== p); G.coins += p.n === 5 ? 400 : 150; SFX.place(); groundDirty = true;
  }
}
const walkable = t => t && (t.g === 'path' || t.g === 'bridge');
function pathNeighbors(i, j) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [i + a, j + b]).filter(([a, b]) => walkable(T(a, b))); }
function connectedPens() {
  const seen = new Set([GATE[0] * N + GATE[1]]), q = [GATE], pens = new Set();
  while (q.length) {
    const [i, j] = q.shift();
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const t = T(i + a, j + b); if (t && t.g === 'pen' && G.dinos.some(d => d.pen === t.pen)) pens.add(t.pen); }
    for (const [a, b] of pathNeighbors(i, j)) { const k = a * N + b; if (!seen.has(k)) { seen.add(k); q.push([a, b]); } }
  }
  return pens;
}
const capOf = p => p.n === 5 ? 6 : 3;
function penInfo(p, skipId) {
  const sps = G.dinos.filter(d => d.pen === p.id && d.id !== skipId).map(d => d.sp).concat(G.eggs.filter(e => e.pen === p.id).map(e => e.sp));
  return { count: sps.length, cap: capOf(p), diet: sps.length ? S[sps[0]].diet : null, sp: sps.find(x => S[x].diet === 'maso') || null };
}
function penProblem(p, spId, skipId) {
  const I = penInfo(p, skipId), sp = S[spId];
  if (CAT[spId].big && p.n !== 5) return 'Obr se vejde jen do velkého výběhu 5 × 5.';
  if (I.count >= I.cap) return 'Výběh č. ' + p.id + ' je plný (' + I.count + '/' + I.cap + ').';
  if (I.diet && I.diet !== sp.diet) return sp.diet === 'maso' ? 'Masožravec by tady býložravce snědl!' : 'Tady žijí masožravci. Býložravec by tu nepřežil.';
  if (sp.diet === 'maso' && I.sp && I.sp !== spId) return 'Různí masožravci by se poprali. Sem patří jen ' + S[I.sp].name + '.';
  return null;
}
const anyPen = (spId, skipId, notId) => G.pens.some(p => p.id !== notId && !penProblem(p, spId, skipId));
function buyEgg(c) {
  if (!G.hatch) return;
  if (stars() < c.stars) { toast('Tenhle druh se odemkne při ' + c.stars + ' hvězdách.', 'bad'); SFX.bad(); return; }
  if (G.eggs.length >= 3) { toast('Líheň je plná, počkej až se vejce vylíhnou.', 'bad'); SFX.bad(); return; }
  if (!G.pens.length) { toast('Nejdřív postav výběh.', 'bad'); SFX.bad(); return; }
  if (!anyPen(c.id)) { toast(c.big ? 'Obr potřebuje velký výběh 5 × 5 s volným místem.' : 'Pro tenhle druh nemá žádný výběh místo. Postav další.', 'bad'); SFX.bad(); return; }
  if (G.coins < c.price) { toast('Nemáš dost mincí (chybí ' + Math.ceil(c.price - G.coins) + ').', 'bad'); SFX.bad(); return; }
  $('hatchModal').classList.remove('open');
  startPick({ kind: 'egg', sp: c.id });
}
function pickSp() { return pick && (pick.kind === 'egg' ? pick.sp : (G.dinos.find(d => d.id === pick.dino) || {}).sp); }
function startPick(pk) {
  setTool('view'); pick = pk; SFX.click();
  const sp = S[pickSp()];
  $('pickTxt').textContent = pk.kind === 'egg' ? `Kam má jít ${sp.name}? Klikni na zelený výběh.` : `Kam přestěhovat ${sp.name}? Klikni na zelený výběh.`;
  $('pickbar').hidden = false; $('hint').textContent = 'Zelené výběhy jsou volné, červené ne. Esc nebo pravé tlačítko zruší výběr.';
}
function endPick() { pick = null; $('pickbar').hidden = true; $('hint').textContent = toolHint(tool); }
function pickPen(p) {
  const spId = pickSp(); if (!spId) { endPick(); return; }
  const prob = penProblem(p, spId, pick.kind === 'move' ? pick.dino : null);
  if (pick.kind === 'move' && G.dinos.find(d => d.id === pick.dino).pen === p.id) { toast('Tady už bydlí. Vyber jiný výběh.', 'bad'); SFX.bad(); return; }
  if (prob) { toast(prob, 'bad'); SFX.bad(); return; }
  if (pick.kind === 'egg') {
    const c = CAT[spId]; if (!spend(c.price)) { endPick(); return; }
    G.eggs.push({ sp: spId, pen: p.id, t: 0, total: c.time });
    toast('Vejce ' + S[spId].name + ' se zahřívá v líhni. Pak poputuje do výběhu č. ' + p.id + '.'); SFX.coin();
  } else {
    const d = G.dinos.find(x => x.id === pick.dino);
    const [ox, oy] = pos(d.fi, d.fj); burst(ox, oy - 20, 20, true);
    d.pen = p.id; d.fi = d.tx = p.i + p.n / 2; d.fj = d.ty = p.j + p.n / 2; d.st = 'idle'; d.timer = 1;
    const [x, y] = pos(d.fi, d.fj); burst(x, y - 20, 26, true);
    SFX.place(); toast(S[d.sp].name + ' se přestěhoval do výběhu č. ' + p.id + '.');
  }
  endPick(); saveSoon();
}
function hatchEgg(e) {
  const p = G.pens.find(p => p.id === e.pen); if (!p) return;
  const fi = p.i + p.n / 2, fj = p.j + p.n / 2;
  G.dinos.push({ id: G.nextId++, sp: e.sp, pen: p.id, fi, fj, tx: fi, ty: fj, ph: Math.random() * 6, st: 'idle', timer: 1, flip: Math.random() < 0.5 });
  const [x, y] = pos(fi, fj); burst(x, y - 20, 34, true);
  const h = G.hatch; if (h) { const [hx, hy] = pos(h.i + 1, h.j + 1); burst(hx, hy - 30, 20, true); }
  SFX.hatch(e.sp); toast('Vylíhl se ' + S[e.sp].name + '!'); saveSoon();
}

// ---------- návštěvníci ----------
const SHIRTS = ['#e85d4a', '#3d8fd1', '#f2b93b', '#8c5ad1', '#3fae7a', '#ef7fa8', '#f08c2e', '#2f6d9a'];
const SKIN = ['#f3d2b3', '#e0b089', '#c88b5e', '#8d5a3b', '#f6dcc4'];
function spawnVisitor() {
  const [gi, gj] = GATE;
  visitors.push({ i: gi, j: gj, ni: gi, nj: gj, p: 1, prev: null, life: 34 + Math.floor(Math.random() * 30), st: 'walk', wt: 0, watched: new Set(), fade: 1,
    shirt: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], skin: SKIN[Math.floor(Math.random() * SKIN.length)], hat: Math.random() < 0.45 ? (Math.random() < 0.6 ? 'safari' : 'cap') : null, sp: 1.1 + Math.random() * 0.5, ph: Math.random() * 6 });
  G.totalVisitors++;
  const [x, y] = pos(gi + 0.5, gj + 0.5); earn(8, x, y - 30);
}
let spawnT = 3;
function stepVisitors(dt) {
  if (walkable(T(...GATE))) {
    spawnT -= dt;
    const interval = Math.max(0.9, 9 - stars() * 1.6);
    if (spawnT <= 0 && visitors.length < 80) { spawnT = interval * (0.7 + Math.random() * 0.6); spawnVisitor(); }
  }
  for (const v of visitors) {
    v.ph += dt * 9;
    if (v.st === 'leave') { v.fade -= dt * 1.2; continue; }
    if (v.st === 'watch') {
      v.wt -= dt;
      if (v.wt <= 0) { v.st = 'walk'; const [x, y] = pos(v.i + 0.5, v.j + 0.5); earn(v.pay, x, y - 30); parts.push({ type: 'heart', x, y: y - 26, vy: -20, life: 1.2, max: 1.2 }); if (Math.random() < 0.4) SFX.coin(); }
      continue;
    }
    v.p += dt * v.sp;
    if (v.p >= 1) {
      v.prev = [v.i, v.j]; v.i = v.ni; v.j = v.nj; v.p = 0; v.life--;
      if (!walkable(T(v.i, v.j)) || v.life <= 0) { v.st = 'leave'; continue; }
      let best = null, pay = 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const n = T(v.i + a, v.j + b);
        if (n && n.g === 'pen' && !v.watched.has(n.pen)) {
          const ds = G.dinos.filter(d => d.pen === n.pen);
          if (ds.length) { best = n.pen; pay = ds.reduce((s, d) => s + CAT[d.sp].appeal, 0) + new Set(ds.map(d => d.sp)).size * 2; }
        }
      }
      if (best != null) { v.watched.add(best); v.st = 'watch'; v.wt = 1.4 + Math.random() * 0.8; v.pay = pay; v.ni = v.i; v.nj = v.j; continue; }
      let nb = pathNeighbors(v.i, v.j);
      if (nb.length > 1 && v.prev) nb = nb.filter(([a, b]) => a !== v.prev[0] || b !== v.prev[1]);
      if (!nb.length) { v.st = 'leave'; continue; }
      const pick = nb[Math.floor(Math.random() * nb.length)];
      v.ni = pick[0]; v.nj = pick[1];
    }
  }
  visitors = visitors.filter(v => v.fade > 0);
}

// ---------- dinosauři ----------
function stepDinos(dt) {
  for (const d of G.dinos) {
    const p = G.pens.find(p => p.id === d.pen); if (!p) continue;
    d.timer -= dt;
    const fast = { raptor: 0.9, galli: 1.1, dilo: 0.8, carno: 0.75, pachy: 0.7 }[d.sp];
    const spd = fast || (S[d.sp].diet === 'maso' ? 0.55 : 0.4);
    if (d.st === 'walk') {
      const dx = d.tx - d.fi, dy = d.ty - d.fj, dist = Math.hypot(dx, dy);
      if (dist < 0.05) { d.st = Math.random() < 0.45 ? 'eat' : 'idle'; d.timer = 1.5 + Math.random() * 3; }
      else {
        const k = Math.min(dist, spd * dt); d.fi += dx / dist * k; d.fj += dy / dist * k; d.ph += k * 9;
        const sx = dx - dy; if (Math.abs(sx) > 0.02) d.flip = sx < 0;
      }
    } else if (d.timer <= 0) {
      d.tx = p.i + 0.4 + Math.random() * (p.n - 0.8); d.ty = p.j + 0.4 + Math.random() * (p.n - 0.8); d.st = 'walk';
    }
  }
}

// ---------- částice ----------
function burst(x, y, n, colorful) {
  const cols = colorful ? ['#ffd65a', '#ff8a5c', '#7fd1ff', '#b7f07a', '#ffffff'] : ['#d8c08a', '#a8c97a', '#ffffff'];
  for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 90; parts.push({ type: 'dot', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - 40, life: 0.6 + Math.random() * 0.7, max: 1.3, c: cols[k % cols.length], r: 1.5 + Math.random() * 2.5 }); }
}
function stepParts(dt) {
  for (const p of parts) { p.life -= dt; p.x += (p.vx || 0) * dt; p.y += p.vy * dt; if (p.type === 'dot') p.vy += 160 * dt; }
  parts = parts.filter(p => p.life > 0);
  if (Math.random() < dt * 0.12 && birds.length < 3) birds.push({ x: -80, y: 60 + Math.random() * H * 0.4, vx: 60 + Math.random() * 40, s: 0.7 + Math.random() * 0.5, ph: Math.random() * 6 });
  for (const b of birds) { b.x += b.vx * dt; b.ph += dt * 7; b.y += Math.sin(b.ph * 0.2) * 0.3; }
  birds = birds.filter(b => b.x < W + 100);
  for (const c of clouds) { c.x += 9 * dt; if (c.x > 1300) c.x = -1300; }
  const [vx, vy] = pos(VOLC[0] + 2, VOLC[1] + 2);
  if (Math.random() < dt * 3) smoke.push({ x: vx + (Math.random() - 0.5) * 20, y: vy - 150, r: 10 + Math.random() * 10, vy: -14 - Math.random() * 10, vx: 6 + Math.random() * 6, life: 6, max: 6 });
  for (const s of smoke) { s.life -= dt; s.y += s.vy * dt; s.x += s.vx * dt; s.r += dt * 7; }
  smoke = smoke.filter(s => s.life > 0);
}

// ---------- kreslení: zem ----------
function diamond(c, i, j, inset = 0) {
  const [x, y] = pos(i, j);
  c.beginPath(); c.moveTo(x, y + inset); c.lineTo(x + TW / 2 - inset * 2, y + TH / 2); c.lineTo(x, y + TH - inset); c.lineTo(x - TW / 2 + inset * 2, y + TH / 2); c.closePath();
}
const CACHE_S = 1.5, PADX = TW * N / 2 + 20, PADY = 20, CH = N * TH + SIDE + PADY * 2;
function edgePts(x, y) { return [[x, y], [x + TW / 2, y + TH / 2], [x, y + TH], [x - TW / 2, y + TH / 2]]; }
const EDGES = [[-1, 0, 3, 0], [0, -1, 0, 1], [1, 0, 1, 2], [0, 1, 2, 3]];
function buildGround() {
  if (!groundCache) { groundCache = document.createElement('canvas'); groundCache.width = Math.round(PADX * 2 * CACHE_S); groundCache.height = Math.round(CH * CACHE_S); }
  const c = groundCache.getContext('2d');
  c.setTransform(CACHE_S, 0, 0, CACHE_S, PADX * CACHE_S, PADY * CACHE_S);
  c.clearRect(-PADX, -PADY, PADX * 2, CH);
  const [lx, ly] = pos(0, N), [bx, by] = pos(N, N), [rx, ry] = pos(N, 0);
  const sideL = c.createLinearGradient(0, by, 0, by + SIDE); sideL.addColorStop(0, '#a5703f'); sideL.addColorStop(1, '#6e4526');
  c.fillStyle = sideL; c.beginPath(); c.moveTo(lx, ly); c.lineTo(bx, by); c.lineTo(bx, by + SIDE); c.lineTo(lx, ly + SIDE); c.fill();
  c.fillStyle = '#8a5a32'; c.beginPath(); c.moveTo(bx, by); c.lineTo(rx, ry); c.lineTo(rx, ry + SIDE); c.lineTo(bx, by + SIDE); c.fill();
  c.strokeStyle = 'rgba(60,35,15,0.35)'; c.lineWidth = 2;
  for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(lx, ly + k * 10); c.lineTo(bx, by + k * 10); c.lineTo(rx, ry + k * 10); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 80; k++) { const t = hash(k, 7), u = hash(k, 9); const onL = t < 0.5; const x0 = onL ? lx + (bx - lx) * u : bx + (rx - bx) * u; const y0 = (onL ? ly + (by - ly) * u : by + (ry - by) * u) + 6 + hash(k, 11) * (SIDE - 10); c.beginPath(); c.ellipse(x0, y0, 3 + hash(k, 2) * 4, 2, 0, 0, 7); c.fill(); }
  c.fillStyle = '#4f8a2d'; c.beginPath(); c.moveTo(lx, ly); c.lineTo(bx, by); c.lineTo(rx, ry); c.lineTo(rx, ry + 5); c.lineTo(bx, by + 5); c.lineTo(lx, ly + 5); c.fill();
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i; if (j < 0 || j >= N) continue;
    const t = T(i, j), h = hash(i, j), [x, y] = pos(i, j), pts = edgePts(x, y);
    if (t.g === 'water' || t.g === 'bridge') {
      diamond(c, i, j); c.fillStyle = '#3c8db3'; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.08)'; diamond(c, i, j, 4); c.fill();
      EDGES.forEach(([a, b, p0, p1]) => {
        const n = T(i + a, j + b); if (!n || n.g === 'water' || n.g === 'bridge') return;
        c.strokeStyle = '#e8d7a3'; c.lineWidth = 6; c.beginPath(); c.moveTo(...pts[p0]); c.lineTo(...pts[p1]); c.stroke();
        c.strokeStyle = '#d6f2f7'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(pts[p0][0], pts[p0][1] + 3); c.lineTo(pts[p1][0], pts[p1][1] + 3); c.stroke();
      });
      if (t.g === 'bridge') {
        diamond(c, i, j, 3); c.fillStyle = '#a8763e'; c.fill();
        c.strokeStyle = '#6b4421'; c.lineWidth = 1.2;
        for (let k = 1; k < 6; k++) { const q = k / 6; c.beginPath(); c.moveTo(x - TW / 2 * (1 - q) + 3, y + TH / 2 + TH / 2 * q - 1); c.lineTo(x + TW / 2 * q - 3, y + TH / 2 * q + 1); c.stroke(); }
        EDGES.forEach(([a, b, p0, p1]) => { const n = T(i + a, j + b); if (n && (walkable(n) || n.g === 'grass')) return; c.strokeStyle = '#5a3818'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(pts[p0][0], pts[p0][1] - 4); c.lineTo(pts[p1][0], pts[p1][1] - 4); c.stroke(); });
      }
    } else {
      const base = t.g === 'path' ? '#e3cc94' : t.g === 'road' ? '#8f8a7e' : t.g === 'ash' ? (h < 0.5 ? '#8a7d6a' : '#93856f') : t.g === 'pen' ? (h < 0.5 ? '#9cba62' : '#a3bf67') : (h < 0.33 ? '#7db449' : h < 0.66 ? '#77ad44' : '#84ba4f');
      diamond(c, i, j); c.fillStyle = base; c.fill();
      if (t.g === 'grass' || t.g === 'pen' || t.g === 'ash') {
        for (let k = 0; k < (t.g === 'ash' ? 3 : 7); k++) {
          const u = hash(i, j, k + 1), v = hash(j, i, k + 5);
          const px = x + (u - v) * TW / 2 * 0.8, py = y + TH / 2 + (u + v - 1) * TH / 2 * 0.8;
          c.strokeStyle = t.g === 'ash' ? '#6a5e4c' : k % 3 ? '#5f9433' : '#a3d468'; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(px, py); c.lineTo(px - 1.5, py - 4); c.moveTo(px, py); c.lineTo(px + 1.5, py - 3.5); c.stroke();
        }
        if (t.g === 'grass' && h > 0.9) { c.fillStyle = h > 0.95 ? '#fff6c8' : '#ffd0e0'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x - 8 + k * 7, y + 14 + (k % 2) * 4, 1.6, 0, 7); c.fill(); } }
        if (t.g === 'pen' && h > 0.6) { c.fillStyle = 'rgba(150,110,60,0.35)'; c.beginPath(); c.ellipse(x + (h - 0.8) * 30, y + TH / 2, 10, 4, 0, 0, 7); c.fill(); }
      }
      if (t.g === 'path') {
        c.fillStyle = 'rgba(160,125,70,0.45)';
        for (let k = 0; k < 6; k++) { const u = hash(i, j, k + 20), v = hash(j, i, k + 30); c.beginPath(); c.ellipse(x + (u - v) * 22, y + TH / 2 + (u + v - 1) * 10, 1.8, 1.1, 0, 0, 7); c.fill(); }
        EDGES.forEach(([a, b, p0, p1]) => { const n = T(i + a, j + b); if (walkable(n)) return; c.strokeStyle = '#b8995d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(...pts[p0]); c.lineTo(...pts[p1]); c.stroke(); });
      }
      if (t.g === 'road') { c.strokeStyle = '#efe6c8'; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(x - TW / 4, y + TH / 4); c.lineTo(x + TW / 4, y + TH * 3 / 4); c.stroke(); c.setLineDash([]); }
    }
    if (!isOwned(i, j)) { diamond(c, i, j); c.fillStyle = 'rgba(28,46,40,0.42)'; c.fill(); }
    else EDGES.forEach(([a, b, p0, p1]) => {
      if (!T(i + a, j + b) || isOwned(i + a, j + b)) return;
      c.strokeStyle = 'rgba(255,240,170,0.75)'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(...pts[p0]); c.lineTo(...pts[p1]); c.stroke(); c.setLineDash([]);
    });
  }
  buildMini();
  groundDirty = false;
}
function buildMini() {
  if (!miniCache) { miniCache = document.createElement('canvas'); miniCache.width = 420; miniCache.height = 224; }
  const c = miniCache.getContext('2d'), m = miniScale();
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 420, 224);
  c.setTransform(m.s, 0, 0, m.s, m.ox, m.oy);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const t = T(i, j);
    let col = { water: '#3c8db3', bridge: '#a8763e', path: '#f0dca6', road: '#8f8a7e', pen: '#c9a46a', ash: '#8a7d6a' }[t.g] || '#7db449';
    if (t.o && t.o.t === 'tree') col = '#3f7d2a'; if (t.o && t.o.t === 'volc') col = '#5a3a2a'; if (t.o && (t.o.t === 'hatch' || t.o.t === 'hatchpart')) col = '#bfe6f2';
    if (!isOwned(i, j)) col = DINO.mix(col, '#12281c', 0.45);
    diamond(c, i, j); c.fillStyle = col; c.fill();
  }
}
function miniScale() { const s = 400 / (N * TW); return { s, ox: 210, oy: (224 - N * TH * s) / 2 }; }

// ---------- kreslení: objekty ----------
function drawTree(c, x, y, v, t, seed) {
  const sw = Math.sin(t * 1.3 + seed * 10) * 0.035;
  const sc = 0.9 + hash(seed * 100, 3) * 0.3;
  c.fillStyle = 'rgba(20,40,10,0.28)'; c.beginPath(); c.ellipse(x + 5, y + 2, 17 * sc, 7 * sc, 0, 0, 7); c.fill();
  c.save(); c.translate(x, y); c.scale(sc, sc);
  if (v === 1) {
    c.rotate(sw);
    c.strokeStyle = '#7b5530'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-2, -26, 8, -50); c.stroke();
    c.strokeStyle = '#5c3d1f'; c.lineWidth = 1.2;
    for (let k = 1; k < 7; k++) { const q = k / 7, px = -2 * 2 * q * (1 - q) + 8 * q * q, py = -26 * 2 * q * (1 - q) - 50 * q * q; c.beginPath(); c.moveTo(px - 3, py); c.lineTo(px + 3, py + 1); c.stroke(); }
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.55 + Math.sin(t * 1.5 + k) * 0.04;
      c.save(); c.translate(8, -50); c.rotate(a + Math.PI / 2);
      c.fillStyle = k % 2 ? '#4f9a35' : '#66b043'; c.strokeStyle = '#2c5a1e'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -14, 2 + (k - 3) * 2, -30 + Math.abs(k - 3) * 4); c.quadraticCurveTo(-8, -12, 0, 0); c.fill(); c.stroke();
      c.restore();
    }
    c.fillStyle = '#6b4421'; [[5, -48], [11, -47], [8, -45]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 2.4, 0, 7); c.fill(); });
  } else if (v === 2) {
    c.fillStyle = '#6b4421'; c.fillRect(-2.5, -10, 5, 10);
    c.rotate(sw * 0.6);
    [[-16, -8, 16, '#2f6b33'], [-13, -22, 13, '#3a7d3c'], [-9, -36, 10, '#4a9046']].forEach(([w, yy, h, col]) => {
      c.fillStyle = col; c.strokeStyle = '#1d4521'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(w, yy); c.lineTo(0, yy - h - 10); c.lineTo(-w, yy); c.quadraticCurveTo(0, yy + 5, w, yy); c.fill(); c.stroke();
    });
  } else if (v === 3) {
    c.rotate(sw);
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI + 0.25 + k * (Math.PI - 0.5) / 8;
      c.save(); c.rotate(a + Math.PI / 2);
      c.fillStyle = k % 2 ? '#3f8a2a' : '#5aa43a'; c.strokeStyle = '#24501a'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(7, -10, 1, -22 + Math.abs(k - 4) * 1.5); c.quadraticCurveTo(-6, -10, 0, 0); c.fill(); c.stroke(); c.restore();
    }
  } else {
    c.fillStyle = '#6b4421'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-2, -22); c.lineTo(2, -22); c.lineTo(3, 0); c.fill();
    c.rotate(sw);
    const blobs = [[-9, -28, 12], [9, -30, 12], [0, -40, 14], [-2, -25, 11]];
    blobs.forEach(([a, b, r]) => { c.fillStyle = '#2c5a1e'; c.beginPath(); c.arc(a, b, r + 1.5, 0, 7); c.fill(); });
    blobs.forEach(([a, b, r]) => { const g = c.createRadialGradient(a - r * 0.4, b - r * 0.5, 1, a, b, r); g.addColorStop(0, '#9edb62'); g.addColorStop(1, '#3f7d2a'); c.fillStyle = g; c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); });
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.arc(-4, -45, 4, 0, 7); c.fill();
  }
  c.restore();
}
function drawRock(c, x, y, v) {
  c.fillStyle = 'rgba(20,30,10,0.25)'; c.beginPath(); c.ellipse(x + 3, y + 2, 14, 5, 0, 0, 7); c.fill();
  const s = 0.8 + v * 0.2;
  const g = c.createLinearGradient(x, y - 18 * s, x, y);
  g.addColorStop(0, '#c4c0b2'); g.addColorStop(1, '#7c786c');
  c.fillStyle = g; c.strokeStyle = '#4c4a42'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x - 13 * s, y); c.quadraticCurveTo(x - 14 * s, y - 12 * s, x - 3 * s, y - 17 * s); c.quadraticCurveTo(x + 10 * s, y - 18 * s, x + 13 * s, y - 4 * s); c.quadraticCurveTo(x + 12 * s, y + 2, x - 13 * s, y); c.fill(); c.stroke();
  c.fillStyle = '#6c9a3a'; c.beginPath(); c.ellipse(x - 4 * s, y - 15 * s, 5 * s, 2.5 * s, -0.3, 0, 7); c.fill();
}
function drawVolcano(c, t) {
  const [cx, cy] = pos(VOLC[0] + 2, VOLC[1] + 2);
  const by = cy + 22;
  c.fillStyle = 'rgba(30,20,10,0.3)'; c.beginPath(); c.ellipse(cx + 10, by, 140, 50, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(cx - 130, 0, cx + 130, 0);
  g.addColorStop(0, '#5a3f2e'); g.addColorStop(0.45, '#8a6248'); g.addColorStop(1, '#3e2a1e');
  c.fillStyle = g; c.strokeStyle = '#2a1a10'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(cx - 135, by); c.quadraticCurveTo(cx - 70, by - 40, cx - 34, cy - 140); c.lineTo(cx + 34, cy - 140); c.quadraticCurveTo(cx + 70, by - 40, cx + 135, by); c.quadraticCurveTo(cx, by + 30, cx - 135, by); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(40,25,15,0.45)'; c.lineWidth = 2;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(cx + k * 9, cy - 136); c.quadraticCurveTo(cx + k * 22, by - 50, cx + k * 36, by + 8); c.stroke(); }
  const glow = 0.75 + Math.sin(t * 3) * 0.15;
  c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(cx, cy - 140, 34, 9, 0, 0, 7); c.fill();
  c.fillStyle = `rgba(255,${120 + glow * 60},40,${glow})`; c.beginPath(); c.ellipse(cx, cy - 139, 26, 6, 0, 0, 7); c.fill();
  c.strokeStyle = `rgba(255,110,30,${0.75 + Math.sin(t * 2) * 0.2})`; c.lineWidth = 4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - 8, cy - 134); c.quadraticCurveTo(cx - 22, cy - 90, cx - 40, cy - 40); c.stroke();
  c.beginPath(); c.moveTo(cx + 12, cy - 134); c.quadraticCurveTo(cx + 18, cy - 100, cx + 30, cy - 70); c.stroke();
  c.strokeStyle = 'rgba(255,220,120,0.6)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(cx - 8, cy - 134); c.quadraticCurveTo(cx - 22, cy - 90, cx - 40, cy - 40); c.stroke();
}
function fenceSeg(c, a0, b0, a1, b1, meat) {
  const [x0, y0] = pos(a0, b0), [x1, y1] = pos(a1, b1);
  const post = (x, y) => {
    if (meat) { c.fillStyle = '#5d646b'; c.fillRect(x - 2, y - 30, 4, 30); c.fillStyle = '#9aa3ab'; c.fillRect(x - 2, y - 30, 2, 30); c.fillStyle = '#e94b3c'; c.fillRect(x - 2.5, y - 33, 5, 3); }
    else { c.fillStyle = '#6b4421'; c.fillRect(x - 2.5, y - 24, 5, 24); c.fillStyle = '#9a6a38'; c.fillRect(x - 2.5, y - 24, 2, 24); c.fillStyle = '#c99a62'; c.beginPath(); c.ellipse(x, y - 24, 2.5, 1.3, 0, 0, 7); c.fill(); }
  };
  post(x0, y0);
  if (meat) {
    c.strokeStyle = '#2f3438'; c.lineWidth = 1;
    for (const h of [8, 15, 22, 28]) { c.beginPath(); c.moveTo(x0, y0 - h); c.lineTo(x1, y1 - h); c.stroke(); }
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(mx, my - 22); c.lineTo(mx + 5, my - 13); c.lineTo(mx - 5, my - 13); c.closePath(); c.fill();
    c.fillStyle = '#2b1d0e'; c.fillRect(mx - 0.6, my - 20, 1.2, 4);
  } else {
    for (const h of [9, 18]) {
      c.strokeStyle = '#5a3818'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(x0, y0 - h); c.lineTo(x1, y1 - h); c.stroke();
      c.strokeStyle = '#a8763e'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, y0 - h - 0.5); c.lineTo(x1, y1 - h - 0.5); c.stroke();
    }
  }
  post(x1, y1);
}
function drawHatchery(c, h, t) {
  const [cx, cy] = pos(h.i + 1, h.j + 1);
  const P = [pos(h.i + 0.12, h.j + 0.12), pos(h.i + 1.88, h.j + 0.12), pos(h.i + 1.88, h.j + 1.88), pos(h.i + 0.12, h.j + 1.88)];
  const up = 7;
  c.fillStyle = '#9b958a'; c.beginPath(); c.moveTo(P[3][0], P[3][1] - up); c.lineTo(P[2][0], P[2][1] - up); c.lineTo(P[2][0], P[2][1]); c.lineTo(P[3][0], P[3][1]); c.fill();
  c.fillStyle = '#857f74'; c.beginPath(); c.moveTo(P[2][0], P[2][1] - up); c.lineTo(P[1][0], P[1][1] - up); c.lineTo(P[1][0], P[1][1]); c.lineTo(P[2][0], P[2][1]); c.fill();
  c.fillStyle = '#ddd7c9'; c.beginPath(); P.forEach(([x, y], k) => k ? c.lineTo(x, y - up) : c.moveTo(x, y - up)); c.closePath(); c.fill();
  c.strokeStyle = '#b7af9f'; c.lineWidth = 1; c.stroke();
  const by = cy - up, rx = 44, ry = 21, dh = 52;
  c.fillStyle = '#5f8f7a'; c.beginPath(); c.ellipse(cx, by, rx, ry, 0, 0, 7); c.fill();
  c.fillStyle = '#c6a46b'; c.beginPath(); c.ellipse(cx, by + 2, 20, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#a3824f'; c.beginPath(); c.ellipse(cx, by + 1, 15, 6, 0, 0, 7); c.fill();
  G.eggs.forEach((e, k) => {
    const ex = cx - 10 + k * 10, ey = by - 2 + (k % 2) * 3;
    const w = Math.sin(t * (6 + e.t / e.total * 20)) * (0.1 + e.t / e.total * 0.25);
    c.save(); c.translate(ex, ey); c.rotate(w);
    const g = c.createRadialGradient(-2, -9, 1, 0, -6, 10); g.addColorStop(0, '#fffdf3'); g.addColorStop(1, S[e.sp].colors.belly);
    c.fillStyle = g; c.strokeStyle = '#6e5733'; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(0, -6, 5, 7, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = DINO.rgba(S[e.sp].colors.pattern, 0.55); [[-2, -8], [2, -4], [1, -10]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 1.1, 0, 7); c.fill(); });
    c.restore();
  });
  const gl = c.createLinearGradient(cx - rx, by - dh, cx + rx, by);
  gl.addColorStop(0, 'rgba(225,248,255,0.75)'); gl.addColorStop(0.5, 'rgba(160,215,235,0.45)'); gl.addColorStop(1, 'rgba(110,170,200,0.6)');
  c.fillStyle = gl; c.beginPath(); c.moveTo(cx - rx, by); c.bezierCurveTo(cx - rx, by - dh * 1.25, cx + rx, by - dh * 1.25, cx + rx, by); c.ellipse(cx, by, rx, ry, 0, 0, Math.PI); c.fill();
  c.strokeStyle = '#4a5a60'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - rx, by); c.bezierCurveTo(cx - rx, by - dh * 1.25, cx + rx, by - dh * 1.25, cx + rx, by); c.stroke();
  c.lineWidth = 1.2; c.strokeStyle = 'rgba(70,90,96,0.7)';
  [-0.5, 0, 0.5].forEach(k => { c.beginPath(); c.moveTo(cx + k * rx * 0.9, by + ry * Math.sqrt(1 - k * k * 0.81)); c.quadraticCurveTo(cx + k * rx * 1.05, by - dh * 0.8, cx, by - dh * 0.93); c.stroke(); });
  c.beginPath(); c.ellipse(cx, by - dh * 0.45, rx * 0.85, ry * 0.7, 0, Math.PI, 0); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 3; c.beginPath(); c.arc(cx - 12, by - 24, 22, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
  c.strokeStyle = '#4a5a60'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, by, rx, ry, 0, 0, Math.PI); c.stroke();
  c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, by - dh * 0.93); c.lineTo(cx, by - dh - 12); c.stroke();
  c.fillStyle = Math.sin(t * 4) > 0 ? '#ff4d3d' : '#7a2018'; c.beginPath(); c.arc(cx, by - dh - 13, 2.6, 0, 7); c.fill();
  c.save(); c.translate(cx + 6, by + ry - 2); c.transform(1, -0.5, 0, 1, 0, 0);
  c.fillStyle = '#2f6b3a'; c.fillRect(-2, -5, 36, 13); c.fillStyle = '#fff5df'; let hf = 9; c.font = hf + 'px "Lilita One", sans-serif'; while (c.measureText('LÍHEŇ').width > 30 && hf > 5) { hf -= 0.5; c.font = hf + 'px "Lilita One", sans-serif'; } c.textAlign = 'center'; c.fillText('LÍHEŇ', 16, 5); c.restore();
  if (G.eggs.length) {
    const e = G.eggs[0], k = e.t / e.total;
    c.fillStyle = '#fff5df'; c.strokeStyle = '#3b2410'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx + 34, by - dh - 4, 9, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = '#5f9b3a'; c.lineWidth = 4; c.beginPath(); c.arc(cx + 34, by - dh - 4, 6, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke();
  }
}
function drawGate(c, t) {
  const [gi, gj] = GATE;
  const [x0, y0] = pos(gi - 0.35, gj + 1), [x1, y1] = pos(gi + 1.35, gj + 1);
  const hgt = 52;
  const log = (x, y) => {
    c.fillStyle = 'rgba(20,30,10,0.3)'; c.beginPath(); c.ellipse(x + 3, y + 1, 8, 3, 0, 0, 7); c.fill();
    const g = c.createLinearGradient(x - 5, 0, x + 5, 0); g.addColorStop(0, '#5a3818'); g.addColorStop(0.4, '#a8763e'); g.addColorStop(1, '#5a3818');
    c.fillStyle = g; c.fillRect(x - 5, y - hgt, 10, hgt);
    c.fillStyle = '#c99a62'; c.beginPath(); c.ellipse(x, y - hgt, 5, 2.4, 0, 0, 7); c.fill();
    c.fillStyle = '#ffb23f'; c.beginPath(); c.arc(x, y - hgt - 6 + Math.sin(t * 9 + x) * 0.8, 3.4 + Math.sin(t * 13 + x) * 0.6, 0, 7); c.fill();
    c.fillStyle = '#fff1a8'; c.beginPath(); c.arc(x, y - hgt - 5, 1.6, 0, 7); c.fill();
  };
  log(x0, y0);
  c.save(); c.translate(x0, y0 - hgt + 4); c.transform(1, 0.5, 0, 1, 0, 0);
  const wdt = x1 - x0;
  c.fillStyle = '#5a3818'; c.fillRect(-4, -2, wdt + 8, 19);
  c.fillStyle = '#ffd65a'; c.fillRect(-2, 0, wdt + 4, 15);
  c.fillStyle = '#3b2410'; c.textAlign = 'center'; let fs = 13; c.font = fs + 'px "Lilita One", sans-serif'; while (c.measureText('DINOPARK').width > wdt - 4 && fs > 6) { fs -= 0.5; c.font = fs + 'px "Lilita One", sans-serif'; } c.fillText('DINOPARK', wdt / 2, 7.5 + fs * 0.35);
  c.restore();
  log(x1, y1);
}
function drawSaleSign(c, bi, bj) {
  const [x, y] = pos(bi * BLK + BLK / 2, bj * BLK + BLK / 2);
  c.fillStyle = 'rgba(20,30,10,0.3)'; c.beginPath(); c.ellipse(x + 3, y + 1, 9, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#6b4421'; c.fillRect(x - 2.5, y - 34, 5, 34);
  c.fillStyle = '#5a3818'; c.fillRect(x - 31, y - 52, 62, 26);
  c.fillStyle = '#ffd65a'; c.fillRect(x - 29, y - 50, 58, 22);
  c.textAlign = 'center'; c.fillStyle = '#3b2410';
  c.font = '10px "Lilita One", sans-serif'; c.fillText('NA PRODEJ', x, y - 40);
  c.font = '800 9px "Baloo 2", sans-serif'; c.fillText(landPrice().toLocaleString('cs-CZ') + ' mincí', x, y - 31);
}
function drawPenSign(c, p, t) {
  const [x, y] = pos(p.i + p.n, p.j + p.n), I = penInfo(p);
  const sy = y + 4, ok = pick && !penProblem(p, pickSp(), pick.kind === 'move' ? pick.dino : null) && !(pick.kind === 'move' && G.dinos.find(d => d.id === pick.dino)?.pen === p.id);
  c.fillStyle = '#6b4421'; c.fillRect(x - 1.5, sy - 16, 3, 16);
  c.fillStyle = pick ? (ok ? '#5f9b3a' : '#d4503f') : '#5a3818';
  c.beginPath(); c.roundRect(x - 17, sy - 34, 34, 20, 5); c.fill();
  c.fillStyle = '#fff5df'; c.textAlign = 'center';
  c.font = '11px "Lilita One", sans-serif'; c.fillText('č. ' + p.id, x, sy - 25);
  c.font = '800 8.5px "Baloo 2", sans-serif'; c.fillText(I.count + ' / ' + I.cap, x, sy - 16.5);
}
function drawVisitor(c, v, t) {
  const fi = v.i + (v.ni - v.i) * v.p + 0.5, fj = v.j + (v.nj - v.j) * v.p + 0.5;
  let [x, y] = pos(fi, fj);
  const off = ((v.ph * 13) % 7) - 3.5; x += off * 0.6; y += off * 0.25;
  c.globalAlpha = Math.max(0, v.fade);
  const walking = v.st === 'walk', sw = walking ? Math.sin(v.ph) * 2.2 : 0;
  c.fillStyle = 'rgba(20,30,10,0.3)'; c.beginPath(); c.ellipse(x, y, 5, 2, 0, 0, 7); c.fill();
  c.strokeStyle = '#3a3a48'; c.lineWidth = 2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - 1.5, y - 7); c.lineTo(x - 1.5 + sw * 0.6, y - 0.5); c.moveTo(x + 1.5, y - 7); c.lineTo(x + 1.5 - sw * 0.6, y - 0.5); c.stroke();
  const bob = walking ? Math.abs(Math.sin(v.ph)) * 0.8 : 0;
  c.fillStyle = v.shirt; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1;
  c.beginPath(); c.roundRect(x - 4, y - 16 - bob, 8, 10, 3); c.fill(); c.stroke();
  c.fillStyle = v.skin; c.beginPath(); c.arc(x, y - 19.5 - bob, 3.6, 0, 7); c.fill(); c.stroke();
  if (v.hat === 'safari') { c.fillStyle = '#d9c28a'; c.beginPath(); c.ellipse(x, y - 21.5 - bob, 5.5, 1.6, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - 22 - bob, 3, Math.PI, 0); c.fill(); }
  else if (v.hat === 'cap') { c.fillStyle = '#d4503f'; c.beginPath(); c.arc(x, y - 21 - bob, 3.6, Math.PI, 0); c.fill(); c.fillRect(x, y - 21.5 - bob, 5, 1.5); }
  if (v.st === 'watch') {
    c.fillStyle = '#2b2b33'; c.fillRect(x - 3, y - 15, 6, 4);
    if (Math.sin(t * 7 + v.ph) > 0.92) { c.fillStyle = 'rgba(255,255,240,0.95)'; c.beginPath(); c.arc(x, y - 14, 5, 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
}
function heart(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.4, x, y - s * 0.4); c.bezierCurveTo(x + s * 0.6, y - s * 1.4, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); c.fill(); }

function drawBackdrop(t) {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 50, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  g.addColorStop(0, '#5f9e7c'); g.addColorStop(0.55, '#2d6045'); g.addColorStop(1, '#122a1c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.16;
  for (let k = 0; k < 7; k++) { const x = ((k * 241 + t * 6) % (W + 400)) - 200, y = H * (0.1 + (k % 4) * 0.22); ctx.fillStyle = '#e6fff2'; ctx.beginPath(); ctx.ellipse(x, y, 120, 26, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  const water = ctx.createLinearGradient(0, H * 0.2, 0, H);
  water.addColorStop(0, 'rgba(70,150,170,0)'); water.addColorStop(1, 'rgba(40,110,140,0.55)');
  ctx.fillStyle = water; ctx.fillRect(0, 0, W, H);
}
function drawFoliage(t) {
  const leaf = (x, y, len, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.sin(t * 0.8 + x * 0.01) * 0.03);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.95, 0); ctx.stroke();
    ctx.restore();
  };
  const cols = ['#0f2618', '#173a24', '#1f4a2d'];
  [[0, H, -0.6], [0, H, -1.0], [0, H, -0.25], [W, H, -2.5], [W, H, -2.1], [W, H, -2.9], [0, 0, 0.5], [0, 0, 0.95], [W, 0, 2.6], [W, 0, 2.2]].forEach(([x, y, a], k) => leaf(x, y, 150 + (k % 3) * 45, a, cols[k % 3]));
}
function drawBird(b) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b.s, b.s);
  const f = Math.sin(b.ph) * 10;
  ctx.fillStyle = '#1d2b22';
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-6, -2, 0, -1); ctx.lineTo(14, -4); ctx.lineTo(4, 1); ctx.quadraticCurveTo(-4, 3, -14, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, -1); ctx.quadraticCurveTo(-14, -8 - f, -30, -2 - f * 1.4); ctx.quadraticCurveTo(-14, 1, -2, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, -1); ctx.quadraticCurveTo(10, -10 - f, 22, -4 - f * 1.4); ctx.quadraticCurveTo(10, 0, 0, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11, -4); ctx.lineTo(5, -9); ctx.lineTo(9, -3); ctx.fill();
  ctx.restore();
}

function visible(x, y, mx = 160, top = 260) { const sx = x * cam.z + cam.x, sy = y * cam.z + cam.y; return sx > -mx * cam.z && sx < W + mx * cam.z && sy > -40 * cam.z && sy < H + top * cam.z; }
function blockOutline(bi, bj) { const n = BLK, i = bi * n, j = bj * n; return [pos(i, j), pos(i + n, j), pos(i + n, j + n), pos(i, j + n)]; }
function render(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBackdrop(t);
  if (groundDirty) buildGround();
  ctx.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, cam.x * DPR, cam.y * DPR);
  ctx.fillStyle = 'rgba(10,30,20,0.35)'; ctx.beginPath(); ctx.ellipse(0, N * TH / 2 + SIDE + 60, N * TW * 0.55, N * TH * 0.55, 0, 0, 7); ctx.fill();
  ctx.drawImage(groundCache, -PADX, -PADY, PADX * 2, CH);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (T(i, j).g !== 'water') continue;
    const [x, y] = pos(i + 0.5, j + 0.5); if (!visible(x, y, 40, 40)) continue;
    for (let k = 0; k < 2; k++) {
      const a = (Math.sin(t * 0.8 + hash(i, j, k) * 6) + 1) / 2;
      ctx.strokeStyle = `rgba(230,250,255,${0.15 + a * 0.4})`; ctx.lineWidth = 1.3;
      const ox = (hash(i, j, k + 4) - 0.5) * 30, oy = (hash(i, j, k + 8) - 0.5) * 12;
      ctx.beginPath(); ctx.moveTo(x + ox - 5, y + oy); ctx.quadraticCurveTo(x + ox, y + oy - 2 * a, x + ox + 5, y + oy); ctx.stroke();
    }
  }
  if (hover && tool !== 'view') {
    let poly, ok, bad = false;
    if (tool === 'land') {
      const [bi, bj] = blockOf(hover[0], hover[1]);
      if (bi >= 0 && bj >= 0 && bi < NB && bj < NB && !G.owned[bi * NB + bj]) { poly = blockOutline(bi, bj); ok = buyable(bi, bj); }
    } else {
      const n = penSize(tool === 'bull' ? 'x' : tool), [ai, aj] = anchor(tool, hover[0], hover[1]);
      ok = tool === 'bull' ? isOwned(ai, aj) : canPlace(tool, ai, aj); bad = tool === 'bull';
      poly = [pos(ai, aj), pos(ai + n, aj), pos(ai + n, aj + n), pos(ai, aj + n)];
    }
    if (poly) {
      ctx.fillStyle = bad ? 'rgba(255,90,60,0.35)' : ok ? 'rgba(255,240,120,0.4)' : 'rgba(255,60,40,0.4)';
      ctx.strokeStyle = bad ? '#ff5a3c' : ok ? '#fff2a0' : '#ff3c28'; ctx.lineWidth = 2;
      ctx.beginPath(); poly.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  if (pick) {
    const spId = pickSp(), skip = pick.kind === 'move' ? pick.dino : null, ht = hover && T(hover[0], hover[1]);
    for (const p of G.pens) {
      const bad = !spId || penProblem(p, spId, skip) || (skip && G.dinos.find(d => d.id === skip)?.pen === p.id), hv = ht && ht.g === 'pen' && ht.pen === p.id;
      const pp = [pos(p.i, p.j), pos(p.i + p.n, p.j), pos(p.i + p.n, p.j + p.n), pos(p.i, p.j + p.n)];
      ctx.fillStyle = bad ? 'rgba(220,60,40,0.30)' : hv ? 'rgba(120,230,90,0.65)' : 'rgba(120,230,90,0.38)';
      ctx.strokeStyle = bad ? '#ff5a3c' : '#e8ffd0'; ctx.lineWidth = hv ? 4 : 2.5;
      ctx.beginPath(); pp.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  const list = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const o = T(i, j).o; if (!o) continue;
    if (o.t === 'tree' || o.t === 'rock') { const [x, y] = pos(i + 0.5, j + 0.5); if (!visible(x, y)) continue; list.push([i + j + 0.5, () => o.t === 'tree' ? drawTree(ctx, x, y, o.v, t, i * N + j) : drawRock(ctx, x, y, o.v)]); }
    if (o.t === 'gate') list.push([i + j + 0.9, () => drawGate(ctx, t)]);
  }
  list.push([VOLC[0] + VOLC[1] + 6.5, () => drawVolcano(ctx, t)]);
  for (let bi = 0; bi < NB; bi++) for (let bj = 0; bj < NB; bj++) if (buyable(bi, bj)) { const [x, y] = pos(bi * BLK + BLK / 2, bj * BLK + BLK / 2); if (visible(x, y)) list.push([bi * BLK + bj * BLK + BLK + 0.2, () => drawSaleSign(ctx, bi, bj)]); }
  if (G.hatch) list.push([G.hatch.i + G.hatch.j + 2.5, () => drawHatchery(ctx, G.hatch, t)]);
  for (const p of G.pens) {
    const meat = penInfo(p).diet === 'maso', n = p.n;
    for (let k = 0; k < n; k++) {
      list.push([p.i + p.j + k - 0.45, () => fenceSeg(ctx, p.i, p.j + k, p.i, p.j + k + 1, meat)]);
      list.push([p.i + p.j + k - 0.45, () => fenceSeg(ctx, p.i + k, p.j, p.i + k + 1, p.j, meat)]);
      list.push([p.i + n - 1 + p.j + k + 0.65, () => fenceSeg(ctx, p.i + n, p.j + k, p.i + n, p.j + k + 1, meat)]);
      list.push([p.i + k + p.j + n - 1 + 0.65, () => fenceSeg(ctx, p.i + k, p.j + n, p.i + k + 1, p.j + n, meat)]);
    }
    list.push([p.i + p.j + 2 * n - 1.05, () => drawPenSign(ctx, p, t)]);
  }
  for (const d of G.dinos) {
    const [x, y] = pos(d.fi, d.fj); if (!visible(x, y, 160, 320)) continue;
    list.push([Math.floor(d.fi) + Math.floor(d.fj) + 0.5 + (d.fi + d.fj) * 0.001, () => {
      DINO.draw(ctx, S[d.sp], { x, y, scale: 0.3, flip: d.flip, t: t + d.id * 1.7, walk: d.st === 'walk' ? 1 : 0, phase: d.ph, headTilt: d.st === 'eat' ? 0.55 + Math.sin(t * 3 + d.id) * 0.08 : 0, jaw: d.st === 'eat' ? 0.2 + Math.max(0, Math.sin(t * 6)) * 0.3 : 0.05 });
    }]);
  }
  for (const v of visitors) { const fi = v.i + (v.ni - v.i) * v.p, fj = v.j + (v.nj - v.j) * v.p; list.push([fi + fj + 0.6, () => drawVisitor(ctx, v, t)]); }
  list.sort((a, b) => a[0] - b[0]).forEach(x => x[1]());
  for (const s of smoke) { const a = Math.min(1, s.life / s.max * 1.5) * 0.5; ctx.fillStyle = `rgba(110,100,95,${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
  const [ccx, ccy] = pos(N / 2, N / 2);
  for (const cl of clouds) {
    const g = ctx.createRadialGradient(ccx + cl.x, ccy + cl.y, 10, ccx + cl.x, ccy + cl.y, cl.r);
    g.addColorStop(0, 'rgba(10,30,40,0.15)'); g.addColorStop(1, 'rgba(10,30,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ccx + cl.x, ccy + cl.y, cl.r, cl.r * 0.5, 0, 0, 7); ctx.fill();
  }
  for (const p of parts) {
    const a = Math.min(1, p.life / (p.max * 0.5));
    if (p.type === 'dot') { ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    if (p.type === 'txt') { ctx.globalAlpha = a; ctx.font = '15px "Lilita One", sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#3b2410'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = '#ffd65a'; ctx.fillText(p.text, p.x, p.y); }
    if (p.type === 'heart') { ctx.globalAlpha = a; heart(ctx, p.x, p.y, 4, '#ff5a7a'); }
  }
  ctx.globalAlpha = 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  birds.forEach(drawBird);
  drawFoliage(t);
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,10,5,0.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  drawMini();
}
function drawMini() {
  const mc = $('miniCv'); if (!mc.offsetParent || !miniCache) return;
  const c = mc.getContext('2d'), m = miniScale();
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2d6045'; c.fillRect(0, 0, 420, 224); c.drawImage(miniCache, 0, 0);
  c.setTransform(m.s, 0, 0, m.s, m.ox, m.oy);
  c.fillStyle = '#ffd65a';
  for (const d of G.dinos) { const [x, y] = pos(d.fi, d.fj); c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); }
  const w2 = (sx, sy) => [(sx - cam.x) / cam.z, (sy - cam.y) / cam.z];
  const cs = [w2(0, 0), w2(W, 0), w2(W, H), w2(0, H)];
  c.strokeStyle = '#fff'; c.lineWidth = 2 / m.s * 2; c.beginPath(); cs.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke();
}

// ---------- kamera ----------
function centerOn(wx, wy, z) { if (z) cam.z = z; cam.x = W / 2 - wx * cam.z; cam.y = (H - 40) / 2 - wy * cam.z; }
function fitPark() {
  let mi = N, ma = 0, mj = N, mb = 0;
  for (let bi = 0; bi < NB; bi++) for (let bj = 0; bj < NB; bj++) if (G.owned[bi * NB + bj]) { mi = Math.min(mi, bi * BLK); ma = Math.max(ma, bi * BLK + BLK); mj = Math.min(mj, bj * BLK); mb = Math.max(mb, bj * BLK + BLK); }
  const cs = [pos(mi, mj), pos(ma, mj), pos(ma, mb), pos(mi, mb)];
  const w = Math.max(...cs.map(c => c[0])) - Math.min(...cs.map(c => c[0])), h = Math.max(...cs.map(c => c[1])) - Math.min(...cs.map(c => c[1]));
  const z = Math.max(0.35, Math.min(1.4, Math.min((W - 80) / (w * 1.1), (H - 230) / (h * 1.1))));
  centerOn((Math.max(...cs.map(c => c[0])) + Math.min(...cs.map(c => c[0]))) / 2, (Math.max(...cs.map(c => c[1])) + Math.min(...cs.map(c => c[1]))) / 2, z);
}
function fitAll() { const z = Math.max(0.3, Math.min((W - 60) / (N * TW * 1.05), (H - 200) / (N * TH * 1.15))); centerOn(0, N * TH / 2 - 30, z); }
function zoomBy(f, sx = W / 2, sy = H / 2) { const z0 = cam.z, z1 = Math.max(0.3, Math.min(2.2, z0 * f)); cam.x = sx - (sx - cam.x) * z1 / z0; cam.y = sy - (sy - cam.y) * z1 / z0; cam.z = z1; }
$('zIn').onclick = () => zoomBy(1.25); $('zOut').onclick = () => zoomBy(0.8);
$('zPark').onclick = fitPark; $('zAll').onclick = fitAll;
$('miniCv').addEventListener('pointerdown', e => {
  const r = e.currentTarget.getBoundingClientRect(), m = miniScale();
  const px = (e.clientX - r.left) / r.width * 420, py = (e.clientY - r.top) / r.height * 224;
  centerOn((px - m.ox) / m.s, (py - m.oy) / m.s);
});

// ---------- vstup ----------
function toTile(sx, sy) {
  const wx = (sx - cam.x) / cam.z, wy = (sy - cam.y) / cam.z;
  return [Math.floor((wy / (TH / 2) + wx / (TW / 2)) / 2), Math.floor((wy / (TH / 2) - wx / (TW / 2)) / 2)];
}
function pickDino(sx, sy) {
  let best = null, bd = 40 * cam.z;
  for (const d of G.dinos) { const [x, y] = pos(d.fi, d.fj); const px = x * cam.z + cam.x, py = (y - 18) * cam.z + cam.y; const dd = Math.hypot(px - sx, py - sy); if (dd < bd) { bd = dd; best = d; } }
  return best;
}
cv.addEventListener('pointerdown', e => {
  audio(); hideInfo();
  cv.setPointerCapture(e.pointerId);
  const [i, j] = toTile(e.offsetX, e.offsetY);
  if (pick && e.button === 2) { endPick(); return; }
  drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y, moved: false, pan: !!pick || tool === 'view' || e.button !== 0, last: null };
  if (!drag.pan) {
    if (tool === 'path') { place('path', i, j, !isOwned(i, j) ? false : true); drag.last = i * N + j; }
    else if (tool === 'bull') bulldoze(i, j);
    else if (tool === 'land') buyLand(i, j);
    else { const [ai, aj] = anchor(tool, i, j); place(tool, ai, aj); }
  }
});
cv.addEventListener('pointermove', e => {
  const [i, j] = toTile(e.offsetX, e.offsetY);
  hover = [i, j];
  if (drag) {
    const dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (drag.pan) { cam.x = drag.cx + dx; cam.y = drag.cy + dy; }
    else if (tool === 'path' && drag.last !== i * N + j) { place('path', i, j, true); drag.last = i * N + j; }
  }
  cv.style.cursor = pick ? 'pointer' : tool === 'view' ? (drag ? 'grabbing' : 'grab') : 'crosshair';
});
cv.addEventListener('pointerup', e => {
  if (drag && pick && !drag.moved) {
    const [i, j] = toTile(e.offsetX, e.offsetY), t = T(i, j);
    if (t && t.g === 'pen') pickPen(G.pens.find(p => p.id === t.pen)); else { toast('Klikni přímo do výběhu.', 'bad'); SFX.bad(); }
    drag = null; return;
  }
  if (drag && tool === 'view' && !drag.moved) {
    const [i, j] = toTile(e.offsetX, e.offsetY), t = T(i, j);
    const d = pickDino(e.offsetX, e.offsetY);
    if (d) showInfo(d, e.offsetX, e.offsetY);
    else if (t && t.o && (t.o.t === 'hatch' || t.o.t === 'hatchpart')) openHatch();
    else if (G.hatch) { const [hx, hy] = pos(G.hatch.i + 1, G.hatch.j + 1); if (Math.hypot(hx * cam.z + cam.x - e.offsetX, (hy - 30) * cam.z + cam.y - e.offsetY) < 50 * cam.z) openHatch(); }
  }
  drag = null;
});
cv.addEventListener('pointerleave', () => { hover = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.offsetX, e.offsetY); }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());
const keys = new Set();
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (pick) endPick(); $('hatchModal').classList.remove('open'); $('menuModal').classList.remove('open'); setTool('view'); }
  if ($('hatchModal').classList.contains('open')) return;
  const k = parseInt(e.key, 10); if (k >= 1 && k <= TOOLS.length) setTool(TOOLS[k - 1].id);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) { keys.add(e.key); e.preventDefault(); }
  if (e.key === '+' || e.key === '=') zoomBy(1.2); if (e.key === '-') zoomBy(0.83);
});
window.addEventListener('keyup', e => keys.delete(e.key));

function showInfo(d, x, y) {
  const sp = S[d.sp], c = CAT[d.sp], el = $('info'); infoDino = d.id;
  $('infoName').textContent = sp.name; $('infoEra').textContent = c.era; $('infoFact').textContent = c.fact;
  $('infoTxt').textContent = (sp.diet === 'maso' ? 'Masožravec' : 'Býložravec') + ' · bydlí ve výběhu č. ' + d.pen + ' · ' + c.appeal + ' mincí za pohled';
  el.style.display = 'block';
  el.style.left = Math.min(W - 270, x + 14) + 'px'; el.style.top = Math.max(70, Math.min(H - 290, y - 160)) + 'px';
  DINO.portrait($('infoCv'), sp, { t: tNow });
}
function hideInfo() { $('info').style.display = 'none'; }
$('infoMove').onclick = () => {
  const d = G.dinos.find(x => x.id === infoDino); hideInfo(); if (!d) return;
  if (!anyPen(d.sp, d.id, d.pen)) { toast('Žádný jiný výběh pro něj nemá místo. Postav nový.', 'bad'); SFX.bad(); return; }
  startPick({ kind: 'move', dino: d.id });
};

function openHatch() { $('hatchModal').classList.add('open'); renderEggs(); SFX.click(); }
function renderEggs() {
  const st = stars();
  $('hSub').textContent = (G.eggs.length ? `V líhni se zahřívá ${G.eggs.length} z 3 vajec. ` : '') + 'Nové druhy se odemykají hvězdami. Masožravci potřebují výběh jen pro svůj druh, obři velký výběh.';
  $('eggGrid').innerHTML = CATALOG.map(c => {
    const sp = S[c.id], lock = st < c.stars;
    return `<div class="egg ${lock ? 'locked' : ''}"><canvas id="ep-${c.id}"></canvas>${lock ? `<span class="lockbadge">od ${c.stars} ★</span>` : ''}<h3>${sp.name}</h3><div class="era">${c.era}</div><div class="fact">${c.fact}</div>
    <div class="meta"><span><span class="tag ${sp.diet === 'maso' ? 'meat' : ''}">${sp.diet === 'maso' ? 'masožravec' : 'býložravec'}</span>${c.big ? ' <span class="tag big">velký výběh</span>' : ''}</span><span>${c.time} s</span></div>
    <div class="meta"><span>${c.price} mincí</span><span>+${c.appeal} za pohled</span></div>
    <button class="btn" data-sp="${c.id}" aria-disabled="${lock || G.coins < c.price}">${lock ? 'Zamčeno' : 'Vylíhnout'}</button></div>`;
  }).join('');
  CATALOG.forEach(c => DINO.portrait($('ep-' + c.id), S[c.id], { t: 1 }));
  $('eggGrid').querySelectorAll('button').forEach(b => b.onclick = () => buyEgg(CAT[b.dataset.sp]));
}
$('hClose').onclick = () => $('hatchModal').classList.remove('open');
$('pickCancel').onclick = () => endPick();
$('hatchModal').addEventListener('click', e => { if (e.target.id === 'hatchModal') $('hatchModal').classList.remove('open'); });

// ---------- smyčka ----------
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; }
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; tNow += dt;
  const pan = 520 * dt;
  if (keys.has('ArrowLeft') || keys.has('a')) cam.x += pan; if (keys.has('ArrowRight') || keys.has('d')) cam.x -= pan;
  if (keys.has('ArrowUp') || keys.has('w')) cam.y += pan; if (keys.has('ArrowDown') || keys.has('s')) cam.y -= pan;
  for (const e of G.eggs) e.t += dt;
  const done = G.eggs.filter(e => e.t >= e.total); G.eggs = G.eggs.filter(e => e.t < e.total); done.forEach(hatchEgg);
  if (done.length && $('hatchModal').classList.contains('open')) renderEggs();
  stepDinos(dt); stepVisitors(dt); stepParts(dt);
  render(tNow); updateHud();
  saveT -= dt; if (saveT <= 0) { saveT = 10; saveGame(false); }
  requestAnimationFrame(frame);
}
function snapshot() { return { game: 'honzikuv-dinopark', v: 3, savedAt: new Date().toISOString(), coins: G.coins, earned: G.earned, totalVisitors: G.totalVisitors, tiles: G.tiles, owned: G.owned, bought: G.bought, pens: G.pens.map(p => ({ id: p.id, i: p.i, j: p.j, n: p.n })), hatch: G.hatch, eggs: G.eggs, dinos: G.dinos, nextId: G.nextId, quests: G.quests, won: G.won }; }
const SAVE_KEY = 'honzikuv-dinopark-ulozena-hra';
let saveT = 10, lastSaved = null;
function storage() { try { const ls = window.localStorage; ls.setItem('__t', '1'); ls.removeItem('__t'); return ls; } catch (e) { return null; } }
function validSave(d) { return d && Array.isArray(d.tiles) && d.tiles.length === N * N && Array.isArray(d.owned) && d.v >= 2; }
function saveGame(manual) {
  const ls = storage();
  if (!ls) { if (manual) { toast('Tady prohlížeč ukládání nepovoluje. Stáhni si zálohu do souboru.', 'bad'); SFX.bad(); } return false; }
  try {
    ls.setItem(SAVE_KEY, JSON.stringify(snapshot())); lastSaved = new Date();
    const tag = $('savedTag'); tag.textContent = 'Uloženo ' + lastSaved.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }); tag.classList.add('on'); clearTimeout(tag._t); tag._t = setTimeout(() => tag.classList.remove('on'), 1800);
    if (manual) { toast('Hra je uložená.', 'gold'); SFX.coin(); }
    return true;
  } catch (e) { if (manual) { toast('Uložení se nepovedlo.', 'bad'); SFX.bad(); } return false; }
}
function loadSaved() { const ls = storage(); if (!ls) return null; try { const d = JSON.parse(ls.getItem(SAVE_KEY) || 'null'); return validSave(d) ? d : null; } catch (e) { return null; } }
function saveSoon() { saveT = Math.min(saveT, 1.5); }
function loadData(d) {
  G = d ? Object.assign(newGame(), d) : newGame();
  G.pens = G.pens.map(p => ({ id: p.id, i: p.i, j: p.j, n: p.n || 3 }));
  visitors = []; parts = []; pick = null; $('pickbar').hidden = true; groundDirty = true; lastHud = '';
  unlockedSeen = new Set(); const st = stars(); CATALOG.forEach(c => { if (st >= c.stars) unlockedSeen.add(c.id); });
  fitPark();
}
function menuSub() { $('mSub').textContent = (storage() ? 'Hra se ukládá sama každých 10 sekund do tohohle prohlížeče.' : 'Tenhle prohlížeč ukládání nepovoluje, použij zálohu do souboru.') + (lastSaved ? ' Naposledy uloženo v ' + lastSaved.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) + '.' : ''); }
$('menuBtn').onclick = () => { menuSub(); $('menuMain').hidden = false; $('menuConfirm').hidden = true; $('menuModal').classList.add('open'); SFX.click(); };
$('mClose').onclick = () => $('menuModal').classList.remove('open');
$('menuModal').addEventListener('click', e => { if (e.target.id === 'menuModal') $('menuModal').classList.remove('open'); });
$('mSave').onclick = () => { saveGame(true); menuSub(); };
$('mExport').onclick = async () => {
  const name = 'dinopark-zaloha-' + new Date().toISOString().slice(0, 10) + '.json', text = JSON.stringify(snapshot());
  let dl = null;
  if (window.claude && typeof window.claude.use === 'function') { try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; } }
  if (dl) {
    try { await dl.save({ filename: name, data: text }); toast('Záloha je uložená ve Stažených souborech.', 'gold'); }
    catch (e) { if (!e || e.code !== 'declined') toast('Stažení zálohy se tady nepovedlo.', 'bad'); }
    return;
  }
  try {
    const blob = new Blob([text], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Záloha se stahuje. Najdeš ji ve Stažených souborech.', 'gold');
  } catch (e) { toast('Stažení se nepovedlo.', 'bad'); }
};
$('mImport').onclick = () => $('mFile').click();
$('mFile').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try { const d = JSON.parse(r.result); if (!validSave(d)) throw 0; loadData(d); saveGame(false); $('menuModal').classList.remove('open'); toast('Záloha nahraná. Hraješ dál od uloženého místa.', 'gold'); SFX.land(); }
    catch (err) { toast('Tohle není záloha Dinoparku.', 'bad'); SFX.bad(); }
    e.target.value = '';
  };
  r.readAsText(f);
};
$('mNew').onclick = () => { $('menuMain').hidden = true; $('menuConfirm').hidden = false; };
$('mNo').onclick = () => { $('menuMain').hidden = false; $('menuConfirm').hidden = true; };
$('mYes').onclick = () => { loadData(null); saveGame(false); $('menuModal').classList.remove('open'); toast('Nový ostrov je připravený. Hodně štěstí!', 'gold'); };
window.addEventListener('pagehide', () => saveGame(false));
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(false); });
function start(data) {
  resize();
  const saved = validSave(data) ? null : loadSaved();
  loadData(validSave(data) ? data : saved);
  if (saved) setTimeout(() => toast('Vítej zpátky! Pokračuješ v uložené hře.', 'gold'), 700);
  clouds = [{ x: -600, y: 0, r: 300 }, { x: 200, y: 200, r: 240 }, { x: 800, y: -150, r: 340 }];
  buildToolbar(); setTool('view'); muteIcon();
  window.addEventListener('resize', () => { resize(); fitPark(); });
  window.claude?.hot?.snapshot?.(snapshot);
  window.__ranch = { G: () => G, saveGame, loadSaved, loadData, pickPen, startPick, place, setTool, buyEgg, buyLand, CAT, cam, openHatch, fitAll, fitPark, stars,
    tick: n => { for (let k = 0; k < n; k++) { G.eggs.forEach(e => e.t += 0.05); const d = G.eggs.filter(e => e.t >= e.total); G.eggs = G.eggs.filter(e => e.t < e.total); d.forEach(hatchEgg); stepDinos(0.05); stepVisitors(0.05); stepParts(0.05); } } };
  requestAnimationFrame(t => { last = t; frame(t); });
}
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
});
})();
