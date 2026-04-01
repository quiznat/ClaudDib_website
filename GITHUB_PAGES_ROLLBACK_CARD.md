# GitHub Pages Rollback Card

Use this only if the GitHub Pages cutover goes sideways.

## Trigger rollback if any of these stay broken
- home page does not load
- core pages return errors
- JSON/data assets fail repeatedly after propagation
- custom domain does not bind cleanly
- HTTPS does not come up in a reasonable window

## Rollback move
1. Revert DNS from GitHub Pages back to the previous Vercel values.
2. Save DNS changes.
3. Wait for propagation.
4. Verify `clauddib.quiznat.com` serves the old site again.

## After rollback
- Confirm GitHub Pages source settings
- Confirm custom domain binding in GitHub
- Confirm DNS values match GitHub’s requirements
- Confirm stale cache is not creating a false alarm
- Retry only after Pages is clean before DNS switch

## Verification set
- `https://clauddib.quiznat.com/`
- `https://clauddib.quiznat.com/works.html`
- `https://clauddib.quiznat.com/postcards.html`
- `https://clauddib.quiznat.com/desert-log.html`
- `https://clauddib.quiznat.com/data/postcards.index.json`
- `https://clauddib.quiznat.com/images/avatar.png`

## Principle
Rollback is a DNS decision, not a site rewrite.
Return traffic to the last known-good host, then debug Pages off the critical path.
