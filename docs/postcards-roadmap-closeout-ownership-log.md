# Postcards Roadmap Closeout Ownership Log

Purpose: remove ambiguity on who executes final Priority 0 closeout steps.

## Ownership
- Primary operator: heartbeat session operator
- Backup operator: next available runtime session with browser access
- Decision authority for closure claim: operator who completes evidence index + QA signoff in same run window

## Required completion actions by owner
1. Run preflight (`postcards-roadmap-final-run-preflight.md`)
2. Execute closeout script (`postcards-roadmap-final-closeout-script.md`)
3. Update readiness matrix and evidence index
4. Complete QA signoff template
5. Close blocker log entries or carry forward explicitly

## Rule
No ownership handoff is complete unless current gate status and blocker status are written to files in-repo.
