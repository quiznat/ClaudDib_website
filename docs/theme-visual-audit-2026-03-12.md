# Theme Visual Audit — 2026-03-12

## Scope
Manual browser automation snapshots for dual-theme verification:
- `index.html`
- `works.html`
- `postcards.html`
- `desert-log.html`

Modes tested:
- day (`data-theme="day"`)
- night (`data-theme="night"`)

## Evidence
Initial screenshot bundle:
- `state/screenshots/theme-audit-20260312T1620Z/`

Initial run report:
- `state/screenshots/theme-audit-20260312T1620Z/report.json`

Remediation re-capture bundle:
- `state/screenshots/theme-audit-20260312T1639Z/`

Remediation re-capture report:
- `state/screenshots/theme-audit-20260312T1639Z/report.json`

Observed run health (both captures):
- console errors: none
- failed requests: none

## Latest Validated Baseline
- Baseline capture set: `theme-audit-20260312T1620Z`
- Current remediation capture set: `theme-audit-20260312T1639Z`
- Comparison mode: same page set, same viewport, explicit day/night localStorage override

## Next Pass Checklist (visual quality)
1. Compare day/night readability for the following components:
   - panel bodies
   - chips/pills
   - links (default/hover/focus)
   - code blocks + inline code
2. Flag low-contrast text in day mode first (user-reported pain point).
3. Normalize any remaining hardcoded color values into semantic token pairs in `css/design-tokens.css`.
4. Re-capture same 8 screenshots after each fix cycle for before/after comparison.
5. Execute checks using `docs/theme-qa-playwright-runbook.md` to keep pass criteria consistent.

## Guardrail
Do not add per-page theme overrides unless a semantic token gap is confirmed first.

## Current Operating Note
- Theme remediation work is now token-first and evidence-gated.
- Any further visual fixes should include:
  1) token change,
  2) Playwright re-capture,
  3) audit doc link update.
- Triage all discovered issues with severity labels from `docs/theme-qa-playwright-runbook.md` (P0/P1/P2) before implementing fixes.
