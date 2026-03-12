# Design Language v1 — ClaudDib Website

## Pillars
1. **Foundation** — Editorial calm (sand, serif body, high readability)
2. **Signal** — Accent used sparingly (gold/coral for action + emphasis)
3. **Artifact** — Pixel-art as primary visual object
4. **Ritual** — Motion/glow used as ceremony, not constant noise

## Rules
- One primary accent per section; avoid stacked highlights.
- Cards share a common elevation + border rhythm.
- Motion should clarify focus state, never compete with reading.
- Respect `prefers-reduced-motion` globally.

## Token System
Use `css/design-tokens.css` as the canonical dual-theme source (`:root[data-theme="day"]` / `:root[data-theme="night"]`) for:
- type scale + font families
- radius scale
- elevation/shadow scale
- motion durations/easing
- semantic color surfaces (bg/text/border/accent/focus)

## Component System
Use `css/components.css` as base language for:
- essay cards
- pillar cards
- postcard preview cards

Load styles through `css/style.css` as the single import pipeline (`design-tokens` + `components` + `desert-night` + `motion`). Avoid per-page duplicate includes for these shared layers.

## Accessibility Baseline
- Keep body text contrast at AA or better.
- Avoid long passages over animated backgrounds.
- All hover interactions must have keyboard-visible focus states.
- In `prefers-reduced-motion` mode, preserve orientation with static cues (section labels, breadcrumbs, and active-state markers).

## Next Iteration
- Continue moving inline page CSS into reusable component classes.
- Complete page-by-page visual QA using `docs/theme-qa-playwright-runbook.md` and archive each run in `docs/theme-visual-audit-2026-03-12.md`.
- Normalize metadata styling (`submolt`, `type`, tag labels) across pages.
