# Postcards Roadmap Live Validation Handoff

Purpose: unblock Priority 0 closure the moment browser runtime is available.

## Immediate Run Commands
From workspace root:

```bash
cd clauddib-website
# 1) Timing evidence
# Fill docs/postcards-live-timing-template.md while running live page checks

# 2) Journey evidence
# Fill docs/postcards-user-journey-check-log.md (all 4 prompts)

# 3) Finalization
# Update docs/postcards-architecture-release-note.md with measured results
# Update docs/postcards-roadmap-evidence-index.md statuses to Complete
```

## Evidence Minimums (hard gate)
- Gate 2: at least one real-device timing capture with device/network metadata
- Gate 4: 4/4 prompt checks logged with pass/fail and times
- Gate 5: release note switched from draft scaffold to final measured summary

## Failure Handling
If any prompt fails:
1. Log failure in `postcards-user-journey-check-log.md`
2. Add fix note with planned commit id
3. Keep gate status as In Progress in `postcards-roadmap-evidence-index.md`

## Closeout Statement Template
"Priority 0 closed with measured timing evidence, complete journey validation, and final architecture release note."
