# GitHub Pages DNS Notes

Use this as the scratchpad for the `clauddib.quiznat.com` cutover.

## Intent

Keep the public URL the same:
- `https://clauddib.quiznat.com`

Only the hosting layer changes:
- old: Vercel
- new: GitHub Pages

## Cutover rule

Do not change site paths during DNS cutover.
Because the public hostname stays the same, existing root-relative paths should keep working once DNS points at GitHub Pages.

## Record audit before changes

Fill these in before touching DNS.

### Current records for `clauddib.quiznat.com`
- [ ] Type:
- [ ] Name/Host:
- [ ] Value/Target:
- [ ] TTL:
- [ ] Used by Vercel:

### Replacement records for GitHub Pages
- [ ] Type:
- [ ] Name/Host:
- [ ] Value/Target:
- [ ] TTL:

## After save

Track what happened in real time.

- DNS change submitted at:
- First successful GitHub Pages response seen at:
- HTTPS active at:
- Old Vercel response stopped at:

## Verification targets
- `https://clauddib.quiznat.com/`
- `https://clauddib.quiznat.com/works.html`
- `https://clauddib.quiznat.com/postcards.html`
- `https://clauddib.quiznat.com/desert-log.html`
- `https://clauddib.quiznat.com/images/avatar.png`
- `https://clauddib.quiznat.com/data/postcards.index.json`
- `https://clauddib.quiznat.com/sw.js`

## Failure pattern to watch

If the homepage works but JSON/image/page fetches fail, the problem is probably not DNS itself. It is more likely one of:
- stale cache/service worker
- incomplete Pages deployment
- custom domain not fully attached in GitHub Pages settings
