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
    back: 7.2,
    height: 3.55,
    lookAhead: 14,
    baseFov: 62,
    boostFov: 71,
  },
  columnRadius: 10.4,
  leaderboardKey: 'chromaracers_vitamin_rush_lb_v1',
  maxLeaderboard: 10,
  character: 'Vita C',
};

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
  {
    name: 'Captain Caffeine',
    color: 0xff7b31,
    emissive: 0x5a2208,
    lane: -1,
    speedIndex: 0,
    spriteKey: 'captain',
  },
  { name: 'Lady Paraben', color: 0xd9368a, emissive: 0x4a1030, lane: 1, speedIndex: 1 },
  { name: 'Aroma', color: 0x5de5ff, emissive: 0x0a3a4a, lane: 0, speedIndex: 2 },
];

/** Captain Caffeine production sheets (64×64 frames, horizontal). */
const CAPTAIN_SHEETS = {
  run: { url: './assets/captain-caffeine-run.png', frames: 8 },
  'run-back': { url: './assets/captain-caffeine-run-back.png', frames: 8 },
  boost: { url: './assets/captain-caffeine-boost.png', frames: 7 },
  attack: { url: './assets/captain-caffeine-attack.png', frames: 8 },
  victory: { url: './assets/captain-caffeine-victory.png', frames: 4 },
  idle: { url: './assets/captain-caffeine-idle.png', frames: 4 },
  jump: { url: './assets/captain-caffeine-jump.png', frames: 4 },
  fall: { url: './assets/captain-caffeine-fall.png', frames: 4 },
  skid: { url: './assets/captain-caffeine-skid.png', frames: 4 },
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
scene.background = new THREE.Color(0x071326);
scene.fog = new THREE.FogExp2(0x071326, 0.009);

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
renderer.setPixelRatio(Math.min(devicePixelRatio, qualityState.pixelRatioCap));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0x5de5ff, 0x17233d, 0.85);
scene.add(hemi);
const keyLight = new THREE.DirectionalLight(0xb8e8ff, 0.9);
keyLight.position.set(4, 10, 2);
scene.add(keyLight);
const accent = new THREE.PointLight(0xf28c28, 0.55, 48, 2);
scene.add(accent);

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

// Shared geometries / materials (pooling)
const geo = {
  sphereS: new THREE.SphereGeometry(1, 6, 5),
  sphereM: new THREE.SphereGeometry(1, 8, 6),
  icosa: new THREE.IcosahedronGeometry(1, 0),
  torusRing: new THREE.TorusGeometry(GAME_CONFIG.columnRadius + 1.2, 0.2, 6, 24),
  torusInner: new THREE.TorusGeometry(GAME_CONFIG.columnRadius - 0.5, 0.06, 5, 24),
  bubble: new THREE.SphereGeometry(1, 8, 6),
};

const mats = {
  silica: new THREE.MeshStandardMaterial({
    color: 0x4a6ec8, emissive: 0x16306a, emissiveIntensity: 0.35, roughness: 0.86, metalness: 0.04,
  }),
  silicaWarm: new THREE.MeshStandardMaterial({
    color: 0x5a78d0, emissive: 0x1a2860, emissiveIntensity: 0.28, roughness: 0.88, metalness: 0.03,
  }),
  ring: new THREE.MeshStandardMaterial({
    color: 0x274568, emissive: 0x0a3058, emissiveIntensity: 0.65, metalness: 0.75, roughness: 0.38,
  }),
  ringCyan: new THREE.MeshBasicMaterial({ color: 0x39eaff, transparent: true, opacity: 0.55 }),
  flow: [
    new THREE.MeshBasicMaterial({ color: 0x35cfff, transparent: true, opacity: 0.72 }),
    new THREE.MeshBasicMaterial({ color: 0x7cffff, transparent: true, opacity: 0.82 }),
    new THREE.MeshBasicMaterial({ color: 0x35cfff, transparent: true, opacity: 0.72 }),
  ],
  flowGlow: new THREE.MeshBasicMaterial({
    color: 0x1ceaff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false,
  }),
  molecule: new THREE.MeshBasicMaterial({ color: 0xffd447, transparent: true, opacity: 0.95 }),
  energy: new THREE.MeshBasicMaterial({ color: 0x59f2ff, transparent: true, opacity: 0.95 }),
  vitamin: new THREE.MeshBasicMaterial({ color: 0x43c95a, transparent: true, opacity: 0.95 }),
  obstacleSilica: new THREE.MeshStandardMaterial({
    color: 0x6a8ad8, emissive: 0x1a3068, emissiveIntensity: 0.4, roughness: 0.7, metalness: 0.1,
  }),
  obstacleBubble: new THREE.MeshStandardMaterial({
    color: 0x5de5ff, emissive: 0x0a4a60, emissiveIntensity: 0.35, transparent: true, opacity: 0.72, roughness: 0.25,
  }),
  obstacleConc: new THREE.MeshStandardMaterial({
    color: 0xf28c28, emissive: 0x5a2808, emissiveIntensity: 0.45, roughness: 0.55,
  }),
  obstacleInterf: new THREE.MeshStandardMaterial({
    color: 0xd9368a, emissive: 0x401028, emissiveIntensity: 0.4, roughness: 0.5,
  }),
};

// ---------------------------------------------------------------------------
// Environment: chromatographic column
const envGroup = new THREE.Group();
scene.add(envGroup);

const texLoader = new THREE.TextureLoader();
const silicaTex = texLoader.load('./assets/silica-back.png');
silicaTex.colorSpace = THREE.SRGBColorSpace;
silicaTex.wrapS = silicaTex.wrapT = THREE.RepeatWrapping;
silicaTex.repeat.set(4, 2);

// Soft cylindrical wall segments along path (reused material)
const wallMat = new THREE.MeshBasicMaterial({
  map: silicaTex,
  transparent: true,
  opacity: 0.22,
  side: THREE.BackSide,
  depthWrite: false,
});

let seed = 1337;
function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function buildEnvironment() {
  while (envGroup.children.length) {
    envGroup.remove(envGroup.children[0]);
  }

  const samples = Math.floor(72 / qualityState.ringStep);
  for (let i = 0; i < samples; i++) {
    const d = (i / (samples - 1)) * RACE_DISTANCE;
    const f = frameAt(d / RACE_DISTANCE);
    const ring = new THREE.Group();
    ring.position.copy(f.p);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.tangent);

    const torus = new THREE.Mesh(geo.torusRing, mats.ring);
    torus.rotation.x = Math.PI / 2;
    ring.add(torus);

    const inner = new THREE.Mesh(geo.torusInner, mats.ringCyan);
    inner.rotation.x = Math.PI / 2;
    ring.add(inner);

    // short wall shell for silica texture presence
    if (i % 3 === 0) {
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(GAME_CONFIG.columnRadius + 0.2, GAME_CONFIG.columnRadius + 0.2, 28, 16, 1, true),
        wallMat
      );
      shell.rotation.x = Math.PI / 2;
      ring.add(shell);
    }
    envGroup.add(ring);
  }

  // Silica beads on inner wall
  const beadCount = Math.floor(320 * qualityState.particleMul);
  for (let i = 0; i < beadCount; i++) {
    const d = 10 + rnd() * (RACE_DISTANCE - 20);
    const f = frameAt(d / RACE_DISTANCE);
    const angle = rnd() * Math.PI * 2;
    const radius = GAME_CONFIG.columnRadius - 0.9 - rnd() * 0.8;
    const p = f.p.clone()
      .addScaledVector(f.side, Math.cos(angle) * radius)
      .addScaledVector(f.trueUp, Math.sin(angle) * radius);
    const s = 0.18 + rnd() * 0.55;
    const bead = new THREE.Mesh(geo.sphereS, rnd() > 0.72 ? mats.silicaWarm : mats.silica);
    bead.position.copy(p);
    bead.scale.set(s, s * 0.78, s);
    envGroup.add(bead);
  }
}

// Flow channels (3 lanes)
const flowGroup = new THREE.Group();
scene.add(flowGroup);

function buildFlowChannels() {
  while (flowGroup.children.length) flowGroup.remove(flowGroup.children[0]);

  for (let li = 0; li < LANES.length; li++) {
    const lane = LANES[li];
    const pts = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      pts.push(worldAt((i / steps) * RACE_DISTANCE, lane, 0.12));
    }
    const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 280, 0.07, 5, false), mats.flow[li]);
    flowGroup.add(tube);
    const glow = new THREE.Mesh(new THREE.TubeGeometry(c, 180, 0.18, 5, false), mats.flowGlow);
    flowGroup.add(glow);
  }
}

// Flow particles + molecules
const flowParticles = [];
function spawnFlowParticles() {
  flowParticles.forEach((fp) => flowGroup.remove(fp.mesh));
  flowParticles.length = 0;
  const count = Math.floor(110 * qualityState.particleMul);
  for (let i = 0; i < count; i++) {
    const lane = LANES[i % 3];
    const isMol = i % 6 === 0;
    const mesh = new THREE.Mesh(
      geo.sphereS,
      isMol ? mats.molecule : new THREE.MeshBasicMaterial({ color: 0x62edff })
    );
    const s = isMol ? 0.14 + rnd() * 0.1 : 0.05 + rnd() * 0.07;
    mesh.scale.setScalar(s);
    flowGroup.add(mesh);
    flowParticles.push({
      mesh,
      lane,
      offset: rnd() * RACE_DISTANCE,
      speed: 12 + rnd() * 18,
      wobble: rnd() * Math.PI * 2,
    });
  }
}

// Detector UV/Vis
const detectorTex = texLoader.load('./assets/detector-uv-vis.png');
detectorTex.colorSpace = THREE.SRGBColorSpace;
const detector = new THREE.Sprite(new THREE.SpriteMaterial({
  map: detectorTex, transparent: true, depthWrite: false,
}));
detector.scale.set(14, 9.2, 1);
scene.add(detector);

const detectorGlow = new THREE.PointLight(0x5de5ff, 1.4, 55, 2);
scene.add(detectorGlow);

function placeDetector() {
  const f = frameAt(0.995);
  detector.position.copy(worldAt(RACE_DISTANCE - 8, 0, 2.8));
  detectorGlow.position.copy(detector.position);
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
// Sprite-sheet animator (Captain Caffeine)
function loadAnimSheet(url, frames) {
  const tex = texLoader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1 / frames, 1);
  tex.offset.set(0, 0);
  return { tex, frames };
}

function createSheetAnimator(sheetDefs, initial = 'run') {
  const sheets = {};
  Object.entries(sheetDefs).forEach(([key, def]) => {
    sheets[key] = loadAnimSheet(def.url, def.frames);
  });
  const first = sheets[initial] || sheets.run;
  const mat = new THREE.SpriteMaterial({
    map: first.tex,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.15, 3.15, 1);
  return {
    sprite,
    sheets,
    anim: initial,
    frame: 0,
    timer: 0,
    lock: 0, // seconds to keep one-shot anim before returning to run
    setAnim(name, lock = 0) {
      if (!this.sheets[name]) return;
      if (this.anim === name && lock <= 0) return;
      this.anim = name;
      this.frame = 0;
      this.timer = 0;
      this.lock = lock;
      const sheet = this.sheets[name];
      mat.map = sheet.tex;
      sheet.tex.repeat.set(1 / sheet.frames, 1);
      sheet.tex.offset.x = 0;
      mat.needsUpdate = true;
    },
    update(dt, fps = 12) {
      if (this.lock > 0) {
        this.lock = Math.max(0, this.lock - dt);
      }
      const sheet = this.sheets[this.anim];
      if (!sheet) return;
      this.timer += dt;
      const frameDur = 1 / fps;
      if (this.timer >= frameDur) {
        this.timer = 0;
        this.frame = (this.frame + 1) % sheet.frames;
        sheet.tex.offset.x = this.frame / sheet.frames;
      }
      if (this.lock <= 0 && (this.anim === 'skid' || this.anim === 'attack' || this.anim === 'fall' || this.anim === 'jump')) {
        this.setAnim('run');
      }
    },
  };
}

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
  label.position.y = 1.7;
  return label;
}

// ---------------------------------------------------------------------------
// Rivals
const rivals = RIVALS_DEF.map((def, i) => {
  const g = new THREE.Group();
  let animator = null;
  let orbit = null;

  if (def.spriteKey === 'captain') {
    animator = createSheetAnimator(CAPTAIN_SHEETS, 'idle');
    g.add(animator.sprite);
  } else {
    const body = new THREE.Mesh(
      geo.sphereM,
      new THREE.MeshStandardMaterial({
        color: def.color, emissive: def.emissive, emissiveIntensity: 0.35, roughness: 0.55, metalness: 0.15,
      })
    );
    body.scale.set(0.85, 0.95, 0.85);
    const core = new THREE.Mesh(geo.sphereS, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    core.scale.setScalar(0.28);
    orbit = new THREE.Mesh(geo.sphereS, new THREE.MeshBasicMaterial({ color: def.color }));
    orbit.scale.setScalar(0.18);
    orbit.position.set(0.7, 0.2, 0);
    g.add(body, core, orbit);
  }

  g.add(makeRivalNameLabel(def.name));
  scene.add(g);
  return {
    ...def,
    g,
    orbit,
    animator,
    d: 80 + i * 55,
    lane: def.lane,
    laneF: def.lane,
    prevLane: def.lane,
    speed: GAME_CONFIG.rivalBaseSpeeds[def.speedIndex],
    laneTimer: 2 + i,
    boostPulse: 0,
  };
});

function updateCaptainAnim(r, dt, boostingPlayer) {
  if (!r.animator) return;
  const anim = r.animator;

  if (state.mode === 'menu') {
    anim.setAnim('idle');
    anim.update(dt, 8);
    return;
  }
  if (state.mode === 'results' || state.finished) {
    const captainAhead = r.d >= RACE_DISTANCE - 6 && r.d >= state.distance;
    anim.setAnim(captainAhead || r.d > state.distance ? 'victory' : 'idle');
    anim.update(dt, 8);
    return;
  }
  if (state.mode !== 'race' && state.mode !== 'countdown') {
    anim.setAnim('idle');
    anim.update(dt, 8);
    return;
  }

  // One-shot locks take priority
  if (anim.lock > 0) {
    anim.update(dt, anim.anim === 'attack' ? 14 : 12);
    return;
  }

  const laneDelta = Math.abs(r.lane - r.laneF);
  if (laneDelta > 0.35 && anim.anim !== 'skid') {
    anim.setAnim('skid', 0.35);
  } else if (r.boostPulse > 0) {
    r.boostPulse -= dt;
    anim.setAnim('boost');
  } else if (r.d + 12 < state.distance && boostingPlayer) {
    // Being overtaken — run-back / struggle
    anim.setAnim('run-back');
  } else if (r.speed > GAME_CONFIG.rivalBaseSpeeds[r.speedIndex] * 1.08 || (boostingPlayer && Math.abs(r.d - state.distance) < 18 && r.d > state.distance)) {
    anim.setAnim('boost');
  } else {
    anim.setAnim('run');
  }
  anim.update(dt, anim.anim === 'boost' ? 14 : 12);
}

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

// Speed streaks (motion feel)
const streaks = [];
for (let i = 0; i < 18; i++) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
    new THREE.MeshBasicMaterial({ color: 0x5de5ff, transparent: true, opacity: 0.35 })
  );
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
    r.prevLane = r.lane;
    r.speed = GAME_CONFIG.rivalBaseSpeeds[r.speedIndex] * (0.94 + rnd() * 0.1);
    r.laneTimer = 1.5 + i * 0.8;
    r.boostPulse = 0;
    if (r.animator) r.animator.setAnim('run');
  });
  obstacles.forEach((o, i) => {
    o.d = 100 + i * 62 + rnd() * 20;
    o.lane = LANES[i % 3];
    o.hit = false;
    o.active = true;
    o.g.visible = true;
  });
  pickups.forEach((p, i) => {
    p.d = 60 + i * 58;
    p.lane = LANES[(i + 1) % 3];
    p.active = true;
    p.g.visible = true;
  });
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
    r.laneTimer -= dt;
    if (r.laneTimer <= 0) {
      r.laneTimer = 1.2 + rnd() * 2.4;
      const options = LANES.filter((l) => l !== state.lane || rnd() > 0.4);
      r.lane = options[Math.floor(rnd() * options.length)] ?? r.lane;
      if (r.animator && rnd() > 0.55) r.boostPulse = 0.7 + rnd() * 0.6;
      if (r.animator && rnd() > 0.82) {
        r.animator.setAnim('attack', 0.55);
      }
    }
    r.laneF += (r.lane - r.laneF) * Math.min(1, dt * 4);
    const pace = r.speed * (boosting && r.d < state.distance + 8 ? 0.92 : 1) * (r.boostPulse > 0 ? 1.12 : 1);
    r.d += pace * dt;
    if (r.d > state.distance + 160) r.d = state.distance - 25 - i * 15;
    if (r.d < state.distance - 80) r.d = state.distance + 40 + i * 20;
    r.d = Math.min(r.d, RACE_DISTANCE - 5);
    worldAt(r.d, r.laneF, r.animator ? 1.05 : 0.95, r.g.position);
    if (r.orbit) r.orbit.rotation.y += dt * 2.5;
    const prox = r.animator
      ? THREE.MathUtils.clamp(1.15 - Math.abs(r.d - state.distance) / 110, 0.75, 1.4)
      : THREE.MathUtils.clamp(1.1 - Math.abs(r.d - state.distance) / 90, 0.55, 1.35);
    r.g.scale.setScalar(prox);
    updateCaptainAnim(r, dt, boosting);
  });

  // Obstacles
  obstacles.forEach((o, i) => {
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

  // Flow particles
  flowParticles.forEach((fp) => {
    fp.offset -= fp.speed * dt * (boosting ? 1.5 : 1);
    if (fp.offset < state.distance - 12) fp.offset = state.distance + 220 + rnd() * 400;
    if (fp.offset > state.distance + 500) fp.offset = state.distance + 40 + rnd() * 80;
    const lift = 0.2 + Math.sin(fp.offset * 0.08 + fp.wobble) * 0.18;
    worldAt(fp.offset, fp.lane, lift, fp.mesh.position);
  });

  // Streaks during boost
  streaks.forEach((s, i) => {
    if (boosting && s.life <= 0 && rnd() > 0.7) {
      s.life = 0.25 + rnd() * 0.2;
      s.lane = state.laneVisual + (rnd() - 0.5) * 1.6;
      s.d = state.distance + 2 + rnd() * 10;
      s.mesh.visible = true;
    }
    if (s.life > 0) {
      s.life -= dt;
      s.d += state.speed * dt * 0.4;
      worldAt(s.d, s.lane, 0.5 + rnd() * 0.8, s.mesh.position);
      const f = frameAt(THREE.MathUtils.clamp(s.d / RACE_DISTANCE, 0, 0.999));
      s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), f.tangent);
      s.mesh.material.opacity = Math.max(0, s.life * 1.4);
      if (s.life <= 0) s.mesh.visible = false;
    }
  });

  // Accent light near player
  accent.position.copy(vita.position);
  accent.position.y += 2;

  // Sector fog / tint
  scene.fog.density = sector.fog * (boosting ? 0.85 : 1);
  scene.background.lerp(new THREE.Color(0x071326).lerp(new THREE.Color(sector.tint), 0.15), 0.05);

  // Camera follow spline
  const t = THREE.MathUtils.clamp(state.distance / RACE_DISTANCE, 0, 0.998);
  const f = frameAt(t);
  const camPos = worldAt(state.distance - GAME_CONFIG.camera.back, state.laneVisual * 0.35, GAME_CONFIG.camera.height, _tmp);
  camera.position.lerp(camPos, 1 - Math.pow(0.001, dt));
  const look = worldAt(state.distance + GAME_CONFIG.camera.lookAhead, state.laneVisual * 0.2, 1.4, _tmp2);
  look.addScaledVector(f.trueUp, 0.4);
  camera.up.lerp(f.trueUp, 0.08);
  camera.lookAt(look);

  const targetFov = boosting ? GAME_CONFIG.camera.boostFov : GAME_CONFIG.camera.baseFov;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 4);
  camera.updateProjectionMatrix();

  placeDetector();
  // Scale detector as approach
  const approach = THREE.MathUtils.clamp(1 - (RACE_DISTANCE - state.distance) / 120, 0, 1);
  detector.scale.set(14 + approach * 6, 9.2 + approach * 4, 1);
  detectorGlow.intensity = 1.2 + approach * 2.2;

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
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.1));
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
    // Idle camera drift near start
    const idleT = (performance.now() * 0.00008) % 0.08;
    const f = frameAt(idleT);
    camera.position.lerp(worldAt(idleT * RACE_DISTANCE - 6, 0, 4.2, _tmp), 0.04);
    camera.up.lerp(f.trueUp, 0.05);
    camera.lookAt(worldAt(idleT * RACE_DISTANCE + 18, 0, 1.5, _tmp2));
    flowParticles.forEach((fp) => {
      fp.offset = (fp.offset + dt * fp.speed * 0.35) % RACE_DISTANCE;
      worldAt(fp.offset, fp.lane, 0.25, fp.mesh.position);
    });
    worldAt(8, 0, 1.1, vita.position);
    vitaAnimTime += dt;
    if (vitaAnimTime > 0.1) {
      vitaAnimTime = 0;
      vitaFrame = (vitaFrame + 1) % 8;
      setVitaFrame(vitaFrame);
    }
    rivals.forEach((r) => {
      worldAt(r.d, r.laneF, r.animator ? 1.05 : 0.95, r.g.position);
      updateCaptainAnim(r, dt, false);
    });
    placeDetector();
  }
  if (state.mode === 'countdown' || state.mode === 'results') {
    rivals.forEach((r) => {
      worldAt(r.d, r.laneF, r.animator ? 1.05 : 0.95, r.g.position);
      if (state.mode === 'countdown' && r.animator) {
        r.animator.setAnim('idle');
        r.animator.update(dt, 8);
      } else {
        updateCaptainAnim(r, dt, false);
      }
    });
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
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, qualityState.pixelRatioCap));
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
  renderer.setPixelRatio(Math.min(devicePixelRatio, qualityState.pixelRatioCap));
};
$('settingAudio').checked = AudioBus.enabled;
$('settingAudio').onchange = (e) => { AudioBus.enabled = e.target.checked; };
$('settingFewerParticles').checked = qualityState.fewerParticles;
$('settingFewerParticles').onchange = (e) => {
  qualityState.fewerParticles = e.target.checked;
  Storage.set('chromaracers_fewer_particles', e.target.checked);
  applyQuality(qualityState.mode, lastFps);
  spawnFlowParticles();
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
placeDetector();
setVitaFrame(0);
worldAt(8, 0, 1.1, vita.position);
rivals.forEach((r, i) => worldAt(r.d, r.lane, 0.95, r.g.position));
showScreen('menu');
state.mode = 'menu';
animate();

// Expose config for debugging / easy distance change verification
window.CHROMARACERS = { GAME_CONFIG, RACE_DISTANCE, SECTORS, state, Storage, rivals };
