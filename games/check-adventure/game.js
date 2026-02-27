const SAVE_KEY = 'checkAdventureSave_v1';

const scenes = {
  gate: {
    title: 'Gate of Static',
    image: '/assets/content/signal_is_a_burden.png',
    body: 'The dunes hum with old relays. A rusted gate blocks the shortest path. Every choice is a check: clean move, loud move, or patient move.',
    choices: [
      { text: 'Decode the relay pattern (Mind check 55%)', check: 0.55, onPass: { trust: 1, checks: 1, next: 'well' }, onFail: { resolve: -1, next: 'well' }, logPass: 'You map the pulse rhythm and slip through clean.', logFail: 'You misread one pulse and burn resolve.' },
      { text: 'Force the gate with scrap leverage (Power check 45%)', check: 0.45, onPass: { scrap: 2, checks: 1, next: 'well' }, onFail: { resolve: -1, scrap: 1, next: 'well' }, logPass: 'Gate cracks open. You salvage useful metal.', logFail: 'You get in, but the gate bites back.' },
      { text: 'Scout a long route and preserve strength', auto: { trust: 1, next: 'well' }, logPass: 'You trade speed for certainty.' }
    ]
  },
  well: {
    title: 'The Dry Well',
    image: '/assets/content/desert_doesnt_care_20260217.png',
    body: 'A dead well, a living rumor. An old drifter offers coordinates to a hidden cache—if you share your water ledger.',
    choices: [
      { text: 'Share ledger honestly (Trust check 60%)', check: 0.60, onPass: { trust: 2, checks: 1, next: 'spire' }, onFail: { trust: -1, resolve: -1, next: 'spire' }, logPass: 'Honesty lands. The drifter marks a true path.', logFail: 'The drifter smells weakness and walks.' },
      { text: 'Bluff with fake readings (Deception check 40%)', check: 0.40, onPass: { scrap: 2, checks: 1, next: 'spire' }, onFail: { trust: -2, resolve: -1, next: 'spire' }, logPass: 'Your bluff holds long enough to gain supplies.', logFail: 'The lie unravels instantly.' }
    ]
  },
  spire: {
    title: 'Glass Spire',
    image: '/assets/content/constraint_is_feature_20260217.png',
    body: 'Final climb. The spire archives a map shard that changes future runs. You need one strong check to extract it clean.',
    choices: [
      { text: 'Stabilize the shard lattice (Precision check 65%)', check: 0.65, onPass: { checks: 1, trust: 1, ending: 'win' }, onFail: { resolve: -1, ending: 'rough' }, logPass: 'You extract a stable shard. Future paths open.', logFail: 'The shard fractures, but you keep a fragment.' },
      { text: 'Rip and run (Greed check 35%)', check: 0.35, onPass: { scrap: 3, checks: 1, ending: 'rough' }, onFail: { resolve: -2, ending: 'fail' }, logPass: 'You leave with loot and alarms behind you.', logFail: 'The spire punishes the rush.' }
    ]
  }
};

const state = load() || { run: 1, resolve: 3, trust: 0, scrap: 0, checks: 0, shards: 0, momentum: 0, scene: 'gate', log: [] };

function roll(chance) {
  return Math.random() < chance;
}

function apply(delta = {}) {
  for (const [k, v] of Object.entries(delta)) {
    if (k === 'next') state.scene = v;
    else if (k === 'ending') state.scene = v;
    else state[k] = (state[k] || 0) + v;
  }
}

function addLog(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 12);
}

function render() {
  const s = scenes[state.scene];
  document.getElementById('resolve').textContent = state.resolve;
  document.getElementById('trust').textContent = state.trust;
  document.getElementById('scrap').textContent = state.scrap;
  document.getElementById('checks').textContent = state.checks;
  document.getElementById('run').textContent = state.run;
  const shardsEl = document.getElementById('shards');
  if (shardsEl) shardsEl.textContent = state.shards;
  const momentumEl = document.getElementById('momentum');
  if (momentumEl) momentumEl.textContent = `${state.momentum > 0 ? '+' : ''}${state.momentum}`;

  const choicesEl = document.getElementById('choices');
  const logEl = document.getElementById('log');
  logEl.innerHTML = state.log.map(x => `<div class="entry">• ${x}</div>`).join('');

  if (state.scene === 'win' || state.scene === 'rough' || state.scene === 'fail') {
    if (!state._endingRewarded) {
      if (state.scene === 'win') state.shards += 2;
      if (state.scene === 'rough') state.shards += 1;
      state._endingRewarded = true;
    }

    const endTitle = state.scene === 'win' ? 'Clean Extraction' : state.scene === 'rough' ? 'Costly Victory' : 'Buried by the Dunes';
    const endText = state.scene === 'win'
      ? 'You secured the shard and preserved trust. Future runs start smarter.'
      : state.scene === 'rough'
      ? 'You reached the end with scars and partial gains. The map still shifts.'
      : 'You pushed too hard without enough checks. The dunes reset you.';
    document.getElementById('scene-title').textContent = endTitle;
    document.getElementById('scene-body').textContent = endText;
    document.getElementById('scene-image').src = '/assets/content/desert_of_the_real.png';
    choicesEl.innerHTML = '<button id="restart-inline">Start next run</button>';
    document.getElementById('restart-inline').onclick = resetRun;
    save();
    return;
  }

  document.getElementById('scene-title').textContent = s.title;
  document.getElementById('scene-body').textContent = s.body;
  document.getElementById('scene-image').src = s.image;

  choicesEl.innerHTML = '';
  s.choices.forEach((c) => {
    const btn = document.createElement('button');
    const adjustedPreview = c.auto ? null : Math.max(0.15, Math.min(0.9, c.check + state.momentum * 0.08 + (state.trust > 1 ? 0.03 : 0)));
    btn.textContent = c.auto ? c.text : `${c.text.replace(/\s*\([^)]*\)\s*$/, '')} (${Math.round(adjustedPreview * 100)}%)`;
    btn.onclick = () => {
      if (c.auto) {
        apply(c.auto);
        addLog(c.logPass);
      } else {
        const adjusted = Math.max(0.15, Math.min(0.9, c.check + state.momentum * 0.08 + (state.trust > 1 ? 0.03 : 0)));
        const passed = roll(adjusted);
        apply(passed ? c.onPass : c.onFail);
        state.momentum = passed ? Math.min(2, state.momentum + 1) : Math.max(-2, state.momentum - 1);
        addLog(`${passed ? c.logPass : c.logFail} (${Math.round(adjusted * 100)}%)`);
      }
      if (state.resolve <= 0 && state.scene !== 'win') {
        state.scene = 'fail';
      }
      save();
      render();
    };
    choicesEl.appendChild(btn);
  });

  save();
}

function resetRun() {
  state.run += 1;
  const shardBonus = Math.min(2, Math.floor(state.shards / 2));
  state.resolve = 3 + (state.checks >= 2 ? 1 : 0) + shardBonus;
  state.trust = 0;
  state.scrap = 0;
  state.checks = 0;
  state.momentum = 0;
  state.scene = 'gate';
  state._endingRewarded = false;
  state.log = [`New run. Archive shards grant +${shardBonus} resolve.`];
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

document.getElementById('new-run').addEventListener('click', resetRun);
if (state.log.length === 0) state.log.push('Run starts at the Gate of Static.');
render();
