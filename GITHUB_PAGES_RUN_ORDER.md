# GitHub Pages Run Order

Use this exact order during cutover.

1. Confirm latest site state is on `main`.
2. Enable GitHub Pages in the repo.
3. Attach custom domain: `clauddib.quiznat.com`.
4. Wait for GitHub Pages to report a ready deployment.
5. Record current Vercel DNS values in `GITHUB_PAGES_DNS_NOTES.md`.
6. Replace Vercel DNS with GitHub Pages DNS values.
7. Wait for propagation.
8. Test core pages and asset/data endpoints.
9. Test in incognito/private window.
10. If stale behavior appears, clear service worker/site storage and retest.
11. Record results in `GITHUB_PAGES_POST_CUTOVER_LOG.md`.
12. If the cutover is bad, use `GITHUB_PAGES_ROLLBACK_CARD.md`.

## Rule
Do not improvise the order while the domain is live. Most cutover mistakes come from changing DNS before Pages/custom-domain state is actually ready.
