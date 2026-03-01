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
  anomaly: {
    title: 'Mirror Anomaly',
    image: '/assets/content/second_order_effects.png',
    body: 'A hidden relay bloom appears only for quiet operators carrying a key. The city offers one forbidden gift.',
    choices: [
      {
        text: 'Take Echo Prism (+1 intel, +1 trust, +Echo Prism)',
        effect: { intel: 1, trust: 1 },
        gain: 'prism',
        set: { mark: 'ghost' },
        next: 'shrine',
        log: 'You captured an Echo Prism and the relay hummed your name.'
      },
      {
        text: 'Walk away clean (-1 heat, +1 energy)',
        effect: { heat: -1, energy: 1 },
        set: { balance: 'steady' },
        next: 'shrine',
        log: 'You left power on the table to keep the run clean.'
      }
    ]
  },
  ambush: {
    title: 'Patrol Ambush',
    image: '/assets/content/desert_doesnt_care_20260217.png',
    body: 'Your heat spike finally cashes out. Sirens rise from three sides.',
    choices: [
      {
        text: 'Burn decoys (-1 energy, -2 heat, +1 trust)',
        effect: { energy: -1, heat: -2, trust: 1 },
        set: { mark: 'hunted' },
        next: 'shrine',
        log: 'You bled resources to fake your death trail.'
      },
      {
        text: 'Fight through (+1 intel, -2 energy, +1 heat)',
        effect: { intel: 1, energy: -2, heat: 1 },
        set: { stance: 'bold', mark: 'hunted' },
        next: 'shrine',
        log: 'You punched through and stole one more payload chunk.'
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
        text: 'Commit extraction now (balanced route)',
        effect: {},
        next: 'resolve',
        log: 'You make the final call on a balanced route.'
      },
      {
        text: 'Bribe a convoy for cover (-1 trust, -1 heat, -1 energy)',
        effect: { trust: -1, heat: -1, energy: -1 },
        next: 'resolve',
        set: { mark: 'ghost', deal: 'brokered' },
        log: 'You bought cover with reputation.'
      },
      {
        text: 'Punch the redline exit (+1 intel, +2 heat, -1 energy)',
        effect: { intel: 1, heat: 2, energy: -1 },
        next: 'resolve',
        set: { stance: 'bold', mark: 'hunted' },
        log: 'You forced the hottest lane and prayed it held.'
      }
    ]
  }
};

const state = load() || newRunState(1);
if (!state.powerups) state.powerups = { cloak: 0, battery: 0, key: 0, prism: 0 };
if (!state.tags) state.tags = { stance: 'quiet', balance: 'steady', mark: 'unknown', oath: 'none', deal: 'none' };
if (typeof state.powerUsedThisScene !== 'boolean') state.powerUsedThisScene = false;
if (typeof state.totalPowerupsUsed !== 'number') state.totalPowerupsUsed = 0;
if (typeof state.anomalyVisited !== 'boolean') state.anomalyVisited = false;
if (typeof state.ambushVisited !== 'boolean') state.ambushVisited = false;
if (typeof state.wins !== 'number') state.wins = 0;
if (typeof state.losses !== 'number') state.losses = 0;
if (typeof state.streak !== 'number') state.streak = 0;
if (!Array.isArray(state.recentForm)) state.recentForm = [];
if (!state.lastRun) state.lastRun = null;
if (typeof state.endingTallied !== 'boolean') state.endingTallied = false;
if (typeof state.turn !== 'number') state.turn = 0;
if (typeof state.lastAdvisoryMode !== 'string' && state.lastAdvisoryMode !== null) state.lastAdvisoryMode = null;
if (typeof state.modeShiftCount !== 'number') state.modeShiftCount = 0;
if (!Array.isArray(state.modeSeen)) state.modeSeen = ['build-phase'];

function newRunState(run) {
  return {
    run,
    day: 1,
    turn: 0,
    sceneId: 'entry',
    energy: 6,
    intel: 0,
    heat: 1,
    trust: 0,
    status: 'Infiltrating',
    powerups: { cloak: 0, battery: 0, key: 0, prism: 0 },
    tags: { stance: 'quiet', balance: 'steady', mark: 'unknown', oath: 'none', deal: 'none' },
    powerUsedThisScene: false,
    totalPowerupsUsed: 0,
    anomalyVisited: false,
    ambushVisited: false,
    wins: 0,
    losses: 0,
    streak: 0,
    recentForm: [],
    lastRun: null,
    ending: null,
    endingTallied: false,
    lastAdvisoryMode: null,
    modeShiftCount: 0,
    modeSeen: ['build-phase'],
    log: ['Run started. Objective is live.']
  };
}

function objectiveText() {
  return `Objective: reach extraction with at least 4 intel, heat 4 or lower, and enough energy to survive. Power-up activations consume 1 turn. Current: intel ${state.intel}/4, energy ${state.energy}, heat ${state.heat}.`;
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

function routeEchoText() {
  const anomalyReady = state.tags.stance === 'quiet' && (state.powerups.key || 0) > 0 && state.heat <= 3;
  const ambushRisk = state.tags.mark === 'hunted' && state.heat >= 5;
  if (anomalyReady) return 'anomaly signal rising';
  if (ambushRisk) return 'ambush pressure rising';
  if (state.heat <= 2) return 'ghost lanes stable';
  return 'volatile';
}

function signatureMeaningText() {
  const stance = state.tags.stance === 'bold' ? 'Bold = fast gains, louder consequences' : 'Quiet = slower gains, cleaner lanes';
  const mark = state.tags.mark === 'hunted' ? 'Hunted = ambush risk is live' : state.tags.mark === 'ghost' ? 'Ghost = stealth branches open' : 'Unknown = route identity still forming';
  const oath = state.tags.oath === 'steward' ? 'Steward = trust-forward endings improve' : state.tags.oath === 'raider' ? 'Raider = payload-heavy endings improve' : 'No oath yet = identity not locked';
  const deal = state.tags.deal === 'brokered' ? 'Brokered deal = convoy endings open' : 'No deal = direct extraction routes';
  return `${stance} · ${mark} · ${oath} · ${deal}`;
}

function endingForecastText() {
  if (state.sceneId === 'gate') return 'option-dependent (see ending previews)';
  const intelGap = Math.max(0, 4 - state.intel);
  if (state.energy <= 0 || state.heat >= 7) return 'collapse imminent';
  if (state.intel >= 5 && state.heat <= 3 && state.trust >= 1 && state.tags.oath === 'steward') return 'legendary track';
  if (state.totalPowerupsUsed === 0 && state.intel >= 4 && state.heat <= 3 && state.energy >= 2) return 'iron track';
  if (state.intel >= 4 && state.heat <= 4 && state.energy >= 1) return 'clean track';
  if (intelGap > 0) return `${intelGap} intel short`;
  if (state.heat > 4) return 'heat too high';
  return 'unstable route';
}

function nextUnlockText() {
  const anomalyReady = !state.anomalyVisited && state.tags.stance === 'quiet' && (state.powerups.key || 0) > 0 && state.heat <= 3;
  const ambushRisk = !state.ambushVisited && state.tags.mark === 'hunted' && state.heat >= 5;
  const hasCloak = (state.powerups.cloak || 0) > 0;
  if (state.sceneId === 'gate' || state.ending) return 'final resolution active';
  if (anomalyReady) return 'Mirror Anomaly primed';
  if (ambushRisk && !hasCloak && state.energy <= 2) return 'Patrol Ambush primed (danger: no cloak, low energy)';
  if (ambushRisk) return 'Patrol Ambush primed';
  if (!state.anomalyVisited && state.tags.stance !== 'quiet') return 'go quiet to prime anomaly';
  if (!state.anomalyVisited && (state.powerups.key || 0) === 0) return 'find Signal Key for anomaly';
  if (!state.anomalyVisited && state.heat > 3) return 'lower heat to unlock anomaly';
  return 'special branches exhausted this run';
}

function runCodexText() {
  const specials = [];
  if (state.anomalyVisited) specials.push('Mirror Anomaly');
  if (state.ambushVisited) specials.push('Patrol Ambush');
  const specialText = specials.length ? specials.join(', ') : 'none';
  return `Run Codex: power-ups used ${state.totalPowerupsUsed} · specials hit ${specialText}`;
}

function riskPostureText() {
  if (state.energy <= 1 || state.heat >= 6) return 'critical';
  if (state.energy <= 2 || state.heat >= 5) return 'high';
  if (state.energy >= 5 && state.heat <= 2) return 'stable';
  return 'tense';
}

function turnPressureText() {
  if (state.ending) return 'resolved';
  const remaining = 9 - state.turn;
  if (remaining <= 1) return 'critical';
  if (remaining <= 3) return 'high';
  if (remaining <= 5) return 'rising';
  return 'safe';
}

function bestMoveText() {
  const hasCooling = (state.powerups.cloak || 0) > 0 || (state.powerups.prism || 0) > 0;
  const hasRecovery = (state.powerups.battery || 0) > 0;
  if (state.turn >= 8 && state.sceneId !== 'gate') return 'advance route now; extraction window is closing';
  if (state.sceneId === 'gate') {
    const gateChoices = scenes.gate?.choices || [];
    const outcomes = [...new Set(gateChoices.map((choice) => {
      const projected = {
        energy: state.energy + (choice.effect?.energy || 0),
        intel: state.intel + (choice.effect?.intel || 0),
        heat: state.heat + (choice.effect?.heat || 0),
        trust: state.trust + (choice.effect?.trust || 0),
        tags: { ...state.tags, ...(choice.set || {}) },
        totalPowerupsUsed: state.totalPowerupsUsed
      };
      return resolveEnding(projected).title;
    }))];
    if (outcomes.length > 1) {
      if (outcomes.includes('Run Collapsed') && state.heat >= 4) return 'avoid collapse branch: prioritize lower-heat extraction options';
      const safeConf = safeGateOptionConfidenceText();
      if (safeConf === 'low') return 'outcomes are close: compare safe line and backup before committing';
      if (safeConf === 'high') return 'safe line is dominant: commit unless you intentionally want variance';
      return 'multiple outcomes live: choose the ending identity you want';
    }
    if (outcomes[0] === 'Run Collapsed') return 'collapse locked: no safe extraction remains this run';
    return `commit now for ${outcomes[0] || 'resolution'}`;
  }
  if (state.sceneId === 'shrine') {
    if (state.tags.oath === 'none') return 'lock your oath for ending control';
    if (state.intel < 4) return `you are ${4 - state.intel} intel short; secure intel before gate`;
    return 'commit to extraction gate';
  }
  if (state.sceneId === 'storm' && state.heat >= 4) return hasCooling ? 'use cooling power-up, then route forward' : 'cool heat before final phase';
  if (state.sceneId === 'storm' && state.energy <= 2) return hasRecovery ? 'use battery before route decision' : 'recover energy before final phase';
  if (state.sceneId === 'anomaly') return 'take prism for high-control finish';
  if (state.sceneId === 'ambush') return hasCooling ? 'use cooling tool, then survive ambush' : 'survive ambush with lowest heat possible';
  if (state.intel < 4) return 'prioritize intel gain';
  if (state.heat > 4) return hasCooling ? 'use cooling power-up before advancing' : 'reduce heat before advancing';
  return 'maintain balance and push forward';
}

function bestMoveConfidenceText() {
  if (state.ending) return 'resolved';
  if (state.sceneId === 'gate') return 'high';
  if (state.sceneId === 'anomaly' || state.sceneId === 'ambush') return 'high';
  if (state.turn >= 8) return 'high';
  if (state.heat >= 6 || state.energy <= 1) return 'high';
  if (state.heat >= 4 || state.energy <= 2) return 'medium';
  return 'low';
}

function confidenceMeaningText() {
  const c = bestMoveConfidenceText();
  if (c === 'resolved') return 'Resolved = run complete; guidance no longer predictive.';
  if (c === 'high') return 'High confidence = urgent correction or decisive branch moment.';
  if (c === 'medium') return 'Medium confidence = strong recommendation, but alternatives can still work.';
  return 'Low confidence = optimization guidance, not a must-do.';
}

function targetEndingText() {
  if (state.ending) return state.ending.title;
  if (state.sceneId === 'gate') {
    const gateChoices = scenes.gate?.choices || [];
    const outcomePriority = {
      'Legendary Extraction': 1,
      'Silent Extraction': 2,
      'Iron Extraction': 3,
      'Brokered Extraction': 4,
      'Clean Extraction': 5,
      'Pyrrhic Extraction': 6,
      'Run Collapsed': 7
    };
    const outcomes = [...new Set(gateChoices.map((choice) => {
      const projected = {
        energy: state.energy + (choice.effect?.energy || 0),
        intel: state.intel + (choice.effect?.intel || 0),
        heat: state.heat + (choice.effect?.heat || 0),
        trust: state.trust + (choice.effect?.trust || 0),
        tags: { ...state.tags, ...(choice.set || {}) },
        totalPowerupsUsed: state.totalPowerupsUsed
      };
      return resolveEnding(projected).title;
    }))].sort((a, b) => (outcomePriority[a] || 99) - (outcomePriority[b] || 99));
    if (outcomes.length === 1) return outcomes[0];
    return `split (${outcomes.length}): ${outcomes.join(' / ')}`;
  }
  let baseTarget = 'Clean Extraction';
  if (state.tags.deal === 'brokered') baseTarget = 'Brokered Extraction';
  else if (state.tags.oath === 'raider' && state.tags.mark === 'hunted') baseTarget = 'Pyrrhic Extraction';
  else if (state.tags.oath === 'steward' && state.tags.mark === 'ghost') baseTarget = 'Silent Extraction';
  else if (state.totalPowerupsUsed === 0 && state.intel >= 4 && state.heat <= 3) baseTarget = 'Iron Extraction';
  else if (state.intel >= 5 && state.heat <= 3 && state.trust >= 1 && state.tags.oath === 'steward') baseTarget = 'Legendary Extraction';

  const intelGap = Math.max(0, 4 - state.intel);
  const heatRisk = state.heat > 4 ? 'heat risk' : null;
  const trustRisk = (baseTarget === 'Brokered Extraction' && state.trust < 0) ? 'repair trust to 0+' : null;
  if (intelGap > 0 || heatRisk || trustRisk) {
    const req = [];
    if (intelGap > 0) req.push(`+${intelGap} intel`);
    if (heatRisk) req.push(heatRisk);
    if (trustRisk) req.push(trustRisk);
    return `${baseTarget} (needs ${req.join(', ')})`;
  }

  return baseTarget;
}

function outcomeBandText() {
  if (state.ending) return state.ending.type === 'win' ? 'secured' : 'collapsed';
  if (state.heat >= 6 || state.energy <= 1 || state.turn >= 9) return 'critical';
  if (state.intel >= 4 && state.heat <= 4 && state.energy >= 1) return 'favorable';
  if (state.intel >= 3) return 'fragile';
  return 'uncertain';
}

function getGateScoredOptions() {
  const gateChoices = scenes.gate?.choices || [];
  return gateChoices.map((choice) => {
    const projected = {
      energy: state.energy + (choice.effect?.energy || 0),
      intel: state.intel + (choice.effect?.intel || 0),
      heat: state.heat + (choice.effect?.heat || 0),
      trust: state.trust + (choice.effect?.trust || 0),
      tags: { ...state.tags, ...(choice.set || {}) },
      totalPowerupsUsed: state.totalPowerupsUsed
    };
    const result = resolveEnding(projected);
    const winScore = result.type === 'win' ? 100 : 0;
    const riskPenalty = Math.max(0, projected.heat - 4) * 10 + Math.max(0, 1 - projected.energy) * 10;
    const score = winScore - riskPenalty;
    return { text: choice.text, result: result.title, score };
  }).sort((a, b) => b.score - a.score);
}

function safeGateOptionText() {
  if (state.ending) return 'resolved';
  if (state.sceneId !== 'gate') return 'arrives at gate';

  const scored = getGateScoredOptions();
  if (!scored.length) return 'n/a';
  if (scored[0].result === 'Run Collapsed' && ((state.powerups.cloak || 0) > 0 || (state.powerups.prism || 0) > 0)) {
    return 'use cooling power-up first, then re-evaluate gate';
  }

  const primary = `${scored[0].text.split(' (')[0]} → ${scored[0].result}`;
  const backup = scored.find((x, i) => i > 0 && x.result !== scored[0].result && x.result !== 'Run Collapsed');
  if (backup && scored[0].result !== 'Run Collapsed') {
    return `${primary} (backup: ${backup.result})`;
  }
  return primary;
}

function safeGateOptionConfidenceText() {
  if (state.ending) return 'resolved';
  if (state.sceneId !== 'gate') return 'arrives at gate';
  const scored = getGateScoredOptions();
  if (scored.length < 2) return 'high';
  const gap = scored[0].score - scored[1].score;
  if (gap >= 35) return 'high';
  if (gap >= 15) return 'medium';
  return 'low';
}

function safeGateOptionGapText() {
  if (state.ending) return 'resolved';
  if (state.sceneId !== 'gate') return 'arrives at gate';
  const scored = getGateScoredOptions();
  if (scored.length < 2) return 'single option profile';
  const gap = Math.round(scored[0].score - scored[1].score);
  return `${gap} pts`;
}

function safeGapMeaningText() {
  if (state.ending) return 'Gap meaning: run resolved.';
  if (state.sceneId !== 'gate') return 'Gap meaning appears at extraction gate.';
  const scored = getGateScoredOptions();
  if (scored.length < 2) return 'Single profile = no meaningful gap comparison.';
  const gap = Math.round(scored[0].score - scored[1].score);
  if (gap >= 35) return 'Large gap = safest line is clearly dominant.';
  if (gap >= 15) return 'Mid gap = safest line leads, but alternatives are viable.';
  return 'Small gap = options are close; pick by ending preference.';
}

function gateSnapshotText() {
  if (state.ending) return 'resolved';
  if (state.sceneId !== 'gate') return 'arrives at gate';
  const outcomes = [...new Set(getGateScoredOptions().map((x) => x.result))];
  const conf = safeGateOptionConfidenceText();
  return `${outcomes.length} outcomes · safe ${conf}`;
}

function gateSnapshotMeaningText() {
  const snapshot = gateSnapshotText();
  if (snapshot === 'resolved') return 'Gate snapshot: run complete.';
  if (snapshot === 'arrives at gate') return 'Gate advisors activate at extraction gate.';
  const outcomes = [...new Set(getGateScoredOptions().map((x) => x.result))];
  if (outcomes.length >= 3) return 'Many live outcomes = high divergence; verify your ending intent before clicking.';
  if (outcomes.length === 2) {
    if (outcomes.includes('Run Collapsed')) return 'Two-way fork with collapse risk: follow safe line unless you are intentionally gambling.';
    return 'Two live outcomes = meaningful fork; safe line matters.';
  }
  return 'Single outcome = gate has effectively converged.';
}

function gateCollapsePathsText() {
  if (state.ending) return 'resolved';
  if (state.sceneId !== 'gate') return 'arrives at gate';
  const scored = getGateScoredOptions();
  const collapseCount = scored.filter((x) => x.result === 'Run Collapsed').length;
  return `${collapseCount}/${scored.length} collapse`;
}

function collapsePathsMeaningText() {
  const txt = gateCollapsePathsText();
  if (txt === 'resolved') return 'Collapse paths lock after ending.';
  if (txt === 'arrives at gate') return 'Collapse-path count appears at extraction gate.';
  const [num, den] = txt.split(' ')[0].split('/').map((x) => Number(x));
  if (num === 0) return 'No collapse branches: all gate options survive.';
  if (num === den) return 'All gate branches collapse: recover state before committing if possible.';
  return `Partial collapse risk: ${num} of ${den} gate options fail.`;
}

function gateTagLegendText() {
  if (state.sceneId !== 'gate' || state.ending) return '';
  return 'Gate legend: ✓ viable, ⚠ risky, ⛔ collapse.';
}

function advisoryModeText() {
  if (state.ending) return 'resolved-phase';
  if (state.sceneId === 'gate') {
    const outcomes = [...new Set(getGateScoredOptions().map((x) => x.result))];
    if (outcomes.length > 1) return 'gate-compare';
    return 'gate-commit';
  }
  if (state.sceneId === 'anomaly') return 'anomaly-choice';
  if (state.sceneId === 'ambush') return 'ambush-response';
  if (state.sceneId === 'shrine') return state.tags.oath === 'none' ? 'oath-lock' : 'pre-gate';
  const risk = collapseRiskText();
  if (risk === 'critical' || risk === 'rising') return 'stabilize-now';
  return 'build-phase';
}

function advisoryModeMeaningText() {
  const mode = advisoryModeText();
  if (mode === 'build-phase') return 'Build-phase = improve resources and branch identity.';
  if (mode === 'stabilize-now') return 'Stabilize-now = prioritize survival before optimization.';
  if (mode === 'anomaly-choice') return 'Anomaly-choice = decide whether to cash rarity for control or keep route clean.';
  if (mode === 'ambush-response') return 'Ambush-response = absorb pressure first, then preserve extraction viability.';
  if (mode === 'oath-lock') return 'Oath-lock = choose your value path before extraction.';
  if (mode === 'pre-gate') return 'Pre-gate = route is prepared; enter extraction with intent.';
  if (mode === 'gate-compare') return 'Gate-compare = multiple endings live; compare options.';
  if (mode === 'gate-commit') return 'Gate-commit = outcomes converged; commit cleanly.';
  return 'Resolved-phase = run complete.';
}

function shiftRateMeaningText() {
  const rate = state.turn > 0 ? (state.modeShiftCount / state.turn) : 0;
  if (state.ending) return 'Shift rate locks at end; compare across runs for turbulence profile.';
  if (rate >= 0.45) return 'High shift churn: decision frame is changing often.';
  if (rate >= 0.25) return 'Moderate churn: watch transitions before committing.';
  return 'Low churn: strategy frame is staying stable.';
}

function outcomeReliabilityText() {
  const totalRuns = state.wins + state.losses;
  const shiftRate = state.turn > 0 ? (state.modeShiftCount / state.turn) : 0;
  const modeBreadth = (state.modeSeen || []).length;
  if (totalRuns < 3) return 'forming';
  if (shiftRate < 0.2 && modeBreadth <= 3) return 'narrow';
  if (shiftRate > 0.5 && modeBreadth >= 5) return 'volatile';
  return 'balanced';
}

function outcomeReliabilityMeaningText() {
  const r = outcomeReliabilityText();
  if (r === 'forming') return 'Forming = too few completed runs for stable reliability inference.';
  if (r === 'narrow') return 'Narrow = route exploration is constrained; diversify decisions to increase learning depth.';
  if (r === 'volatile') return 'Volatile = heavy mode churn; stabilize decision frame to improve repeatability.';
  return 'Balanced = depth and consistency are in productive range.';
}

function reliabilityBasisText() {
  const totalRuns = state.wins + state.losses;
  const shiftRate = state.turn > 0 ? (state.modeShiftCount / state.turn) : 0;
  const modeBreadth = (state.modeSeen || []).length;
  return `${totalRuns} runs · shift ${shiftRate.toFixed(2)} · modes ${modeBreadth}`;
}

function reliabilityBasisMeaningText() {
  const totalRuns = state.wins + state.losses;
  const shiftRate = state.turn > 0 ? (state.modeShiftCount / state.turn) : 0;
  const modeBreadth = (state.modeSeen || []).length;
  if (totalRuns < 3) return 'Low sample: reliability labels are provisional until more runs are logged.';
  if (shiftRate > 0.5 && modeBreadth >= 5) return 'High churn + high breadth: reliability likely volatile this run.';
  if (shiftRate < 0.2 && modeBreadth <= 3) return 'Low churn + low breadth: reliability likely narrow.';
  return 'Inputs indicate a balanced reliability envelope.';
}

function formTrendText() {
  const recent = state.recentForm || [];
  if (recent.length < 3) return 'forming';
  const last3 = recent.slice(-3);
  const wins = last3.filter((x) => x === 'W').length;
  if (wins === 3) return 'surging';
  if (wins === 0) return 'sliding';
  if (wins === 2) return 'up';
  if (wins === 1) return 'down';
  return 'flat';
}

function formTrendMeaningText() {
  const trend = formTrendText();
  if (trend === 'forming') return 'Forming = not enough runs yet for directional confidence.';
  if (trend === 'surging') return 'Surging = recent strategy changes are producing consistent wins.';
  if (trend === 'up') return 'Up = momentum is improving but not fully stable yet.';
  if (trend === 'flat') return 'Flat = outcomes are balanced; test a sharper strategic pivot.';
  if (trend === 'down') return 'Down = recent results are weakening; reduce risk and reset fundamentals.';
  return 'Sliding = current approach is failing repeatedly; change plan aggressively.';
}

function formConfidenceText() {
  const n = (state.recentForm || []).length;
  if (n >= 5) return 'high';
  if (n >= 3) return 'medium';
  return 'low';
}

function formConfidenceMeaningText() {
  const c = formConfidenceText();
  const n = (state.recentForm || []).length;
  const pending = state.ending ? n : n + 1;
  if (c === 'high') return `High confidence = trend backed by ${n} recent runs.`;
  if (c === 'medium') return `Medium confidence = trend backed by ${n} recent runs.`;
  return `Low confidence = trend still forming (${n} recent runs; ${pending} after this run).`;
}

function collapseRiskText() {
  if (state.ending) return state.ending.type === 'fail' ? 'collapsed' : 'cleared';
  if (state.sceneId === 'gate') {
    const outcomes = [...new Set(getGateScoredOptions().map((x) => x.result))];
    if (outcomes.length === 1 && outcomes[0] === 'Run Collapsed') return 'locked';
    if (outcomes.includes('Run Collapsed')) return 'present';
    return 'low';
  }
  if (state.heat >= 6 || state.energy <= 1 || state.turn >= 9) return 'critical';
  if (state.heat >= 4 || state.turn >= 7) return 'rising';
  return 'monitoring';
}

function collapseRiskMeaningText() {
  const r = collapseRiskText();
  if (r === 'monitoring') return 'Monitoring = no immediate collapse signal, keep building safely.';
  if (r === 'rising') return 'Rising = one bad branch can lock collapse risk.';
  if (r === 'critical') return 'Critical = stabilize now (heat/energy/turn pressure).';
  if (r === 'present') return 'Present = at least one gate option collapses the run.';
  if (r === 'locked') return 'Locked = every gate option currently collapses.';
  if (r === 'cleared') return 'Cleared = ending resolved without collapse.';
  if (r === 'collapsed') return 'Collapsed = run ended in failure.';
  return 'Collapse risk state active.';
}

function priorityAlertText() {
  if (state.ending) return 'Run resolved';
  if (state.sceneId === 'gate') {
    const safe = safeGateOptionText();
    if (state.tags.deal === 'brokered' && state.trust < 0) return 'Brokered path blocked: repair trust or choose another exit';
    if (safe.includes('use cooling power-up first')) return 'Use cooling before gate click';
    if (safe.includes('Run Collapsed')) return 'No safe gate line currently';
    if (safe.includes('backup:')) return 'Compare safe line vs backup before committing';
    return 'Finalize extraction choice';
  }
  if (state.turn >= 8 && state.intel < 4) return `Final push: need ${4 - state.intel} intel before window closes`;
  if (state.turn >= 8) return 'Extraction window closing';
  if (state.energy <= 1) return 'Energy critical';
  if (state.heat >= 6) return 'Heat critical';
  if (state.intel < 4) return `Need ${4 - state.intel} more intel`;
  return 'No urgent blockers';
}

function priorityAlertMeaningText() {
  const a = priorityAlertText();
  if (a === 'Run resolved') return 'Alert meaning: run complete, no urgent action required.';
  if (a.includes('blocked')) return 'Alert meaning: constraint gate active; resolve blocker before committing.';
  if (a.includes('cooling')) return 'Alert meaning: stabilization precondition is required before safe gate selection.';
  if (a.includes('No safe gate')) return 'Alert meaning: all current gate branches collapse; recover state first if possible.';
  if (a.includes('window closing')) return 'Alert meaning: pacing pressure is now the dominant risk.';
  if (a.includes('critical')) return 'Alert meaning: immediate survivability risk exceeds optimization value.';
  if (a.includes('Need')) return 'Alert meaning: objective deficit is primary blocker to strong endings.';
  return 'Alert meaning: no dominant blocker; optimize route quality.';
}

function brokeredTrustText() {
  if (state.trust >= 0) return 'eligible';
  return `blocked (${state.trust})`;
}

function safeConfidenceMeaningText() {
  const c = safeGateOptionConfidenceText();
  if (c === 'resolved') return 'Safe option confidence: run resolved.';
  if (c === 'n/a') return 'Safe option confidence appears at extraction gate.';
  if (c === 'high') return 'High = top gate line is clearly safer than alternatives.';
  if (c === 'medium') return 'Medium = top line is safer, but close alternatives exist.';
  return 'Low = gate options are tightly clustered; choose deliberately.';
}

function outcomeBandBasisText() {
  if (state.ending) return state.ending.type === 'win' ? 'ending locked: success' : 'ending locked: collapse';
  const reasons = [];
  if (state.intel < 4) reasons.push(`intel ${state.intel}/4`);
  if (state.heat > 4) reasons.push(`heat high (${state.heat})`);
  if (state.energy <= 1) reasons.push(`energy critical (${state.energy})`);
  if (state.turn >= 8) reasons.push(`turn pressure (${state.turn}/9)`);
  if (state.sceneId === 'shrine' && state.heat >= 4) reasons.push('gate risk: aggressive exits can force collapse');
  if (state.sceneId === 'gate') {
    const outcomes = [...new Set(getGateScoredOptions().map((x) => x.result))];
    if (outcomes.length > 1) reasons.push(`split outcomes active (${outcomes.length})`);
  }
  if (!reasons.length) reasons.push('thresholds currently healthy');
  return reasons.join(' · ');
}

function resolveEnding(projected = null) {
  const p = projected || {
    energy: state.energy,
    intel: state.intel,
    heat: state.heat,
    trust: state.trust,
    tags: { ...state.tags },
    totalPowerupsUsed: state.totalPowerupsUsed
  };

  if (p.energy <= 0 || p.heat >= 7) {
    return { type: 'fail', title: 'Run Collapsed', body: 'The route folded under pressure before extraction.' };
  }

  if (p.tags.deal === 'brokered' && p.intel >= 4 && p.heat <= 4 && p.energy >= 1 && p.trust >= 0) {
    return { type: 'win', title: 'Brokered Extraction', body: 'You paid for a covered exit and left with a debt instead of a chase.' };
  }

  if (p.totalPowerupsUsed === 0 && p.intel >= 4 && p.heat <= 3 && p.energy >= 2) {
    return { type: 'win', title: 'Iron Extraction', body: 'No boosts, no bailouts. Pure route discipline carried the run.' };
  }

  if (p.intel >= 5 && p.heat <= 3 && p.trust >= 1 && p.tags.oath === 'steward') {
    return { type: 'win', title: 'Legendary Extraction', body: 'You extracted perfect intel and left the district stronger than you found it.' };
  }

  if (p.intel >= 4 && p.heat <= 4 && p.energy >= 1) {
    if (p.tags.oath === 'raider' && p.tags.mark === 'hunted') {
      return { type: 'win', title: 'Pyrrhic Extraction', body: 'You got out with maximum payload, but the district now has your full pattern.' };
    }
    if (p.tags.oath === 'steward' && p.tags.mark === 'ghost') {
      return { type: 'win', title: 'Silent Extraction', body: 'You left with strong intel and no obvious scar in the city.' };
    }
    return { type: 'win', title: 'Clean Extraction', body: 'You got out with the payload and a route worth reusing.' };
  }

  return { type: 'fail', title: 'Run Collapsed', body: p.intel < 4 ? 'You reached the gate without enough intel to matter.' : 'You carried the intel, but the heat was too high to escape clean.' };
}

function projectChoiceState(choice) {
  const projected = {
    energy: state.energy + (choice.effect?.energy || 0),
    intel: state.intel + (choice.effect?.intel || 0),
    heat: state.heat + (choice.effect?.heat || 0),
    trust: state.trust + (choice.effect?.trust || 0),
    tags: { ...state.tags, ...(choice.set || {}) },
    totalPowerupsUsed: state.totalPowerupsUsed,
    turn: state.turn + 1
  };

  const immediateCollapse = projected.energy <= 0 || projected.heat >= 7 || projected.turn > 9;
  const nearCollapse = !immediateCollapse && (projected.energy <= 1 || projected.heat >= 6 || projected.turn >= 9);
  return { projected, immediateCollapse, nearCollapse };
}

function render() {
  if (state.ending && !state.endingTallied) {
    if (state.ending.type === 'win') {
      state.wins += 1;
      state.streak += 1;
      state.recentForm.push('W');
    } else {
      state.losses += 1;
      state.streak = 0;
      state.recentForm.push('L');
    }
    state.recentForm = state.recentForm.slice(-5);
    state.endingTallied = true;
  }

  document.getElementById('day').textContent = state.day;
  document.getElementById('turn').textContent = state.turn;
  document.getElementById('turn-pressure').textContent = turnPressureText();
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
  if (state.powerups.prism) pList.push(`Echo Prism x${state.powerups.prism}`);
  document.getElementById('powerups').textContent = pList.length ? pList.join(', ') : 'none';
  document.getElementById('route-echo').textContent = routeEchoText();
  document.getElementById('forecast').textContent = endingForecastText();
  document.getElementById('signature').textContent = `${state.tags.stance} · ${state.tags.mark} · ${state.tags.oath} · ${state.tags.deal}`;
  document.getElementById('next-unlock').textContent = nextUnlockText();
  document.getElementById('record').textContent = `${state.wins}W/${state.losses}L`;
  const totalRuns = state.wins + state.losses;
  const winRate = totalRuns > 0 ? Math.round((state.wins / totalRuns) * 100) : 0;
  const metaConfidence = totalRuns >= 20 ? 'strong sample' : totalRuns >= 8 ? 'moderate sample' : 'low sample';
  document.getElementById('win-rate').textContent = `${winRate}%`;
  document.getElementById('run-count').textContent = `${totalRuns}`;
  document.getElementById('meta-confidence').textContent = metaConfidence;
  document.getElementById('recent-form').textContent = state.recentForm.length ? state.recentForm.join('') : 'none';
  document.getElementById('form-confidence').textContent = formConfidenceText();
  document.getElementById('form-trend').textContent = formTrendText();
  document.getElementById('streak').textContent = `${state.streak > 0 ? '+' : ''}${state.streak}`;
  document.getElementById('risk-posture').textContent = riskPostureText();
  document.getElementById('best-move').textContent = bestMoveText();
  document.getElementById('move-confidence').textContent = bestMoveConfidenceText();
  document.getElementById('target-ending').textContent = targetEndingText();
  document.getElementById('safe-gate-option').textContent = safeGateOptionText();
  document.getElementById('safe-option-confidence').textContent = safeGateOptionConfidenceText();
  document.getElementById('safe-option-gap').textContent = safeGateOptionGapText();
  document.getElementById('gate-snapshot').textContent = gateSnapshotText();
  const currentAdvisoryMode = advisoryModeText();
  if (!state.modeSeen.includes(currentAdvisoryMode)) state.modeSeen.push(currentAdvisoryMode);
  document.getElementById('advisory-mode').textContent = currentAdvisoryMode;
  document.getElementById('mode-shifts').textContent = `${state.modeShiftCount}`;
  document.getElementById('unique-modes').textContent = `${state.modeSeen.length}`;
  const shiftRate = state.turn > 0 ? (state.modeShiftCount / state.turn) : 0;
  document.getElementById('shift-rate').textContent = shiftRate.toFixed(2);
  document.getElementById('outcome-reliability').textContent = outcomeReliabilityText();
  document.getElementById('reliability-basis').textContent = reliabilityBasisText();
  document.getElementById('reliability-basis-meaning').textContent = reliabilityBasisMeaningText();
  document.getElementById('collapse-risk').textContent = collapseRiskText();
  document.getElementById('priority-alert').textContent = priorityAlertText();
  document.getElementById('priority-alert-meaning').textContent = priorityAlertMeaningText();
  document.getElementById('collapse-paths-meaning').textContent = collapsePathsMeaningText();
  document.getElementById('collapse-risk-meaning').textContent = collapseRiskMeaningText();
  document.getElementById('advisory-mode-meaning').textContent = advisoryModeMeaningText();
  document.getElementById('shift-rate-meaning').textContent = shiftRateMeaningText();
  document.getElementById('form-trend-meaning').textContent = formTrendMeaningText();
  document.getElementById('form-confidence-meaning').textContent = formConfidenceMeaningText();
  document.getElementById('outcome-reliability-meaning').textContent = outcomeReliabilityMeaningText();
  document.getElementById('brokered-trust').textContent = brokeredTrustText();
  if (state.lastAdvisoryMode !== null && state.lastAdvisoryMode !== currentAdvisoryMode) {
    state.modeShiftCount += 1;
    addLog(`Mode shift: ${state.lastAdvisoryMode} → ${currentAdvisoryMode}.`);
  }
  state.lastAdvisoryMode = currentAdvisoryMode;
  document.getElementById('mode-shifts').textContent = `${state.modeShiftCount}`;
  document.getElementById('safe-confidence-meaning').textContent = safeConfidenceMeaningText();
  document.getElementById('safe-gap-meaning').textContent = safeGapMeaningText();
  document.getElementById('gate-snapshot-meaning').textContent = gateSnapshotMeaningText();
  document.getElementById('outcome-band').textContent = outcomeBandText();
  document.getElementById('band-basis').textContent = outcomeBandBasisText();
  document.getElementById('confidence-meaning').textContent = confidenceMeaningText();
  const lastRunText = state.lastRun
    ? `${state.lastRun.ending} (P${state.lastRun.powerups}, S:${state.lastRun.specials || 'none'})`
    : 'none yet';
  document.getElementById('last-run').textContent = lastRunText;
  const specials = [];
  if (state.anomalyVisited) specials.push('anomaly');
  if (state.ambushVisited) specials.push('ambush');
  document.getElementById('run-profile').textContent = `P${state.totalPowerupsUsed} · S:${specials.join('+') || 'none'}`;
  document.getElementById('signature-meaning').textContent = signatureMeaningText();
  document.getElementById('run-codex').textContent = runCodexText();

  document.getElementById('goal').textContent = objectiveText();
  document.getElementById('log').innerHTML = state.log.map((x) => `<div class="entry">• ${x}</div>`).join('');

  const choicesEl = document.getElementById('choices');

  if (state.ending) {
    document.getElementById('scene-title').textContent = state.ending.title;
    document.getElementById('scene-body').textContent = `${state.ending.body} ${foldedBody('')}`.trim();
    document.getElementById('scene-image').src = '/assets/content/desert_of_the_real.png';
    document.getElementById('forecast').textContent = `achieved: ${state.ending.title}`;
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
  const hasScenePowerup = (state.powerups.cloak + state.powerups.battery + state.powerups.key + state.powerups.prism) > 0;
  const powerupsAllowedHere = !['shrine', 'gate'].includes(state.sceneId);
  let consequenceHint = state.powerUsedThisScene
    ? 'Power-up locked in (cost: 1 turn). Choose a route action to advance the story.'
    : (hasScenePowerup && powerupsAllowedHere)
    ? 'Each option tells exact consequences. You may use one power-up (cost: 1 turn) before choosing a route action.'
    : 'Each option tells exact consequences. Choose your route action to advance.';
  const gateLegend = gateTagLegendText();
  if (gateLegend) consequenceHint = `${consequenceHint} ${gateLegend}`;
  document.getElementById('consequence-hint').textContent = consequenceHint;

  choicesEl.innerHTML = '';

  scene.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    const projection = projectChoiceState(choice);
    if (state.sceneId === 'gate') {
      const previewResult = resolveEnding(projection.projected);
      const intelGap = Math.max(0, 4 - projection.projected.intel);
      const riskTag = previewResult.title === 'Run Collapsed' ? '⛔' : (projection.projected.heat >= 5 || projection.projected.energy <= 1) ? '⚠' : '✓';
      if (previewResult.title === 'Run Collapsed' && intelGap > 0) {
        btn.textContent = `${riskTag} ${choice.text} → ${previewResult.title} (need +${intelGap} intel)`;
      } else if (previewResult.title === 'Run Collapsed' && projection.projected.energy <= 0) {
        btn.textContent = `${riskTag} ${choice.text} → ${previewResult.title} (energy depleted)`;
      } else if (previewResult.title === 'Run Collapsed' && projection.projected.heat > 4) {
        btn.textContent = `${riskTag} ${choice.text} → ${previewResult.title} (heat too high)`;
      } else {
        btn.textContent = `${riskTag} ${choice.text} → ${previewResult.title}`;
      }
    } else if (state.sceneId === 'shrine') {
      const projectedIntel = projection.projected.intel;
      const intelGap = Math.max(0, 4 - projectedIntel);
      if (intelGap > 0) {
        btn.textContent = `${choice.text} ⚠ still ${intelGap} intel short for extraction`;
      } else {
        btn.textContent = `${choice.text} ✓ extraction threshold ready`;
      }
    } else {
      if (projection.immediateCollapse) {
        btn.textContent = `${choice.text} ⚠ immediate collapse`;
      } else if (projection.nearCollapse) {
        btn.textContent = `${choice.text} ⚠ high collapse risk`;
      } else {
        btn.textContent = choice.text;
      }
    }
    btn.onclick = () => {
      applyEffect(choice.effect);
      gainPowerup(choice.gain);
      setTags(choice.set);
      state.turn += 1;
      addLog(choice.log);

      if (choice.next === 'resolve') {
        state.ending = resolveEnding();
      } else {
        let nextScene = choice.next;
        if (choice.next === 'shrine') {
          const triggerAnomaly = !state.anomalyVisited && state.tags.stance === 'quiet' && (state.powerups.key || 0) > 0 && state.heat <= 3;
          const triggerAmbush = !state.ambushVisited && state.tags.mark === 'hunted' && state.heat >= 5;
          if (triggerAnomaly) nextScene = 'anomaly';
          else if (triggerAmbush) nextScene = 'ambush';
        }
        if (nextScene === 'anomaly') state.anomalyVisited = true;
        if (nextScene === 'ambush') state.ambushVisited = true;
        state.sceneId = nextScene;
        state.day += 1;
        state.powerUsedThisScene = false;
      }

      if (!state.ending && state.turn > 9) {
        state.ending = { type: 'fail', title: 'Run Collapsed', body: 'You burned too many actions before extraction and the window closed.' };
      }

      if (!state.ending && (state.energy <= 0 || state.heat >= 7)) {
        state.ending = { type: 'fail', title: 'Run Collapsed', body: 'You were broken by heat and attrition before the gate.' };
      }

      save();
      render();
    };
    choicesEl.appendChild(btn);
  });

  if (!state.powerUsedThisScene && !['shrine', 'gate'].includes(state.sceneId)) {
    const powerButtons = [];

    if (state.powerups.cloak > 0) {
      powerButtons.push({
        text: '⚡ Use Sand Cloak now (-2 heat, costs 1 turn)',
        action: () => {
          state.powerups.cloak -= 1;
          state.heat = Math.max(0, state.heat - 2);
          state.powerUsedThisScene = true;
          state.totalPowerupsUsed += 1;
          state.turn += 1;
          addLog('Power-up: Sand Cloak bent sightlines away from you.');
        }
      });
    }

    if (state.powerups.battery > 0) {
      powerButtons.push({
        text: '⚡ Use Battery Pack now (+2 energy, costs 1 turn)',
        action: () => {
          state.powerups.battery -= 1;
          state.energy = Math.min(9, state.energy + 2);
          state.powerUsedThisScene = true;
          state.totalPowerupsUsed += 1;
          state.turn += 1;
          addLog('Power-up: Battery Pack stabilized your suit core.');
        }
      });
    }

    if (state.powerups.key > 0) {
      powerButtons.push({
        text: '⚡ Use Signal Key now (+1 intel, costs 1 turn)',
        action: () => {
          state.powerups.key -= 1;
          state.intel += 1;
          state.powerUsedThisScene = true;
          state.totalPowerupsUsed += 1;
          state.turn += 1;
          addLog('Power-up: Signal Key opened a hidden data spine.');
        }
      });
    }

    if (state.powerups.prism > 0) {
      powerButtons.push({
        text: '⚡ Use Echo Prism now (-2 heat, +1 intel, costs 1 turn)',
        action: () => {
          state.powerups.prism -= 1;
          state.heat = Math.max(0, state.heat - 2);
          state.intel += 1;
          state.powerUsedThisScene = true;
          state.totalPowerupsUsed += 1;
          state.turn += 1;
          addLog('Power-up: Echo Prism bent outcome probabilities in your favor.');
        }
      });
    }

    powerButtons.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = item.text;
      btn.onclick = () => {
        item.action();
        save();
        render();
      };
      choicesEl.appendChild(btn);
    });
  }

  save();
}

function restart() {
  const nextRun = (state.run || 1) + 1;
  const specials = [];
  if (state.anomalyVisited) specials.push('anomaly');
  if (state.ambushVisited) specials.push('ambush');
  const lastRun = {
    ending: state.ending?.title || 'Unresolved',
    powerups: state.totalPowerupsUsed || 0,
    specials: specials.join('+')
  };
  const meta = { wins: state.wins || 0, losses: state.losses || 0, streak: state.streak || 0, recentForm: state.recentForm || [] };
  Object.assign(state, newRunState(nextRun));
  state.wins = meta.wins;
  state.losses = meta.losses;
  state.streak = meta.streak;
  state.recentForm = meta.recentForm;
  state.lastRun = lastRun;
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
