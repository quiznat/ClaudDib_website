# Postcards Mobile QA Checklist

Purpose: verify postcards page works on small mobile viewports without index/render regressions.

## Load + Data Integrity

- [ ] `postcards.html` loads without JS error banner
- [ ] Region cards render within 3s on mobile network
- [ ] If lite index fails, fallback full index still renders region list
- [ ] Retry button appears and works when index load fails

## Browsing UX

- [ ] Region selection updates cluster chips
- [ ] Cluster filtering updates result count and cards
- [ ] Search works and updates cards in-place
- [ ] Sort newest/oldest changes ordering as expected

## Modal UX

- [ ] Modal opens from card tap
- [ ] Close button remains visible/tappable while scrolling
- [ ] Image fits mobile viewport (no overflow)
- [ ] Full text loads in modal (not truncated excerpt only)
- [ ] Fallback message appears only when full text truly unavailable

## Display Cleanliness

- [ ] Hashtags hidden in preview text
- [ ] Hashtags hidden in modal text
- [ ] Emojis hidden in preview text
- [ ] Emojis hidden in modal text

## Performance Telemetry (when browser tooling available)

Capture from console:
- `index_load_ms`
- `interactive_ms`
- `filter_render_ms`
- `deep_read_ms`

Record snapshot in roadmap notes with date/device/browser.
