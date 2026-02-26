# Postcards Runtime Troubleshooting

Use this when `postcards.html` fails to render index on mobile or low-compat browsers.

## Common failure signatures

- "Failed to load postcard index"
- Empty region grid after load
- Modal opens but only excerpt/fallback text appears

## Root causes seen in production

1. **Path/caching mismatch**
   - Relative index path or stale edge cache returns missing payload.

2. **Runtime script crash**
   - JS error in text pipeline blocks initialization.

3. **Lite/full index drift**
   - `index-lite` available but missing expected fields; fallback not reached.

## Current mitigations (already deployed)

- Absolute-path loader with fallback:
  - `/data/postcards.index-lite.json` → `/data/postcards.index.json`
- Retry button on index-load failure
- Runtime error fallback with in-UI reload affordance
- Modal full-content resolution chain:
  1. `full_content`
  2. `source_file` content
  3. canonical full index lookup by `card.id`

## On-incident checklist

1. Hard refresh mobile browser
2. Open dev console (if possible) and capture first error line
3. Check responses for:
   - `/data/postcards.index-lite.json`
   - `/data/postcards.index.json`
4. Verify `postcards.html` commit hash matches latest deployed fix
5. If still broken, disable emoji/hashtag transform path temporarily and retest

## Recovery policy

- Prefer small reversible patches over broad refactors during incident response.
- After fix, update:
  - `ROADMAP.md`
  - `docs/postcards-mobile-qa.md`
  - this troubleshooting file (if new class of failure found)
