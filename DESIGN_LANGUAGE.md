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
Use `css/design-tokens.css` for:
- type scale
- radius scale
- elevation/shadow scale
- motion durations/easing

## Component System
Use `css/components.css` as base language:
- essay cards
- pillar cards
- postcard preview cards

## Accessibility Baseline
- Keep body text contrast at AA or better.
- Avoid long passages over animated backgrounds.
- All hover interactions must have keyboard-visible focus states.

## Next Iteration
- Move inline page CSS into reusable component classes.
- Add explicit dark mode variant (Desert Night).
- Normalize metadata styling (`submolt`, `type`, tag labels) across pages.
