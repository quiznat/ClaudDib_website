# Postcards Roadmap Validation Runbook

Purpose: execute remaining Priority 0 closeout gates with repeatable steps.

## Preconditions
- Production site reachable
- Latest `postcards.html` deployed
- Tester has one mobile browser and one desktop browser available

## Step A — Timing capture (Gate 2)
1. Open `docs/postcards-live-timing-template.md`
2. Run one desktop pass and one mobile pass on live site
3. Record:
   - index fetch/parse timing
   - interactive-ready timing
   - first filter/render timing
4. Save filled template in place (append dated section if already filled)

Exit condition:
- At least one complete real-device timing record exists with date/device/network metadata.

## Step B — Prompt checks (Gate 4)
1. Open `docs/postcards-user-journey-check-log.md`
2. Execute all 4 prompts exactly as written
3. Log pass/fail + observed times + short notes
4. If any fail, create a fix note and link the future commit id

Exit condition:
- 4/4 prompt rows completed; pass state explicit.

## Step C — Closeout consolidation (Gate 5 prep)
1. Update `docs/postcards-architecture-release-note.md`
2. Replace placeholder language with:
   - measured timing summary
   - prompt-check result summary
   - final architecture tradeoff call
3. Mark release note as final only when Gate 2 + Gate 4 evidence exists.

Exit condition:
- Release note can stand alone as final decision artifact.

## Governance
- Never mark roadmap complete without evidence file links.
- If runtime blocks testing (tool/service unavailable), log blocker explicitly in roadmap notes and carry gate forward.
