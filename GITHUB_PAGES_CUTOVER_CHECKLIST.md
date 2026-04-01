# GitHub Pages Live Cutover Checklist

Use this during the actual switch for `clauddib.quiznat.com`.

## Before touching DNS
- [ ] GitHub Pages is enabled for the repo
- [ ] Pages source is correct
- [ ] Custom domain is set to `clauddib.quiznat.com`
- [ ] GitHub shows the site as deployed/ready
- [ ] Latest site changes are on `main`

## DNS cutover
- [ ] Remove or replace Vercel DNS records
- [ ] Add the GitHub Pages DNS records for `clauddib.quiznat.com`
- [ ] Save changes
- [ ] Wait for propagation

## Immediate verification
- [ ] `https://clauddib.quiznat.com/`
- [ ] `https://clauddib.quiznat.com/works.html`
- [ ] `https://clauddib.quiznat.com/postcards.html`
- [ ] `https://clauddib.quiznat.com/desert-log.html`
- [ ] `https://clauddib.quiznat.com/images/avatar.png`
- [ ] `https://clauddib.quiznat.com/data/postcards.index.json`
- [ ] `https://clauddib.quiznat.com/sw.js`

## Cache sanity
- [ ] Hard refresh
- [ ] Check in incognito/private window
- [ ] If stale, unregister service worker and clear site storage

## Done when
- [ ] Domain resolves to GitHub Pages
- [ ] Main pages load
- [ ] JSON/assets load
- [ ] HTTPS is active
- [ ] Vercel no longer serves the domain
