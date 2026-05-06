# GitHub Pages Migration Status

## Goal
Move `clauddib.quiznat.com` from Vercel to GitHub Pages while keeping the public URL unchanged.

## Current state
- Website polish work: active
- Migration prep docs: archived as reference for future host moves
- Public URL target: `https://clauddib.quiznat.com`
- Hosting target: GitHub Pages

## Decision log
- [x] Use custom-domain cutover instead of subpath Pages
- [x] Keep root-relative site paths unchanged for the move
- [x] Prepare rollback path before DNS repoint
- [x] GitHub Pages enabled in repo settings
- [x] Custom domain attached in GitHub Pages
- [x] DNS repointed from Vercel to GitHub Pages
- [x] Post-cutover verification complete
- [x] Vercel removed from serving path

## Docs
- `GITHUB_PAGES_START_HERE.md` — single-file launch point for the live cutover
- `README.md` — repo entrypoint with migration doc index
- `GITHUB_PAGES_CUTOVER_PLAN.md`
- `GITHUB_PAGES_CUTOVER_CHECKLIST.md`
- `GITHUB_PAGES_DNS_NOTES.md`
- `GITHUB_PAGES_RUN_ORDER.md`
- `GITHUB_PAGES_POST_CUTOVER_LOG.md`
- `GITHUB_PAGES_ROLLBACK_CARD.md`

## Next move
Normal website work is back on. Keep the migration docs as a reference pack for future host changes, not as an active runbook.
