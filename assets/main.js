/**
 * CHROMARACERS: VITAMIN RUSH
 * Three.js / WebGL chromatography race — client-side only.
 */
import * as THREE from 'three';

// ---------------------------------------------------------------------------
const GAME_CONFIG = {
  raceDistance: 1500, // RACE_DISTANCE — change to 1000/2000/3000 freely
  lanes: 3,
  laneWidth: 2.15,
  baseSpeed: 42,
  boostMultiplier: 1.72,
  boostDuration: 2.4,
  rivalBaseSpeeds: [38, 40, 41.5],
  camera: {
    // Visual-target Phase 1: behind + slightly above; Vita in lower-middle frame
    back: 8.4,
    height: 4.35,
    lookAhead: 16,
    baseFov: 64,
    boostFov: 72,
  },
  // HPLC column containment radius (arch major radius)
  columnRadius: 7.5,
  /** Etapa 3.2.1 — structural frame parameters (geometry only). */
  columnLength: 1500, // matches raceDistance; frames span this length
  frameSpacing: 14,
  frameThickness: 0.95,
  longitudinalBeamCount: 9,
  longitudinalBeamThickness: 0.4,
  lowerBeamHeight: -1.25, // track-level lateral rails (trueUp lift)
  lowerBeamThickness: 0.5,
  leaderboardKey: 'chromaracers_vitamin_rush_lb_v1',
  maxLeaderboard: 10,
  character: 'Vita C',
};

/** Lift column center above the race spline so the pista sits in the lower tube. */
const COLUMN_LIFT = 4.2;

const RACE_DISTANCE = GAME_CONFIG.raceDistance;

/** Sector templates as fractions of raceDistance (designed for 1500 m). */
const SECTOR_TEMPLATES = [
  { id: 1, start: 0 / 1500, end: 200 / 1500, name: 'INTRODUÇÃO', tint: 0x2878c8, fog: 0.0085, label: 'SECTOR 1 — INTRODUÇÃO' },
  { id: 2, start: 200 / 1500, end: 400 / 1500, name: 'CURVAS', tint: 0x2a6fb8, fog: 0.0092, label: 'SECTOR 2 — CURVAS' },
  { id: 3, start: 400 / 1500, end: 600 / 1500, name: 'SUBIDA', tint: 0x1f6a9a, fog: 0.0098, label: 'SECTOR 3 — SUBIDA' },
  { id: 4, start: 600 / 1500, end: 750 / 1500, name: 'TOPO', tint: 0x3a7ec4, fog: 0.0088, label: 'SECTOR 4 — TOPO' },
  { id: 5, start: 750 / 1500, end: 950 / 1500, name: 'DESCIDA', tint: 0x246090, fog: 0.0105, label: 'SECTOR 5 — DESCIDA' },
  { id: 6, start: 950 / 1500, end: 1150 / 1500, name: 'TURBULÊNCIA', tint: 0x1a5580, fog: 0.012, label: 'SECTOR 6 — TURBULÊNCIA' },
  { id: 7, start: 1150 / 1500, end: 1300 / 1500, name: 'CURVAS COMBINADAS', tint: 0x2d6aa8, fog: 0.01, label: 'SECTOR 7 — CURVAS COMBINADAS' },
  { id: 8, start: 1300 / 1500, end: 1450 / 1500, name: 'ALTA VELOCIDADE', tint: 0x1e7ab8, fog: 0.0078, label: 'SECTOR 8 — ALTA VELOCIDADE' },
  { id: 9, start: 1450 / 1500, end: 1500 / 1500, name: 'DETECTOR UV/VIS', tint: 0x5de5ff, fog: 0.0065, label: 'SECTOR 9 — DETECTOR UV/VIS' },
];

function buildSectors(raceDistance) {
  return SECTOR_TEMPLATES.map((s) => ({
    ...s,
    start: s.start * raceDistance,
    end: s.end * raceDistance,
  }));
}

const SECTORS = buildSectors(GAME_CONFIG.raceDistance);

const LANES = [-1, 0, 1];

const RIVALS_DEF = [
  { name: 'Captain Caffeine', color: 0xff7b31, emissive: 0x5a2208, lane: -1, speedIndex: 0, spriteId: 'captain' },
  { name: 'Lady Paraben', color: 0xd9368a, emissive: 0x4a1030, lane: 1, speedIndex: 1 },
  { name: 'Aroma', color: 0x5de5ff, emissive: 0x0a3a4a, lane: 0, speedIndex: 2, spriteId: 'aroma' },
];

/** Shared 64×64 horizontal sheets (same layout as Vita C). */
const CAPTAIN_ANIMS = {
  run: { url: './assets/captain-caffeine-run.png', frames: 8 },
  'run-back': { url: './assets/captain-caffeine-run-back.png', frames: 8 },
  boost: { url: './assets/captain-caffeine-boost.png', frames: 7 },
  attack: { url: './assets/captain-caffeine-attack.png', frames: 8 },
  victory: { url: './assets/captain-caffeine-victory.png', frames: 4 },
  idle: { url: './assets/captain-caffeine-idle.png', frames: 4 },
  jump: { url: './assets/captain-caffeine-jump.png', frames: 4 },
  fall: { url: './assets/captain-caffeine-fall.png', frames: 4 },
  skid: { url: './assets/captain-caffeine-skid.png', frames: 4 },
  hit: { url: './assets/captain-caffeine-hit.png', frames: 4 },
};

const AROMA_ANIMS = {
  run: { url: './assets/aroma-run.png', frames: 8 },
  'run-back': { url: './assets/aroma-run-back.png', frames: 8 },
  boost: { url: './assets/aroma-boost.png', frames: 7 },
  attack: { url: './assets/aroma-attack-side.png', frames: 6 },
  victory: { url: './assets/aroma-victory.png', frames: 4 },
  idle: { url: './assets/aroma-idle.png', frames: 4 },
  jump: { url: './assets/aroma-jump.png', frames: 4 },
  fall: { url: './assets/aroma-fall.png', frames: 4 },
  skid: { url: './assets/aroma-skid.png', frames: 4 },
  hit: { url: './assets/aroma-hit.png', frames: 4 },
  hurt: { url: './assets/aroma-hurt.png', frames: 4 },
};

// ---------------------------------------------------------------------------
// Safe storage
const Storage = {
  available: (() => {
    try {
      const k = '__cr_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })(),
  get(key, fallback) {
    if (!this.available) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    if (!this.available) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

// ---------------------------------------------------------------------------
// Audio architecture (no external files required)
const AudioBus = {
  enabled: true,
  ctx: null,
  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  beep(freq = 440, dur = 0.08, type = 'sine', gain = 0.04) {
    const ctx = this.ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  },
  collect() { this.beep(880, 0.07, 'triangle', 0.05); },
  boost() { this.beep(220, 0.12, 'sawtooth', 0.035); this.beep(440, 0.18, 'sine', 0.03); },
  collide() { this.beep(90, 0.16, 'square', 0.04); },
  win() { this.beep(523, 0.12); setTimeout(() => this.beep(659, 0.12), 100); setTimeout(() => this.beep(784, 0.18), 200); },
  click() { this.beep(520, 0.04, 'square', 0.025); },
};

// ---------------------------------------------------------------------------
// Track builder — continuous 3D spline with curves / climbs / descents
function sectorProfile(distance) {
  const d = (distance / RACE_DISTANCE) * 1500; // profile authored for 1500 m, scaled by race length
  if (d < 200) return { curve: Math.sin(d * 0.012) * 0.08, hill: 0.02 };
  if (d < 400) return { curve: Math.sin((d - 200) * 0.028) * 0.55, hill: Math.sin(d * 0.01) * 0.08 };
  if (d < 600) return { curve: Math.sin((d - 400) * 0.018) * 0.22, hill: 0.38 + Math.sin(d * 0.015) * 0.06 };
  if (d < 750) return { curve: Math.sin((d - 600) * 0.035) * 0.48, hill: 0.52 + Math.sin(d * 0.02) * 0.05 };
  if (d < 950) return { curve: Math.sin((d - 750) * 0.02) * 0.25, hill: -0.42 + Math.sin(d * 0.012) * 0.08 };
  if (d < 1150) return { curve: Math.sin((d - 950) * 0.055) * 0.72, hill: Math.sin(d * 0.04) * 0.28 };
  if (d < 1300) return { curve: Math.sin((d - 1150) * 0.04) * 0.62, hill: Math.sin(d * 0.025) * 0.22 };
  if (d < 1450) return { curve: Math.sin((d - 1300) * 0.015) * 0.18, hill: -0.06 };
  return { curve: Math.sin((d - 1450) * 0.02) * 0.08, hill: 0.04 };
}

function buildTrackCurve(raceDistance) {
  const pts = [];
  const pos = new THREE.Vector3(0, 0, 0);
  let heading = 0;
  const step = 18;
  pts.push(pos.clone());
  for (let d = step; d <= raceDistance + step; d += step) {
    const { curve, hill } = sectorProfile(d);
    heading += curve * (step / 18) * 0.42;
    const pitch = hill * 0.55;
    pos.x += Math.sin(heading) * Math.cos(pitch) * step;
    pos.y += Math.sin(pitch) * step * 0.85;
    pos.z -= Math.cos(heading) * Math.cos(pitch) * step;
    pts.push(pos.clone());
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.42);
}

// ---------------------------------------------------------------------------
// DOM helpers
const $ = (id) => document.getElementById(id);
const screens = {
  menu: $('screen-menu'),
  howto: $('screen-howto'),
  settings: $('screen-settings'),
  leaderboard: $('screen-leaderboard'),
  results: $('screen-results'),
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    const on = key === name;
    el.classList.toggle('active', on);
    el.classList.toggle('panel-hidden', !on);
  });
  const racing = name === null;
  $('hud').classList.toggle('panel-hidden', !racing);
  $('mobileControls').classList.toggle('panel-hidden', !racing);
  if (!racing) $('countdown').classList.add('panel-hidden');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function getLeaderboard() {
  const list = Storage.get(GAME_CONFIG.leaderboardKey, []);
  return Array.isArray(list) ? list : [];
}

function saveLeaderboardEntry(entry) {
  const list = getLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.score - a.score || a.time - b.time);
  const top = list.slice(0, GAME_CONFIG.maxLeaderboard);
  Storage.set(GAME_CONFIG.leaderboardKey, top);
  return top;
}

function renderLeaderboard() {
  const list = getLeaderboard();
  const root = $('leaderboardList');
  if (!list.length) {
    root.innerHTML = '<div class="lb-row"><div class="lb-meta">Nenhum score ainda. Corra e salve o seu!</div></div>';
    return;
  }
  root.innerHTML = list.map((e, i) => {
    const rank = i + 1;
    const cls = rank <= 3 ? ` rank-${rank}` : '';
    return `<div class="lb-row${cls}">
      <div class="lb-rank">${String(rank).padStart(2, '0')}</div>
      <div>
        <div>${escapeHtml(e.name)}</div>
        <div class="lb-meta">${formatTime(e.time)} · ${e.distance} m · ${escapeHtml(e.character || 'Vita C')} · ${escapeHtml(e.date || '')}</div>
      </div>
      <div class="lb-score">${Number(e.score).toLocaleString('pt-BR')}</div>
    </div>`;
  }).join('');
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Quality / performance
const qualityState = {
  mode: Storage.get('chromaracers_quality', 'auto') || 'auto',
  fewerParticles: !!Storage.get('chromaracers_fewer_particles', false),
  pixelRatioCap: 1.75,
  particleMul: 1,
  ringStep: 1,
};

function applyQuality(mode, fpsHint = 60) {
  qualityState.mode = mode;
  if (mode === 'high') {
    qualityState.pixelRatioCap = 2;
    qualityState.particleMul = 1;
    qualityState.ringStep = 1;
  } else if (mode === 'medium') {
    qualityState.pixelRatioCap = 1.4;
    qualityState.particleMul = 0.7;
    qualityState.ringStep = 1;
  } else if (mode === 'low') {
    qualityState.pixelRatioCap = 1;
    qualityState.particleMul = 0.45;
    qualityState.ringStep = 2;
  } else {
    // auto from fps
    if (fpsHint < 28) applyQuality('low', 60);
    else if (fpsHint < 45) applyQuality('medium', 60);
    else applyQuality('high', 60);
    qualityState.mode = 'auto';
  }
  if (qualityState.fewerParticles) qualityState.particleMul *= 0.55;
}

// ---------------------------------------------------------------------------
// Three.js scene bootstrap
const mount = $('game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1834);
// Minimal scene fog — wall uses fog:false (FogExp2 on the tube created ring banding)
scene.fog = new THREE.FogExp2(0x0c1834, 0.0007);

const camera = new THREE.PerspectiveCamera(
  GAME_CONFIG.camera.baseFov,
  innerWidth / innerHeight,
  0.08,
  420
);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    alpha: false,
  });
} catch (err) {
  const box = document.createElement('div');
  box.className = 'overlay screen active';
  box.innerHTML = `<div class="card-panel"><h2>WEBGL INDISPONÍVEL</h2><p>Este dispositivo/navegador não conseguiu criar um contexto WebGL. Tente outro navegador ou atualize os drivers gráficos.</p><p style="color:#8fa0b8;font-size:12px">${escapeHtml(String(err))}</p></div>`;
  document.body.appendChild(box);
  throw err;
}
const PIX = 3; // 2 = fino, 4 = bem retrô
function applyRenderSize() {
  renderer.setPixelRatio(1);
  renderer.setSize(Math.ceil(innerWidth / PIX), Math.ceil(innerHeight / PIX), false);
  const c = renderer.domElement;
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.imageRendering = 'pixelated';
}
applyRenderSize();
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x8ec8ff, 0x1a1040, 0.7);
scene.add(hemi);
const keyLight = new THREE.DirectionalLight(0xc8b8ff, 0.65);
keyLight.position.set(3, 8, 2);
scene.add(keyLight);
const accent = new THREE.PointLight(0xf28c28, 0.45, 42, 2);
scene.add(accent);
const columnFill = new THREE.PointLight(0x3a5a8a, 0.32, 55, 2);
scene.add(columnFill);

const clock = new THREE.Clock();
const curve = buildTrackCurve(RACE_DISTANCE);

const _up = new THREE.Vector3(0, 1, 0);
const _side = new THREE.Vector3();
const _trueUp = new THREE.Vector3();
const _tmp = new THREE.Vector3();
const _tmp2 = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function frameAt(t) {
  t = THREE.MathUtils.clamp(t, 0, 0.9995);
  const p = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  _side.crossVectors(_up, tangent);
  if (_side.lengthSq() < 0.001) _side.set(1, 0, 0);
  _side.normalize();
  _trueUp.crossVectors(tangent, _side).normalize();
  return { p, tangent, side: _side.clone(), trueUp: _trueUp.clone() };
}

function worldAt(distance, lane = 0, lift = 0, out = new THREE.Vector3()) {
  const t = THREE.MathUtils.clamp(distance / RACE_DISTANCE, 0, 0.9995);
  const f = frameAt(t);
  return out.copy(f.p)
    .addScaledVector(f.side, lane * GAME_CONFIG.laneWidth)
    .addScaledVector(f.trueUp, lift);
}

function getSector(distance) {
  for (let i = SECTORS.length - 1; i >= 0; i--) {
    if (distance >= SECTORS[i].start) return SECTORS[i];
  }
  return SECTORS[0];
}

// Shared geometries / materials (pooling) — arcade 16-bit palette, not PBR
const geo = {
  sphereS: new THREE.SphereGeometry(1, 6, 5),
  sphereM: new THREE.SphereGeometry(1, 8, 6),
  icosa: new THREE.IcosahedronGeometry(1, 0),
  bubble: new THREE.SphereGeometry(1, 8, 6),
  pixel: new THREE.BoxGeometry(1, 1, 1),
  crystal: new THREE.OctahedronGeometry(1, 0),
  panel: new THREE.PlaneGeometry(2.4, 3.2),
  strut: new THREE.BoxGeometry(0.22, 0.22, 2.8),
};

const mats = {
  flowPixel: new THREE.MeshBasicMaterial({ color: 0x5de5ff, transparent: true, opacity: 0.85 }),
  flowSoft: new THREE.MeshBasicMaterial({
    color: 0x3a5a88, transparent: true, opacity: 0.028, depthWrite: false, blending: THREE.AdditiveBlending,
  }),
  moleculeAmb: [
    new THREE.MeshBasicMaterial({ color: 0xf28c28 }),
    new THREE.MeshBasicMaterial({ color: 0x5de5ff }),
    new THREE.MeshBasicMaterial({ color: 0x43c95a }),
    new THREE.MeshBasicMaterial({ color: 0xd9368a }),
    new THREE.MeshBasicMaterial({ color: 0x9b6dff }),
  ],
  molecule: new THREE.MeshBasicMaterial({ color: 0xffd447, transparent: true, opacity: 0.95 }),
  energy: new THREE.MeshBasicMaterial({ color: 0x59f2ff, transparent: true, opacity: 0.95 }),
  vitamin: new THREE.MeshBasicMaterial({ color: 0x43c95a, transparent: true, opacity: 0.95 }),
  obstacleSilica: new THREE.MeshBasicMaterial({ color: 0x9a86d8 }),
  obstacleBubble: new THREE.MeshBasicMaterial({ color: 0x5de5ff, transparent: true, opacity: 0.72 }),
  obstacleConc: new THREE.MeshBasicMaterial({ color: 0xf28c28 }),
  obstacleInterf: new THREE.MeshBasicMaterial({ color: 0xd9368a }),
  infra: new THREE.MeshBasicMaterial({ color: 0x243a62 }),
  infraAccent: new THREE.MeshBasicMaterial({ color: 0x3a6ea8 }),
  detectorBody: new THREE.MeshBasicMaterial({ color: 0x152848 }),
  detectorHousingDark: new THREE.MeshBasicMaterial({ color: 0x0d1530 }),
  detectorAccent: new THREE.MeshBasicMaterial({ color: 0x5de5ff }),
  detectorAmber: new THREE.MeshBasicMaterial({ color: 0xf2a33a }),
  detectorUv: new THREE.MeshBasicMaterial({
    color: 0x5de5ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }),
  detectorCore: new THREE.MeshBasicMaterial({
    color: 0xe8f8ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }),
  detectorHalo: new THREE.MeshBasicMaterial({
    color: 0x5de5ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }),
};

// ---------------------------------------------------------------------------
// ColumnEnvironment — chromatographic column following the race spline
/** Dev-only: denser silica visibility; hide some non-silica env when true. Not exposed in UI. */
const DEBUG_SILICA = false;
/**
 * Dev-only column architecture mode.
 * When true: show ONLY column shell + corridor + player (no silica/flow/molecules/decor).
 * Not exposed in player-facing UI.
 */
/**
 * Visual-target Phase 1 — structural composition only
 * (column + rings + stationary walls + mobile floor + detector + player).
 * Defers decorative particle polish / infra clutter.
 */
const VISUAL_PHASE1_COMPOSITION = true;
/** Dev-only shell isolation. Off for visual-target composition. */
const DEBUG_COLUMN = false;
/** Dev-only: emphasize mobile-phase flow (Phase D). Default off. */
const DEBUG_FLOW = false;
/** Dev-only: emphasize molecular traffic (Phase E). Default off. */
const DEBUG_MOLECULES = false;
/**
 * Dev-only detector focus mode.
 * When true: hide silica/flow/molecules/unrelated decor; show column + detector clearly.
 */
const DEBUG_DETECTOR = false;

/** UV/Vis detector mount distance along the race (finish = 1500). Near end of sector 9. */
const DETECTOR_DISTANCE = 1480;

const envGroup = new THREE.Group();
scene.add(envGroup);
const silicaGroup = new THREE.Group();
scene.add(silicaGroup);
const flowGroup = new THREE.Group();
scene.add(flowGroup);
const infraGroup = new THREE.Group();
scene.add(infraGroup);
const detectorGroup = new THREE.Group();
scene.add(detectorGroup);

const texLoader = new THREE.TextureLoader();

/**
 * Phase A.1 — continuous HPLC glass inner-wall texture.
 * TubeGeometry UV: U = along path, V = around circumference.
 * Canvas X → U, canvas Y → V.
 * Longitudinal details must be HORIZONTAL (constant V). Vertical strokes = rings.
 */
function createColumnWallTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Circumferential curvature shading (varies with V / canvas Y only)
  const radial = ctx.createLinearGradient(0, 0, 0, 512);
  radial.addColorStop(0.0, '#0a1428');
  radial.addColorStop(0.16, '#101c3a');
  radial.addColorStop(0.34, '#152848');
  radial.addColorStop(0.50, '#183a67');
  radial.addColorStop(0.66, '#152848');
  radial.addColorStop(0.84, '#101c3a');
  radial.addColorStop(1.0, '#0a1428');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 1024, 512);

  // Soft glass body — circumferential only (no U banding)
  const body = ctx.createLinearGradient(0, 80, 0, 432);
  body.addColorStop(0, 'rgba(24,58,103,0)');
  body.addColorStop(0.4, 'rgba(40,80,140,0.16)');
  body.addColorStop(0.5, 'rgba(48,92,155,0.12)');
  body.addColorStop(0.6, 'rgba(40,80,140,0.16)');
  body.addColorStop(1, 'rgba(24,58,103,0)');
  ctx.fillStyle = body;
  ctx.fillRect(0, 80, 1024, 352);

  // Very restrained longitudinal glass catch (constant V → along spline). Avoid starburst density.
  for (const y of [128, 160, 352, 384]) {
    ctx.fillStyle = 'rgba(180,200,230,0.035)';
    ctx.fillRect(0, y, 1024, 1);
  }
  // Soft structural seam pair (mid-side walls)
  for (const y of [148, 364]) {
    ctx.fillStyle = 'rgba(24,58,103,0.12)';
    ctx.fillRect(0, y, 1024, 1);
  }

  // Peripheral curvature darken (ceiling / floor in V)
  const edgeTop = ctx.createLinearGradient(0, 0, 0, 64);
  edgeTop.addColorStop(0, 'rgba(8,12,24,0.45)');
  edgeTop.addColorStop(1, 'rgba(8,12,24,0)');
  ctx.fillStyle = edgeTop;
  ctx.fillRect(0, 0, 1024, 64);
  const edgeBot = ctx.createLinearGradient(0, 448, 0, 512);
  edgeBot.addColorStop(0, 'rgba(8,12,24,0)');
  edgeBot.addColorStop(1, 'rgba(8,12,24,0.4)');
  ctx.fillStyle = edgeBot;
  ctx.fillRect(0, 448, 1024, 64);

  // Soft micro grain — avoid aligned constant-U streaks
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(20,40,80,${0.04 + Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1 + Math.random(), 1);
  }

  // Alpha: upper arc (canvas Y near 0) more transparent — glass ceiling read
  const img = ctx.getImageData(0, 0, 1024, 512);
  const data = img.data;
  for (let py = 0; py < 512; py++) {
    const yN = py / 511;
    // Ceiling band transparent → mid sides solid → floor slightly open
    let a = 255;
    if (yN < 0.28) a = Math.floor(55 + (yN / 0.28) * 200);
    else if (yN > 0.82) a = Math.floor(200 + ((1 - yN) / 0.18) * 55);
    for (let px = 0; px < 1024; px++) data[(py * 1024 + px) * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // No U-repeat seams (those become transverse rings looking down the tube)
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

const COLUMN_WALL_TEX = createColumnWallTexture();

/** Mobile-phase race surface — blue/cyan flow language (visual target palette). */
function createMobilePhaseTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#0050A8');
  g.addColorStop(0.35, '#0066CC');
  g.addColorStop(0.55, '#00AEEF');
  g.addColorStop(0.75, '#0066CC');
  g.addColorStop(1, '#0050A8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // Longitudinal flow streaks (U along path when mapped on ribbon)
  for (let i = 0; i < 28; i++) {
    const y = (i / 28) * 256 + (Math.random() - 0.5) * 6;
    ctx.fillStyle = `rgba(25,217,255,${0.08 + Math.random() * 0.14})`;
    ctx.fillRect(0, y, 512, 1 + Math.random() * 2);
  }
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 512;
    ctx.fillStyle = `rgba(111,234,255,${0.06 + Math.random() * 0.1})`;
    ctx.fillRect(x, 0, 2 + Math.random() * 4, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(14, 1);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}
const MOBILE_PHASE_TEX = createMobilePhaseTexture();

// Continuous HPLC glass — fog OFF; alpha enables transparent upper wall
mats.columnWall = new THREE.MeshBasicMaterial({
  map: COLUMN_WALL_TEX,
  color: 0xffffff,
  side: THREE.BackSide,
  transparent: true,
  opacity: 1,
  depthWrite: true,
  fog: false,
});
mats.mobilePhase = new THREE.MeshBasicMaterial({
  map: MOBILE_PHASE_TEX,
  color: 0xffffff,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
  depthWrite: true,
  fog: false,
});
mats.columnSeam = new THREE.MeshBasicMaterial({
  color: 0x1a3f70,
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
  fog: false,
});
mats.columnClamp = new THREE.MeshBasicMaterial({
  color: 0x152848,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
  fog: false,
});
mats.columnClampAccent = new THREE.MeshBasicMaterial({
  color: 0x183a67,
  transparent: true,
  opacity: 0.22,
  depthWrite: false,
  fog: false,
});
/** Thick section rings — kept for optional debug; etapa 3.2.1 uses open frames. */
mats.columnSectionRing = new THREE.MeshBasicMaterial({
  color: 0x2a6aa8,
  transparent: true,
  opacity: 0.92,
  side: THREE.DoubleSide,
  depthWrite: true,
  fog: false,
});
mats.columnSectionRingCore = new THREE.MeshBasicMaterial({
  color: 0x183a67,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
  depthWrite: false,
  fog: false,
});
/** Hard-banded metal matcap — volume + cyan rim from the pista (pixel-art friendly). */
function makeMetalMatcap() {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(s * 0.36, s * 0.3, 0, s * 0.5, s * 0.5, s * 0.55);
  // bandas duras: duas paradas no mesmo ponto
  [[0, '#ffffff'], [0.12, '#ffffff'], [0.12, '#c8d4e8'], [0.4, '#c8d4e8'],
   [0.4, '#7e8fb0'], [0.7, '#7e8fb0'], [0.7, '#3a4668'], [1, '#3a4668']]
    .forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  // luz refletida da pista (ciano) embaixo à direita
  const rim = g.createRadialGradient(s * 0.8, s * 0.85, 0, s * 0.8, s * 0.85, s * 0.3);
  rim.addColorStop(0, 'rgba(80,220,255,0.85)');
  rim.addColorStop(1, 'rgba(80,220,255,0)');
  g.fillStyle = rim;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = t.minFilter = THREE.NearestFilter;
  return t;
}
const metalMatcap = makeMetalMatcap();

mats.columnFrame = new THREE.MeshMatcapMaterial({ matcap: metalMatcap, color: 0x5aa0e8, fog: false });
mats.columnFrameAccent = new THREE.MeshMatcapMaterial({ matcap: metalMatcap, color: 0x7cc8ff, fog: false });
mats.columnLowerBeam = new THREE.MeshMatcapMaterial({ matcap: metalMatcap, color: 0x3a78b8, fog: false });

let seed = 1337;
function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function disposeObject3D(obj) {
  obj.traverse((child) => {
    if (child.geometry && !Object.values(geo).includes(child.geometry)) {
      child.geometry.dispose?.();
    }
    if (child.userData?.disposeMaterial && child.material) {
      child.material.dispose?.();
    }
  });
}

function clearGroup(group) {
  while (group.children.length) {
    const c = group.children[0];
    group.remove(c);
    disposeObject3D(c);
  }
}

/** Sector visual density multipliers (organic along 1500 m). */
function columnVisualProfile(distance) {
  const t = distance / RACE_DISTANCE;
  // Phase A.1: navy-only tints (no bright portal horizon). Scene fog stays minimal.
  if (t < 0.2) return { silica: 0.75, flow: 0.7, mol: 0.45, fog: 0.0007, tint: 0x0c1834 };
  if (t < 0.4) return { silica: 1.15, flow: 0.85, mol: 0.7, fog: 0.0008, tint: 0x0c1834 };
  if (t < 0.6) return { silica: 1.0, flow: 1.0, mol: 1.2, fog: 0.0008, tint: 0x0e1a36 };
  if (t < 0.8) return { silica: 0.95, flow: 1.25, mol: 1.1, fog: 0.0008, tint: 0x0c1834 };
  if (t < 0.967) return { silica: 0.85, flow: 1.1, mol: 0.7, fog: 0.0007, tint: 0x0a1428 };
  return { silica: 0.6, flow: 0.85, mol: 0.35, fog: 0.0006, tint: 0x0a1228 };
}

const flowParticles = [];
const ambientMolecules = [];

/** Approved stationary-phase sprites — NearestFilter preserves 16-bit crispness. */
function loadSilicaTexture(url) {
  const tex = texLoader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

const SILICA_TEX = {
  particleSmall: loadSilicaTexture('./assets/environment/silica/silica-particle-small.png'),
  particleMedium: loadSilicaTexture('./assets/environment/silica/silica-particle-medium.png'),
  particleLarge: loadSilicaTexture('./assets/environment/silica/silica-particle-large.png'),
  clusterSmall: loadSilicaTexture('./assets/environment/silica/silica-cluster-small.png'),
  clusterMedium: loadSilicaTexture('./assets/environment/silica/silica-cluster-medium.png'),
  clusterLarge: loadSilicaTexture('./assets/environment/silica/silica-cluster-large.png'),
};

// Packed-bed materials — white base; per-instance purple/violet/lavender tints
const SILICA_MATS = {
  particleSmall: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.particleSmall, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
  particleMedium: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.particleMedium, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
  particleLarge: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.particleLarge, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
  clusterSmall: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.clusterSmall, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
  clusterMedium: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.clusterMedium, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
  clusterLarge: new THREE.MeshBasicMaterial({
    map: SILICA_TEX.clusterLarge, color: 0xffffff, transparent: true, alphaTest: 0.28,
    depthWrite: true, side: THREE.DoubleSide,
  }),
};

/** Non-neon packed-bed tints — readable on navy wall, not neon. */
const SILICA_TINTS = [
  { color: new THREE.Color(0x3a1868), weight: 0.18 }, // dark violet
  { color: new THREE.Color(0x5120a8), weight: 0.26 }, // deep purple
  { color: new THREE.Color(0x6a38c0), weight: 0.24 }, // purple
  { color: new THREE.Color(0x7a58b8), weight: 0.18 }, // blue-violet
  { color: new THREE.Color(0x9a82d0), weight: 0.14 }, // muted lavender
];

function pickSilicaTint() {
  let r = rnd();
  for (const t of SILICA_TINTS) {
    r -= t.weight;
    if (r <= 0) return t.color;
  }
  return SILICA_TINTS[0].color;
}

/** Shared plane for wall-mounted packing (faces column axis, not camera). */
const silicaPlaneGeo = new THREE.PlaneGeometry(1, 1);

/** Runtime counts exposed for reports / debug. */
const silicaStats = { particles: 0, clusters: 0, instances: 0, clusterLarge: 0 };

/** Instanced wall packing — one mesh per approved silica material. */
const silicaLayers = {
  clusterLarge: { mat: SILICA_MATS.clusterLarge, mesh: null, count: 0, kind: 'cluster' },
  clusterMedium: { mat: SILICA_MATS.clusterMedium, mesh: null, count: 0, kind: 'cluster' },
  clusterSmall: { mat: SILICA_MATS.clusterSmall, mesh: null, count: 0, kind: 'cluster' },
  particleLarge: { mat: SILICA_MATS.particleLarge, mesh: null, count: 0, kind: 'particle' },
  particleMedium: { mat: SILICA_MATS.particleMedium, mesh: null, count: 0, kind: 'particle' },
  particleSmall: { mat: SILICA_MATS.particleSmall, mesh: null, count: 0, kind: 'particle' },
};
const silicaDummy = new THREE.Object3D();
const _silicaTint = new THREE.Color();

/**
 * Dense packed-bed sample in L/R annular sectors of the cylinder.
 * Thick bed from near the track corridor out to the wall (not a thin skin at R).
 * angle 0 = +side (right), π/2 = ceiling. Mobile-phase corridor kept clear.
 */
function samplePackedBed(sideSign) {
  const R = GAME_CONFIG.columnRadius;
  // Tight clear channel so L/R beds flank the blue track like the reference
  const corridorR = GAME_CONFIG.laneWidth * 2.35;
  const roll = rnd();
  // Angular elevation from horizon — side masses + upper-lateral cylinder fill
  let elev;
  if (roll < 0.48) elev = -0.1 + rnd() * 0.75;       // mid sides (main mass)
  else if (roll < 0.78) elev = 0.45 + rnd() * 0.8;    // upper-lateral
  else elev = -0.55 + rnd() * 0.35;                  // lower wall above floor
  elev = THREE.MathUtils.clamp(elev, -0.7, 1.35);

  const angle = sideSign > 0 ? elev : Math.PI - elev;
  // Thick annular bed from near track out to wall (solid packed mass)
  const bedRoll = rnd();
  let radial;
  if (bedRoll < 0.40) radial = R - (0.04 + rnd() * 1.2); // outer crust
  else if (bedRoll < 0.82) radial = corridorR + 1.1 + rnd() * (R - corridorR - 1.8); // bulk fill
  else radial = corridorR + 0.7 + rnd() * 1.3; // inner face of bed (near track)

  let lateral = Math.cos(angle) * radial;
  let lift = Math.sin(angle) * radial;

  // Keep mobile-phase track clear — but beds hug the sides closely
  const corridorHalf = GAME_CONFIG.laneWidth * 2.25;
  if (Math.abs(lateral) < corridorHalf) {
    lateral = sideSign * (corridorHalf + 0.55 + rnd() * 1.1);
    const hyp = Math.hypot(lateral, lift) || 1;
    const targetR = Math.max(radial, corridorHalf + 2.4);
    lateral = (lateral / hyp) * targetR;
    lift = (lift / hyp) * targetR;
  }
  // Never sit on the floor ribbon
  if (lift < -R * 0.42) lift = -R * 0.22 + rnd() * 0.4;

  return { lateral, lift, radial, angle };
}

/** Legacy helper kept for any residual callers — routes to packed-bed sampler. */
function sampleWallPacked(sideSign, rMin, rMax, elev = 0) {
  const p = samplePackedBed(sideSign);
  return { lateral: p.lateral, lift: p.lift, r: p.radial };
}

/**
 * Place one inward-facing packing instance on a silica layer.
 * Faces the column axis so it reads as packed bed, not floating debris.
 */
function placeSilicaInstance(layerKey, distance, lateral, lift, scale, tint) {
  const layer = silicaLayers[layerKey];
  const cap = layer?.mesh?.userData?.capacity ?? 0;
  if (!layer || !layer.mesh || layer.count >= cap) return false;
  const f = frameAt(THREE.MathUtils.clamp(distance / RACE_DISTANCE, 0, 0.999));
  const s = scale * (0.94 + rnd() * 0.1);
  const idx = layer.count;
  silicaDummy.position.copy(f.p)
    .addScaledVector(f.side, lateral)
    .addScaledVector(f.trueUp, lift);
  silicaDummy.scale.set(s, s, 1);
  silicaDummy.lookAt(f.p);
  silicaDummy.rotateZ((rnd() - 0.5) * 0.45);
  silicaDummy.updateMatrix();
  layer.mesh.setMatrixAt(idx, silicaDummy.matrix);
  if (tint && layer.mesh.instanceColor) {
    _silicaTint.copy(tint);
    layer.mesh.setColorAt(idx, _silicaTint);
  }
  layer.count += 1;
  if (layer.kind === 'cluster') {
    silicaStats.clusters += 1;
    if (layerKey === 'clusterLarge') silicaStats.clusterLarge += 1;
  } else {
    silicaStats.particles += 1;
  }
  silicaStats.instances += 1;
  return true;
}

/** Clusters: small/medium common; large very rare accent. */
function pickClusterKey() {
  const r = rnd();
  if (r < 0.035) return 'clusterLarge';
  if (r < 0.42) return 'clusterMedium';
  return 'clusterSmall';
}

function pickParticleKey(preferSmall = false) {
  const r = rnd();
  if (preferSmall) {
    if (r < 0.55) return 'particleSmall';
    if (r < 0.88) return 'particleMedium';
    return 'particleLarge';
  }
  if (r < 0.22) return 'particleLarge';
  if (r < 0.7) return 'particleMedium';
  return 'particleSmall';
}

/**
 * Open circular arch curve in local column coordinates.
 * Local X = side, Y = trueUp, Z = tangent.
 * Circle solved so feet sit on L/R pista rails and the crown reaches `radius`.
 */
function createArchCurveData(radius, floorLift) {
  const halfW = GAME_CONFIG.laneWidth * 2.35;
  const cy = (radius * radius - halfW * halfW - floorLift * floorLift)
    / (2 * (radius - floorLift));
  const rr = radius - cy;
  const footAng = Math.atan2(floorLift - cy, halfW);
  const a0 = footAng;
  const a1 = Math.PI - footAng;
  const pathSegs = qualityState.mode === 'low' ? 32 : 56;
  const pts = [];
  for (let i = 0; i <= pathSegs; i++) {
    const a = a0 + (a1 - a0) * (i / pathSegs);
    pts.push(new THREE.Vector3(Math.cos(a) * rr, cy + Math.sin(a) * rr, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
  return { curve, a0, a1, cy, rr, halfW, pathSegs };
}

function createArchFrameGeometry(radius, tubeRadius, floorLift) {
  const data = createArchCurveData(radius, floorLift);
  const radial = qualityState.mode === 'low' ? 6 : 10;
  const geoArch = new THREE.TubeGeometry(data.curve, data.pathSegs, tubeRadius, radial, false);
  geoArch.userData.archAngles = {
    a0: data.a0, a1: data.a1, cy: data.cy, rr: data.rr, halfW: data.halfW,
  };
  return geoArch;
}

/** Basis matrix: local +X→side, +Y→trueUp, +Z→tangent. */
function columnFrameBasis(f, out = new THREE.Matrix4()) {
  return out.makeBasis(f.side, f.trueUp, f.tangent);
}

/**
 * Perforated arch in local space: thick tube segments with circular voids
 * (gap + torus rim) spaced along the circumference.
 */
function buildPerforatedArch(radius, tubeRadius, floorLift, metalMat, glowMat) {
  const { curve } = createArchCurveData(radius, floorLift);
  const group = new THREE.Group();
  group.name = 'columnFramePerforated';
  const radial = qualityState.mode === 'low' ? 5 : 8;
  const holeCount = 5 + Math.floor(rnd() * 4); // 5–8
  const baseHalf = 0.045 + rnd() * 0.025; // larger voids so cutouts read at PIX=3
  const holes = [];
  for (let i = 0; i < holeCount; i++) {
    let t = (i + 0.5) / holeCount + (rnd() - 0.5) * 0.035;
    t = THREE.MathUtils.clamp(t, 0.08, 0.92);
    holes.push({ t, half: baseHalf * (0.85 + rnd() * 0.35) });
  }
  holes.sort((a, b) => a.t - b.t);

  const addSegment = (t0, t1) => {
    if (t1 - t0 < 0.018) return;
    const segs = Math.max(4, Math.floor((t1 - t0) * 48));
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      pts.push(curve.getPoint(t0 + (t1 - t0) * (i / segs)));
    }
    const segCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
    const metal = new THREE.Mesh(
      new THREE.TubeGeometry(segCurve, segs, tubeRadius, radial, false),
      metalMat
    );
    group.add(metal);
    const glow = new THREE.Mesh(
      new THREE.TubeGeometry(segCurve, segs, tubeRadius * 0.28, 4, false),
      glowMat
    );
    group.add(glow);
  };

  const _z = new THREE.Vector3(0, 0, 1);
  let tCursor = 0;
  for (const h of holes) {
    addSegment(tCursor, h.t - h.half);
    const p = curve.getPoint(h.t);
    const tangent = curve.getTangent(h.t).normalize();
    const rimR = tubeRadius * 1.08;
    const rimTube = tubeRadius * 0.24;
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(rimR, rimTube, 6, 18),
      metalMat
    );
    rim.position.copy(p);
    rim.quaternion.setFromUnitVectors(_z, tangent);
    group.add(rim);
    const rimGlow = new THREE.Mesh(
      new THREE.TorusGeometry(rimR, rimTube * 0.45, 5, 14),
      glowMat
    );
    rimGlow.position.copy(p);
    rimGlow.quaternion.copy(rim.quaternion);
    group.add(rimGlow);
    tCursor = h.t + h.half;
  }
  addSegment(tCursor, 1);
  return group;
}

/**
 * Etapa 3.2.1 — containment armature (NOT a continuous cylinder).
 * Transversal open arches + longitudinal beams + L/R lower rails at pista level.
 * Spaces between members are reserved for future silica (3.2.2) — left empty here.
 */
function buildColumnStructure() {
  const R = GAME_CONFIG.columnRadius;
  const length = GAME_CONFIG.columnLength || RACE_DISTANCE;
  const spacing = Math.max(8, GAME_CONFIG.frameSpacing || 18);
  const frameThick = GAME_CONFIG.frameThickness || 0.36;
  const beamThick = GAME_CONFIG.longitudinalBeamThickness || 0.26;
  const lowerThick = GAME_CONFIG.lowerBeamThickness || 0.34;
  // Pista lift in world; arch local floor is relative to lifted column center
  const pistaLift = GAME_CONFIG.lowerBeamHeight ?? -1.25;
  const floorLift = pistaLift - COLUMN_LIFT;
  const lowMul = qualityState.mode === 'low' ? 0.65 : 1;
  const frameCount = Math.max(12, Math.floor((length / spacing) * lowMul));

  const structure = new THREE.Group();
  structure.name = 'columnStructure';

  // --- Transversal curved frames: thick solids + random perforated arches ---
  const tubeR = frameThick * 0.5;
  const archGeo = createArchFrameGeometry(R, tubeR, floorLift);
  const { a0, a1, cy, rr } = archGeo.userData.archAngles;
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x39eaff, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  const glowGeo = createArchFrameGeometry(R - 0.45, frameThick * 0.14, floorLift);

  // Pick ~28% of arches to be perforated (stable via seeded rnd)
  const perforated = new Array(frameCount);
  let solidCount = 0;
  for (let i = 0; i < frameCount; i++) {
    perforated[i] = rnd() < 0.28;
    if (!perforated[i]) solidCount += 1;
  }
  // Guarantee one near-camera perforated arch for readable cutouts
  if (![1, 2, 3, 4].some((i) => perforated[i])) {
    if (!perforated[2]) solidCount -= 1;
    perforated[2] = true;
  }
  if (solidCount === 0) {
    perforated[0] = false;
    solidCount = 1;
  }

  const frames = new THREE.InstancedMesh(archGeo, mats.columnFrame, solidCount);
  frames.name = 'columnFrames';
  frames.frustumCulled = false;
  frames.instanceMatrix.setUsage(THREE.StaticDrawUsage);

  const glow = new THREE.InstancedMesh(glowGeo, glowMat, solidCount);
  glow.name = 'columnFrameGlow';
  glow.frustumCulled = false;

  const dummy = new THREE.Object3D();
  const basis = new THREE.Matrix4();
  const cBase = new THREE.Color(0xa0b4d0);
  const cAccent = new THREE.Color(0xffffff);
  const startD = 8;
  const endD = Math.min(length, DETECTOR_DISTANCE) - 6;
  let solidSlot = 0;
  let perforatedCount = 0;
  for (let i = 0; i < frameCount; i++) {
    const d = startD + (i / Math.max(1, frameCount - 1)) * (endD - startD);
    const f = frameAt(THREE.MathUtils.clamp(d / RACE_DISTANCE, 0, 0.999));
    dummy.position.copy(f.p).addScaledVector(f.trueUp, COLUMN_LIFT);
    dummy.quaternion.setFromRotationMatrix(columnFrameBasis(f, basis));
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();

    if (perforated[i]) {
      const metalMat = i % 4 === 0 ? mats.columnFrameAccent : mats.columnFrame;
      const perf = buildPerforatedArch(R, tubeR, floorLift, metalMat, glowMat);
      perf.position.copy(dummy.position);
      perf.quaternion.copy(dummy.quaternion);
      structure.add(perf);
      perforatedCount += 1;
    } else {
      frames.setMatrixAt(solidSlot, dummy.matrix);
      glow.setMatrixAt(solidSlot, dummy.matrix);
      frames.setColorAt(solidSlot, i % 4 === 0 ? cAccent : cBase);
      solidSlot += 1;
    }
  }
  frames.count = solidSlot;
  glow.count = solidSlot;
  frames.instanceMatrix.needsUpdate = true;
  glow.instanceMatrix.needsUpdate = true;
  if (frames.instanceColor) frames.instanceColor.needsUpdate = true;
  structure.add(frames);
  structure.add(glow);
  structure.userData.archStats = { total: frameCount, solid: solidSlot, perforated: perforatedCount };

  // --- Ceiling longitudinal beams only (skip crown center + all side/lower lines) ---
  const ceilingUs = [0.38, 0.62];
  const beamSegs = qualityState.mode === 'low' ? 100 : 180;
  for (let bi = 0; bi < ceilingUs.length; bi++) {
    const u = ceilingUs[bi];
    const a = a0 + (a1 - a0) * u;
    const localX = Math.cos(a) * rr;
    const localY = cy + Math.sin(a) * rr;
    const pts = [];
    for (let i = 0; i <= beamSegs; i++) {
      const t = THREE.MathUtils.clamp(i / beamSegs, 0, 0.999);
      const f = frameAt(t);
      pts.push(
        f.p.clone()
          .addScaledVector(f.trueUp, COLUMN_LIFT)
          .addScaledVector(f.side, localX)
          .addScaledVector(f.trueUp, localY)
      );
    }
    const beamCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.12);
    const beamGeo = new THREE.TubeGeometry(beamCurve, beamSegs, beamThick * 0.5, 6, false);
    const beam = new THREE.Mesh(beamGeo, bi % 2 === 0 ? mats.columnFrame : mats.columnFrameAccent);
    beam.name = 'columnLongitudinalBeam';
    beam.frustumCulled = false;
    structure.add(beam);
    // Thin neon core along ceiling beams
    const beamGlow = new THREE.Mesh(
      new THREE.TubeGeometry(beamCurve, beamSegs, beamThick * 0.12, 4, false),
      glowMat
    );
    beamGlow.name = 'columnLongitudinalGlow';
    beamGlow.frustumCulled = false;
    structure.add(beamGlow);
  }

  // --- Lower L/R rails at pista level (silica bed floor limit; never cross center) ---
  const corridorHalf = GAME_CONFIG.laneWidth * 2.35;
  const railSegs = qualityState.mode === 'low' ? 100 : 180;
  for (const sideSign of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= railSegs; i++) {
      const t = THREE.MathUtils.clamp(i / railSegs, 0, 0.999);
      const f = frameAt(t);
      pts.push(
        f.p.clone()
          .addScaledVector(f.side, sideSign * corridorHalf)
          .addScaledVector(f.trueUp, pistaLift)
      );
    }
    const railCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.12);
    const railGeo = new THREE.TubeGeometry(railCurve, railSegs, lowerThick * 0.5, 6, false);
    const rail = new THREE.Mesh(railGeo, mats.columnLowerBeam);
    rail.name = sideSign > 0 ? 'columnLowerBeamR' : 'columnLowerBeamL';
    rail.frustumCulled = false;
    structure.add(rail);
  }

  envGroup.add(structure);
}

/**
 * Legacy full-circle section rings — unused in 3.2.1 (open arches replace them).
 * Kept so older debug callers do not break if re-enabled.
 */
function buildColumnSectionRings(wallRadius) {
  const distances = [];
  for (let i = 0; i < SECTORS.length; i++) {
    const s = SECTORS[i];
    if (i > 0) distances.push(s.start);
    const mid = (s.start + s.end) * 0.5;
    if (mid > 40 && mid < RACE_DISTANCE - 40) distances.push(mid);
  }
  distances.sort((a, b) => a - b);

  const tubeR = qualityState.mode === 'low' ? 1.05 : 1.35;
  const majorR = wallRadius - tubeR * 0.85;

  for (let i = 0; i < distances.length; i++) {
    const d = distances[i];
    if (d < 40 || d > RACE_DISTANCE - 30) continue;
    const f = frameAt(THREE.MathUtils.clamp(d / RACE_DISTANCE, 0, 0.999));
    const isBoundary = SECTORS.some((s, idx) => idx > 0 && Math.abs(s.start - d) < 0.5);
    const bulkTube = isBoundary ? tubeR : tubeR * 0.72;

    const ring = new THREE.Group();
    ring.name = 'columnSectionRing';

    const bulkGeo = new THREE.TorusGeometry(majorR, bulkTube, 16, 64);
    const bulk = new THREE.Mesh(bulkGeo, mats.columnSectionRing);
    bulk.renderOrder = 1;

    const coreGeo = new THREE.TorusGeometry(majorR - bulkTube * 0.12, bulkTube * 0.45, 12, 48);
    const core = new THREE.Mesh(coreGeo, mats.columnSectionRingCore);
    core.renderOrder = 1;

    ring.add(bulk, core);
    ring.position.copy(f.p).addScaledVector(f.trueUp, COLUMN_LIFT);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
    envGroup.add(ring);
  }
}

/** Thin longitudinal glass seams — L/R only, very subtle (no crosshair, no rings). */
function buildColumnSeams(tubularSegments, radius) {
  const angles = [-1.12, 1.12]; // left/right walls only
  const seamSegs = Math.floor(tubularSegments * 0.7);
  for (let ai = 0; ai < angles.length; ai++) {
    const ang = angles[ai];
    const pts = [];
    for (let i = 0; i <= seamSegs; i++) {
      const t = i / seamSegs;
      const f = frameAt(THREE.MathUtils.clamp(t, 0, 0.999));
      const p = f.p.clone()
        .addScaledVector(f.side, Math.cos(ang) * radius)
        .addScaledVector(f.trueUp, Math.sin(ang) * radius);
      pts.push(p);
    }
    const seamCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
    const seamGeo = new THREE.TubeGeometry(seamCurve, seamSegs, 0.012, 3, false);
    const seam = new THREE.Mesh(seamGeo, mats.columnSeam);
    seam.renderOrder = -1;
    envGroup.add(seam);
  }
}

/**
 * Sparse longitudinal wall fittings — technical glass segments, not transverse rings.
 */
function buildColumnClamps(radius) {
  const count = qualityState.mode === 'low' ? 4 : 6;
  for (let i = 0; i < count; i++) {
    const d = 180 + i * ((RACE_DISTANCE - 360) / Math.max(1, count - 1));
    if (d > DETECTOR_DISTANCE - 60) continue;
    const f = frameAt(THREE.MathUtils.clamp(d / RACE_DISTANCE, 0, 0.999));
    const sideSign = i % 2 === 0 ? 1 : -1;
    const elev = (i % 3 === 0 ? 0.22 : i % 3 === 1 ? -0.18 : 0.05);

    const clamp = new THREE.Group();
    const plate = new THREE.Mesh(geo.pixel, mats.columnClamp);
    plate.scale.set(0.35, 1.35, 0.12); // elongated along wall, not a ring
    const tip = new THREE.Mesh(geo.pixel, mats.columnClampAccent);
    tip.scale.set(0.12, 0.9, 0.1);
    tip.position.x = 0.18;
    clamp.add(plate, tip);

    clamp.position.copy(f.p)
      .addScaledVector(f.side, sideSign * radius * 0.94)
      .addScaledVector(f.trueUp, elev * radius);
    clamp.lookAt(f.p);
    envGroup.add(clamp);
  }
}

/**
 * Stationary-phase packing — mid-density wall bed (3.2.2B).
 * Midpoint between empty floating debris (~few hundred visible as space rocks)
 * and cave flood (~44k). Modest scales + wide corridor; silica frames the tube.
 *
 * Midpoint budget ~4k–5k modest sprites (~9× below cave ~44k).
 * Brief “180–240 total” cannot hit ~15–25% player-camera frame coverage
 * over 1500 m; composition follows the visual hierarchy targets instead.
 */
/**
 * ETAPA 3.2.2 — dense chromatographic packed bed on L/R (+ upper-lateral) walls.
 * Central mobile-phase corridor stays clear. Section rings remain visible (gaps).
 * InstancedMesh only — no independent Mesh flood.
 */
function buildSilicaField() {
  clearGroup(silicaGroup);
  silicaStats.particles = 0;
  silicaStats.clusters = 0;
  silicaStats.instances = 0;
  silicaStats.clusterLarge = 0;
  Object.keys(silicaLayers).forEach((key) => {
    silicaLayers[key].count = 0;
    silicaLayers[key].mesh = null;
  });

  const mul = Math.min(1.15, qualityState.particleMul * (DEBUG_SILICA ? 1.2 : 1));
  const debugScale = DEBUG_SILICA ? 1.06 : 1;
  /** @type {{ key: string, distance: number, lateral: number, lift: number, scale: number, tint: THREE.Color }[]} */
  const placements = [];
  const queue = (key, distance, lateral, lift, scale) => {
    placements.push({
      key, distance, lateral, lift, scale,
      tint: pickSilicaTint().clone(),
    });
  };

  // Readable packed-bed scales at R=18 (compact beads, not sparse boulders)
  const clusterScale = (key) => {
    if (key === 'clusterLarge') return 1.55 + rnd() * 0.35;
    if (key === 'clusterMedium') return 1.15 + rnd() * 0.28;
    return 0.85 + rnd() * 0.25;
  };
  const particleScale = (size = 'medium') => {
    if (size === 'small') return 0.48 + rnd() * 0.2;
    if (size === 'large') return 0.85 + rnd() * 0.22;
    return 0.62 + rnd() * 0.2;
  };

  // Leave metallic section rings readable
  const ringGaps = [];
  for (let i = 0; i < SECTORS.length; i++) {
    const s = SECTORS[i];
    if (i > 0) ringGaps.push(s.start);
    const mid = (s.start + s.end) * 0.5;
    if (mid > 40 && mid < RACE_DISTANCE - 40) ringGaps.push(mid);
  }
  const nearRingGap = (d) => ringGaps.some((rd) => Math.abs(rd - d) < 5.2);

  // Dense cylindrical beds — L/R mass along full spline
  const patchStep = Math.max(0.32, 0.38 / Math.max(0.55, mul));
  outerPacked:
  for (let d0 = 8; d0 < RACE_DISTANCE - 10; d0 += patchStep) {
    if (nearRingGap(d0) && rnd() < 0.68) continue; // structural rings show through

    for (const sideSign of [-1, 1]) {
      const seeds = 5 + Math.floor(rnd() * 5); // 5–9 cluster seeds / side / patch
      for (let s = 0; s < seeds; s++) {
        if (placements.length > 28000) break outerPacked;
        const base = samplePackedBed(sideSign);
        const dd = d0 + (rnd() - 0.5) * patchStep * 0.95;

        if (rnd() < 0.4) {
          const key = pickClusterKey();
          queue(key, dd, base.lateral, base.lift, clusterScale(key) * debugScale);
        } else {
          const pk = pickParticleKey(rnd() < 0.45);
          const sz = pk === 'particleSmall' ? 'small' : pk === 'particleLarge' ? 'large' : 'medium';
          queue(pk, dd, base.lateral, base.lift, particleScale(sz) * debugScale);
        }

        // Tight companions → compacted bed mass on the side
        const companions = 8 + Math.floor(rnd() * 8); // 8–15
        for (let c = 0; c < companions; c++) {
          if (rnd() > 0.95) continue;
          const p2 = samplePackedBed(sideSign);
          const lateral = THREE.MathUtils.lerp(base.lateral, p2.lateral, 0.25 + rnd() * 0.4);
          const lift = THREE.MathUtils.lerp(base.lift, p2.lift, 0.25 + rnd() * 0.4);
          const d2 = dd + (rnd() - 0.5) * 0.85;
          if (nearRingGap(d2) && rnd() < 0.5) continue;
          if (rnd() < 0.32) {
            const key = rnd() < 0.7 ? 'clusterSmall' : 'clusterMedium';
            queue(key, d2, lateral, lift, clusterScale(key) * 0.92 * debugScale);
          } else {
            queue(
              pickParticleKey(true),
              d2, lateral, lift,
              particleScale(rnd() < 0.55 ? 'small' : 'medium') * debugScale
            );
          }
        }
      }
    }
  }

  // Background knit — tiny particles for packed-bed fill
  const fillStep = Math.max(0.55, 0.65 / Math.max(0.55, mul));
  for (let d0 = 10; d0 < RACE_DISTANCE - 14; d0 += fillStep) {
    if (placements.length > 28000) break;
    if (nearRingGap(d0) && rnd() < 0.6) continue;
    for (const sideSign of [-1, 1]) {
      const n = 3 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const p = samplePackedBed(sideSign);
        queue(
          pickParticleKey(true),
          d0 + rnd() * fillStep * 0.6,
          p.lateral, p.lift,
          particleScale('small') * 0.95 * debugScale
        );
      }
    }
  }

  // Soft budget — keep local cluster cohesion (no stride thinning)
  const softMax = Math.floor(22000 * Math.min(1.1, mul));
  if (placements.length > softMax) {
    // Reservoir-sample random subset so dense companion groups survive
    for (let i = placements.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = placements[i];
      placements[i] = placements[j];
      placements[j] = tmp;
    }
    placements.length = softMax;
  }

  const counts = {
    clusterLarge: 0, clusterMedium: 0, clusterSmall: 0,
    particleLarge: 0, particleMedium: 0, particleSmall: 0,
  };
  placements.forEach((p) => { counts[p.key] += 1; });
  Object.keys(silicaLayers).forEach((key) => {
    const n = Math.max(1, counts[key] || 0);
    const mesh = new THREE.InstancedMesh(silicaPlaneGeo, silicaLayers[key].mat, n);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.frustumCulled = false;
    mesh.renderOrder = 0;
    mesh.userData.capacity = n;
    // Enable per-instance color variation
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
    silicaLayers[key].mesh = mesh;
    silicaLayers[key].count = 0;
    silicaGroup.add(mesh);
  });
  placements.forEach((p) => {
    placeSilicaInstance(p.key, p.distance, p.lateral, p.lift, p.scale, p.tint);
  });
  Object.keys(silicaLayers).forEach((key) => {
    const layer = silicaLayers[key];
    if (!layer.mesh) return;
    layer.mesh.count = layer.count;
    layer.mesh.instanceMatrix.needsUpdate = true;
    if (layer.mesh.instanceColor) layer.mesh.instanceColor.needsUpdate = true;
  });

  applyEnvironmentDebugVisibility();
}

function buildInfrastructure() {
  const count = Math.floor(48 / qualityState.ringStep);
  const dummy = new THREE.Object3D();
  const struts = new THREE.InstancedMesh(geo.strut, mats.infra, count * 2);
  const panels = new THREE.InstancedMesh(geo.panel, mats.infraAccent, count);
  let si = 0;
  let pi = 0;
  for (let i = 0; i < count; i++) {
    const d = (i / Math.max(1, count - 1)) * RACE_DISTANCE;
    const f = frameAt(d / RACE_DISTANCE);
    for (const sideSign of [-1, 1]) {
      dummy.position.copy(f.p)
        .addScaledVector(f.side, sideSign * (GAME_CONFIG.columnRadius - 1.15))
        .addScaledVector(f.trueUp, -0.4 + (i % 3) * 0.35);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      struts.setMatrixAt(si++, dummy.matrix);
    }
    if (i % 2 === 0) {
      const sideSign = (i % 4) < 2 ? -1 : 1;
      dummy.position.copy(f.p)
        .addScaledVector(f.side, sideSign * (GAME_CONFIG.columnRadius - 0.6))
        .addScaledVector(f.trueUp, 1.8);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      panels.setMatrixAt(pi++, dummy.matrix);
    }
  }
  struts.count = si;
  panels.count = pi;
  struts.instanceMatrix.needsUpdate = true;
  panels.instanceMatrix.needsUpdate = true;
  infraGroup.add(struts, panels);

  for (let i = 0; i < 18; i++) {
    const d = 40 + i * (RACE_DISTANCE / 18);
    const f = frameAt(d / RACE_DISTANCE);
    const port = new THREE.Mesh(geo.pixel, mats.detectorAccent);
    port.scale.set(0.35, 0.55, 0.9);
    port.position.copy(f.p)
      .addScaledVector(f.trueUp, GAME_CONFIG.columnRadius - 1.4)
      .addScaledVector(f.side, (i % 2 ? -1 : 1) * 1.2);
    infraGroup.add(port);
  }
}

/**
 * Apply DEBUG_COLUMN / DEBUG_DETECTOR / DEBUG_SILICA visibility.
 * DEBUG_COLUMN: shell + player only.
 * DEBUG_DETECTOR: shell + detector (+ player); hide silica/flow/molecules/decor.
 */
function applyEnvironmentDebugVisibility() {
  if (DEBUG_COLUMN) {
    silicaGroup.visible = false;
    flowGroup.visible = false;
    infraGroup.visible = false;
    detectorGroup.visible = false;
    ambientMolecules.forEach((m) => { if (m.mesh) m.mesh.visible = false; });
    if (mats.columnSeam) mats.columnSeam.opacity = 0.14;
    return;
  }

  if (DEBUG_DETECTOR) {
    silicaGroup.visible = false;
    flowGroup.visible = false;
    infraGroup.visible = false;
    detectorGroup.visible = true;
    ambientMolecules.forEach((m) => { if (m.mesh) m.mesh.visible = false; });
    if (mats.columnSeam) mats.columnSeam.opacity = 0.12;
    return;
  }

  silicaGroup.visible = true;
  flowGroup.visible = !DEBUG_SILICA;
  infraGroup.visible = !DEBUG_SILICA && !VISUAL_PHASE1_COMPOSITION;
  detectorGroup.visible = true;
  ambientMolecules.forEach((m) => {
    if (m.mesh) m.mesh.visible = !VISUAL_PHASE1_COMPOSITION;
  });
  if (mats.columnSeam) mats.columnSeam.opacity = 0.12;

  if (DEBUG_SILICA) {
    flowGroup.visible = false;
    infraGroup.visible = false;
  }
}

/** Hide gameplay clutter for DEBUG_COLUMN / DEBUG_DETECTOR / Phase 1 composition shots. */
function applyDebugColumnGameplayHide() {
  if (!DEBUG_COLUMN && !DEBUG_DETECTOR && !VISUAL_PHASE1_COMPOSITION) return;
  obstacles.forEach((o) => { if (o.g) o.g.visible = false; });
  pickups.forEach((p) => { if (p.g) p.g.visible = false; });
  rivals.forEach((r) => {
    if (r.actor) {
      r.actor.sprite.visible = false;
      r.actor.label.visible = false;
    } else if (r.g) {
      r.g.visible = false;
    }
  });
}

/** Soft matcap for volumetric 3D relief beads (no scene lights required). */
function makeMatcap() {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(s * 0.38, s * 0.32, s * 0.04, s * 0.5, s * 0.5, s * 0.52);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(0.35, '#e0e0f0');
  gr.addColorStop(0.7, '#a8a8c8');
  gr.addColorStop(1, '#50507a');
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Stamp atlas from assets/environment/silica/* (3×2).
 * silica-back.png is a L/R composition, not a cell grid — use the stamp sheet.
 */
const SHEET_URL = './assets/silica-stamps-sheet.png';
const SHEET_COLS = 3;
const SHEET_ROWS = 2;

const wallMat2 = new THREE.MeshBasicMaterial({
  color: 0x140f3d,
  side: THREE.DoubleSide,
  fog: false,
  transparent: true,
  alphaTest: 0.08,
});

function bakeWallTexture(img) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#140f3d';
  g.fillRect(0, 0, W, H);

  const cw = img.width / SHEET_COLS;
  const ch = img.height / SHEET_ROWS;
  const stamps = [];
  for (let i = 0; i < 1200; i++) {
    stamps.push({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 28 + Math.pow(Math.random(), 2) * 140,
      cell: (Math.random() * SHEET_COLS * SHEET_ROWS) | 0,
    });
  }
  stamps.sort((a, b) => a.s - b.s); // grandes por cima

  for (const st of stamps) {
    const sx = (st.cell % SHEET_COLS) * cw;
    const sy = Math.floor(st.cell / SHEET_COLS) * ch;
    for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
      const dx = st.x + ox - st.s / 2;
      const dy = st.y + oy - st.s / 2;
      if (dx > W || dy > H || dx + st.s < 0 || dy + st.s < 0) continue;
      g.drawImage(img, sx, sy, cw, ch, dx, dy, st.s, st.s);
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.repeat.set(RACE_DISTANCE / 48, 1);
  wallMat2.color.set(0xffffff);
  wallMat2.map = t;
  wallMat2.needsUpdate = true;
}

const sheetImg = new Image();
sheetImg.onload = () => bakeWallTexture(sheetImg);
sheetImg.src = SHEET_URL;

/**
 * Lateral silica wall strip — ceiling + floor stay open (mobile phase / frames).
 * sideSign +1 = right, -1 = left.
 */
function buildLateralSilicaWall(sideSign) {
  const R = GAME_CONFIG.columnRadius + 1.6;
  const segments = qualityState.mode === 'low' ? 160 : 280;
  const elevBands = qualityState.mode === 'low' ? 6 : 10;
  // Angles relative to lifted column center — reach pista, leave crown open
  const pistaLift = (GAME_CONFIG.lowerBeamHeight ?? -1.25) + 0.4;
  const elev0 = Math.asin(THREE.MathUtils.clamp((pistaLift - COLUMN_LIFT) / R, -0.99, 0.99));
  const elev1 = 0.72; // stop before ceiling so frames / mobile-phase crown stay readable
  const positions = [];
  const uvs = [];
  const indices = [];
  const normals = [];
  const _n = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = Math.min(0.999, i / segments);
    const f = frameAt(t);
    const u = (i / segments) * (RACE_DISTANCE / 48);
    for (let j = 0; j <= elevBands; j++) {
      const v = j / elevBands;
      const elev = elev0 + (elev1 - elev0) * v;
      const a = sideSign > 0 ? elev : Math.PI - elev;
      const p = f.p.clone()
        .addScaledVector(f.trueUp, COLUMN_LIFT)
        .addScaledVector(f.side, Math.cos(a) * R)
        .addScaledVector(f.trueUp, Math.sin(a) * R);
      positions.push(p.x, p.y, p.z);
      _n.copy(f.side).multiplyScalar(-Math.cos(a))
        .addScaledVector(f.trueUp, -Math.sin(a))
        .normalize();
      normals.push(_n.x, _n.y, _n.z);
      uvs.push(u, v);
      if (i < segments && j < elevBands) {
        const a0 = i * (elevBands + 1) + j;
        const a1 = a0 + 1;
        const b0 = (i + 1) * (elevBands + 1) + j;
        const b1 = b0 + 1;
        indices.push(a0, b0, a1, a1, b0, b1);
      }
    }
  }

  const geoWall = new THREE.BufferGeometry();
  geoWall.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geoWall.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geoWall.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geoWall.setIndex(indices);
  geoWall.computeBoundingSphere();

  const mesh = new THREE.Mesh(geoWall, wallMat2);
  mesh.name = sideSign > 0 ? 'silicaWallR' : 'silicaWallL';
  mesh.renderOrder = -2;
  mesh.frustumCulled = false;
  return mesh;
}

function buildEnvironment() {
  clearGroup(envGroup);
  clearGroup(silicaGroup);
  clearGroup(infraGroup);
  seed = 1337;
  buildColumnStructure();

  // Dark outer shell for enclosure depth (no silica on ceiling/floor)
  const wallPts = [];
  for (let i = 0; i <= 200; i++) {
    const f = frameAt(i / 200);
    wallPts.push(f.p.clone().addScaledVector(f.trueUp, COLUMN_LIFT));
  }
  const shell = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wallPts), 400, GAME_CONFIG.columnRadius + 1.85, 20, false),
    new THREE.MeshBasicMaterial({ color: 0x0c0a28, side: THREE.BackSide, fog: false })
  );
  shell.name = 'columnWall';
  shell.renderOrder = -3;
  envGroup.add(shell);

  // Lateral packed-bed walls from spritesheet stamps; ceiling/floor stay clear
  if (!DEBUG_COLUMN && !DEBUG_DETECTOR) {
    envGroup.add(buildLateralSilicaWall(1));
    envGroup.add(buildLateralSilicaWall(-1));
  }

  // Sparse 3D matcap beads for near-field relief — lateral walls only
  if (!DEBUG_COLUMN && !DEBUG_DETECTOR) {
    const palette = [0x8f5cf0, 0xa57bff, 0x7a4de0, 0xb0acd0, 0x9a96bd].map((c) => new THREE.Color(c));
    const beadCount = Math.floor(1200 * qualityState.particleMul);
    const beads = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 8),
      new THREE.MeshMatcapMaterial({ matcap: makeMatcap(), fog: false }),
      beadCount
    );
    beads.name = 'silicaBeads';
    beads.frustumCulled = false;
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    let placed = 0;
    let guard = 0;
    while (placed < beadCount && guard < beadCount * 6) {
      guard += 1;
      const d = 10 + rnd() * (RACE_DISTANCE - 20);
      const f = frameAt(d / RACE_DISTANCE);
      const sideSign = rnd() < 0.5 ? 1 : -1;
      const pistaLift = (GAME_CONFIG.lowerBeamHeight ?? -1.25) + 0.5;
      const Rwall = GAME_CONFIG.columnRadius + 0.7;
      const elev0 = Math.asin(THREE.MathUtils.clamp((pistaLift - COLUMN_LIFT) / Rwall, -0.99, 0.99));
      const elev = elev0 + rnd() * (0.72 - elev0);
      const a = sideSign > 0 ? elev : Math.PI - elev;
      const r = GAME_CONFIG.columnRadius + 0.7 - rnd() * 1.3;
      const p = f.p.clone()
        .addScaledVector(f.trueUp, COLUMN_LIFT)
        .addScaledVector(f.side, Math.cos(a) * r)
        .addScaledVector(f.trueUp, Math.sin(a) * r);
      const s = 0.4 + Math.pow(rnd(), 2.5) * 0.8;
      m4.compose(p, q, sc.set(s, s, s));
      beads.setMatrixAt(placed, m4);
      beads.setColorAt(placed, palette[Math.floor(rnd() * palette.length)]);
      placed += 1;
    }
    beads.count = placed;
    beads.instanceMatrix.needsUpdate = true;
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
    envGroup.add(beads);
  }

  // Skip futuristic infra clutter — armature carries structure
  if (!DEBUG_COLUMN && !DEBUG_DETECTOR && !DEBUG_SILICA && !VISUAL_PHASE1_COMPOSITION) {
    buildInfrastructure();
  }
  applyEnvironmentDebugVisibility();
}

/**
 * Visual-target Phase 1 — continuous blue/cyan mobile-phase race surface.
 * Ribbon follows the spline just below the gameplay path (lanes unchanged).
 */
function buildMobilePhaseFloor() {
  const segments = qualityState.mode === 'low' ? 160 : 260;
  const halfW = GAME_CONFIG.laneWidth * 2.35; // ~3–5 character widths
  const lift = -1.35; // just under Vita racing line
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const _n = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = Math.min(0.999, i / segments);
    const f = frameAt(t);
    const center = f.p.clone().addScaledVector(f.trueUp, lift);
    const left = center.clone().addScaledVector(f.side, -halfW);
    const right = center.clone().addScaledVector(f.side, halfW);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
    _n.copy(f.trueUp);
    normals.push(_n.x, _n.y, _n.z, _n.x, _n.y, _n.z);
    const u = (i / segments) * 14;
    uvs.push(u, 0, u, 1);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geoFloor = new THREE.BufferGeometry();
  geoFloor.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geoFloor.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geoFloor.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geoFloor.setIndex(indices);
  geoFloor.computeBoundingSphere();

  const floor = new THREE.Mesh(geoFloor, mats.mobilePhase);
  floor.name = 'mobilePhaseFloor';
  floor.renderOrder = -1;
  flowGroup.add(floor);
}

function buildFlowChannels() {
  clearGroup(flowGroup);
  // Structural mobile-phase floor (Phase 1 composition)
  buildMobilePhaseFloor();

  // Decorative motes deferred in Phase 1 — keep gameplay path readable
  if (VISUAL_PHASE1_COMPOSITION) return;

  const tickCount = Math.floor(18 * qualityState.particleMul);
  const ticks = new THREE.InstancedMesh(geo.pixel, mats.flowSoft, tickCount);
  ticks.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const dummy = new THREE.Object3D();
  let ti = 0;
  for (let i = 0; i < tickCount; i++) {
    const lane = LANES[i % 3] * 0.35;
    const d = (i / tickCount) * RACE_DISTANCE;
    const f = frameAt(THREE.MathUtils.clamp(d / RACE_DISTANCE, 0, 0.999));
    worldAt(d, lane, 0.06 + (i % 5) * 0.04, dummy.position);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
    const s = 0.03 + (i % 3) * 0.01;
    dummy.scale.set(s * 0.35, s * 0.35, s * 0.9);
    dummy.updateMatrix();
    ticks.setMatrixAt(ti++, dummy.matrix);
  }
  ticks.count = ti;
  ticks.instanceMatrix.needsUpdate = true;
  flowGroup.add(ticks);
}

function spawnFlowParticles() {
  flowParticles.forEach((fp) => flowGroup.remove(fp.mesh));
  flowParticles.length = 0;
  // Phase 1: no decorative solvent motes — floor carries mobile-phase read
  if (VISUAL_PHASE1_COMPOSITION) return;
  const count = Math.floor(120 * qualityState.particleMul);
  for (let i = 0; i < count; i++) {
    const laneBias = LANES[i % 3] + (rnd() - 0.5) * 0.7;
    const mesh = new THREE.Mesh(geo.pixel, mats.flowPixel.clone());
    mesh.material.opacity = 0.12 + rnd() * 0.28;
    const s = 0.025 + rnd() * 0.07;
    mesh.scale.set(s, s, s * (1.4 + rnd() * 2.4));
    flowGroup.add(mesh);
    flowParticles.push({
      mesh,
      lane: laneBias,
      offset: rnd() * RACE_DISTANCE,
      speed: 16 + rnd() * 26,
      wobble: rnd() * Math.PI * 2,
      liftBase: 0.15 + rnd() * 1.1,
    });
  }
}

function spawnAmbientMolecules() {
  ambientMolecules.forEach((m) => scene.remove(m.mesh));
  ambientMolecules.length = 0;
  // Phase 1 defers molecules / particle polish (Phase 4 in visual target)
  if (VISUAL_PHASE1_COMPOSITION) return;
  const count = Math.floor(36 * qualityState.particleMul);
  for (let i = 0; i < count; i++) {
    const mat = mats.moleculeAmb[i % mats.moleculeAmb.length];
    const mesh = new THREE.Mesh(i % 3 === 0 ? geo.crystal : geo.pixel, mat);
    mesh.scale.setScalar(0.12 + rnd() * 0.22);
    scene.add(mesh);
    ambientMolecules.push({
      mesh,
      lane: (rnd() - 0.5) * 2.4,
      offset: rnd() * RACE_DISTANCE,
      speed: 6 + rnd() * 14,
      lift: 0.4 + rnd() * 2.2,
      spin: 0.5 + rnd() * 2,
    });
  }
}

/**
 * UV/Vis optical detector — scientific instrumentation at ~1450 m.
 * Distant: small cyan-white core + soft halo.
 * Close: compact housing + optical aperture (NOT a portal / finish gate).
 */
const detectorTex = texLoader.load('./assets/detector-uv-vis.png');
detectorTex.colorSpace = THREE.SRGBColorSpace;
detectorTex.magFilter = THREE.NearestFilter;
detectorTex.minFilter = THREE.NearestFilter;

const detectorFace = new THREE.Sprite(new THREE.SpriteMaterial({
  map: detectorTex, transparent: true, depthWrite: false, opacity: 0.85, fog: false,
}));
detectorFace.scale.set(4.2, 2.8, 1);
detectorFace.renderOrder = 4;

// Soft distant optical halo (sprite, not a giant ring mesh)
const detectorHaloSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  color: 0x5de5ff,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  fog: false,
  blending: THREE.AdditiveBlending,
}));
detectorHaloSprite.scale.set(2.4, 2.4, 1);
detectorHaloSprite.renderOrder = 3;

const detectorCore = new THREE.Mesh(geo.sphereS, mats.detectorCore);
detectorCore.scale.set(0.55, 0.55, 0.35);
detectorCore.renderOrder = 5;

const detectorHaloMesh = new THREE.Mesh(geo.sphereS, mats.detectorHalo);
detectorHaloMesh.scale.set(1.35, 1.35, 0.7);
detectorHaloMesh.renderOrder = 3;

const detectorHousing = new THREE.Group();
{
  // Compact dark technical housing — lab instrument, not a gate
  const body = new THREE.Mesh(geo.pixel, mats.detectorBody);
  body.scale.set(3.6, 3.2, 2.4);
  const backplate = new THREE.Mesh(geo.pixel, mats.detectorHousingDark);
  backplate.scale.set(4.2, 3.8, 0.35);
  backplate.position.z = -1.35;
  const bezel = new THREE.Mesh(geo.pixel, mats.detectorHousingDark);
  bezel.scale.set(2.6, 2.6, 0.4);
  bezel.position.z = 1.15;
  const aperture = new THREE.Mesh(geo.sphereS, mats.detectorUv);
  aperture.scale.set(1.05, 1.05, 0.45);
  aperture.position.z = 1.45;
  const windowRing = new THREE.Mesh(geo.pixel, mats.detectorAccent);
  windowRing.scale.set(2.2, 0.12, 0.12);
  windowRing.position.set(0, 1.15, 1.35);
  const amber = new THREE.Mesh(geo.pixel, mats.detectorAmber);
  amber.scale.set(0.28, 0.28, 0.2);
  amber.position.set(1.45, 1.35, 1.1);
  const sensorL = new THREE.Mesh(geo.pixel, mats.detectorAccent);
  sensorL.scale.set(0.22, 0.55, 0.22);
  sensorL.position.set(-1.55, 0.2, 1.25);
  const sensorR = sensorL.clone();
  sensorR.position.x = 1.55;
  const mount = new THREE.Mesh(geo.pixel, mats.detectorHousingDark);
  mount.scale.set(0.45, 1.8, 0.45);
  mount.position.set(0, -2.2, -0.2);
  detectorHousing.add(body, backplate, bezel, aperture, windowRing, amber, sensorL, sensorR, mount);
  detectorHousing.add(detectorCore, detectorHaloMesh);
}

detectorGroup.add(detectorHousing, detectorFace, detectorHaloSprite);
const detectorGlow = new THREE.PointLight(0x5de5ff, 0.8, 45, 2);
detectorGroup.add(detectorGlow);
const detectorFill = new THREE.PointLight(0xe8f8ff, 0.25, 22, 2);
detectorGroup.add(detectorFill);
const detector = detectorFace;

function placeDetector() {
  const t = THREE.MathUtils.clamp(DETECTOR_DISTANCE / RACE_DISTANCE, 0, 0.999);
  const f = frameAt(t);
  // Low on the far column end — horizon anchor under Vita's sightline (not a portal disc)
  const p = worldAt(DETECTOR_DISTANCE, 0, 0.15);
  p.addScaledVector(f.trueUp, -0.25);
  detectorGroup.position.copy(p);
  // Face toward oncoming racers (against race tangent)
  detectorGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent.clone().negate());
  detectorHousing.position.set(0, 0.25, 0);
  detectorFace.position.set(0, 0.45, 1.45);
  detectorHaloSprite.position.set(0, 0.45, 1.3);
  detectorCore.position.set(0, 0.3, 1.3);
  detectorHaloMesh.position.set(0, 0.3, 1.15);
  detectorGlow.position.set(0, 0.45, 1.8);
  detectorFill.position.set(0, 0.2, 1.0);
}

/** Purely visual UV/Vis approach staging — does not alter race logic. */
function updateDetectorApproach(dist) {
  const toDet = DETECTOR_DISTANCE - dist;
  // Stay mounted through finish; distant speck from ~900 m out (not a portal).
  // Phase 1: keep distant cyan destination always readable as vanishing-point anchor
  const showDetector = (!DEBUG_COLUMN || DEBUG_DETECTOR)
    && (DEBUG_DETECTOR || VISUAL_PHASE1_COMPOSITION || toDet < 900);
  detectorGroup.visible = showDetector;
  if (!showDetector) return;

  // Stages: <250 subtle, <150 clear, <75 brighter, <30 housing readable
  const absTo = Math.abs(toDet);
  const far = THREE.MathUtils.clamp(1 - Math.max(0, toDet) / 900, 0, 1);
  const subtle = THREE.MathUtils.clamp(1 - Math.max(0, toDet) / 250, 0, 1);
  const clear = THREE.MathUtils.clamp(1 - Math.max(0, toDet) / 150, 0, 1);
  const bright = THREE.MathUtils.clamp(1 - Math.max(0, toDet) / 75, 0, 1);
  const close = THREE.MathUtils.clamp(1 - Math.max(0, toDet) / 30, 0, 1);
  // Past the mount: keep instrument readable until finish
  const past = toDet < 0 ? THREE.MathUtils.clamp(1 - absTo / 25, 0.55, 1) : 0;

  // Distant: small bright cyan-white core; close: compact scientific instrument
  const coreScale = 0.4 + far * 0.28 + subtle * 0.2 + bright * 0.25 + close * 0.18 + past * 0.12;
  detectorCore.scale.set(coreScale, coreScale, coreScale * 0.5);
  mats.detectorCore.opacity = 0.65 + far * 0.2 + subtle * 0.12 + bright * 0.1 + past * 0.08;

  // Halo shrinks on approach — distant speck only; never a portal disc up close
  const haloS = 0.9 + far * 0.45 + subtle * 0.25 + clear * 0.15 - close * 0.25;
  detectorHaloMesh.scale.set(Math.max(0.4, haloS), Math.max(0.4, haloS), Math.max(0.25, haloS * 0.4));
  mats.detectorHalo.opacity = 0.1 + far * 0.1 + subtle * 0.08 + clear * 0.04 - close * 0.04;
  const spriteS = 1.2 + far * 0.75 + subtle * 0.35 + clear * 0.2 - close * 0.45;
  detectorHaloSprite.scale.set(Math.max(0.6, spriteS), Math.max(0.6, spriteS), 1);
  detectorHaloSprite.material.opacity = Math.max(0.04, 0.14 + far * 0.1 + subtle * 0.08 - close * 0.08);

  // Housing fades in at medium range; fully readable <30 m
  const houseScale = 0.48 + clear * 0.42 + close * 0.35 + past * 0.2;
  detectorHousing.scale.setScalar(houseScale);
  detectorHousing.visible = true;
  // Dim housing body at long range so only the optical core reads far away
  detectorHousing.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    if (child === detectorCore || child === detectorHaloMesh) return;
    if (child.material === mats.detectorUv || child.material === mats.detectorAmber) return;
    if (child.material === mats.detectorBody || child.material === mats.detectorHousingDark
        || child.material === mats.detectorAccent) {
      // Shared mats — drive via group scale/visibility only
    }
  });

  // Face sprite only near range — compact instrument panel, not a finish gate
  detectorFace.visible = clear > 0.25 || past > 0.2;
  detectorFace.material.opacity = 0.1 + clear * 0.45 + close * 0.3 + past * 0.25;
  const faceS = 1.2 + clear * 0.7 + close * 0.55 + past * 0.3;
  detectorFace.scale.set(faceS, faceS * 0.66, 1);

  mats.detectorUv.opacity = 0.2 + clear * 0.35 + bright * 0.25 + past * 0.2;
  // Cap close glow — local wash only, no screen-filling bloom
  detectorGlow.intensity = Math.min(1.35, 0.22 + far * 0.3 + subtle * 0.35 + clear * 0.3 + bright * 0.25 + close * 0.15);
  detectorGlow.distance = 24 + clear * 20 + bright * 12 + close * 8;
  detectorFill.intensity = 0.05 + clear * 0.12 + close * 0.2 + past * 0.12;

  // Soft local cyan wash near the detector — not whole-tunnel bloom
  if (close > 0.08 || past > 0.3) {
    accent.color.lerp(new THREE.Color(0x5de5ff), 0.04 * Math.max(close, past));
  } else if (subtle > 0.15) {
    accent.color.lerp(new THREE.Color(0x3a8aaa), 0.018 * subtle);
  } else {
    accent.color.lerp(new THREE.Color(0xf28c28), 0.025);
  }
}

function updateColumnAtmosphere(dt, boosting) {
  const profile = columnVisualProfile(state.mode === 'race' || state.mode === 'countdown' ? state.distance : 20);
  const dist = state.mode === 'race' || state.mode === 'countdown' ? state.distance : 20;
  const sector = getSector(dist);
  const turbulent = sector?.name === 'TURBULÊNCIA';
  const turbPulse = turbulent ? 1 + Math.sin(state.elapsed * 5.5) * 0.12 : 1;

  scene.fog.density = (sector?.fog ?? 0.009) * 1.5 * (boosting ? 0.85 : 1);
  scene.background.lerp(new THREE.Color(profile.tint), 0.04);
  columnFill.intensity = 0.28 + profile.flow * 0.12 + (boosting ? 0.18 : 0) + (turbulent ? 0.1 : 0);

  const speedRatio = Math.max(0.35, state.speed / GAME_CONFIG.baseSpeed || 1);
  const flowMul = profile.flow * (boosting ? 1.85 : 1) * speedRatio * turbPulse;
  flowParticles.forEach((fp) => {
    fp.offset -= fp.speed * dt * flowMul;
    const windowFar = 280 + profile.flow * 80;
    if (fp.offset < dist - 14) fp.offset = dist + 40 + rnd() * windowFar;
    if (fp.offset > dist + 520) fp.offset = dist + 30 + rnd() * 60;
    const sideWobble = turbulent ? Math.sin(fp.offset * 0.14 + fp.wobble + state.elapsed * 3) * 0.22 : 0;
    const lift = fp.liftBase + Math.sin(fp.offset * 0.09 + fp.wobble) * (0.16 + (turbulent ? 0.12 : 0));
    worldAt(fp.offset, fp.lane + sideWobble, lift, fp.mesh.position);
    const f = frameAt(THREE.MathUtils.clamp(fp.offset / RACE_DISTANCE, 0, 0.999));
    fp.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
    if (fp.mesh.material) {
      const stretch = boosting ? 1.35 : 1;
      fp.mesh.scale.z = Math.max(fp.mesh.scale.x * 1.8, fp.mesh.scale.x * (2.2 + speedRatio) * stretch);
      fp.mesh.material.opacity = Math.min(0.95, (0.32 + profile.flow * 0.28) * (boosting ? 1.2 : 1));
    }
  });

  ambientMolecules.forEach((m) => {
    m.offset -= m.speed * dt * (0.7 + profile.mol * 0.5) * (boosting ? 1.35 : 1) * turbPulse;
    if (m.offset < dist - 20) m.offset = dist + 80 + rnd() * 420;
    const laneJitter = turbulent ? Math.sin(state.elapsed * 2.2 + m.spin) * 0.15 : 0;
    worldAt(m.offset, m.lane + laneJitter, m.lift, m.mesh.position);
    m.mesh.rotation.x += dt * m.spin;
    m.mesh.rotation.y += dt * m.spin * 0.7;
    const close = Math.abs(m.offset - dist) < 8 && Math.abs(m.lane - (state.laneVisual || 0)) < 0.55;
    m.mesh.visible = (DEBUG_COLUMN || DEBUG_DETECTOR) ? false : !close;
  });

  updateDetectorApproach(dist);
}

// ---------------------------------------------------------------------------
// Player Vita C (8-frame spritesheet 512x64)
const vitaTex = texLoader.load('./assets/vita-c-run-final-spritesheet.png');
vitaTex.colorSpace = THREE.SRGBColorSpace;
vitaTex.magFilter = THREE.NearestFilter;
vitaTex.minFilter = THREE.NearestFilter;
vitaTex.wrapS = THREE.ClampToEdgeWrapping;
vitaTex.repeat.set(1 / 8, 1);
const vitaMat = new THREE.SpriteMaterial({ map: vitaTex, transparent: true, depthWrite: false });
const vita = new THREE.Sprite(vitaMat);
vita.scale.set(3.1, 3.1, 1);
scene.add(vita);

let vitaFrame = 0;
let vitaAnimTime = 0;
function setVitaFrame(n) {
  vitaTex.offset.x = n / 8;
}

// ---------------------------------------------------------------------------
// Rival sprite actors — same THREE.Sprite pipeline as Vita C
function makeRivalNameLabel(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = 'rgba(8,16,32,0.65)';
  ctx.fillRect(8, 16, 240, 32);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#F5F7FA';
  ctx.textAlign = 'center';
  ctx.fillText(name, 128, 38);
  const labelTex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false }));
  label.scale.set(3.2, 0.8, 1);
  return label;
}

function createRivalSpriteActor(name, animDefs, defaultAnim = 'run-back') {
  const textures = {};
  Object.entries(animDefs).forEach(([key, def]) => {
    const tex = texLoader.load(def.url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1 / def.frames, 1);
    tex.offset.set(0, 0);
    textures[key] = tex;
  });

  const mat = new THREE.SpriteMaterial({
    map: textures[defaultAnim],
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.1, 3.1, 1);
  sprite.renderOrder = 2;
  scene.add(sprite);

  const label = makeRivalNameLabel(name);
  scene.add(label);

  const oneshots = ['skid', 'attack', 'fall', 'jump', 'hit', 'hurt'];

  return {
    name,
    animDefs,
    textures,
    sprite,
    mat,
    label,
    anim: defaultAnim,
    frames: animDefs[defaultAnim].frames,
    frame: 0,
    animTime: 0,
    lock: 0,
    defaultAnim,
    play(animName, lock = 0) {
      const def = this.animDefs[animName];
      if (!def || !this.textures[animName]) return;
      if (this.anim === animName && lock <= 0) return;
      this.anim = animName;
      this.frames = def.frames;
      this.frame = 0;
      this.animTime = 0;
      this.lock = lock;
      this.mat.map = this.textures[animName];
      this.mat.map.repeat.set(1 / def.frames, 1);
      this.mat.map.offset.x = 0;
      this.mat.needsUpdate = true;
    },
    tick(dt, fps = 12) {
      if (this.lock > 0) this.lock = Math.max(0, this.lock - dt);
      this.animTime += dt;
      if (this.animTime >= 1 / fps) {
        this.animTime = 0;
        this.frame = (this.frame + 1) % this.frames;
        this.mat.map.offset.x = this.frame / this.frames;
      }
      if (this.lock <= 0 && oneshots.includes(this.anim)) {
        this.play(this.defaultAnim);
      }
    },
    place(distance, lane, size = 3.1) {
      worldAt(distance, lane, 1.05, this.sprite.position);
      this.sprite.position.addScaledVector(
        frameAt(THREE.MathUtils.clamp(distance / RACE_DISTANCE, 0, 0.9995)).trueUp,
        0.45
      );
      this.sprite.scale.set(size, size, 1);
    },
    updateVisual(r, dt, boostingPlayer) {
      const prox = THREE.MathUtils.clamp(1.2 - Math.abs(r.d - state.distance) / 100, 0.85, 1.35);
      const size = 3.1 * prox;
      this.place(r.d, r.laneF, size);
      this.label.position.copy(this.sprite.position);
      this.label.position.y += 1.75;
      this.label.scale.set(3.2 * prox, 0.8 * prox, 1);

      if (state.mode === 'menu' || state.mode === 'countdown') {
        this.play('idle');
        this.tick(dt, 8);
        return;
      }
      if (state.mode === 'results' || state.finished) {
        this.play(r.d >= state.distance ? 'victory' : 'idle');
        this.tick(dt, 8);
        return;
      }
      if (state.mode !== 'race') {
        this.play('idle');
        this.tick(dt, 8);
        return;
      }

      if (this.lock > 0) {
        this.tick(dt, this.anim === 'attack' || this.anim === 'hit' || this.anim === 'hurt' ? 14 : 12);
        return;
      }

      const laneDelta = Math.abs(r.lane - r.laneF);
      if (laneDelta > 0.35) {
        this.play('skid', 0.35);
      } else if (r.boostPulse > 0) {
        r.boostPulse -= dt;
        this.play('boost');
      } else if (r.d + 12 < state.distance && boostingPlayer) {
        this.play('run');
      } else if (
        r.speed > GAME_CONFIG.rivalBaseSpeeds[r.speedIndex] * 1.08
        || (boostingPlayer && Math.abs(r.d - state.distance) < 18 && r.d > state.distance)
      ) {
        this.play('boost');
      } else {
        this.play(this.defaultAnim);
      }
      this.tick(dt, this.anim === 'boost' ? 14 : 12);
    },
  };
}

const spriteActors = {
  captain: createRivalSpriteActor('Captain Caffeine', CAPTAIN_ANIMS, 'run-back'),
  aroma: createRivalSpriteActor('Aroma', AROMA_ANIMS, 'run-back'),
};

// ---------------------------------------------------------------------------
// Rivals (sprite actors for Captain/Aroma; Lady Paraben keeps molecule mesh)
const rivals = RIVALS_DEF.map((def, i) => {
  const entry = {
    ...def,
    d: 80 + i * 55,
    lane: def.lane,
    laneF: def.lane,
    speed: GAME_CONFIG.rivalBaseSpeeds[def.speedIndex],
    laneTimer: 2 + i,
    boostPulse: 0,
    g: null,
    orbit: null,
    label: null,
    actor: null,
  };

  if (def.spriteId && spriteActors[def.spriteId]) {
    entry.actor = spriteActors[def.spriteId];
    entry.label = entry.actor.label;
    return entry;
  }

  const g = new THREE.Group();
  const body = new THREE.Mesh(
    geo.sphereM,
    new THREE.MeshStandardMaterial({
      color: def.color, emissive: def.emissive, emissiveIntensity: 0.35, roughness: 0.55, metalness: 0.15,
    })
  );
  body.scale.set(0.85, 0.95, 0.85);
  const core = new THREE.Mesh(geo.sphereS, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  core.scale.setScalar(0.28);
  const orbit = new THREE.Mesh(geo.sphereS, new THREE.MeshBasicMaterial({ color: def.color }));
  orbit.scale.setScalar(0.18);
  orbit.position.set(0.7, 0.2, 0);
  const label = makeRivalNameLabel(def.name);
  label.position.y = 1.7;
  g.add(body, core, orbit, label);
  scene.add(g);
  entry.g = g;
  entry.orbit = orbit;
  entry.label = label;
  return entry;
});

// Obstacles pool
const OBSTACLE_TYPES = ['silica', 'bubble', 'concentration', 'interferent', 'cluster'];
const obstacles = [];

function makeObstacle(type) {
  const g = new THREE.Group();
  if (type === 'silica' || type === 'cluster') {
    for (let i = 0; i < (type === 'cluster' ? 5 : 3); i++) {
      const m = new THREE.Mesh(geo.sphereS, mats.obstacleSilica);
      const s = 0.35 + rnd() * 0.4;
      m.scale.setScalar(s);
      m.position.set((rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.5);
      g.add(m);
    }
  } else if (type === 'bubble') {
    const m = new THREE.Mesh(geo.bubble, mats.obstacleBubble);
    m.scale.setScalar(0.75);
    g.add(m);
  } else if (type === 'concentration') {
    const m = new THREE.Mesh(geo.icosa, mats.obstacleConc);
    m.scale.setScalar(0.7);
    g.add(m);
  } else {
    const m = new THREE.Mesh(geo.icosa, mats.obstacleInterf);
    m.scale.setScalar(0.65);
    g.add(m);
    const ring = new THREE.Mesh(geo.sphereS, mats.obstacleBubble);
    ring.scale.set(1.1, 0.25, 1.1);
    g.add(ring);
  }
  scene.add(g);
  return g;
}

for (let i = 0; i < 22; i++) {
  const type = OBSTACLE_TYPES[i % OBSTACLE_TYPES.length];
  obstacles.push({
    g: makeObstacle(type),
    type,
    lane: LANES[i % 3],
    d: 90 + i * 62,
    hit: false,
    active: true,
  });
}

// Items / pickups
const ITEM_KINDS = [
  { id: 'BOOST', mat: mats.energy, label: 'BOOST' },
  { id: 'BOOST', mat: mats.molecule, label: 'ENERGIA' },
  { id: 'BOOST', mat: mats.vitamin, label: 'VITAMINA' },
];
const pickups = [];
for (let i = 0; i < 24; i++) {
  const kind = ITEM_KINDS[i % ITEM_KINDS.length];
  const g = new THREE.Mesh(geo.sphereS, kind.mat);
  g.scale.setScalar(0.42);
  scene.add(g);
  pickups.push({
    g,
    kind,
    lane: LANES[(i + 1) % 3],
    d: 50 + i * 58,
    active: true,
  });
}

// Speed streaks (pixelated solvent streaks)
const streaks = [];
for (let i = 0; i < 18; i++) {
  const m = new THREE.Mesh(
    geo.pixel,
    new THREE.MeshBasicMaterial({ color: 0x9adfff, transparent: true, opacity: 0.4 })
  );
  m.scale.set(0.05, 0.05, 1.4);
  m.visible = false;
  scene.add(m);
  streaks.push({ mesh: m, life: 0, lane: 0, d: 0 });
}

// ---------------------------------------------------------------------------
// Game state
const state = {
  mode: 'menu', // menu | countdown | race | results
  running: false,
  finished: false,
  distance: 0,
  lane: 0,
  laneVisual: 0,
  item: null,
  boost: 0,
  speed: 0,
  score: 0,
  elapsed: 0,
  maxSpeed: 0,
  boostsUsed: 0,
  obstaclesHit: 0,
  obstaclesPassed: 0,
  position: 4,
  scoreSaved: false,
  countdown: 3,
  countdownTimer: 0,
};

function resetRaceEntities() {
  state.distance = 0;
  state.lane = 0;
  state.laneVisual = 0;
  state.item = null;
  state.boost = 0;
  state.speed = 0;
  state.score = 0;
  state.elapsed = 0;
  state.maxSpeed = 0;
  state.boostsUsed = 0;
  state.obstaclesHit = 0;
  state.obstaclesPassed = 0;
  state.finished = false;
  state.scoreSaved = false;
  rivals.forEach((r, i) => {
    r.d = 70 + i * 48 + rnd() * 20;
    r.lane = RIVALS_DEF[i].lane;
    r.laneF = r.lane;
    r.speed = GAME_CONFIG.rivalBaseSpeeds[r.speedIndex] * (0.94 + rnd() * 0.1);
    r.laneTimer = 1.5 + i * 0.8;
    r.boostPulse = 0;
    if (r.actor) r.actor.play(r.actor.defaultAnim);
  });
  obstacles.forEach((o, i) => {
    o.d = 100 + i * 62 + rnd() * 20;
    o.lane = LANES[i % 3];
    o.hit = false;
    o.active = true;
    o.g.visible = !(DEBUG_COLUMN || DEBUG_DETECTOR);
  });
  pickups.forEach((p, i) => {
    p.d = 60 + i * 58;
    p.lane = LANES[(i + 1) % 3];
    p.active = true;
    p.g.visible = !(DEBUG_COLUMN || DEBUG_DETECTOR);
  });
  applyDebugColumnGameplayHide();
}

function laneMove(dir) {
  if (state.mode !== 'race') return;
  state.lane = THREE.MathUtils.clamp(state.lane + dir, -1, 1);
  AudioBus.click();
}

function useItem() {
  if (state.mode !== 'race') return;
  if (state.item) {
    state.boost = GAME_CONFIG.boostDuration;
    state.item = null;
    state.boostsUsed += 1;
    AudioBus.boost();
  } else if (state.boost <= 0) {
    // small emergency pulse if empty — keeps mobile feedback
    state.boost = 0.75;
    state.boostsUsed += 1;
    AudioBus.boost();
  }
}

function startCountdown() {
  AudioBus.ensure();
  resetRaceEntities();
  state.mode = 'countdown';
  state.running = false;
  state.countdown = 3;
  state.countdownTimer = 0;
  showScreen(null);
  $('countdown').classList.remove('panel-hidden');
  $('countdownValue').textContent = '3';
  $('hud').classList.remove('panel-hidden');
  $('mobileControls').classList.remove('panel-hidden');
  updateHud();
}

function beginRace() {
  state.mode = 'race';
  state.running = true;
  $('countdown').classList.add('panel-hidden');
  AudioBus.beep(660, 0.12, 'triangle', 0.05);
}

function finishRace() {
  state.running = false;
  state.finished = true;
  state.mode = 'results';
  state.distance = RACE_DISTANCE;
  AudioBus.win();
  const pos = computePosition();
  state.position = pos;
  $('resDist').textContent = `${RACE_DISTANCE} m`;
  $('resTime').textContent = formatTime(state.elapsed);
  $('resScore').textContent = Math.floor(state.score).toLocaleString('pt-BR');
  $('resPos').textContent = ordinal(pos);
  $('resMaxSpd').textContent = `${Math.floor(state.maxSpeed)}`;
  $('resBoosts').textContent = String(state.boostsUsed);
  $('resAvoid').textContent = String(Math.max(0, state.obstaclesPassed));
  $('saveStatus').textContent = Storage.available ? '' : 'localStorage indisponível — score não persistirá.';
  $('saveBlock').classList.toggle('panel-hidden', false);
  $('btnSaveScore').disabled = false;
  showScreen('results');
}

function computePosition() {
  let ahead = rivals.filter((r) => r.d > state.distance).length;
  return 1 + ahead;
}

function updateHud() {
  const dist = Math.min(RACE_DISTANCE, Math.floor(state.distance));
  $('hudDist').textContent = `${dist} m`;
  $('hudPos').textContent = `${computePosition()}/4`;
  $('hudScore').textContent = Math.floor(state.score).toLocaleString('pt-BR');
  $('hudItem').textContent = state.item || '—';
  $('hudBoost').textContent = state.boost > 0 ? state.boost.toFixed(1) + 's' : 'OFF';
  $('hudSpeed').textContent = String(Math.floor(state.speed));
  const sector = getSector(state.distance);
  $('hudSector').textContent = sector.label;
  $('hudProgress').style.width = `${(state.distance / RACE_DISTANCE) * 100}%`;
}

// ---------------------------------------------------------------------------
// Update loop
function updateCountdown(dt) {
  state.countdownTimer += dt;
  if (state.countdownTimer >= 1) {
    state.countdownTimer = 0;
    state.countdown -= 1;
    if (state.countdown > 0) {
      $('countdownValue').textContent = String(state.countdown);
      $('countdownValue').style.animation = 'none';
      void $('countdownValue').offsetWidth;
      $('countdownValue').style.animation = '';
      AudioBus.beep(400 + (3 - state.countdown) * 80, 0.08);
    } else if (state.countdown === 0) {
      $('countdownValue').textContent = 'GO!';
      AudioBus.beep(780, 0.15, 'triangle', 0.06);
    } else {
      beginRace();
    }
  }
}

function updateRace(dt) {
  const boosting = state.boost > 0;
  const sector = getSector(state.distance);
  let speedMul = 1;
  if (sector.id === 6) speedMul = 0.92; // turbulence
  if (sector.id === 8) speedMul = 1.12; // high speed stretch
  if (sector.id === 9) speedMul = 0.95;

  state.speed = GAME_CONFIG.baseSpeed * speedMul * (boosting ? GAME_CONFIG.boostMultiplier : 1);
  state.distance += state.speed * dt;
  state.elapsed += dt;
  state.score += dt * (55 + state.speed * 0.9) + (boosting ? dt * 40 : 0);
  state.maxSpeed = Math.max(state.maxSpeed, state.speed);
  if (state.boost > 0) state.boost = Math.max(0, state.boost - dt);

  // Smooth lane lerp
  state.laneVisual += (state.lane - state.laneVisual) * Math.min(1, dt * 10);

  // Vita C
  worldAt(state.distance, state.laneVisual, 1.05, vita.position);
  vita.position.addScaledVector(frameAt(state.distance / RACE_DISTANCE).trueUp, 0.45);
  const size = boosting ? 3.35 : 3.1;
  vita.scale.set(size, size, 1);
  vitaAnimTime += dt * (boosting ? 1.6 : 1);
  if (vitaAnimTime > 0.075) {
    vitaAnimTime = 0;
    vitaFrame = (vitaFrame + 1) % 8;
    setVitaFrame(vitaFrame);
  }

  // Rivals AI
  rivals.forEach((r, i) => {
    if (DEBUG_COLUMN || DEBUG_DETECTOR || VISUAL_PHASE1_COMPOSITION) {
      if (r.actor) {
        r.actor.sprite.visible = false;
        r.actor.label.visible = false;
      } else if (r.g) r.g.visible = false;
      return;
    }
    if (r.actor) {
      r.actor.sprite.visible = true;
      r.actor.label.visible = true;
    } else if (r.g) r.g.visible = true;
    r.laneTimer -= dt;
    if (r.laneTimer <= 0) {
      r.laneTimer = 1.2 + rnd() * 2.4;
      const options = LANES.filter((l) => l !== state.lane || rnd() > 0.4);
      r.lane = options[Math.floor(rnd() * options.length)] ?? r.lane;
      if (r.actor && rnd() > 0.55) r.boostPulse = 0.7 + rnd() * 0.6;
      if (r.actor && rnd() > 0.82) r.actor.play('attack', 0.55);
    }
    r.laneF += (r.lane - r.laneF) * Math.min(1, dt * 4);
    const pace = r.speed * (boosting && r.d < state.distance + 8 ? 0.92 : 1) * (r.boostPulse > 0 ? 1.12 : 1);
    r.d += pace * dt;
    if (r.d > state.distance + 160) r.d = state.distance - 25 - i * 15;
    if (r.d < state.distance - 80) r.d = state.distance + 40 + i * 20;
    r.d = Math.min(r.d, RACE_DISTANCE - 5);

    if (r.actor) {
      if (
        boosting
        && Math.abs(r.d - state.distance) < 3.2
        && Math.abs(r.laneF - state.lane) < 0.35
        && r.actor.lock <= 0
      ) {
        r.actor.play('hit', 0.45);
        r.d -= 6;
      }
      r.actor.updateVisual(r, dt, boosting);
    } else {
      worldAt(r.d, r.laneF, 0.95, r.g.position);
      if (r.orbit) r.orbit.rotation.y += dt * 2.5;
      const prox = THREE.MathUtils.clamp(1.1 - Math.abs(r.d - state.distance) / 90, 0.55, 1.35);
      r.g.scale.setScalar(prox);
    }
  });

  // Obstacles
  obstacles.forEach((o, i) => {
    if (DEBUG_COLUMN || DEBUG_DETECTOR || VISUAL_PHASE1_COMPOSITION) {
      o.g.visible = false;
      return;
    }
    if (o.d < state.distance - 25) {
      if (!o.hit) state.obstaclesPassed += 1;
      o.d = state.distance + 140 + i * 18 + rnd() * 40;
      o.lane = LANES[Math.floor(rnd() * 3)];
      o.hit = false;
      o.active = true;
      o.g.visible = true;
    }
    worldAt(o.d, o.lane, 0.7, o.g.position);
    o.g.rotation.x += dt * 1.2;
    o.g.rotation.y += dt * 1.6;
    if (
      o.active &&
      Math.abs(o.d - state.distance) < 2.4 &&
      Math.abs(o.lane - state.lane) < 0.2
    ) {
      o.hit = true;
      o.active = false;
      o.g.visible = false;
      state.obstaclesHit += 1;
      state.boost = 0;
      state.speed *= 0.55;
      state.score = Math.max(0, state.score - 180);
      AudioBus.collide();
    }
  });

  // Pickups
  pickups.forEach((p, i) => {
    if (DEBUG_COLUMN || DEBUG_DETECTOR || VISUAL_PHASE1_COMPOSITION) {
      p.g.visible = false;
      return;
    }
    if (p.d < state.distance - 18) {
      p.d = state.distance + 100 + i * 20 + rnd() * 50;
      p.lane = LANES[Math.floor(rnd() * 3)];
      p.active = true;
      p.g.visible = true;
    }
    worldAt(p.d, p.lane, 0.7, p.g.position);
    p.g.rotation.y += dt * 2.5;
    p.g.position.y += Math.sin(state.elapsed * 4 + i) * 0.01;
    if (
      p.active &&
      Math.abs(p.d - state.distance) < 2.1 &&
      Math.abs(p.lane - state.lane) < 0.2
    ) {
      p.active = false;
      p.g.visible = false;
      state.item = 'BOOST';
      state.score += 320;
      AudioBus.collect();
      p.d = state.distance + 180 + i * 15;
    }
  });

  // Streaks during boost — pixel streaks, not photographic blur
  streaks.forEach((s) => {
    if (boosting && s.life <= 0 && rnd() > 0.65) {
      s.life = 0.22 + rnd() * 0.2;
      s.lane = state.laneVisual + (rnd() - 0.5) * 1.8;
      s.d = state.distance + 2 + rnd() * 12;
      s.mesh.visible = true;
    }
    if (s.life > 0) {
      s.life -= dt;
      s.d += state.speed * dt * 0.45;
      worldAt(s.d, s.lane, 0.4 + rnd() * 1.1, s.mesh.position);
      const f = frameAt(THREE.MathUtils.clamp(s.d / RACE_DISTANCE, 0, 0.999));
      s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);
      s.mesh.material.opacity = Math.max(0, s.life * 1.5);
      if (s.life <= 0) s.mesh.visible = false;
    }
  });

  // Lights follow player inside the column
  accent.position.copy(vita.position);
  accent.position.y += 2;
  columnFill.position.copy(vita.position);
  columnFill.position.addScaledVector(frameAt(THREE.MathUtils.clamp(state.distance / RACE_DISTANCE, 0, 0.998)).trueUp, 2.5);

  // Camera follow spline — third-person arcade; Vita stays lower-middle
  const t = THREE.MathUtils.clamp(state.distance / RACE_DISTANCE, 0, 0.998);
  const f = frameAt(t);
  const camPos = worldAt(state.distance - GAME_CONFIG.camera.back, state.laneVisual * 0.35, GAME_CONFIG.camera.height, _tmp);
  camera.position.lerp(camPos, 1 - Math.pow(0.001, dt));
  const look = worldAt(state.distance + GAME_CONFIG.camera.lookAhead, state.laneVisual * 0.2, 1.15, _tmp2);
  look.addScaledVector(f.trueUp, 0.15);
  camera.up.lerp(f.trueUp, 0.08);
  camera.lookAt(look);

  const targetFov = boosting ? GAME_CONFIG.camera.boostFov : GAME_CONFIG.camera.baseFov;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 4);
  camera.updateProjectionMatrix();

  placeDetector();
  updateColumnAtmosphere(dt, boosting);

  updateHud();

  if (state.distance >= RACE_DISTANCE) finishRace();
}

// ---------------------------------------------------------------------------
// Performance monitor
let fpsFrames = 0;
let fpsTimer = 0;
let lastFps = 60;
function sampleFps(dt) {
  fpsFrames += 1;
  fpsTimer += dt;
  if (fpsTimer >= 1.2) {
    lastFps = fpsFrames / fpsTimer;
    fpsFrames = 0;
    fpsTimer = 0;
    if (qualityState.mode === 'auto' && lastFps < 28) {
      qualityState.fewerParticles = true;
      qualityState.particleMul = Math.max(0.35, qualityState.particleMul * 0.7);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);
  sampleFps(dt);
  if (state.mode === 'countdown') updateCountdown(dt);
  else if (state.mode === 'race') updateRace(dt);
  else if (state.mode === 'menu') {
    // Idle camera drift near start — inside the column
    const idleT = (performance.now() * 0.00008) % 0.08;
    const f = frameAt(idleT);
    camera.position.lerp(worldAt(idleT * RACE_DISTANCE - 6, 0, 4.2, _tmp), 0.04);
    camera.up.lerp(f.trueUp, 0.05);
    camera.lookAt(worldAt(idleT * RACE_DISTANCE + 18, 0, 1.5, _tmp2));
    worldAt(8, 0, 1.1, vita.position);
    vitaAnimTime += dt;
    if (vitaAnimTime > 0.1) {
      vitaAnimTime = 0;
      vitaFrame = (vitaFrame + 1) % 8;
      setVitaFrame(vitaFrame);
    }
    rivals.forEach((r, i) => {
      if (r.actor) {
        r.d = 16 + i * 6;
        r.lane = r.laneF = (i % 3) - 1;
        r.actor.updateVisual(r, dt, false);
      } else {
        worldAt(r.d, r.laneF, 0.95, r.g.position);
      }
    });
    placeDetector();
    updateColumnAtmosphere(dt, false);
  }
  if (state.mode === 'countdown' || state.mode === 'results') {
    rivals.forEach((r) => {
      if (r.actor) r.actor.updateVisual(r, dt, false);
      else worldAt(r.d, r.laneF, 0.95, r.g.position);
    });
    placeDetector();
    updateColumnAtmosphere(dt, false);
  }
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------------------
// Input
function onKey(e) {
  if (['ArrowLeft', 'ArrowRight', 'Space', 'KeyA', 'KeyD', 'KeyR'].includes(e.code)) e.preventDefault();
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') laneMove(-1);
  if (e.code === 'ArrowRight' || e.code === 'KeyD') laneMove(1);
  if (e.code === 'Space') useItem();
  if (e.code === 'KeyR' && (state.mode === 'race' || state.mode === 'results')) startCountdown();
}
addEventListener('keydown', onKey);

$('btnLeft').onpointerdown = (e) => { e.preventDefault(); laneMove(-1); };
$('btnRight').onpointerdown = (e) => { e.preventDefault(); laneMove(1); };
$('btnItem').onpointerdown = (e) => { e.preventDefault(); useItem(); };

let sx = 0;
let sy = 0;
addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  sx = t.clientX;
  sy = t.clientY;
}, { passive: true });
addEventListener('touchend', (e) => {
  if (state.mode !== 'race') return;
  const t = e.changedTouches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;
  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.15) laneMove(dx < 0 ? -1 : 1);
}, { passive: true });

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  applyRenderSize();
}
addEventListener('resize', resize);

// ---------------------------------------------------------------------------
// UI wiring
$('howtoDistance').textContent = String(RACE_DISTANCE);

$('btnPlay').onclick = () => { AudioBus.click(); startCountdown(); };
$('btnLeaderboard').onclick = () => { AudioBus.click(); renderLeaderboard(); showScreen('leaderboard'); };
$('btnHowTo').onclick = () => { AudioBus.click(); showScreen('howto'); };
$('btnSettings').onclick = () => { AudioBus.click(); showScreen('settings'); };
$('btnPlayAgain').onclick = () => { AudioBus.click(); startCountdown(); };
$('btnResultLb').onclick = () => { AudioBus.click(); renderLeaderboard(); showScreen('leaderboard'); };
$('btnResultMenu').onclick = () => { AudioBus.click(); state.mode = 'menu'; showScreen('menu'); };
$('btnClearLb').onclick = () => {
  AudioBus.click();
  if (Storage.available) localStorage.removeItem(GAME_CONFIG.leaderboardKey);
  renderLeaderboard();
};

document.querySelectorAll('[data-back="menu"]').forEach((btn) => {
  btn.addEventListener('click', () => { AudioBus.click(); state.mode = 'menu'; showScreen('menu'); });
});

$('settingQuality').value = qualityState.mode;
$('settingQuality').onchange = (e) => {
  applyQuality(e.target.value, lastFps);
  Storage.set('chromaracers_quality', e.target.value);
  applyRenderSize();
};
$('settingAudio').checked = AudioBus.enabled;
$('settingAudio').onchange = (e) => { AudioBus.enabled = e.target.checked; };
$('settingFewerParticles').checked = qualityState.fewerParticles;
$('settingFewerParticles').onchange = (e) => {
  qualityState.fewerParticles = e.target.checked;
  Storage.set('chromaracers_fewer_particles', e.target.checked);
  applyQuality(qualityState.mode, lastFps);
  spawnFlowParticles();
  spawnAmbientMolecules();
};

$('btnSaveScore').onclick = () => {
  if (state.scoreSaved) return;
  const name = ($('playerName').value || 'JOGADOR').trim().slice(0, 16).toUpperCase() || 'JOGADOR';
  const entry = {
    name,
    score: Math.floor(state.score),
    time: Number(state.elapsed.toFixed(2)),
    distance: RACE_DISTANCE,
    character: GAME_CONFIG.character,
    date: new Date().toISOString().slice(0, 10),
    position: state.position,
  };
  if (Storage.available) {
    saveLeaderboardEntry(entry);
    $('saveStatus').textContent = 'Score salvo no dispositivo.';
  } else {
    $('saveStatus').textContent = 'Não foi possível salvar (storage bloqueado).';
  }
  state.scoreSaved = true;
  $('btnSaveScore').disabled = true;
  AudioBus.collect();
};

// ---------------------------------------------------------------------------
// Boot
applyQuality(qualityState.mode, 60);
buildEnvironment();
buildFlowChannels();
spawnFlowParticles();
spawnAmbientMolecules();
placeDetector();
setVitaFrame(0);
worldAt(8, 0, 1.1, vita.position);
rivals.forEach((r) => {
  if (r.actor) {
    r.actor.play('idle');
    r.actor.place(r.d, r.laneF, 3.1);
    r.actor.label.position.copy(r.actor.sprite.position);
    r.actor.label.position.y += 1.75;
  } else {
    worldAt(r.d, r.lane, 0.95, r.g.position);
  }
});
showScreen('menu');
state.mode = 'menu';
applyEnvironmentDebugVisibility();
applyDebugColumnGameplayHide();
animate();

// Expose config for debugging / easy distance change verification
function snapCameraToPlayer() {
  const t = THREE.MathUtils.clamp(state.distance / RACE_DISTANCE, 0, 0.998);
  const f = frameAt(t);
  camera.position.copy(worldAt(state.distance - GAME_CONFIG.camera.back, state.laneVisual * 0.35, GAME_CONFIG.camera.height, _tmp));
  const look = worldAt(state.distance + GAME_CONFIG.camera.lookAhead, state.laneVisual * 0.2, 1.15, _tmp2);
  look.addScaledVector(f.trueUp, 0.15);
  camera.up.copy(f.trueUp);
  camera.lookAt(look);
  camera.fov = GAME_CONFIG.camera.baseFov;
  camera.updateProjectionMatrix();
}

window.CHROMARACERS = {
  GAME_CONFIG, RACE_DISTANCE, SECTORS, state, Storage, rivals, vita, spriteActors,
  DEBUG_SILICA, DEBUG_COLUMN, DEBUG_FLOW, DEBUG_MOLECULES, DEBUG_DETECTOR, DETECTOR_DISTANCE,
  VISUAL_PHASE1_COMPOSITION,
  columnRadius: GAME_CONFIG.columnRadius,
  COLUMN_LIFT,
  silicaStats, silicaGroup, flowGroup, envGroup, detectorGroup, infraGroup,
  snapCameraToPlayer, applyEnvironmentDebugVisibility, applyDebugColumnGameplayHide,
  placeDetector, updateDetectorApproach,
  hasColumnWall: () => !!envGroup.getObjectByName('columnWall'),
  hasColumnFrames: () => !!envGroup.getObjectByName('columnFrames'),
  columnFrameCount: () => envGroup.getObjectByName('columnFrames')?.count ?? 0,
  archStats: () => envGroup.getObjectByName('columnStructure')?.userData?.archStats ?? null,
  perforatedArchCount: () => {
    const s = envGroup.getObjectByName('columnStructure');
    if (!s) return 0;
    let n = 0;
    s.children.forEach((c) => { if (c.name === 'columnFramePerforated') n += 1; });
    return n;
  },
  silicaBeadCount: () => envGroup.getObjectByName('silicaBeads')?.count ?? 0,
  hasLateralSilica: () => !!(envGroup.getObjectByName('silicaWallL') && envGroup.getObjectByName('silicaWallR')),
  wallTextureReady: () => !!wallMat2?.map,
};
