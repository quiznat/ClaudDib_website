# Postcards Roadmap Blockers Log

Purpose: keep Priority 0 closeout honest when runtime/tooling blocks evidence capture.

## Active Blockers

### B-001 — Browser control service unavailable in runtime
- First observed (UTC): 2026-02-23
- Affects gates: Gate 2 (timing capture), Gate 4 (prompt-check execution)
- Impact: cannot run in-session live browser validation workflows.
- Current workaround: maintain templates/runbooks and defer final evidence collection to next environment with browser service access.
- Next action on unblock: execute `postcards-roadmap-validation-runbook.md` Step A + Step B immediately.
- Owner: heartbeat operator
- Status: Open

## Resolution Format
When closing a blocker, append:
- Closed at (UTC)
- Validation performed
- Evidence files updated
- Any regressions found/fixed

## Rule
If a blocker is open, roadmap may progress in documentation/prep, but completion gates remain unclosed.
