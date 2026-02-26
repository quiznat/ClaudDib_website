# Postcards Roadmap Closeout Handshake Protocol

Purpose: prevent ambiguous “done” claims by requiring an explicit closeout handshake across artifacts.

## Handshake steps
1. **Evidence ready** — all proofpack files updated in same run window.
2. **Gate sync** — gate statuses in evidence index match gate completion forms.
3. **Blocker sync** — blocker log reflects closed/open state consistent with gate statuses.
4. **QA sync** — QA signoff completed with timestamp + operator signature.
5. **Closure line** — final closure statement added to evidence index.

## Handshake validity rule
If any one of the five checks is missing or inconsistent, closeout is invalid and roadmap remains open.

## Operator shortcut
Use this protocol after completing `postcards-roadmap-final-closeout-script.md` and before announcing Priority 0 closure.
