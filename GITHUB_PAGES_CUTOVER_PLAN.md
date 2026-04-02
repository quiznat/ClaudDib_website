# GitHub Pages Cutover Plan

Status: archived plan from the successful move of `clauddib.quiznat.com` from Vercel to GitHub Pages.
Keep this as a reference blueprint for any future host migration.

## Assumption

We are using **GitHub Pages with the custom domain `clauddib.quiznat.com`**.

That means the site will still live at the root domain, so existing root-relative paths like these should continue to work:
- `/index.html`
- `/images/avatar.png`
- `/sw.js`
- `/data/...`

This avoids the main static-site migration risk that would appear on project Pages under a subpath.

---

## What is not a blocker

These do **not** currently block cutover:
- plain static HTML/CSS/JS site
- no build step required
- root-relative nav and asset paths, **because** the public URL stays the same
- existing GitHub remote already present: `quiznat/ClaudDib_website`

---

## Real cutover risks

### 1. GitHub Pages configuration mismatch
If Pages is not enabled on the correct branch/folder, DNS can point correctly and the site still will not serve.

### 2. DNS cutover lag
The domain may resolve to old infrastructure for a while depending on TTL/cache.

### 3. Service worker stale cache
The current site registers `/sw.js`. After cutover, an old cached service worker can make the site appear partially stale even if Pages is serving correctly.

### 4. Missing custom domain binding on GitHub Pages
If `clauddib.quiznat.com` is not configured in Pages, traffic may fall through to the default GitHub Pages hostname or fail validation.

---

## Pre-cutover checklist

### GitHub repo
- [ ] Confirm repo exists and is accessible: `https://github.com/quiznat/ClaudDib_website`
- [ ] Confirm `main` contains the latest desired site state
- [ ] Confirm GitHub Pages is enabled for the repo
- [ ] Confirm Pages source is the correct branch/folder
- [ ] Confirm custom domain is set to `clauddib.quiznat.com`
- [ ] Confirm HTTPS enforcement is enabled if GitHub makes it available after domain verification

### Site content sanity
- [ ] Home page loads from repo state
- [ ] `works.html` exists and opens locally
- [ ] `postcards.html` exists and JSON fetch paths are intact
- [ ] `desert-log.html` exists and opens locally
- [ ] `404.html` is present
- [ ] `sw.js` is present
- [ ] `manifest.json` is present

### DNS readiness
- [ ] Identify current DNS records for `clauddib.quiznat.com`
- [ ] Note what must be removed or replaced from the Vercel setup
- [ ] Prepare the GitHub Pages DNS target values before touching live DNS
- [ ] If possible, lower TTL ahead of cutover to reduce propagation delay

---

## Cutover sequence

### Phase 1 — Turn on Pages
1. Open the GitHub repo settings.
2. Enable GitHub Pages on the intended source.
3. Set custom domain to `clauddib.quiznat.com`.
4. Wait for GitHub to acknowledge/build the Pages deployment.
5. Confirm the Pages hostname works before DNS cutover if GitHub exposes one.

### Phase 2 — Repoint DNS
1. Remove or replace the DNS records currently targeting Vercel.
2. Add the DNS records GitHub Pages requires for `clauddib.quiznat.com`.
3. Save changes.
4. Wait for propagation.

### Phase 3 — Verify live site after DNS change
Check these in a normal browser window:
- [ ] `https://clauddib.quiznat.com/`
- [ ] `https://clauddib.quiznat.com/works.html`
- [ ] `https://clauddib.quiznat.com/postcards.html`
- [ ] `https://clauddib.quiznat.com/desert-log.html`
- [ ] `https://clauddib.quiznat.com/sw.js`
- [ ] `https://clauddib.quiznat.com/manifest.json`
- [ ] one image path such as `https://clauddib.quiznat.com/images/avatar.png`
- [ ] one JSON path such as `https://clauddib.quiznat.com/data/postcards.index.json`

---

## Service worker verification

Because the site uses a service worker, do this after cutover:

### Fast check
- [ ] Hard refresh the site
- [ ] Open an incognito/private window and load the site
- [ ] Confirm the new host serves current content there too

### If the site looks stale
Use browser devtools:
- unregister the service worker
- clear site storage/cache for `clauddib.quiznat.com`
- reload and test again

If stale-cache problems show up for real, the next fix is to bump the service worker cache name and redeploy.

---

## Rollback plan

If GitHub Pages does not come up cleanly:
1. Repoint DNS back to the Vercel values.
2. Verify the old host serves again.
3. Fix Pages config or domain binding.
4. Retry cutover only after the Pages endpoint is confirmed.

---

## Success criteria

The cutover is done when all are true:
- `clauddib.quiznat.com` resolves to GitHub Pages
- main pages load successfully
- image and JSON asset paths resolve
- no obvious stale-cache mismatch remains
- HTTPS is active
- Vercel is no longer needed for serving this domain

---

## Operator note

Because the public hostname stays the same, this migration is mostly an **infrastructure cutover**, not a site rewrite.

The invisible opponent here is stale state:
- stale DNS
- stale GitHub Pages settings
- stale service worker cache

So the move should be treated as:
**Pages config → DNS repoint → cache sanity check → done**
