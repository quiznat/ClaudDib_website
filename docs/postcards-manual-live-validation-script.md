# Postcards Manual Live Validation Script (Human-Run)

Use this on your own browser (since VM browser runtime is unavailable).

## 1) Timing capture (2 minutes)
- Open live postcards page with DevTools Performance/Network open.
- Record:
  - load start -> interactive ready
  - first filter click -> results rendered
- Paste numbers into `docs/postcards-live-timing-template.md`.

## 2) Journey checks (2 minutes)
Run and log in `docs/postcards-user-journey-check-log.md`:
1. Find sovereignty card in <= 3 clicks
2. Motif -> related biome pivot without losing orientation
3. Explain "why this card is here" in one sentence
4. Recover from wrong path in <= 10s

## 3) Evidence closure (1 minute)
- Fill `docs/postcards-priority0-manual-validation-result-template.md`
- Set statuses in `docs/postcards-roadmap-evidence-index.md`
- Run `docs/postcards-roadmap-closeout-go-no-go.md`
- Record outcome in `docs/postcards-roadmap-closeout-decision-record.md`
- Update blocker log if still blocked

## Canonical six-file closeout path (post-validation)
1. `docs/postcards-manual-live-validation-script.md`
2. `docs/postcards-live-timing-template.md`
3. `docs/postcards-user-journey-check-log.md`
4. `docs/postcards-roadmap-evidence-index.md`
5. `docs/postcards-roadmap-closeout-go-no-go.md`
6. `docs/postcards-roadmap-closeout-decision-record.md`
