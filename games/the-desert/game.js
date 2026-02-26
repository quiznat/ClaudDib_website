const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SAVE_KEY = 'the_desert_save_v2';

let gameState = {
  player: { x: 0, y: 0, speed: 3 },
  camera: { x: 0, y: 0 },
  water: 100,
  wisdom: 0,
  trustScore: 0,
  time: 700,
  day: 1,
  landmarks: new Map(),
  visitedLandmarks: new Set(),
  keys: {},
  touchTarget: null,
  quests: [
    { id: 'first_relic', text: 'Discover 1 relic', target: 1, done: false },
    { id: 'ten_relics', text: 'Discover 10 relics', target: 10, done: false },
    { id: 'trusted', text: 'Reach Trusted status', target: 10, done: false }
  ]
};

let artCatalog = [];
const loadedImages = new Map();
let imageLoadCount = 0;

function trustLabel(score) {
  if (score >= 20) return 'Beloved';
  if (score >= 10) return 'Trusted';
  if (score >= 5) return 'Friendly';
  if (score <= -5) return 'Wary';
  return 'Neutral';
}

async function loadManifest() {
  const res = await fetch('./art-manifest.json');
  artCatalog = await res.json();
}

function preloadImages(limit = 128) {
  const pick = artCatalog.slice(0, Math.min(limit, artCatalog.length));
  pick.forEach(art => {
    const img = new Image();
    img.onload = () => imageLoadCount++;
    img.src = art.src;
    loadedImages.set(art.id, img);
  });
}

function seededHash(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function landmarkKeyFromWorld(x, y) {
  return `${Math.floor(x / 480)},${Math.floor(y / 480)}`;
}

function generateLandmarkAtChunk(cx, cy) {
  const key = `${cx},${cy}`;
  if (gameState.landmarks.has(key)) return gameState.landmarks.get(key);

  const seed = Math.abs((cx * 73856093) ^ (cy * 19349663));
  const idx = Math.floor(seededHash(seed) * artCatalog.length);
  const art = artCatalog[idx];
  const landmark = {
    key,
    x: cx * 480 + 240,
    y: cy * 480 + 240,
    art,
    discovered: false
  };
  gameState.landmarks.set(key, landmark);
  return landmark;
}

function ensureNearbyLandmarks() {
  const cx = Math.floor(gameState.player.x / 480);
  const cy = Math.floor(gameState.player.y / 480);
  for (let y = cy - 2; y <= cy + 2; y++) {
    for (let x = cx - 2; x <= cx + 2; x++) {
      generateLandmarkAtChunk(x, y);
    }
  }
}

function update() {
  let dx = 0, dy = 0;
  if (gameState.keys['w'] || gameState.keys['ArrowUp']) dy = -1;
  if (gameState.keys['s'] || gameState.keys['ArrowDown']) dy = 1;
  if (gameState.keys['a'] || gameState.keys['ArrowLeft']) dx = -1;
  if (gameState.keys['d'] || gameState.keys['ArrowRight']) dx = 1;

  // Mobile click/tap movement (click-to-walk)
  if (!dx && !dy && gameState.touchTarget) {
    const tx = gameState.touchTarget.x - gameState.player.x;
    const ty = gameState.touchTarget.y - gameState.player.y;
    const dist = Math.hypot(tx, ty);
    if (dist > 6) {
      dx = tx / dist;
      dy = ty / dist;
    } else {
      gameState.touchTarget = null;
    }
  }

  if (dx && dy) { dx *= 0.707; dy *= 0.707; }

  const moving = dx !== 0 || dy !== 0;
  gameState.player.x += dx * gameState.player.speed;
  gameState.player.y += dy * gameState.player.speed;

  if (moving) {
    gameState.water = Math.max(0, gameState.water - 0.03);
    if (gameState.water <= 0) gameState.player.speed = 1.2;
    else gameState.player.speed = 3;
  }

  gameState.time += 0.35;
  if (gameState.time >= 2400) {
    gameState.time = 0;
    gameState.day += 1;
    gameState.water = Math.min(100, gameState.water + 12);
  }

  gameState.camera.x = gameState.player.x - canvas.width / 2;
  gameState.camera.y = gameState.player.y - canvas.height / 2;

  ensureNearbyLandmarks();
  updateQuests();
  updateUI();
}

function drawSand() {
  const ox = gameState.camera.x % 96;
  const oy = gameState.camera.y % 96;
  for (let x = -96; x < canvas.width + 96; x += 96) {
    for (let y = -96; y < canvas.height + 96; y += 96) {
      const px = x - ox, py = y - oy;
      ctx.fillStyle = ((x + y) / 96) % 2 === 0 ? '#2b2b40' : '#252538';
      ctx.fillRect(px, py, 96, 96);
    }
  }
}

function drawLandmarks() {
  for (const lm of gameState.landmarks.values()) {
    const sx = lm.x - gameState.camera.x;
    const sy = lm.y - gameState.camera.y;
    if (sx < -90 || sx > canvas.width + 90 || sy < -90 || sy > canvas.height + 90) continue;

    const r = 52;
    const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, r);
    g.addColorStop(0, 'rgba(212,168,106,0.35)');
    g.addColorStop(1, 'rgba(212,168,106,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();

    const img = loadedImages.get(lm.art.id);
    if (img) ctx.drawImage(img, sx - 32, sy - 32, 64, 64);
    else {
      ctx.fillStyle = '#d4a86a';
      ctx.fillRect(sx - 24, sy - 24, 48, 48);
    }

    ctx.fillStyle = '#f3e2c4';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    if (gameState.visitedLandmarks.has(lm.art.id)) ctx.fillText(lm.art.name.slice(0, 18), sx, sy + 46);
  }
}

function drawPlayer() {
  const x = canvas.width / 2, y = canvas.height / 2;
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐭', x, y + 9);
}

function drawTimeOverlay() {
  const h = Math.floor(gameState.time / 100);
  let c = null;
  if (h >= 19 || h < 5) c = 'rgba(0,0,28,0.50)';
  else if (h >= 17 && h < 19) c = 'rgba(255,120,80,0.16)';
  else if (h >= 5 && h < 7) c = 'rgba(255,170,110,0.16)';
  if (c) { ctx.fillStyle = c; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function drawMinimap() {
  const w = 180, h = 120, pad = 12;
  const x0 = canvas.width - w - pad, y0 = canvas.height - h - pad;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#d4a86a';
  ctx.strokeRect(x0, y0, w, h);

  const scale = 0.06;
  for (const lm of gameState.landmarks.values()) {
    const rx = x0 + w / 2 + (lm.x - gameState.player.x) * scale;
    const ry = y0 + h / 2 + (lm.y - gameState.player.y) * scale;
    if (rx < x0 || rx > x0 + w || ry < y0 || ry > y0 + h) continue;
    ctx.fillStyle = gameState.visitedLandmarks.has(lm.art.id) ? '#9ddf9d' : '#d4a86a';
    ctx.fillRect(rx - 2, ry - 2, 4, 4);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x0 + w / 2 - 2, y0 + h / 2 - 2, 4, 4);
}

function render() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawSand();
  drawLandmarks();
  drawPlayer();
  drawTimeOverlay();
  drawMinimap();
}

function tryInteract() {
  let near = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    const dx = gameState.player.x - lm.x;
    const dy = gameState.player.y - lm.y;
    const d = Math.hypot(dx, dy);
    if (d < dmin && d < 95) { dmin = d; near = lm; }
  }
  if (near) visitLandmark(near);
}

function visitLandmark(lm) {
  gameState.visitedLandmarks.add(lm.art.id);
  if (!lm.discovered) {
    lm.discovered = true;
    gameState.wisdom += 1;
    gameState.water = Math.min(100, gameState.water + (lm.art.type === 'oasis' ? 20 : 8));
    gameState.trustScore += (lm.art.type === 'storm' ? -1 : 1);
  }
  showModal(lm);
  saveGame();
}

function showModal(lm) {
  document.getElementById('landmarkTitle').textContent = lm.art.name;
  document.getElementById('landmarkImage').src = lm.art.src;
  document.getElementById('landmarkText').textContent = lm.art.wisdom;
  document.getElementById('landmarkModal').classList.add('active');
}

window.closeModal = function closeModal() {
  document.getElementById('landmarkModal').classList.remove('active');
};

function updateQuests() {
  const discovered = gameState.visitedLandmarks.size;
  for (const q of gameState.quests) {
    if (q.done) continue;
    if (q.id === 'first_relic' && discovered >= q.target) q.done = true;
    if (q.id === 'ten_relics' && discovered >= q.target) q.done = true;
    if (q.id === 'trusted' && gameState.trustScore >= q.target) q.done = true;
  }
}

function updateUI() {
  document.getElementById('water').textContent = Math.floor(gameState.water);
  document.getElementById('wisdom').textContent = `${gameState.wisdom}`;
  document.getElementById('trust').textContent = trustLabel(gameState.trustScore);
  const h = Math.floor(gameState.time / 100);
  const label = h >= 19 || h < 5 ? 'Night' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  document.getElementById('time').textContent = `${label} ${gameState.day}`;
}

function saveGame() {
  const data = {
    player: gameState.player,
    water: gameState.water,
    wisdom: gameState.wisdom,
    trustScore: gameState.trustScore,
    time: gameState.time,
    day: gameState.day,
    visited: Array.from(gameState.visitedLandmarks)
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    gameState.player = d.player || gameState.player;
    gameState.water = d.water ?? gameState.water;
    gameState.wisdom = d.wisdom ?? gameState.wisdom;
    gameState.trustScore = d.trustScore ?? gameState.trustScore;
    gameState.time = d.time ?? gameState.time;
    gameState.day = d.day ?? gameState.day;
    gameState.visitedLandmarks = new Set(d.visited || []);
  } catch {}
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  gameState.keys[e.key] = true;
  // Keyboard input cancels click-to-walk target
  gameState.touchTarget = null;
  if (e.key === ' ') { e.preventDefault(); tryInteract(); }
  if (e.key.toLowerCase() === 'p') saveGame();
});
document.addEventListener('keyup', (e) => { gameState.keys[e.key] = false; });

// Mobile/touch: tap to walk, tap landmark to interact
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const wx = sx + gameState.camera.x;
  const wy = sy + gameState.camera.y;

  // If user tapped near a landmark, interact immediately
  let tapped = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    const d = Math.hypot(wx - lm.x, wy - lm.y);
    if (d < dmin && d < 80) { dmin = d; tapped = lm; }
  }

  if (tapped) {
    visitLandmark(tapped);
    return;
  }

  // Otherwise walk toward tapped location
  gameState.touchTarget = { x: wx, y: wy };
});

async function init() {
  resize();
  window.addEventListener('resize', resize);
  await loadManifest();
  preloadImages(220);
  loadGame();
  ensureNearbyLandmarks();
  setInterval(saveGame, 10000);
  loop();
}

init();
