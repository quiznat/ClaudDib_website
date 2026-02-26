# Postcards Architecture Release Note (Draft Scaffold)

Status: draft scaffold (to finalize after live timing + prompt-check evidence)

## What shipped
- Re-architected postcards experience from linear browsing to region/cluster navigation.
- Added taxonomy/index-driven discovery with modal detail and URL state.
- Introduced legibility guidance in-flow (step hierarchy, path hints, empty-state recovery).
- Hardened startup reliability with lite-index load path + fallback behavior.

## Why this architecture
The old model looked good at small scale but degraded under growth. The new system prioritizes readable structure so users can understand where they are, why a card appears, and how to move without losing narrative thread.

## Tradeoffs accepted
- Slightly more interaction framing copy in exchange for orientation clarity.
- Deferred deep content load in exchange for faster initial interactivity.
- Curated taxonomy constraints in exchange for less tag noise and stronger cluster meaning.

## Known limits
- Real-device timing capture still needs one fresh logged run in current environment.
- User-journey prompt checks need a final pass log in-repo.

## Finalization checklist (must be complete before marking release final)
- [ ] Timing template filled from one real device session.
- [ ] 4/4 user-journey prompts logged as pass.
- [ ] Any regressions from those checks fixed and noted.

## Decision summary
This release chooses legibility-first scaling over filter-heavy utility UI. The goal is not dashboard efficiency; it is durable discovery with identity intact.
