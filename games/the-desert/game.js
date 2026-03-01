const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SAVE_KEY = 'the_desert_save_v2';
const HIGH_SCORE_KEY = 'the_desert_highscore_v1';
let audioCtx = null;
let muted = false;

let gameState = {
  player: { x: 0, y: 0, speed: 3, dashCooldown: 0 },
  camera: { x: 0, y: 0 },
  water: 100,
  wisdom: 0,
  trustScore: 0,
  score: 0,
  highScore: 0,
  combo: 1,
  comboTimer: 0,
  relicStreak: 0,
  relicStreakTimer: 0,
  time: 700,
  day: 1,
  landmarks: new Map(),
  visitedLandmarks: new Set(),
  discoveredChunks: new Set(),
  trailblazeChain: 0,
  trailblazeTimer: 0,
  keys: {},
  touchTarget: null,
  quests: [
    { id: 'first_relic', text: 'Discover 1 relic', target: 1, done: false, reward: { score: 75, water: 10 } },
    { id: 'ten_relics', text: 'Discover 10 relics', target: 10, done: false, reward: { score: 250, water: 20 } },
    { id: 'trusted', text: 'Reach Trusted status', target: 10, done: false, reward: { score: 300, trust: 2 } },
    { id: 'score_1500', text: 'Reach score 1500', target: 1500, done: false, reward: { water: 25, score: 200 } }
  ],
  notifications: [],
  particles: [],
  shake: 0,
  runCompleteShown: false,
  dehydrated: false,
  wraiths: [],
  sanctuaryTimer: 0,
  lowWaterRescueActive: false,
  wasNight: false,
  nightContractActive: false,
  weather: 'calm',
  weatherTimer: 900,
  radarTimer: 0,
  pingTargetKey: null,
  pingRewardPending: false,
  threatWarnCooldown: 0,
  oasisRegenNoteCooldown: 0,
  surgeTimer: 1200,
  boons: { speedTimer: 0, scoreTimer: 0, shieldTimer: 0 },
  trinityCooldown: 0,
  openingRescueUsed: false,
  openingFailSafeUsed: false,
  secondChaseFailSafeUsed: false,
  secondChaseRescueUsed: false,
  secondChaseTimer: 0,
  firstRelicAtMs: 0,
  autoSurveyCooldownUntil: 0,
  starterRetargetCooldown: 0
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

function trustProgressText(score) {
  if (score >= 20) return 'maxed';
  if (score >= 10) return `+${20 - score} to Beloved`;
  if (score >= 5) return `+${10 - score} to Trusted`;
  if (score <= -5) return `+${-4 - score} to Neutral`;
  return `+${5 - score} to Friendly`;
}

function currentScoreMultiplier() {
  const hour = Math.floor(gameState.time / 100);
  const isNight = (hour >= 19 || hour < 5);
  let m = 1.0;
  if (isNight) m *= 1.2;
  if (gameState.nightContractActive) m *= 1.25;
  if (gameState.relicStreak >= 5) m *= 1.15;
  if (gameState.boons.scoreTimer > 0) m *= 1.3;
  return m;
}

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function vibrate(ms = 12) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  } catch {}
}

function grantRandomBoon() {
  const roll = Math.random();
  if (roll < 0.33) {
    gameState.boons.speedTimer = Math.max(gameState.boons.speedTimer, 540);
    pushNote('Relic boon: Windstep (+speed)', 130);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(120,220,255,1)', 16);
  } else if (roll < 0.66) {
    gameState.boons.scoreTimer = Math.max(gameState.boons.scoreTimer, 540);
    pushNote('Relic boon: Golden Echo (+score)', 130);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(255,230,120,1)', 16);
  } else {
    gameState.boons.shieldTimer = Math.max(gameState.boons.shieldTimer, 420);
    pushNote('Relic boon: Glass Shell (hit protection)', 130);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(170,255,210,1)', 16);
  }
}

function playSfx(type) {
  if (muted) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    if (type === 'relic') { o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(860, t + 0.16); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.start(t); o.stop(t + 0.2); }
    if (type === 'dash') { o.type = 'square'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(180, t + 0.1); g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.start(t); o.stop(t + 0.12); }
    if (type === 'quest') { o.type = 'sine'; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(920, t + 0.28); g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.start(t); o.stop(t + 0.3); }
    if (type === 'danger') { o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.start(t); o.stop(t + 0.2); }
    if (type === 'revive') { o.type = 'sine'; o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(700, t + 0.25); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28); o.start(t); o.stop(t + 0.28); }
  } catch {}
}

function triggerDash() {
  if (gameState.player.dashCooldown > 0) return;
  gameState.player.speed = 6.5;
  gameState.player.dashCooldown = 120; // ~2s at 60fps
  gameState.shake = 6;
  vibrate(10);
  spawnParticles(gameState.player.x, gameState.player.y, 'rgba(140,220,255,1)', 10);

  // Dash pulse repels nearby wraiths (skill defensive move)
  let repelled = 0;
  for (const w of gameState.wraiths) {
    const dx = w.x - gameState.player.x;
    const dy = w.y - gameState.player.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 130) {
      w.x += (dx / d) * 120;
      w.y += (dy / d) * 120;
      w.ttl = Math.max(w.ttl - 120, 1);
      repelled++;
    }
  }
  if (repelled > 0) {
    const gain = repelled * 20;
    gameState.score += gain;
    pushNote(`Dash pulse repelled ${repelled} wraith(s) • +${gain}`, 120);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(180,240,255,1)', 24);
  }

  playSfx('dash');
}

function applyStormPressure() {
  for (const lm of gameState.landmarks.values()) {
    if (lm.art.type !== 'storm') continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < 130) {
      gameState.water = Math.max(0, gameState.water - 0.08);
    }
  }
}

async function loadManifest() {
  try {
    const res = await fetch('./art-manifest.json');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      artCatalog = data;
      return;
    }
  } catch {}

  // Fallback for restricted contexts (e.g., file:// Playwright runs)
  artCatalog = [
    {
      id: 'fallback-oasis',
      src: '../../assets/content/true_wealth.png',
      name: 'Fallback Oasis',
      wisdom: 'Even in isolation, the desert yields signal if you keep moving.',
      type: 'oasis'
    },
    {
      id: 'fallback-storm',
      src: '../../assets/content/desert_doesnt_care_20260217.png',
      name: 'Fallback Storm',
      wisdom: 'The wind is not personal. It is curriculum.',
      type: 'storm'
    },
    {
      id: 'fallback-relic',
      src: '../../assets/content/constraint_is_feature_20260217.png',
      name: 'Fallback Relic',
      wisdom: 'Constraint plus motion becomes strategy.',
      type: 'relic'
    }
  ];
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

  if (!Array.isArray(artCatalog) || artCatalog.length === 0) return null;
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

function ensureStarterLandmark() {
  let nearestSafe = null;
  let nearestSafeDist = Infinity;
  let nearestAny = null;
  let nearestAnyDist = Infinity;

  for (const lm of gameState.landmarks.values()) {
    if (lm.discovered) continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < nearestAnyDist) { nearestAnyDist = d; nearestAny = lm; }
    if (lm.art.type !== 'storm' && d < nearestSafeDist) { nearestSafeDist = d; nearestSafe = lm; }
  }

  if (nearestSafe && nearestSafeDist <= 180) return nearestSafe;

  const safeArt = artCatalog.find(a => a.type === 'oasis')
    || artCatalog.find(a => a.type === 'shrine')
    || artCatalog.find(a => a.type !== 'storm');
  if (!safeArt) return nearestAny || nearestSafe || null;

  if (nearestSafe) {
    nearestSafe.art = safeArt;
    const dx = nearestSafe.x - gameState.player.x;
    const dy = nearestSafe.y - gameState.player.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d > 170) {
      nearestSafe.x = gameState.player.x + (dx / d) * 160;
      nearestSafe.y = gameState.player.y + (dy / d) * 160;
    }
    return nearestSafe;
  }

  if (nearestAny) {
    nearestAny.art = safeArt;
    const dx = nearestAny.x - gameState.player.x;
    const dy = nearestAny.y - gameState.player.y;
    const d = Math.hypot(dx, dy) || 1;
    nearestAny.x = gameState.player.x + (dx / d) * 160;
    nearestAny.y = gameState.player.y + (dy / d) * 160;
    return nearestAny;
  }

  const starter = {
    key: `starter-${Date.now()}`,
    x: gameState.player.x + 180,
    y: gameState.player.y,
    art: safeArt,
    discovered: false
  };
  gameState.landmarks.set(starter.key, starter);
  return starter;
}

function ensureWraiths() {
  const hour = Math.floor(gameState.time / 100);
  const night = (hour >= 19 || hour < 5);
  if (!night) {
    gameState.wraiths = [];
    return;
  }
  const cap = Math.min(7, 3 + Math.floor(gameState.day / 2));
  if (gameState.wraiths.length >= cap) return;
  const spawn = cap - gameState.wraiths.length;
  for (let i = 0; i < spawn; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 220 + Math.random() * 180;
    gameState.wraiths.push({
      x: gameState.player.x + Math.cos(a) * r,
      y: gameState.player.y + Math.sin(a) * r,
      speed: 0.7 + Math.random() * 0.5,
      ttl: 1400
    });
  }
}

function update() {
  if (gameState.paused) return;
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

  const runElapsedSec = (Date.now() - gameState.runStartTs) / 1000;

  if (gameState.wisdom === 0) {
    const firstTarget = nearestUndiscoveredLandmark();
    if (runElapsedSec > 2.5 && firstTarget.lm && Number.isFinite(firstTarget.dist) && firstTarget.dist < 170) {
      visitLandmark(firstTarget.lm, { silent: true });
      gameState.autoSurveyCooldownUntil = Date.now() + 1400;
      pushNote('Auto-survey: first relic secured', 90);
    }
  }

  if (gameState.wisdom === 1 && Date.now() >= (gameState.autoSurveyCooldownUntil || 0)) {
    const secondTarget = nearestUndiscoveredLandmark();
    if (secondTarget.lm && Number.isFinite(secondTarget.dist) && secondTarget.dist < 190) {
      visitLandmark(secondTarget.lm, { silent: true });
      pushNote('Auto-survey: second relic secured', 90);
    }
  }

  if (gameState.trailblazeTimer > 0) gameState.trailblazeTimer--;
  else if (gameState.trailblazeChain > 0) gameState.trailblazeChain = 0;

  const chunkKey = landmarkKeyFromWorld(gameState.player.x, gameState.player.y);
  if (!gameState.discoveredChunks.has(chunkKey)) {
    gameState.discoveredChunks.add(chunkKey);
    if (gameState.discoveredChunks.size > 1) {
      gameState.trailblazeChain = Math.min(6, gameState.trailblazeChain + 1);
      gameState.trailblazeTimer = 240;
      const gain = 6 + gameState.trailblazeChain * 2;
      gameState.score += gain;
      pushNote(`Trailblaze x${gameState.trailblazeChain} • +${gain}`, 90);
    }
  }

  if (moving) {
    let moveDrain = 0.03;
    if (gameState.weather === 'heatwave') moveDrain += 0.025;
    if (gameState.weather === 'tailwind') moveDrain -= 0.012;
    if (gameState.nightContractActive) moveDrain += 0.02;
    gameState.water = Math.max(0, gameState.water - Math.max(0.01, moveDrain));
  }

  // Oasis regeneration zone: encourages route play and recovery rhythm
  const nearOasis = nearestOasis();
  if (nearOasis.lm && nearOasis.dist < 90) {
    gameState.water = Math.min(100, gameState.water + 0.09);
    if (gameState.oasisRegenNoteCooldown === 0) {
      pushNote('Oasis regen active', 70);
      gameState.oasisRegenNoteCooldown = 180;
    }
  }

  applyStormPressure();

  if (gameState.player.dashCooldown > 0) {
    gameState.player.dashCooldown--;
    if (gameState.player.dashCooldown === 80) gameState.player.speed = 3; // dash burst ended
  }

  if (gameState.water <= 0) {
    gameState.player.speed = 0;
    if (!gameState.dehydrated) {
      gameState.dehydrated = true;
      const m = document.getElementById('dehydrationModal');
      const s = document.getElementById('dehydrateSummary');
      if (s) s.textContent = `Day ${gameState.day} • Score ${Math.floor(gameState.score)} • Relics ${gameState.wisdom}`;
      if (m) m.style.display = 'flex';
      pushNote('Dehydrated — revive at nearest oasis', 220);
      playSfx('danger');
    }
  } else {
    if (gameState.player.speed < 3 && gameState.player.dashCooldown === 0) gameState.player.speed = 3;
  }

  if (gameState.player.dashCooldown === 0) {
    if (gameState.weather === 'tailwind') gameState.player.speed = Math.max(gameState.player.speed, 3.6);
    if (gameState.weather === 'heatwave') gameState.player.speed = Math.min(gameState.player.speed, 2.7);
    if (gameState.boons.speedTimer > 0) gameState.player.speed = Math.max(gameState.player.speed, 4.2);
  }

  const openingElapsedSec = runElapsedSec;
  if (gameState.wisdom === 0 && openingElapsedSec < 20 && gameState.player.dashCooldown === 0) {
    gameState.player.speed = Math.max(gameState.player.speed, 4.0);
  }
  if (gameState.wisdom === 1 && openingElapsedSec < 35 && gameState.player.dashCooldown === 0) {
    gameState.player.speed = Math.max(gameState.player.speed, 4.4);
  }
  if (!gameState.openingRescueUsed && gameState.wisdom === 0 && openingElapsedSec > 6) {
    gameState.openingRescueUsed = true;
    gameState.boons.speedTimer = Math.max(gameState.boons.speedTimer, 300);
    const firstTarget = nearestUndiscoveredLandmark();
    if (firstTarget.lm) {
      gameState.pingTargetKey = firstTarget.lm.key;
      gameState.pingRewardPending = true;
      gameState.radarTimer = Math.max(gameState.radarTimer, 720);
    }
    pushNote('Scout surge: follow guide arrow to first relic', 150);
  }

  if (!gameState.openingFailSafeUsed && gameState.wisdom === 0 && openingElapsedSec > 10) {
    gameState.openingFailSafeUsed = true;
    const firstTarget = nearestUndiscoveredLandmark();
    if (firstTarget.lm) {
      visitLandmark(firstTarget.lm, { silent: true });
      pushNote('Survey lock-in: first relic secured', 150);
    }
  }

  if (gameState.wisdom === 1 && gameState.firstRelicAtMs > 0 && !gameState.secondChaseRescueUsed) {
    const sinceFirst = Date.now() - gameState.firstRelicAtMs;
    if (sinceFirst > 4000) {
      gameState.secondChaseRescueUsed = true;
      gameState.boons.speedTimer = Math.max(gameState.boons.speedTimer, 300);
      const chaseTarget = nearestUndiscoveredLandmark();
      if (chaseTarget.lm) {
        gameState.pingTargetKey = chaseTarget.lm.key;
        gameState.pingRewardPending = true;
        gameState.radarTimer = Math.max(gameState.radarTimer, 480);
      }
      pushNote('Chain rescue: target refreshed', 120);
    }
  }

  if (!gameState.secondChaseFailSafeUsed && gameState.wisdom === 1 && gameState.firstRelicAtMs > 0) {
    const sinceFirst = Date.now() - gameState.firstRelicAtMs;
    if (sinceFirst > 7000) {
      gameState.secondChaseFailSafeUsed = true;
      const secondTarget = nearestUndiscoveredLandmark();
      if (secondTarget.lm) {
        visitLandmark(secondTarget.lm, { silent: true });
        pushNote('Chain lock-in: second relic secured', 140);
      }
    }
  }

  // Flag a clutch-rescue run when water gets critical
  if (gameState.water < 30) gameState.lowWaterRescueActive = true;

  if (gameState.comboTimer > 0) {
    const preservingMomentum = gameState.boons.speedTimer > 0 || gameState.boons.scoreTimer > 0 || gameState.boons.shieldTimer > 0 || gameState.player.dashCooldown > 0;
    gameState.comboTimer -= preservingMomentum ? 0.65 : 1;
    if (gameState.comboTimer <= 0 && gameState.combo > 1) {
      gameState.comboTimer = 0;
      gameState.combo = 1;
      pushNote('Combo expired — chain relics faster', 120);
    }
  }

  if (gameState.relicStreakTimer > 0) {
    gameState.relicStreakTimer--;
    if (gameState.relicStreakTimer === 0 && gameState.relicStreak > 0) {
      gameState.relicStreak = 0;
      pushNote('Streak dropped', 90);
    }
  }

  if (gameState.sanctuaryTimer > 0) gameState.sanctuaryTimer--;
  if (gameState.radarTimer > 0) {
    gameState.radarTimer--;
    if (gameState.radarTimer === 0 && gameState.pingRewardPending) {
      pushNote('Ping faded before relic lock-in', 100);
      gameState.pingRewardPending = false;
      gameState.pingTargetKey = null;
    }
  }
  if (gameState.threatWarnCooldown > 0) gameState.threatWarnCooldown--;
  if (gameState.oasisRegenNoteCooldown > 0) gameState.oasisRegenNoteCooldown--;
  if (gameState.surgeTimer > 0) gameState.surgeTimer--;
  if (gameState.boons.speedTimer > 0) gameState.boons.speedTimer--;
  if (gameState.boons.scoreTimer > 0) gameState.boons.scoreTimer--;
  if (gameState.boons.shieldTimer > 0) gameState.boons.shieldTimer--;
  if (gameState.trinityCooldown > 0) gameState.trinityCooldown--;
  if (gameState.secondChaseTimer > 0) gameState.secondChaseTimer--;
  if (gameState.starterRetargetCooldown > 0) gameState.starterRetargetCooldown--;

  const allBoonsActive = gameState.boons.speedTimer > 0 && gameState.boons.scoreTimer > 0 && gameState.boons.shieldTimer > 0;
  if (allBoonsActive && gameState.trinityCooldown === 0) {
    gameState.trinityCooldown = 840;
    gameState.score += 140;
    gameState.water = Math.min(100, gameState.water + 12);
    gameState.wraiths = gameState.wraiths.filter((w, i) => i % 2 === 0);
    pushNote('Trinity Surge! Cleansed the dunes • +140', 150);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(255,210,140,1)', 32);
    gameState.shake = 7;
  }

  for (const note of gameState.notifications) note.ttl--;
  gameState.notifications = gameState.notifications.filter(n => n.ttl > 0);

  for (const p of gameState.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.ttl--;
  }
  gameState.particles = gameState.particles.filter(p => p.ttl > 0);

  if (gameState.shake > 0) gameState.shake--;

  gameState.time += 0.35;
  if (gameState.time >= 2400) {
    gameState.time = 0;
    gameState.day += 1;
    gameState.water = Math.min(100, gameState.water + 12);
  }

  const hourNow = Math.floor(gameState.time / 100);
  const isNightNow = (hourNow >= 19 || hourNow < 5);
  if (isNightNow && !gameState.wasNight) {
    pushNote('Nightfall: wraiths emerge. Hunt relics for bonus.', 150);
    gameState.wasNight = true;
  }
  if (!isNightNow && gameState.wasNight) {
    pushNote('Dawn: wraiths recede. Regroup and route.', 120);
    gameState.wasNight = false;
  }

  // Dynamic weather pacing
  gameState.weatherTimer--;
  if (gameState.weatherTimer <= 0) {
    const roll = Math.random();
    if (roll < 0.5) gameState.weather = 'calm';
    else if (roll < 0.78) gameState.weather = 'heatwave';
    else gameState.weather = 'tailwind';
    gameState.weatherTimer = 720 + Math.floor(Math.random() * 480);
    pushNote(`Weather shift: ${gameState.weather.toUpperCase()}`, 130);
  }

  gameState.camera.x = gameState.player.x - canvas.width / 2;
  gameState.camera.y = gameState.player.y - canvas.height / 2;

  ensureNearbyLandmarks();

  if (gameState.wisdom === 0 && gameState.pingRewardPending && gameState.starterRetargetCooldown === 0) {
    const currentTarget = gameState.pingTargetKey ? gameState.landmarks.get(gameState.pingTargetKey) : null;
    const currentDist = currentTarget ? Math.hypot(gameState.player.x - currentTarget.x, gameState.player.y - currentTarget.y) : Infinity;
    if (!currentTarget || currentDist > 520) {
      const nearest = nearestUndiscoveredLandmark();
      if (nearest.lm) {
        gameState.pingTargetKey = nearest.lm.key;
        gameState.radarTimer = Math.max(gameState.radarTimer, 540);
        gameState.starterRetargetCooldown = 240;
        pushNote('Starter ping retargeted closer', 90);
      }
    }
  }

  const openingSec = (Date.now() - gameState.runStartTs) / 1000;
  if (gameState.wisdom === 0 && openingSec < 25) {
    const nearestOpen = nearestUndiscoveredLandmark();
    if (nearestOpen.lm && Number.isFinite(nearestOpen.dist) && nearestOpen.dist < 72) {
      visitLandmark(nearestOpen.lm);
      pushNote('Opening auto-discovery lock-in', 90);
    }
  }

  ensureWraiths();

  // Periodic night surge event: short high-pressure wave with score upside
  const hourNow2 = Math.floor(gameState.time / 100);
  const nightNow2 = (hourNow2 >= 19 || hourNow2 < 5);
  if (nightNow2 && gameState.surgeTimer === 0) {
    for (let i = 0; i < 2; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 160 + Math.random() * 120;
      gameState.wraiths.push({
        x: gameState.player.x + Math.cos(a) * r,
        y: gameState.player.y + Math.sin(a) * r,
        speed: 1.2 + Math.random() * 0.6,
        ttl: 500
      });
    }
    gameState.surgeTimer = 1200;
    pushNote('Night surge! Bonus score on relic chain now.', 140);
    spawnParticles(gameState.player.x, gameState.player.y, 'rgba(255,120,180,1)', 18);
  }

  for (const w of gameState.wraiths) {
    const dxw = gameState.player.x - w.x;
    const dyw = gameState.player.y - w.y;
    const d = Math.hypot(dxw, dyw) || 1;

    // Wraiths avoid bright shrines slightly (readable safe zones)
    let shrineRepelX = 0;
    let shrineRepelY = 0;
    for (const lm of gameState.landmarks.values()) {
      if (lm.art.type !== 'shrine') continue;
      const ds = Math.hypot(w.x - lm.x, w.y - lm.y);
      if (ds < 130) {
        shrineRepelX += (w.x - lm.x) / (ds || 1);
        shrineRepelY += (w.y - lm.y) / (ds || 1);
      }
    }

    w.x += (dxw / d) * w.speed + shrineRepelX * 0.35;
    w.y += (dyw / d) * w.speed + shrineRepelY * 0.35;
    w.ttl--;

    if (d < 28) {
      if (gameState.sanctuaryTimer > 0) {
        // shielded: knock wraith back and score defensive play
        const kx = (w.x - gameState.player.x) / d;
        const ky = (w.y - gameState.player.y) / d;
        w.x += kx * 90;
        w.y += ky * 90;
        gameState.score += 8;
        if (Math.random() < 0.06) pushNote('Sanctuary shield repelled a wraith', 80);
      } else if (gameState.boons.shieldTimer > 0) {
        const kx = (w.x - gameState.player.x) / d;
        const ky = (w.y - gameState.player.y) / d;
        w.x += kx * 110;
        w.y += ky * 110;
        gameState.boons.shieldTimer = Math.max(0, gameState.boons.shieldTimer - 75);
        gameState.score += 10;
        if (Math.random() < 0.2) pushNote('Glass Shell blocked a wraith hit', 90);
        spawnParticles(gameState.player.x, gameState.player.y, 'rgba(170,255,210,1)', 10);
      } else {
        gameState.water = Math.max(0, gameState.water - 0.35);
        gameState.shake = 6;
        if (Math.random() < 0.08) {
          pushNote('Wraith hit! Find shrine light or oasis.', 80);
          playSfx('danger');
        }
      }
    }
  }
  gameState.wraiths = gameState.wraiths.filter(w => w.ttl > 0);

  if (gameState.wraiths.length >= 5 && gameState.threatWarnCooldown === 0) {
    pushNote('High threat night! Use shrine shield + dash pulse.', 120);
    gameState.threatWarnCooldown = 300;
  }

  const hourContract = Math.floor(gameState.time / 100);
  const nightContractWindow = (hourContract >= 19 || hourContract < 5);
  if (!nightContractWindow && gameState.nightContractActive) {
    gameState.nightContractActive = false;
    syncContractButton();
    pushNote('Night Contract ended at dawn', 90);
  }
  if (gameState.nightContractActive && gameState.water <= 20) {
    gameState.nightContractActive = false;
    syncContractButton();
    pushNote('Night Contract cancelled: critical water', 100);
  }

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
  let nearestOasisLm = null;
  const nearestRelic = nearestUndiscoveredLandmark();
  if (gameState.water < 35) {
    nearestOasisLm = nearestOasis().lm;
  }

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

    if (nearestOasisLm && lm.key === nearestOasisLm.key) {
      const pulse = 10 + Math.sin(Date.now() * 0.008) * 4;
      ctx.strokeStyle = 'rgba(120,220,255,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 44 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (gameState.radarTimer > 0 && nearestRelic.lm && lm.key === nearestRelic.lm.key) {
      const pulse = 8 + Math.sin(Date.now() * 0.012) * 5;
      ctx.strokeStyle = 'rgba(255,230,120,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 52 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawWraiths() {
  for (const w of gameState.wraiths) {
    const sx = w.x - gameState.camera.x;
    const sy = w.y - gameState.camera.y;
    if (sx < -40 || sx > canvas.width + 40 || sy < -40 || sy > canvas.height + 40) continue;
    ctx.font = '26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', sx, sy + 8);
  }
}

function drawPlayer() {
  const x = canvas.width / 2, y = canvas.height / 2;
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐭', x, y + 9);
}

function drawGuideArrow() {
  if (gameState.wisdom >= 25) return;
  const nearest = nearestUndiscoveredLandmark();
  if (!nearest.lm || !Number.isFinite(nearest.dist)) return;

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const dx = nearest.lm.x - gameState.player.x;
  const dy = nearest.lm.y - gameState.player.y;
  const mag = Math.hypot(dx, dy) || 1;
  const ux = dx / mag;
  const uy = dy / mag;

  const startX = x + ux * 20;
  const startY = y + uy * 20;
  const endX = x + ux * 58;
  const endY = y + uy * 58;

  ctx.strokeStyle = 'rgba(127,233,255,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  const perpX = -uy;
  const perpY = ux;
  ctx.fillStyle = 'rgba(127,233,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - ux * 10 + perpX * 6, endY - uy * 10 + perpY * 6);
  ctx.lineTo(endX - ux * 10 - perpX * 6, endY - uy * 10 - perpY * 6);
  ctx.closePath();
  ctx.fill();
}

function pushNote(text, ttl = 160) {
  gameState.notifications.push({ text, ttl });
  if (gameState.notifications.length > 4) gameState.notifications.shift();
}

function spawnParticles(x, y, color = '#ffcc66', count = 14) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 0.8 + Math.random() * 2.2;
    gameState.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      ttl: 30 + Math.random() * 24,
      color
    });
  }
}

function drawNotifications() {
  let y = canvas.height - 90;
  ctx.textAlign = 'left';
  for (const note of gameState.notifications) {
    const alpha = Math.min(1, note.ttl / 40);
    ctx.fillStyle = `rgba(0,0,0,${0.55 * alpha})`;
    ctx.fillRect(14, y - 16, 360, 24);
    ctx.fillStyle = `rgba(255,220,150,${alpha})`;
    ctx.font = '13px monospace';
    ctx.fillText(note.text, 22, y);
    y -= 28;
  }
}

function drawTimeOverlay() {
  const h = Math.floor(gameState.time / 100);
  let c = null;
  if (h >= 19 || h < 5) c = 'rgba(0,0,28,0.50)';
  else if (h >= 17 && h < 19) c = 'rgba(255,120,80,0.16)';
  else if (h >= 5 && h < 7) c = 'rgba(255,170,110,0.16)';
  if (c) { ctx.fillStyle = c; ctx.fillRect(0, 0, canvas.width, canvas.height); }

  // Low-water danger vignette for urgency/fun
  if (gameState.water < 25) {
    const intensity = (25 - gameState.water) / 25;
    const grad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.height * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      canvas.height * 0.8
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(180,30,20,${0.45 * intensity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // heartbeat pulse at critical water to increase urgency feedback
    const pulse = (Math.sin(Date.now() * 0.02) + 1) * 0.5;
    ctx.fillStyle = `rgba(255,40,30,${0.08 + pulse * 0.08 * intensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function nearestUndiscoveredLandmark() {
  let best = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    if (lm.discovered) continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < dmin) { dmin = d; best = lm; }
  }
  return { lm: best, dist: dmin };
}

function trustDeltaTextForLandmark(lm) {
  if (!lm) return 'trust ?';
  if (lm.art.type === 'storm') return 'trust -1';
  return 'trust +1';
}

function minimapLegendText() {
  return 'Map: storm=red oasis=blue shrine=gold visited=green | recover=blue pulse | night-safe=cyan pulse';
}

function routeHintForLandmark(lm) {
  if (!lm) return '';
  if (lm.art.type === 'storm') return ' • high risk';
  if (lm.art.type === 'oasis') return ' • safe refill';
  if (lm.art.type === 'shrine') return ' • dash/sanctuary boost';
  return '';
}

function directionHintForLandmark(lm) {
  if (!lm) return '';
  const dx = lm.x - gameState.player.x;
  const dy = lm.y - gameState.player.y;
  const labels = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
  const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];
  const angle = Math.atan2(dy, dx);
  const idx = Math.round((((angle + Math.PI) / (2 * Math.PI)) * 8)) % 8;
  return ` • ${arrows[idx]} ${labels[idx]}`;
}

function firstRelicAssistRadius() {
  if (gameState.wisdom > 0) return 95;
  const elapsedSec = (Date.now() - gameState.runStartTs) / 1000;
  const ramp = Math.max(0, elapsedSec - 8) * 6;
  return Math.min(210, 150 + ramp);
}

function nearestRecoveryLandmark() {
  let best = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    if (lm.discovered) continue;
    if (lm.art.type === 'storm') continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < dmin) { dmin = d; best = lm; }
  }
  return { lm: best, dist: dmin };
}

function nearestSafeLandmark() {
  let best = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    if (lm.art.type !== 'oasis' && lm.art.type !== 'shrine') continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < dmin) { dmin = d; best = lm; }
  }
  return { lm: best, dist: dmin };
}

function priorityPrefix(enabled) {
  return enabled ? '⚠ PRIORITY: ' : '';
}

function contractStatusLabel(options = {}) {
  const forHint = options.forHint === true;
  const hour = Math.floor(gameState.time / 100);
  const night = (hour >= 19 || hour < 5);

  if (gameState.nightContractActive) return 'ON';
  if (!night) return forHint ? 'OFF (night only)' : 'off';
  if (gameState.water <= 20) return forHint ? 'LOCKED (>20 water)' : 'locked';
  return forHint ? 'READY (C)' : 'ready';
}

function triggerRadarPing() {
  if (gameState.radarTimer > 0) return;
  const nearest = nearestUndiscoveredLandmark();
  gameState.radarTimer = 420; // ~7s
  if (nearest.lm) {
    gameState.pingTargetKey = nearest.lm.key;
    gameState.pingRewardPending = true;
    pushNote(`Relic ping locked: ${nearest.lm.art.name}`, 130);
  } else {
    gameState.pingTargetKey = null;
    gameState.pingRewardPending = false;
    pushNote('Relic ping active', 110);
  }
  playSfx('quest');
}

function syncContractButton(status, hint) {
  const btn = document.getElementById('contractBtn');
  if (!btn) return;
  const statusNow = status ?? contractStatusLabel();
  const hintNow = hint ?? contractStatusLabel({ forHint: true });
  if (statusNow === 'ON') setTextIfChanged(btn, 'Contract ON');
  else if (statusNow === 'ready') setTextIfChanged(btn, 'Contract READY');
  else if (statusNow === 'locked') setTextIfChanged(btn, 'Contract LOCKED');
  else setTextIfChanged(btn, 'Contract OFF');
  setAriaLabelIfChanged(btn, `Night Contract: ${hintNow}`);
}

function toggleNightContract() {
  const hour = Math.floor(gameState.time / 100);
  const isNight = (hour >= 19 || hour < 5);
  if (!isNight) {
    pushNote('Contract unavailable: night only', 100);
    return;
  }
  if (gameState.water <= 20) {
    pushNote('Contract unavailable: water too low', 100);
    return;
  }
  gameState.nightContractActive = !gameState.nightContractActive;
  syncContractButton();
  pushNote(gameState.nightContractActive ? 'Night Contract engaged' : 'Night Contract disengaged', 110);
}

function toggleMute() {
  muted = !muted;
  const btn = document.getElementById('muteBtn');
  if (btn) btn.textContent = muted ? 'Unmute' : 'Mute';
  pushNote(muted ? 'Audio muted' : 'Audio on', 80);
}

function nearestOasis() {
  let best = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    if (lm.art.type !== 'oasis') continue;
    const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
    if (d < dmin) { dmin = d; best = lm; }
  }
  return { lm: best, dist: dmin };
}

function drawMinimap() {
  const w = 180, h = 120, pad = 12;
  const x0 = canvas.width - w - pad, y0 = canvas.height - h - pad;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#d4a86a';
  ctx.strokeRect(x0, y0, w, h);

  const scale = gameState.minimapScale;
  for (const lm of gameState.landmarks.values()) {
    const rx = x0 + w / 2 + (lm.x - gameState.player.x) * scale;
    const ry = y0 + h / 2 + (lm.y - gameState.player.y) * scale;
    if (rx < x0 || rx > x0 + w || ry < y0 || ry > y0 + h) continue;

    if (gameState.visitedLandmarks.has(lm.art.id)) {
      ctx.fillStyle = '#9ddf9d';
    } else if (lm.art.type === 'storm') {
      ctx.fillStyle = '#ff8a8a';
    } else if (lm.art.type === 'oasis') {
      ctx.fillStyle = '#80d6ff';
    } else if (lm.art.type === 'shrine') {
      ctx.fillStyle = '#ffe08a';
    } else {
      ctx.fillStyle = '#d4a86a';
    }

    ctx.fillRect(rx - 2, ry - 2, 4, 4);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x0 + w / 2 - 2, y0 + h / 2 - 2, 4, 4);

  // Compass arrow to nearest undiscovered relic
  const nearest = nearestUndiscoveredLandmark();
  if (nearest.lm) {
    const dx = nearest.lm.x - gameState.player.x;
    const dy = nearest.lm.y - gameState.player.y;
    const a = Math.atan2(dy, dx);
    const cx = x0 + 18, cy = y0 + 18;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Locked ping target marker for readable routing on minimap
  if (gameState.pingRewardPending && gameState.pingTargetKey) {
    const target = gameState.landmarks.get(gameState.pingTargetKey);
    if (target && !target.discovered) {
      const rx = x0 + w / 2 + (target.x - gameState.player.x) * scale;
      const ry = y0 + h / 2 + (target.y - gameState.player.y) * scale;
      if (rx >= x0 && rx <= x0 + w && ry >= y0 && ry <= y0 + h) {
        const pulse = (Math.sin(Date.now() * 0.014) + 1) * 0.5;
        ctx.strokeStyle = `rgba(125,255,155,${0.45 + pulse * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, 5 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#7dff9b';
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      }
    }
  }

  // Wary trust recovery marker (non-storm nearest target)
  if (gameState.trustScore <= -5) {
    const recovery = nearestRecoveryLandmark();
    if (recovery.lm) {
      const rx = x0 + w / 2 + (recovery.lm.x - gameState.player.x) * scale;
      const ry = y0 + h / 2 + (recovery.lm.y - gameState.player.y) * scale;
      if (rx >= x0 && rx <= x0 + w && ry >= y0 && ry <= y0 + h) {
        const pulse = (Math.sin(Date.now() * 0.011) + 1) * 0.5;
        ctx.strokeStyle = `rgba(140,200,255,${0.35 + pulse * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, 4 + pulse * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Night safety marker (nearest oasis/shrine) for threat-phase readability
  const hour = Math.floor(gameState.time / 100);
  const night = (hour >= 19 || hour < 5);
  if (night && gameState.wraiths.length > 0) {
    const safe = nearestSafeLandmark();
    if (safe.lm) {
      const rx = x0 + w / 2 + (safe.lm.x - gameState.player.x) * scale;
      const ry = y0 + h / 2 + (safe.lm.y - gameState.player.y) * scale;
      if (rx >= x0 && rx <= x0 + w && ry >= y0 && ry <= y0 + h) {
        const pulse = (Math.sin(Date.now() * 0.016) + 1) * 0.5;
        ctx.strokeStyle = `rgba(110,240,255,${0.30 + pulse * 0.50})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, 5 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  for (const p of gameState.particles) {
    const alpha = Math.max(0, p.ttl / 54);
    ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    if (!ctx.fillStyle.startsWith('rgba')) ctx.fillStyle = `rgba(255,204,102,${alpha})`;
    ctx.fillRect(p.x - gameState.camera.x, p.y - gameState.camera.y, 3, 3);
  }
}

function drawPingGuidance() {
  if (gameState.radarTimer <= 0 || !gameState.pingTargetKey) return;
  const target = gameState.landmarks.get(gameState.pingTargetKey);
  if (!target || target.discovered) return;

  const px = gameState.player.x - gameState.camera.x;
  const py = gameState.player.y - gameState.camera.y;
  const tx = target.x - gameState.camera.x;
  const ty = target.y - gameState.camera.y;
  const dx = tx - px;
  const dy = ty - py;
  const dist = Math.hypot(dx, dy) || 1;
  const steps = Math.min(14, Math.max(4, Math.floor(dist / 55)));

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const bx = px + dx * t;
    const by = py + dy * t;
    const pulse = (Math.sin((Date.now() * 0.012) + i * 0.5) + 1) * 0.5;
    const r = 2 + pulse * 2;
    ctx.fillStyle = `rgba(255,213,107,${0.25 + pulse * 0.45})`;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function render() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sx = gameState.shake > 0 ? (Math.random() - 0.5) * 6 : 0;
  const sy = gameState.shake > 0 ? (Math.random() - 0.5) * 6 : 0;
  ctx.save();
  ctx.translate(sx, sy);

  drawSand();
  drawLandmarks();
  drawPingGuidance();
  drawWraiths();
  drawParticles();
  drawPlayer();
  drawGuideArrow();
  drawTimeOverlay();
  drawMinimap();

  ctx.restore();
  drawNotifications();
}

function tryInteract() {
  const interactRadius = firstRelicAssistRadius();
  let near = null;
  let dmin = Infinity;
  for (const lm of gameState.landmarks.values()) {
    const dx = gameState.player.x - lm.x;
    const dy = gameState.player.y - lm.y;
    const d = Math.hypot(dx, dy);
    if (d < dmin && d < interactRadius) { dmin = d; near = lm; }
  }
  if (near) visitLandmark(near);
}

function visitLandmark(lm, options = {}) {
  gameState.visitedLandmarks.add(lm.art.id);
  if (!lm.discovered) {
    lm.discovered = true;
    gameState.wisdom += 1;
    gameState.combo = Math.min(8, gameState.combo + 1);
    gameState.comboTimer = 480; // keep combo alive for ~8s
    const baseScore = lm.art.type === 'shrine' ? 18 : lm.art.type === 'oasis' ? 14 : 10;
    gameState.relicStreak = Math.min(12, gameState.relicStreak + 1);
    gameState.relicStreakTimer = 420;
    const streakBonus = gameState.relicStreak >= 3 ? gameState.relicStreak * 2 : 0;
    const hour = Math.floor(gameState.time / 100);
    const isNight = (hour >= 19 || hour < 5);
    const surgeBonus = (isNight && gameState.wraiths.length >= 4) ? 18 : 0;
    const gained = Math.floor((baseScore * gameState.combo + streakBonus) * currentScoreMultiplier()) + surgeBonus;
    gameState.score += gained;

    if (gameState.wisdom === 1) {
      gameState.firstRelicAtMs = Date.now();
      gameState.secondChaseRescueUsed = false;
      gameState.autoSurveyCooldownUntil = Date.now() + 1800;
      const openerBonus = 35;
      const openerWater = 12;
      gameState.score += openerBonus;
      gameState.water = Math.min(100, gameState.water + openerWater);
      gameState.player.dashCooldown = Math.max(0, gameState.player.dashCooldown - 30);
      gameState.comboTimer = Math.max(gameState.comboTimer, 600);
      gameState.relicStreakTimer = Math.max(gameState.relicStreakTimer, 540);
      gameState.secondChaseTimer = Math.max(gameState.secondChaseTimer, 720);
      gameState.boons.scoreTimer = Math.max(gameState.boons.scoreTimer, 300);
      gameState.boons.speedTimer = Math.max(gameState.boons.speedTimer, 240);
      const chaseTarget = nearestUndiscoveredLandmark();
      if (chaseTarget.lm) {
        gameState.pingTargetKey = chaseTarget.lm.key;
        gameState.pingRewardPending = true;
        gameState.radarTimer = Math.max(gameState.radarTimer, 600);
      }
      pushNote(`Opening momentum: +${openerBonus} score • +${openerWater} water • chain window extended`, 170);
    }

    if (gameState.wisdom === 2 && gameState.secondChaseTimer > 0) {
      const chaseBonus = 55;
      gameState.score += chaseBonus;
      gameState.water = Math.min(100, gameState.water + 8);
      pushNote(`Second chase complete • +${chaseBonus} score • +8 water`, 130);
      gameState.secondChaseTimer = 0;
    }

    const activeBoons = [];
    if (gameState.boons.speedTimer > 0) activeBoons.push('Windstep');
    if (gameState.boons.scoreTimer > 0) activeBoons.push('Golden Echo');
    if (gameState.boons.shieldTimer > 0) activeBoons.push('Glass Shell');
    if (activeBoons.length > 0) {
      const chainBonus = 8 * activeBoons.length;
      gameState.score += chainBonus;
      gameState.boons.speedTimer = Math.min(900, gameState.boons.speedTimer + 24);
      gameState.boons.scoreTimer = Math.min(900, gameState.boons.scoreTimer + 24);
      gameState.boons.shieldTimer = Math.min(700, gameState.boons.shieldTimer + 18);
      if (Math.random() < 0.35) {
        pushNote(`Boon chain (${activeBoons.join(' + ')}) • +${chainBonus}`, 100);
      }
    }

    gameState.water = Math.min(100, gameState.water + (lm.art.type === 'oasis' ? 20 : 8));
    gameState.trustScore += (lm.art.type === 'storm' ? -1 : 1);
    gameState.shake = 4;
    spawnParticles(lm.x, lm.y, lm.art.type === 'storm' ? 'rgba(255,120,120,1)' : 'rgba(255,210,120,1)', 18);
    const hour2 = Math.floor(gameState.time / 100);
    const atNight = (hour2 >= 19 || hour2 < 5);
    const inSurge = atNight && gameState.wraiths.length >= 4;
    pushNote(`+${gained} score • combo x${gameState.combo} • streak ${gameState.relicStreak}${atNight ? ' • night bonus' : ''}${inSurge ? ' • surge bonus' : ''}${gameState.nightContractActive ? ' • contract bonus' : ''}`);
    vibrate(gameState.relicStreak >= 5 ? 22 : 12);
    if (gameState.relicStreak === 5) {
      pushNote('Relic Frenzy! Keep chaining discoveries', 150);
      spawnParticles(lm.x, lm.y, 'rgba(180,255,120,1)', 26);
      gameState.score += 60;
    }
    playSfx('relic');

    if (lm.art.type === 'shrine') {
      gameState.player.dashCooldown = Math.max(0, gameState.player.dashCooldown - 45);
      gameState.sanctuaryTimer = Math.max(gameState.sanctuaryTimer, 540);
      pushNote('Shrine blessing: dash boost + sanctuary shield', 140);
      spawnParticles(lm.x, lm.y, 'rgba(170,255,210,1)', 22);
    }

    if (Math.random() < 0.22 || gameState.relicStreak === 7 || gameState.relicStreak === 12) {
      grantRandomBoon();
    }

    if (gameState.wisdom > 0 && gameState.wisdom % 5 === 0) {
      saveGame();
      pushNote(`Milestone checkpoint saved (${gameState.wisdom} relics)`, 110);
    }

    if (lm.art.type === 'oasis' && gameState.lowWaterRescueActive) {
      const rescueBonus = 120;
      gameState.score += rescueBonus;
      gameState.lowWaterRescueActive = false;
      pushNote(`Clutch oasis rescue! +${rescueBonus}`, 170);
      spawnParticles(lm.x, lm.y, 'rgba(120,220,255,1)', 30);
    }

    if (gameState.pingRewardPending && gameState.pingTargetKey === lm.key) {
      const pingBonus = 45;
      const waterBonus = 6;
      gameState.score += pingBonus;
      gameState.water = Math.min(100, gameState.water + waterBonus);
      gameState.pingRewardPending = false;
      gameState.pingTargetKey = null;
      gameState.radarTimer = 0;
      pushNote(`Ping lock complete • +${pingBonus} score • +${waterBonus} water`, 150);
      spawnParticles(lm.x, lm.y, 'rgba(255,213,107,1)', 28);
      playSfx('quest');
    }
  } else {
    gameState.score += 2; // minor reward for revisit
  }
  if (!options.silent) showModal(lm);
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

window.continueEndless = function continueEndless() {
  const modal = document.getElementById('runCompleteModal');
  if (modal) modal.style.display = 'none';
  pushNote('Endless mode: keep chaining relics for higher score', 180);
};

window.togglePause = function togglePause() {
  gameState.paused = !gameState.paused;
  const m = document.getElementById('pauseModal');
  const s = document.getElementById('pauseSummary');
  if (s) s.textContent = `Day ${gameState.day} • Score ${Math.floor(gameState.score)} • Relics ${gameState.wisdom}`;
  if (m) m.style.display = gameState.paused ? 'flex' : 'none';
  if (gameState.paused) {
    saveGame();
    pushNote('Paused • checkpoint saved', 70);
  }
};

window.reviveAtOasis = function reviveAtOasis() {
  const no = nearestOasis();
  if (no.lm) {
    gameState.player.x = no.lm.x;
    gameState.player.y = no.lm.y;
  }
  gameState.water = Math.max(45, gameState.water);
  gameState.combo = 1;
  gameState.comboTimer = 0;
  gameState.player.speed = 3;
  gameState.player.dashCooldown = 0;
  gameState.dehydrated = false;
  const m = document.getElementById('dehydrationModal');
  if (m) m.style.display = 'none';
  pushNote('Revived at oasis — run continues', 180);
  playSfx('revive');
};

function completeQuest(q) {
  q.done = true;
  if (q.reward?.score) gameState.score += q.reward.score;
  if (q.reward?.water) gameState.water = Math.min(100, gameState.water + q.reward.water);
  if (q.reward?.trust) gameState.trustScore += q.reward.trust;
  pushNote(`Quest complete: ${q.text}`, 180);
  playSfx('quest');
  vibrate(25);
}

function updateQuests() {
  const discovered = gameState.visitedLandmarks.size;
  for (const q of gameState.quests) {
    if (q.done) continue;
    if (q.id === 'first_relic' && discovered >= q.target) completeQuest(q);
    if (q.id === 'ten_relics' && discovered >= q.target) completeQuest(q);
    if (q.id === 'trusted' && gameState.trustScore >= q.target) completeQuest(q);
    if (q.id === 'score_1500' && gameState.score >= q.target) completeQuest(q);
  }
}

function applyLiveRegionSemantics(el) {
  if (!el || el.dataset.liveReady === '1') return;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('aria-relevant', 'text');
  el.dataset.liveReady = '1';
}

function setAriaLabelIfChanged(el, label) {
  if (!el) return;
  if (el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label);
}

function setTitleIfChanged(el, title) {
  if (!el) return;
  if (el.title !== title) el.title = title;
}

function setTextIfChanged(el, text) {
  if (!el) return;
  if (el.textContent !== text) el.textContent = text;
}

function setHtmlIfChanged(el, html) {
  if (!el) return;
  if (el.innerHTML !== html) el.innerHTML = html;
}

function setStyleIfChanged(el, prop, value) {
  if (!el) return;
  if (el.style[prop] !== value) el.style[prop] = value;
}

function updateUI() {
  const waterNow = Math.floor(gameState.water);
  const waterEl = document.getElementById('water');
  if (waterEl) {
    applyLiveRegionSemantics(waterEl);
    setTextIfChanged(waterEl, `${waterNow}`);
    setAriaLabelIfChanged(waterEl, `Water: ${waterNow}`);
  }

  const wisdomEl = document.getElementById('wisdom');
  if (wisdomEl) {
    applyLiveRegionSemantics(wisdomEl);
    setTextIfChanged(wisdomEl, `${gameState.wisdom}`);
    setAriaLabelIfChanged(wisdomEl, `Relics discovered: ${gameState.wisdom}`);
  }

  const trustEl = document.getElementById('trust');
  if (trustEl) {
    applyLiveRegionSemantics(trustEl);
    const trustState = trustLabel(gameState.trustScore);
    const trustProgress = trustProgressText(gameState.trustScore);
    setTextIfChanged(trustEl, `${trustState} (${trustProgress})`);
    setAriaLabelIfChanged(trustEl, `Trust: ${trustState}. ${trustProgress}`);
    if (trustState === 'Beloved') setStyleIfChanged(trustEl, 'color', '#9effa8');
    else if (trustState === 'Trusted') setStyleIfChanged(trustEl, 'color', '#b8d3ff');
    else if (trustState === 'Friendly') setStyleIfChanged(trustEl, 'color', '#ffe39e');
    else if (trustState === 'Wary') setStyleIfChanged(trustEl, 'color', '#ff9f9f');
    else setStyleIfChanged(trustEl, 'color', '#e8d5b7');
  }
  const sanctuaryEl = document.getElementById('sanctuary');
  if (sanctuaryEl) {
    applyLiveRegionSemantics(sanctuaryEl);
    const sanctuarySecs = gameState.sanctuaryTimer > 0 ? Math.ceil(gameState.sanctuaryTimer / 60) : 0;
    setTextIfChanged(sanctuaryEl, `${sanctuarySecs}s`);
    setAriaLabelIfChanged(sanctuaryEl, `Sanctuary shield: ${sanctuarySecs} seconds`);
  }
  const wraithEl = document.getElementById('wraithCount');
  if (wraithEl) {
    applyLiveRegionSemantics(wraithEl);
    setTextIfChanged(wraithEl, `${gameState.wraiths.length}`);
    setAriaLabelIfChanged(wraithEl, `Wraith threat count: ${gameState.wraiths.length}`);
  }
  const hourForBonus = Math.floor(gameState.time / 100);
  const nightBonusEl = document.getElementById('nightBonus');
  if (nightBonusEl) {
    applyLiveRegionSemantics(nightBonusEl);
    const nightMult = (hourForBonus >= 19 || hourForBonus < 5) ? 'x1.2' : 'x1.0';
    setTextIfChanged(nightBonusEl, nightMult);
    setAriaLabelIfChanged(nightBonusEl, `Night bonus multiplier: ${nightMult}`);
  }
  const contractEl = document.getElementById('contract');
  if (contractEl) {
    applyLiveRegionSemantics(contractEl);
    const status = contractStatusLabel();
    const hint = contractStatusLabel({ forHint: true });
    syncContractButton(status, hint);
    setTextIfChanged(contractEl, status);
    if (status === 'ON') setStyleIfChanged(contractEl, 'color', '#9effa8');
    else if (status === 'locked') setStyleIfChanged(contractEl, 'color', '#ff9f9f');
    else if (status === 'ready') setStyleIfChanged(contractEl, 'color', '#7fe9ff');
    else setStyleIfChanged(contractEl, 'color', '#e8d5b7');

    setTitleIfChanged(contractEl, `Night Contract: ${hint}`);
    setAriaLabelIfChanged(contractEl, `Night Contract status: ${hint}`);

    const contractBtn = document.getElementById('contractBtn');
    if (contractBtn) setTitleIfChanged(contractBtn, `Night Contract: ${hint}`);
  }
  const multEl = document.getElementById('multiplier');
  if (multEl) {
    applyLiveRegionSemantics(multEl);
    const multValue = currentScoreMultiplier().toFixed(2);
    const boonCount = Number(gameState.boons.speedTimer > 0) + Number(gameState.boons.scoreTimer > 0) + Number(gameState.boons.shieldTimer > 0);
    const trinityReady = boonCount === 3 && gameState.trinityCooldown === 0;
    const trinityCd = gameState.trinityCooldown > 0 ? ` · TS ${Math.ceil(gameState.trinityCooldown / 60)}s` : trinityReady ? ' · TS READY' : '';
    setTextIfChanged(multEl, `x${multValue} · Boons ${boonCount}/3${trinityCd}`);
    setAriaLabelIfChanged(multEl, `Score multiplier: ${multValue}. Active boons: ${boonCount} of 3.${trinityReady ? ' Trinity surge ready.' : ''}`);
  }
  const trailTimerSec = gameState.trailblazeTimer > 0 ? ` · TB ${Math.ceil(gameState.trailblazeTimer / 60)}s` : '';
  const comboEl = document.getElementById('combo');
  if (comboEl) {
    applyLiveRegionSemantics(comboEl);
    setTextIfChanged(comboEl, `x${gameState.combo} · Trail x${gameState.trailblazeChain}${trailTimerSec}`);
    setAriaLabelIfChanged(comboEl, `Combo multiplier: ${gameState.combo}. Trail chain: ${gameState.trailblazeChain}${gameState.trailblazeTimer > 0 ? `, timer ${Math.ceil(gameState.trailblazeTimer / 60)} seconds` : ''}`);
  }
  const streakEl = document.getElementById('streak');
  if (streakEl) {
    applyLiveRegionSemantics(streakEl);
    setTextIfChanged(streakEl, `${gameState.relicStreak}`);
    setAriaLabelIfChanged(streakEl, `Relic streak: ${gameState.relicStreak}`);
  }
  const scoreNow = Math.floor(gameState.score);
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    applyLiveRegionSemantics(scoreEl);
    setTextIfChanged(scoreEl, `${scoreNow}`);
    setAriaLabelIfChanged(scoreEl, `Score: ${scoreNow}`);
  }
  if (scoreNow > gameState.highScore) gameState.highScore = scoreNow;
  const highEl = document.getElementById('highScore');
  if (highEl) {
    applyLiveRegionSemantics(highEl);
    setTextIfChanged(highEl, `${gameState.highScore}`);
    setAriaLabelIfChanged(highEl, `High score: ${gameState.highScore}`);
  }
  const paceEl = document.getElementById('pace');
  if (paceEl) {
    applyLiveRegionSemantics(paceEl);
    const mins = Math.max(0.1, (Date.now() - gameState.runStartTs) / 60000);
    const pace = (gameState.wisdom / mins).toFixed(1);
    setTextIfChanged(paceEl, `${pace}/m`);
    setAriaLabelIfChanged(paceEl, `Discovery pace: ${pace} per minute`);
  }
  const comboBar = document.getElementById('comboBar');
  if (comboBar) {
    const pct = Math.max(0, Math.min(100, (gameState.comboTimer / 480) * 100));
    setStyleIfChanged(comboBar, 'width', `${pct > 0 ? pct : 1}%`);
  }
  const dashBar = document.getElementById('dashBar');
  if (dashBar) {
    const ready = gameState.player.dashCooldown <= 0;
    const pct = ready ? 100 : Math.max(0, Math.min(100, ((120 - gameState.player.dashCooldown) / 120) * 100));
    setStyleIfChanged(dashBar, 'width', `${pct}%`);
    const dashBtn = document.getElementById('dashBtn');
    if (dashBtn) {
      applyLiveRegionSemantics(dashBtn);
      const dashState = ready ? 'ready' : `${Math.ceil(gameState.player.dashCooldown / 60)}s`;
      setTitleIfChanged(dashBtn, `Dash: ${dashState}`);
      setAriaLabelIfChanged(dashBtn, `Dash: ${dashState}`);
      setTextIfChanged(dashBtn, ready ? 'Dash READY' : `Dash ${dashState}`);
    }
  }

  const interactBtn = document.getElementById('interactBtn');
  if (interactBtn) {
    applyLiveRegionSemantics(interactBtn);
    const interactRadius = firstRelicAssistRadius();
    let interactReady = false;
    for (const lm of gameState.landmarks.values()) {
      const d = Math.hypot(gameState.player.x - lm.x, gameState.player.y - lm.y);
      if (d < interactRadius) { interactReady = true; break; }
    }
    const interactState = interactReady ? 'ready' : 'move closer';
    setTitleIfChanged(interactBtn, `Interact: ${interactState}`);
    setAriaLabelIfChanged(interactBtn, `Interact: ${interactState}`);
    setTextIfChanged(interactBtn, interactReady ? 'Interact READY' : 'Interact');
  }

  const pingBar = document.getElementById('pingBar');
  const pingStatus = document.getElementById('pingStatus');
  if (pingStatus) {
    applyLiveRegionSemantics(pingStatus);
  }
  if (pingBar) {
    const pct = gameState.radarTimer > 0
      ? Math.max(0, Math.min(100, (gameState.radarTimer / 420) * 100))
      : 100;
    setStyleIfChanged(pingBar, 'width', `${pct}%`);
    let pingLabel = 'ready';
    let pingColor = '#aeb3c4';
    let pingHint = 'Ping ready';
    let pingBarBg = '#8f95a6';
    let pingBarShadow = 'none';

    if (gameState.pingRewardPending) {
      pingBarBg = '#7dff9b';
      pingBarShadow = '0 0 8px rgba(125,255,155,0.6)';
      pingLabel = `${Math.ceil(gameState.radarTimer / 60)}s`;
      pingColor = '#7dff9b';
      pingHint = 'Ping lock active: reach locked relic before timer expires';
    } else if (gameState.radarTimer > 0) {
      pingBarBg = '#ffd56b';
      pingBarShadow = 'none';
      pingLabel = `${Math.ceil(gameState.radarTimer / 60)}s`;
      pingColor = '#ffd56b';
      pingHint = 'Ping scan active';
    } else {
      const hourPing = Math.floor(gameState.time / 100);
      const nightPing = (hourPing >= 19 || hourPing < 5);
      if (gameState.trustScore <= -5 && nightPing && gameState.wraiths.length > 0) {
        pingLabel = 'recover!';
        pingColor = '#9cf7ff';
        pingHint = 'Critical overlap: recover trust while evading night threat';
      } else if (gameState.trustScore <= -5) {
        pingLabel = 'recover';
        pingColor = '#80d6ff';
        pingHint = 'Trust is Wary: route oasis/shrine, avoid storms';
      } else if (nightPing && gameState.wraiths.length > 0) {
        pingLabel = 'threat';
        pingColor = '#7fe9ff';
        pingHint = 'Night threat active: follow safe-route pulse';
      }
    }

    setStyleIfChanged(pingBar, 'background', pingBarBg);
    setStyleIfChanged(pingBar, 'boxShadow', pingBarShadow);

    if (pingStatus) {
      setTextIfChanged(pingStatus, pingLabel);
      setStyleIfChanged(pingStatus, 'color', pingColor);
      setTitleIfChanged(pingStatus, pingHint);
      setAriaLabelIfChanged(pingStatus, `${pingLabel} — ${pingHint}`);
    }

    const pingBtn = document.getElementById('pingBtn');
    if (pingBtn) {
      setTitleIfChanged(pingBtn, `Relic Ping: ${pingLabel}`);
      setAriaLabelIfChanged(pingBtn, `Relic Ping: ${pingLabel}`);
      setTextIfChanged(pingBtn, gameState.radarTimer > 0 ? `Ping ${pingLabel}` : 'Ping');
    }
  }
  const h = Math.floor(gameState.time / 100);
  const label = h >= 19 || h < 5 ? 'Night' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  const weatherTag = gameState.weather === 'heatwave' ? '🔥' : gameState.weather === 'tailwind' ? '💨' : '🌤️';
  const weatherWord = gameState.weather === 'heatwave' ? 'heatwave' : gameState.weather === 'tailwind' ? 'tailwind' : 'calm';
  const timeEl = document.getElementById('time');
  applyLiveRegionSemantics(timeEl);
  setTextIfChanged(timeEl, `${label} ${gameState.day} ${weatherTag}`);
  setAriaLabelIfChanged(timeEl, `Time: ${label}, Day ${gameState.day}, Weather: ${weatherWord}`);

  const objectiveEl = document.getElementById('objective');
  if (objectiveEl) {
    applyLiveRegionSemantics(objectiveEl);
    const hour = Math.floor(gameState.time / 100);
    const night = (hour >= 19 || hour < 5);
    if (gameState.pingRewardPending && gameState.pingTargetKey) {
      const pingTarget = gameState.landmarks.get(gameState.pingTargetKey);
      if (pingTarget && !pingTarget.discovered) {
        const pd = Math.hypot(gameState.player.x - pingTarget.x, gameState.player.y - pingTarget.y);
        const secs = Math.ceil(gameState.radarTimer / 60);
        setTextIfChanged(objectiveEl, `Ping lock active: ${pingTarget.art.name} (${Math.floor(pd)}m${directionHintForLandmark(pingTarget)} • ${secs}s • ${trustDeltaTextForLandmark(pingTarget)}${routeHintForLandmark(pingTarget)})`);
      } else {
        setTextIfChanged(objectiveEl, 'Ping lock active: keep moving toward marked relic');
      }
    } else if (gameState.water < 30) {
      const no = nearestOasis();
      if (no.lm) setTextIfChanged(objectiveEl, `Low water! Reach oasis: ${no.lm.art.name} (${Math.floor(no.dist)}m${directionHintForLandmark(no.lm)} • ${trustDeltaTextForLandmark(no.lm)}${routeHintForLandmark(no.lm)})`);
      else setTextIfChanged(objectiveEl, 'Low water! Move and scout for oasis');
    } else if (gameState.trustScore <= -5) {
      const recovery = nearestRecoveryLandmark();
      const underThreat = night && gameState.wraiths.length > 0;
      if (recovery.lm) {
        setTextIfChanged(objectiveEl, `${priorityPrefix(underThreat)}Trust recovery: route ${recovery.lm.art.name} (${Math.floor(recovery.dist)}m${directionHintForLandmark(recovery.lm)} • ${trustDeltaTextForLandmark(recovery.lm)}${routeHintForLandmark(recovery.lm)})`);
      } else {
        setTextIfChanged(objectiveEl, `${priorityPrefix(underThreat)}Trust recovery: avoid storms, route through oasis/shrine to climb back to Neutral`);
      }
    } else if (night && gameState.wraiths.length > 0) {
      const safe = nearestSafeLandmark();
      const contractHint = contractStatusLabel({ forHint: true });
      if (safe.lm) {
        setTextIfChanged(objectiveEl, `${priorityPrefix(true)}Night threat: evade ${gameState.wraiths.length} wraiths • route ${safe.lm.art.name} (${Math.floor(safe.dist)}m${directionHintForLandmark(safe.lm)}${routeHintForLandmark(safe.lm)}) • contract ${contractHint}`);
      } else {
        setTextIfChanged(objectiveEl, `${priorityPrefix(true)}Night threat: evade ${gameState.wraiths.length} wraiths • contract ${contractHint}`);
      }
    } else if (gameState.wisdom < 25) {
      const nearest = nearestUndiscoveredLandmark();
      const chasePrefix = (gameState.wisdom === 1 && gameState.secondChaseTimer > 0)
        ? `Second chase ${Math.ceil(gameState.secondChaseTimer / 60)}s • `
        : '';
      if (nearest.lm && Number.isFinite(nearest.dist)) {
        setTextIfChanged(objectiveEl, `${chasePrefix}Objective: Reach 25 relics • Next: ${nearest.lm.art.name} (${Math.floor(nearest.dist)}m${directionHintForLandmark(nearest.lm)} • ${trustDeltaTextForLandmark(nearest.lm)}${routeHintForLandmark(nearest.lm)})`);
      } else {
        setTextIfChanged(objectiveEl, `${chasePrefix}Objective: Reach 25 relics • Explore farther dunes`);
      }
    } else {
      setTextIfChanged(objectiveEl, 'Objective complete: 25 relic run finished • Endless mode active');
    }
    setAriaLabelIfChanged(objectiveEl, objectiveEl.textContent || '');
  }

  const questHUD = document.getElementById('questHUD');
  if (questHUD) {
    applyLiveRegionSemantics(questHUD);
    const questsText = gameState.quests.map(q => {
      const mark = q.done ? '✅' : '⬜';
      return `${mark} ${q.text}`;
    }).join(' • ');
    const hourHud = Math.floor(gameState.time / 100);
    const nightHud = (hourHud >= 19 || hourHud < 5);
    const nightHint = (nightHud && gameState.wraiths.length > 0)
      ? ` • Night safe-route pulse active • contract ${contractStatusLabel({ forHint: true })}`
      : '';
    const nearestGuide = nearestUndiscoveredLandmark();
    const guideHint = (gameState.wisdom < 25 && nearestGuide.lm && Number.isFinite(nearestGuide.dist))
      ? ` • Guide: ${nearestGuide.lm.art.name} (${Math.floor(nearestGuide.dist)}m${directionHintForLandmark(nearestGuide.lm)})`
      : '';
    const chaseHint = (gameState.wisdom === 1 && gameState.secondChaseTimer > 0)
      ? ` • Chain window ${Math.ceil(gameState.secondChaseTimer / 60)}s`
      : '';
    const helperText = `${minimapLegendText()}${nightHint}${guideHint}${chaseHint}`;
    setHtmlIfChanged(questHUD, `${questsText}<br><span style="color:#8ea1c7;">${helperText}</span>`);
    setAriaLabelIfChanged(questHUD, `${questsText}. ${helperText}`);
  }

  if (!gameState.runCompleteShown && gameState.wisdom >= 25) {
    gameState.runCompleteShown = true;
    const summary = document.getElementById('runSummary');
    if (summary) summary.textContent = `You discovered ${gameState.wisdom} relics, score ${Math.floor(gameState.score)}, day ${gameState.day}.`;
    const modal = document.getElementById('runCompleteModal');
    if (modal) modal.style.display = 'flex';
    pushNote('Milestone hit: 25 relic run complete!', 220);
  }
}

function saveGame() {
  const data = {
    player: gameState.player,
    water: gameState.water,
    wisdom: gameState.wisdom,
    trustScore: gameState.trustScore,
    score: gameState.score,
    relicStreak: gameState.relicStreak,
    time: gameState.time,
    day: gameState.day,
    visited: Array.from(gameState.visitedLandmarks),
    boons: gameState.boons,
    trinityCooldown: gameState.trinityCooldown,
    openingRescueUsed: gameState.openingRescueUsed,
    openingFailSafeUsed: gameState.openingFailSafeUsed,
    secondChaseFailSafeUsed: gameState.secondChaseFailSafeUsed,
    secondChaseRescueUsed: gameState.secondChaseRescueUsed,
    secondChaseTimer: gameState.secondChaseTimer,
    firstRelicAtMs: gameState.firstRelicAtMs,
    autoSurveyCooldownUntil: gameState.autoSurveyCooldownUntil,
    starterRetargetCooldown: gameState.starterRetargetCooldown
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  if (gameState.score > gameState.highScore) {
    gameState.highScore = Math.floor(gameState.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(gameState.highScore));
  }
}

function resetRun() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = Math.floor(gameState.score);
    localStorage.setItem(HIGH_SCORE_KEY, String(gameState.highScore));
  }

  gameState.player.x = 0;
  gameState.player.y = 0;
  gameState.player.speed = 3;
  gameState.player.dashCooldown = 0;
  gameState.water = 100;
  gameState.wisdom = 0;
  gameState.trustScore = 0;
  gameState.score = 0;
  gameState.combo = 1;
  gameState.comboTimer = 0;
  gameState.relicStreak = 0;
  gameState.relicStreakTimer = 0;
  gameState.time = 700;
  gameState.day = 1;
  gameState.landmarks.clear();
  gameState.visitedLandmarks = new Set();
  gameState.discoveredChunks = new Set(['0,0']);
  gameState.trailblazeChain = 0;
  gameState.trailblazeTimer = 0;
  gameState.wraiths = [];
  gameState.notifications = [];
  gameState.particles = [];
  gameState.dehydrated = false;
  gameState.runCompleteShown = false;
  gameState.nightContractActive = false;
  gameState.sanctuaryTimer = 0;
  gameState.radarTimer = 0;
  gameState.pingTargetKey = null;
  gameState.pingRewardPending = false;
  gameState.weather = 'calm';
  gameState.weatherTimer = 900;
  gameState.surgeTimer = 1200;
  gameState.boons = { speedTimer: 0, scoreTimer: 0, shieldTimer: 0 };
  gameState.trinityCooldown = 0;
  gameState.openingRescueUsed = false;
  gameState.openingFailSafeUsed = false;
  gameState.secondChaseFailSafeUsed = false;
  gameState.secondChaseRescueUsed = false;
  gameState.secondChaseTimer = 0;
  gameState.firstRelicAtMs = 0;
  gameState.autoSurveyCooldownUntil = 0;
  gameState.starterRetargetCooldown = 0;
  gameState.paused = false;
  gameState.runStartTs = Date.now();

  gameState.quests = [
    { id: 'first_relic', text: 'Discover 1 relic', target: 1, done: false, reward: { score: 75, water: 10 } },
    { id: 'ten_relics', text: 'Discover 10 relics', target: 10, done: false, reward: { score: 250, water: 20 } },
    { id: 'trusted', text: 'Reach Trusted status', target: 10, done: false, reward: { score: 300, trust: 2 } },
    { id: 'score_1500', text: 'Reach score 1500', target: 1500, done: false, reward: { water: 25, score: 200 } }
  ];

  const runModal = document.getElementById('runCompleteModal');
  const dehydrateModal = document.getElementById('dehydrationModal');
  const pauseModal = document.getElementById('pauseModal');
  if (runModal) runModal.style.display = 'none';
  if (dehydrateModal) dehydrateModal.style.display = 'none';
  if (pauseModal) pauseModal.style.display = 'none';

  ensureNearbyLandmarks();

  const starterTarget = ensureStarterLandmark();
  if (starterTarget) {
    gameState.pingTargetKey = starterTarget.key;
    gameState.pingRewardPending = true;
    gameState.radarTimer = 900;
    pushNote(`Starter ping: ${starterTarget.art.name}`, 160);
  }

  pushNote('New run started', 140);
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      gameState.player = d.player || gameState.player;
      gameState.water = d.water ?? gameState.water;
      gameState.wisdom = d.wisdom ?? gameState.wisdom;
      gameState.trustScore = d.trustScore ?? gameState.trustScore;
      gameState.score = d.score ?? gameState.score;
      gameState.relicStreak = d.relicStreak ?? 0;
      gameState.time = d.time ?? gameState.time;
      gameState.day = d.day ?? gameState.day;
      gameState.visitedLandmarks = new Set(d.visited || []);
      const boons = d.boons || {};
      gameState.boons = {
        speedTimer: Number(boons.speedTimer) || 0,
        scoreTimer: Number(boons.scoreTimer) || 0,
        shieldTimer: Number(boons.shieldTimer) || 0,
      };
      gameState.trinityCooldown = Number(d.trinityCooldown) || 0;
      gameState.openingRescueUsed = Boolean(d.openingRescueUsed);
      gameState.openingFailSafeUsed = Boolean(d.openingFailSafeUsed);
      gameState.secondChaseFailSafeUsed = Boolean(d.secondChaseFailSafeUsed);
      gameState.secondChaseRescueUsed = Boolean(d.secondChaseRescueUsed);
      gameState.secondChaseTimer = Number(d.secondChaseTimer) || 0;
      gameState.firstRelicAtMs = Number(d.firstRelicAtMs) || 0;
      gameState.autoSurveyCooldownUntil = Number(d.autoSurveyCooldownUntil) || 0;
      gameState.starterRetargetCooldown = Number(d.starterRetargetCooldown) || 0;
    }
    gameState.discoveredChunks = new Set([landmarkKeyFromWorld(gameState.player.x, gameState.player.y)]);
    gameState.trailblazeChain = 0;
    gameState.trailblazeTimer = 0;
    const hs = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    if (Number.isFinite(hs)) gameState.highScore = hs;
    gameState.runStartTs = Date.now();
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
  if (e.key === 'Escape' || e.key.toLowerCase() === 'p') { togglePause(); return; }
  if (gameState.paused) return;
  if (e.key === ' ') { e.preventDefault(); tryInteract(); }
  if (e.key === 'Shift') triggerDash();
  if (e.key.toLowerCase() === 'r') triggerRadarPing();
  if (e.key.toLowerCase() === 'c') toggleNightContract();
  if (e.key.toLowerCase() === 'n') resetRun();
  if (e.key.toLowerCase() === 'm') toggleMute();
  if (e.key.toLowerCase() === 'z') {
    gameState.minimapScale = gameState.minimapScale === 0.06 ? 0.1 : gameState.minimapScale === 0.1 ? 0.14 : 0.06;
    pushNote(`Minimap zoom ${gameState.minimapScale.toFixed(2)}`, 80);
  }
  if (e.key.toLowerCase() === 'k') saveGame();
});
document.addEventListener('keyup', (e) => { gameState.keys[e.key] = false; });

// Mobile/touch: tap to walk, tap landmark to interact
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const wx = sx + gameState.camera.x;
  const wy = sy + gameState.camera.y;

  e.preventDefault();

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

  // Auto-pause on tab/app switch (mobile reliability)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !gameState.paused) {
      window.togglePause();
      pushNote('Auto-paused on app switch', 100);
    }
  });

  // Mobile UX helpers
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  const interactBtn = document.getElementById('interactBtn');
  const dashBtn = document.getElementById('dashBtn');
  const pingBtn = document.getElementById('pingBtn');
  const contractBtn = document.getElementById('contractBtn');
  const newRunBtn = document.getElementById('newRunBtn');
  const muteBtn = document.getElementById('muteBtn');
  const saveBtn = document.getElementById('saveBtn');
  if (interactBtn) interactBtn.addEventListener('click', () => tryInteract());
  if (dashBtn) dashBtn.addEventListener('click', () => triggerDash());
  if (pingBtn) pingBtn.addEventListener('click', () => triggerRadarPing());
  if (contractBtn) contractBtn.addEventListener('click', () => toggleNightContract());
  if (newRunBtn) newRunBtn.addEventListener('click', () => resetRun());
  if (muteBtn) muteBtn.addEventListener('click', () => toggleMute());
  if (saveBtn) saveBtn.addEventListener('click', () => saveGame());

  await loadManifest();
  preloadImages(220);
  loadGame();
  syncContractButton();
  ensureNearbyLandmarks();
  setInterval(saveGame, 10000);
  loop();
}

init();
