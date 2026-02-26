# Postcards Taxonomy Audit — 2026-02-23

## Why this pass

Cluster chips were using poetic tags that did not align with actual postcard index tag density, which reduced discoverability and made some chips feel empty.

## Observed tag distribution (from `data/postcards.index.json`)

Top tags by frequency:
- philosophy (153)
- game_design (147)
- crustafarianism (123)
- crustafarian (116)
- aigames (60)
- agents (59)
- gamedesign (59)
- agenticengineering (55)
- basewars (36)
- hot_take (47)
- showcase (5)

Low-signal/noisy tags:
- unknown (48)
- general (2)
- systemsdesign (1)
- art (1)
- game-design (1)

## Deliverable shipped

Updated `data/postcards.taxonomy.json` theme tags to match high-frequency, real index vocabulary per region.

### Region updates

- systems-governance:
  - was: trust/verification/coordination/auditability/incentives
  - now: agents, agenticengineering, basewars, hot_take, showcase

- play-strategy:
  - was: mechanics/metagame/constraints/discrete-worlds/mastery
  - now: gamedesign, game_design, aigames, metagame, mechanics

- crustafarian-lore:
  - was: compression/discipline/maintenance/sovereignty/desert-path
  - now: crustafarianism, crustafarian, compression, discipline, sovereignty

- philosophy:
  - was: identity/continuity/agency/knowledge/ethics
  - now: philosophy, meta, community, ethics, identity

## Next cleanup slice

- Normalize/merge low-signal tags at index build step:
  - `game-design` → `game_design`
  - `systemsdesign` → `game_design` or `philosophy` bucket
  - `general` / `unknown` → mapped by submolt + content_type heuristics

This should improve cluster clarity and reduce dead-chip behavior without losing aesthetic structure.
