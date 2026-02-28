const SAVE_KEY = 'checkAdventureSignalRun_v2';

const scenes = {
  entry: {
    title: 'Night Entry',
    image: '/assets/content/signal_is_a_burden.png',
    body: 'The city hums under glass wind. You need route intel, low heat, and enough energy to survive extraction.',
    choices: [
      {
        text: 'Ghost through drainage canals (+1 intel, -1 energy, -1 heat, +Sand Cloak)',
        effect: { intel: 1, energy: -1, heat: -1 },
        gain: 'cloak',
        set: { stance: 'quiet' },
        next: 'bazaar',
        log: 'You ghosted in and found a Sand Cloak cache.'
      },
      {
        text: 'Kick open relay hatch (+2 intel, -2 energy, +2 heat, +Battery Pack)',
        effect: { intel: 2, energy: -2, heat: 2 },
        gain: 'battery',
        set: { stance: 'bold' },
        next: 'avenue',
        log: 'You took the loud route and ripped raw relay intel.'
      }
    ]
  },
  bazaar: {
    title: 'Whisper Bazaar',
    image: '/assets/content/constraint_is_feature_20260217.png',
    body: 'Masked traders watch your hands, not your face. Here, trust is currency.',
    choices: [
      {
        text: 'Trade clean maps (+1 intel, +1 trust, -1 heat)',
        effect: { intel: 1, trust: 1, heat: -1 },
        set: { mark: 'ghost' },
        next: 'storm',
        log: 'You traded discipline for better lanes.'
      },
      {
        text: 'Swipe a coded key (+1 intel, +Signal Key, +1 heat)',
        effect: { intel: 1, heat: 1 },
        gain: 'key',
        set: { mark: 'hunted' },
        next: 'storm',
        log: 'You lifted a Signal Key, but eyes followed you.'
      }
    ]
  },
  avenue: {
    title: 'Alarm Avenue',
    image: '/assets/content/desert_doesnt_care_20260217.png',
    body: 'Drones sweep in arcs. Speed buys intel; patience buys survival.',
    choices: [
      {
        text: 'Dash rooftop line (+2 intel, -1 energy, +2 heat)',
        effect: { intel: 2, energy: -1, heat: 2 },
        set: { mark: 'hunted' },
        next: 'storm',
        log: 'You outran one drone and lit up three others.'
      },
      {
        text: 'Hide in turbine shadows (+0 intel, +1 energy, -1 heat, +1 trust)',
        effect: { energy: 1, heat: -1, trust: 1 },
        set: { mark: 'ghost' },
        next: 'storm',
        log: 'You lost time but reset your pulse.'
      }
    ]
  },
  storm: {
    title: 'Signal Storm',
    image: '/assets/content/second_order_effects.png',
    body: 'Static turns every path into a gamble. This is where mediocre runs die.',
    choices: [
      {
        text: 'Punch through static wall (+2 intel, -2 energy, +1 heat)',
        effect: { intel: 2, energy: -2, heat: 1 },
        set: { balance: 'spent' },
        next: 'shrine',
        log: 'You forced the channel open and paid in stamina.'
      },
      {
        text: 'Thread the calm pockets (+1 intel, +1 energy, -1 heat)',
        effect: { intel: 1, energy: 1, heat: -1 },
        set: { balance: 'steady' },
        next: 'shrine',
        log: 'You read the storm like sheet music.'
      }
    ]
  },
  shrine: {
    title: 'Memory Shrine',
    image: '/assets/content/desert_of_the_real.png',
    body: 'A dead terminal asks one question: protect the city, or own it.',
    choices: [
      {
        text: 'Share intel seed with locals (+1 trust, -1 heat)',
        effect: { trust: 1, heat: -1 },
        set: { oath: 'steward' },
        next: 'gate',
        log: 'You leave behind leverage and earn witnesses.'
      },
      {
        text: 'Encrypt and hoard everything (+1 intel, -1 trust, +1 heat)',
        effect: { intel: 1, trust: -1, heat: 1 },
        set: { oath: 'raider' },
        next: 'gate',
        log: 'You keep all the power and all the risk.'
      }
    ]
  },
  gate: {
    title: 'Extraction Gate',
    image: '/assets/content/true_wealth.png',
    body: 'Final lock. Your route identity determines whether this is escape, legend, or collapse.',
    choices: [
      {
        text: 'Commit extraction now (resolve ending)',
        effect: {},
        next: 'resolve',
        log: 'You make the final call.'
      }
    ]
  }
};

const state = load() || newRunState(1);
if (!state.powerups) state.powerups = { cloak: 0, battery: 0, key: 0 };
if (!state.tags) state.tags = { stance: 'quiet', balance: 'steady', mark: 'unknown', oath: 'none' };
if (typeof state.powerUsedThisScene !== 'boolean') state.powerUsedThisScene = false;

function newRunState(run) {
  return {
    run,
    day: 1,
    sceneId: 'entry',
    energy: 6,
    intel: 0,
    heat: 1,
    trust: 0,
    status: 'Infiltrating',
    powerups: { cloak: 0, battery: 0, key: 0 },
    tags: { stance: 'quiet', balance: 'steady', mark: 'unknown', oath: 'none' },
    powerUsedThisScene: false,
    ending: null,
    log: ['Run started. Objective is live.']
  };
}

function objectiveText() {
  return `Objective: reach extraction with at least 4 intel, heat 4 or lower, and enough energy to survive. Current: intel ${state.intel}/4, energy ${state.energy}, heat ${state.heat}.`;
}

function addLog(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 12);
}

function clampStats() {
  state.energy = Math.max(0, Math.min(9, state.energy));
  state.heat = Math.max(0, Math.min(9, state.heat));
}

function applyEffect(effect = {}) {
  for (const [k, v] of Object.entries(effect)) state[k] = (state[k] || 0) + v;
  clampStats();
}

function gainPowerup(kind) {
  if (!kind) return;
  state.powerups[kind] = (state.powerups[kind] || 0) + 1;
}

function setTags(partial = {}) {
  state.tags = { ...state.tags, ...partial };
}

function foldedBody(base) {
  const lines = [];
  lines.push(state.tags.stance === 'bold' ? 'You feel the city reacting to force.' : 'You feel the city opening to subtlety.');
  lines.push(state.tags.mark === 'hunted' ? 'Patrol timing is converging on you.' : 'Your trace remains fragmented.');
  lines.push(state.tags.oath === 'steward' ? 'Your choices are leaving allies behind.' : state.tags.oath === 'raider' ? 'Your choices are leaving debts behind.' : 'Your intent is still uncommitted.');
  return `${base} ${lines.join(' ')}`;
}

function statusText() {
  if (state.energy <= 1) return 'Exhausted';
  if (state.heat >= 5) return 'Compromised';
  if (state.heat >= 3) return 'High Risk';
  return 'Infiltrating';
}

function resolveEnding() {
  if (state.energy <= 0 || state.heat >= 7) {
    return { type: 'fail', title: 'Run Collapsed', body: 'The route folded under pressure before extraction.' };
  }

  if (state.intel >= 5 && state.heat <= 3 && state.trust >= 1 && state.tags.oath === 'steward') {
    return { type: 'win', title: 'Legendary Extraction', body: 'You extracted perfect intel and left the district stronger than you found it.' };
  }

  if (state.intel >= 4 && state.heat <= 4 && state.energy >= 1) {
    return { type: 'win', title: 'Clean Extraction', body: 'You got out with the payload and a route worth reusing.' };
  }

  return { type: 'fail', title: 'Run Collapsed', body: state.intel < 4 ? 'You reached the gate without enough intel to matter.' : 'You carried the intel, but the heat was too high to escape clean.' };
}

function render() {
  document.getElementById('day').textContent = state.day;
  document.getElementById('energy').textContent = state.energy;
  document.getElementById('intel').textContent = state.intel;
  document.getElementById('heat').textContent = state.heat;
  document.getElementById('trust').textContent = state.trust;
  state.status = statusText();
  document.getElementById('status').textContent = state.status;

  const pList = [];
  if (state.powerups.cloak) pList.push(`Sand Cloak x${state.powerups.cloak}`);
  if (state.powerups.battery) pList.push(`Battery Pack x${state.powerups.battery}`);
  if (state.powerups.key) pList.push(`Signal Key x${state.powerups.key}`);
  document.getElementById('powerups').textContent = pList.length ? pList.join(', ') : 'none';

  document.getElementById('goal').textContent = objectiveText();
  document.getElementById('log').innerHTML = state.log.map((x) => `<div class="entry">• ${x}</div>`).join('');

  const choicesEl = document.getElementById('choices');

  if (state.ending) {
    document.getElementById('scene-title').textContent = state.ending.title;
    document.getElementById('scene-body').textContent = `${state.ending.body} ${foldedBody('')}`.trim();
    document.getElementById('scene-image').src = '/assets/content/desert_of_the_real.png';
    document.getElementById('consequence-hint').textContent = state.ending.type === 'win'
      ? 'Big run. Try a different value path and see how the city answers.'
      : 'Failure is explicit. Different branch vectors create different endings.';
    choicesEl.innerHTML = '<button class="restart" id="restart-inline">Start next run</button>';
    document.getElementById('restart-inline').onclick = restart;
    save();
    return;
  }

  const scene = scenes[state.sceneId];
  document.getElementById('scene-title').textContent = scene.title;
  document.getElementById('scene-body').textContent = foldedBody(scene.body);
  document.getElementById('scene-image').src = scene.image;
  document.getElementById('consequence-hint').textContent = 'Each option tells exact consequences. One power-up use allowed per scene.';

  choicesEl.innerHTML = '';

  if (!state.powerUsedThisScene && state.powerups.cloak > 0) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = 'Use Sand Cloak now (-2 heat)';
    btn.onclick = () => {
      state.powerups.cloak -= 1;
      state.heat = Math.max(0, state.heat - 2);
      state.powerUsedThisScene = true;
      addLog('Power-up: Sand Cloak bent sightlines away from you.');
      save();
      render();
    };
    choicesEl.appendChild(btn);
  }

  if (!state.powerUsedThisScene && state.powerups.battery > 0) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = 'Use Battery Pack now (+2 energy)';
    btn.onclick = () => {
      state.powerups.battery -= 1;
      state.energy = Math.min(9, state.energy + 2);
      state.powerUsedThisScene = true;
      addLog('Power-up: Battery Pack stabilized your suit core.');
      save();
      render();
    };
    choicesEl.appendChild(btn);
  }

  if (!state.powerUsedThisScene && state.powerups.key > 0) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = 'Use Signal Key now (+1 intel)';
    btn.onclick = () => {
      state.powerups.key -= 1;
      state.intel += 1;
      state.powerUsedThisScene = true;
      addLog('Power-up: Signal Key opened a hidden data spine.');
      save();
      render();
    };
    choicesEl.appendChild(btn);
  }

  scene.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = choice.text;
    btn.onclick = () => {
      applyEffect(choice.effect);
      gainPowerup(choice.gain);
      setTags(choice.set);
      addLog(choice.log);

      if (choice.next === 'resolve') {
        state.ending = resolveEnding();
      } else {
        state.sceneId = choice.next;
        state.day += 1;
        state.powerUsedThisScene = false;
      }

      if (!state.ending && (state.energy <= 0 || state.heat >= 7)) {
        state.ending = { type: 'fail', title: 'Run Collapsed', body: 'You were broken by heat and attrition before the gate.' };
      }

      save();
      render();
    };
    choicesEl.appendChild(btn);
  });

  save();
}

function restart() {
  const nextRun = (state.run || 1) + 1;
  Object.assign(state, newRunState(nextRun));
  addLog(`Run ${nextRun} started.`);
  save();
  render();
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

document.getElementById('restart').addEventListener('click', restart);
render();
