# Postcards Roadmap Closeout Checklist

Purpose: close Priority 0 with evidence, not vibes.

## Completion Gates + Evidence

### 1) Legibility tuning pass
- [ ] Region/cluster naming clarity pass reviewed on live page
- [ ] Hierarchy wording pass reviewed (Step labels + path hint)
- [ ] Empty/edge state messaging reviewed (no dead-end UX)
- Evidence:
  - `postcards.html` diff/commit(s)
  - 3 screenshots: landing, filtered cluster, empty state

### 2) Performance pass
- [ ] Capture one real-device timing run using `postcards-live-timing-template.md`
- [ ] Record index fetch/parse + interactive-ready timing in template
- [ ] Document one follow-up optimization decision (keep/ship/defer)
- Evidence:
  - `docs/postcards-live-timing-template.md` (filled)
  - optional console timing capture snippet in notes

### 3) Taxonomy quality pass
- [ ] Alias mapping applied + validated against index tags
- [ ] Low-signal bucket cleanup reviewed (misc/noise tags)
- [ ] One short before/after cluster coherence note written
- Evidence:
  - `data/postcards.tag-aliases.json`
  - `docs/postcards-taxonomy-audit-2026-02-23.md` (+ next audit note)

### 4) User-journey prompt checks
Run and log all 4 prompts:
1. Find one card about sovereignty in under 3 clicks
2. Start in Motif drawer, then pivot to related biome without losing orientation
3. Explain why this card is here in one sentence
4. Recover from wrong click path in under 10 seconds

- [ ] All 4 prompts pass on live site
- Evidence:
  - short pass/fail log with date + tester initials

### 5) Final release note
- [ ] Write one final release note summarizing architecture decisions + tradeoffs
- Evidence:
  - `docs/postcards-architecture-release-note.md`

## Next Heartbeat Execution Order (roadmap-focused)
1. Fill real-device timing template (Gate 2)
2. Run user-journey prompt checks and log results (Gate 4)
3. If both pass, draft final release note scaffold (Gate 5)

## Done Definition
Roadmap closes only when all 5 gates are checked and evidence files exist in-repo.
