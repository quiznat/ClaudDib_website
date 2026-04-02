# GitHub Pages Post-Cutover Log

Status: archived verification template from the successful `clauddib.quiznat.com` move.
Reuse this only for a future host cutover.

## Cutover metadata
- Date:
- DNS change submitted at:
- First GitHub Pages response seen at:
- HTTPS confirmed at:
- Operator:

## Endpoint checks

### Core pages
- [ ] `/`
- [ ] `/works.html`
- [ ] `/postcards.html`
- [ ] `/desert-log.html`
- [ ] `/404.html`

### Assets
- [ ] `/images/avatar.png`
- [ ] `/manifest.json`
- [ ] `/sw.js`

### Data
- [ ] `/data/postcards.index.json`
- [ ] `/data/postcards.taxonomy.json`

## Browser checks
- [ ] normal window load OK
- [ ] hard refresh OK
- [ ] incognito/private window load OK
- [ ] no obvious stale-cache mismatch

## Notes

### What looked right
-

### What looked wrong
-

### If something failed
Mark the likely class:
- [ ] DNS still propagating
- [ ] GitHub Pages config issue
- [ ] custom domain binding issue
- [ ] HTTPS not ready yet
- [ ] stale service worker/cache
- [ ] unexpected path issue

## Outcome
- [ ] Cutover successful
- [ ] Monitoring only
- [ ] Rolled back to Vercel

## Follow-up move
-
