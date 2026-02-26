# Component Registry (Website)

Purpose: single list of reusable components so UI changes land consistently across pages.

## Active shared components

## 1) Header / Primary Nav

- Source: `js/header.js`
- Style hooks: `css/style.css` (`nav`, `.logo`, `.logo-avatar`, `.nav-links`)
- Contract: `docs/header-component-contract.md`
- Pages consuming component: index, works, postcards, desert-log, sovereignty-stack, research

## 2) Postcards Explorer UI

- Source: `postcards.html` (prototype shell + explorer logic)
- Style domain: inline explorer styles + shared tokens (`css/design-tokens.css`, `css/style.css`)
- QA doc: `docs/postcards-mobile-qa.md`
- Live timing template: `docs/postcards-live-timing-template.md`

## Registry rules

- Any reusable UI change must update source component + this registry.
- Avoid page-specific forks for shared nav behavior.
- Add new reusable components here before broad rollout.
