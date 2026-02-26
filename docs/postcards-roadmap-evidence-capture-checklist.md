# Postcards Roadmap Evidence Capture Checklist

Purpose: reduce operator ambiguity during live closeout execution.

## Before You Start
- [ ] Confirm live site URL and branch/commit baseline
- [ ] Open these files side by side:
  - `docs/postcards-live-timing-template.md`
  - `docs/postcards-user-journey-check-log.md`
  - `docs/postcards-architecture-release-note.md`
  - `docs/postcards-roadmap-evidence-index.md`

## Capture Order (do not reorder)
1. **Timing pass (Gate 2)**
   - [ ] desktop capture logged
   - [ ] mobile capture logged
   - [ ] interactive-ready + filter-render values entered
2. **Journey pass (Gate 4)**
   - [ ] prompt 1 result logged
   - [ ] prompt 2 result logged
   - [ ] prompt 3 result logged
   - [ ] prompt 4 result logged
3. **Finalize note (Gate 5)**
   - [ ] replace draft placeholders with measured facts
   - [ ] include final tradeoff statement
4. **Evidence index update**
   - [ ] mark Gate 2 status
   - [ ] mark Gate 4 status
   - [ ] mark Gate 5 status

## Hard Stop Rules
- Do **not** mark a gate complete if any required cell is blank.
- Do **not** mark roadmap complete if blockers remain open in `docs/postcards-roadmap-blockers-log.md`.

## Completion line
When all checks pass, append a dated closeout line in the evidence index with operator initials.
