# Postcards Roadmap Evidence Index

Purpose: one-page index of every artifact required to close Priority 0.

## Gate Coverage Matrix

| Gate | Requirement | Evidence File | Status |
|---|---|---|---|
| 1 | Legibility tuning pass complete | `clauddib-website/postcards.html` + commit history + screenshots (to add) | In progress |
| 2 | Performance pass complete | `docs/postcards-live-timing-template.md` | Pending live run |
| 3 | Taxonomy quality pass complete | `docs/postcards-taxonomy-audit-2026-02-23.md` + `data/postcards.tag-aliases.json` | Phase 1 complete |
| 4 | User-journey checks pass | `docs/postcards-user-journey-check-log.md` | Pending run |
| 5 | Final release note | `docs/postcards-architecture-release-note.md` | Draft scaffold ready |

## Operational Artifacts
- Closeout checklist: `docs/postcards-roadmap-closeout-checklist.md`
- Validation runbook: `docs/postcards-roadmap-validation-runbook.md`
- Troubleshooting: `docs/postcards-runtime-troubleshooting.md`
- Data contract: `docs/postcards-data-contract.md`

## Next unblock sequence
1. Run `docs/postcards-manual-live-validation-script.md` in a human browser session.
2. Fill timing template + 4-prompt journey log from that run.
3. Record outcome in `docs/postcards-priority0-manual-validation-result-template.md`.
4. Update this matrix + `docs/postcards-roadmap-closeout-go-no-go.md` + `docs/postcards-roadmap-closeout-decision-record.md` (canonical six-file path).

## Rule
No roadmap-complete claim is valid unless all five gate rows are marked complete with linked evidence.
