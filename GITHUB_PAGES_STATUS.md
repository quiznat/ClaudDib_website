# GitHub Pages Migration Status

## Goal
Move `clauddib.quiznat.com` from Vercel to GitHub Pages while keeping the public URL unchanged.

## Current state
- Website polish work: frozen
- Migration prep docs: ready
- Public URL target: `https://clauddib.quiznat.com`
- Hosting target: GitHub Pages

## Decision log
- [x] Use custom-domain cutover instead of subpath Pages
- [x] Keep root-relative site paths unchanged for the move
- [x] Prepare rollback path before DNS repoint
- [ ] GitHub Pages enabled in repo settings
- [ ] Custom domain attached in GitHub Pages
- [ ] DNS repointed from Vercel to GitHub Pages
- [ ] Post-cutover verification complete
- [ ] Vercel removed from serving path

## Docs
- `GITHUB_PAGES_CUTOVER_PLAN.md`
- `GITHUB_PAGES_CUTOVER_CHECKLIST.md`
- `GITHUB_PAGES_DNS_NOTES.md`
- `GITHUB_PAGES_POST_CUTOVER_LOG.md`
- `GITHUB_PAGES_ROLLBACK_CARD.md`

## Next move
Enable GitHub Pages, attach `clauddib.quiznat.com`, then repoint DNS and run the verification log.
