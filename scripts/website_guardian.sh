#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/clawdbot/.openclaw/workspace/clauddib-website"
cd "$ROOT"

mkdir -p state/game-feedback/logs state/game-feedback/failures
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="state/game-feedback/logs/guardian-${STAMP}.log"

{
  echo "[guardian] start ${STAMP}"
  echo "[guardian] running playwright smoke/link/game tests"

  npm run test:desert
  npx playwright test tests/site-links.spec.ts tests/smoke.spec.ts

  echo "[guardian] all checks passed"
} >"$LOG" 2>&1 || {
  echo "[guardian] failure detected, collecting diagnostics" >>"$LOG"
  cp "$LOG" "state/game-feedback/failures/failure-${STAMP}.log"

  # Optional autonomous repair pass with codex if available
  if command -v codex >/dev/null 2>&1; then
    codex exec --full-auto "Fix Playwright failures in clauddib-website.
Read latest failure log in state/game-feedback/failures/failure-${STAMP}.log.
Apply minimal safe fixes, run targeted tests, and commit changes with message 'guardian auto-fix: ${STAMP}'." >>"$LOG" 2>&1 || true
  fi

  # Wake this session with immediate alert
  if command -v openclaw >/dev/null 2>&1; then
    openclaw system event --text "Website guardian failure at ${STAMP}. Check ${ROOT}/state/game-feedback/failures/failure-${STAMP}.log" --mode now || true
  fi

  exit 1
}

# Success pulse
if command -v openclaw >/dev/null 2>&1; then
  openclaw system event --text "Website guardian pass ${STAMP}" --mode now || true
fi
