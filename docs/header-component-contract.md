# Header Component Contract

Purpose: keep top navigation behavior consistent across all pages via one shared component (`js/header.js`).

## Source of truth

- Component: `js/header.js`
- Primary style hooks: `css/style.css`

## Required nav structure

- Home icon link (`a.logo`) points to `index.html`
- Wordmark (`.logo .name`) hidden on mobile viewport
- Primary links in this order:
  1. Works
  2. Postcards
  3. Desert Log
- Theme toggle button as last nav item

## Change protocol

1. Update `js/header.js` first (structure)
2. Update `css/style.css` (shared visual behavior)
3. Validate on:
   - `index.html`
   - `works.html`
   - `postcards.html`
   - `desert-log.html`
   - `sovereignty-stack.html`
4. Record change in `ROADMAP.md`

## Mobile lock

- Keep icon-first home treatment
- Avoid introducing per-page nav forks
- Any nav change should be component-level, not page-level
