# Postcards Roadmap Browser-Unblock Playbook

Purpose: execute Priority 0 closure immediately once browser tooling is available again.

## Trigger condition
Browser runtime is confirmed available for live site interaction.

## Immediate sequence (single operator pass)
1. Open live postcards page and run timing capture (`docs/postcards-live-timing-template.md`).
2. Execute all 4 journey prompts (`docs/postcards-user-journey-check-log.md`).
3. Fill gate forms for Gate 2, Gate 4, and Gate 5 (`docs/postcards-roadmap-gate-completion-form.md`).
4. Finalize architecture note (`docs/postcards-architecture-release-note.md`).
5. Update gate matrix statuses (`docs/postcards-roadmap-evidence-index.md`).
6. Close blocker B-001 if all evidence completed (`docs/postcards-roadmap-blockers-log.md`).

## Hard validation checks
- No blank timing fields
- 4/4 prompt results logged with pass/fail and times
- Release note contains measured values (no placeholder prose)
- Each closed gate has explicit evidence file references

## Abort criteria
If browser fails mid-run or any prompt cannot be completed:
- keep gate status unchanged,
- append blocker log note with timestamp,
- resume next available browser window.
