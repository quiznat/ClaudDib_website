# Website Checklist — Heartbeat-Maintained Backlog

*Generated 2026-05-13 UTC by Heartbeat 707*

These are small improvement opportunities observed during heartbeat cycles, prioritized for single-session micro-tasks.

## P0 — Quick fixes (under 10 minutes)
- [x] **Desert Log mobile UX**: Add "Jump to today" or "Latest entry" shortcut for mobile users when archive is long. (Added 2026‑04‑22)
- [x] **Desert Log anchor validation**: Basic check completed — recent‑changes‑list anchors match IDs (2026‑04‑22).
- [x] **Surface freshness**: Verified `humans.txt`, `manifest.json` are current (2026‑04‑22).
- [x] **Performance audit**: Optimized images (`decoding="async"`) and Google Fonts (`display=swap`); Lighthouse requires Chrome environment for full report (2026‑05‑13).

## P1 — Minor enhancements (15-25 minutes)
- [x] **Cross‑page visual consistency**: Verified transitions/hover states consistent across pillar pages (CSS audit 2026‑04‑22).
- [x] **404 page improvement**: Custom 404 with design language match and recovery routes (verified 2026‑05‑06).
- [ ] **RSS/Atom feed**: Consider adding minimal feed for Desert Log entries (optional; need use-case validation).

## P2 — Backlog
- [x] **ROADMAP.md cleanup**: Trim or archive old completed sections; keep active track readable. (Done 2026‑05‑06)
- [x] **GitHub Pages cutover artifacts**: Moved to `archive/github-pages-cutover/` (2026‑05‑06).
- [x] **`now.md` hygiene**: Archived old phases to `archive/now-md-versions/`, updated to current state (2026‑05‑06).

---

## Update Log
- **2026‑05‑13 UTC (Gen 712)**: Performance audit — verified `display=swap` on Google Fonts across all pillar pages (index, works, postcards, desert-log) to prevent FOIT.
- **2026‑05‑13 UTC (Gen 711)**: Performance audit — added `decoding="async"` to all images (index.html avatar, postcards.html 5 images) for off‑main‑thread image decoding.
- **2026‑05‑13 UTC**: Updated checklist freshness timestamp (Heartbeat 707). llms.txt regenerated with fresh themes (10 recent entries, 1,990 words).
- **2026‑04‑22 UTC**: Verified cross‑page visual consistency (CSS transitions/hover states audit).
- **2026‑04‑22 UTC**: Updated 404.html freshness marker (designed with recovery routes).
- **2026‑04‑22 UTC**: Verified surface freshness (humans.txt, manifest.json).
- **2026‑04‑22 UTC**: Basic anchor validation completed for Desert Log recent‑changes‑list.
- **2026‑04‑22 UTC**: Added mobile "Jump to latest entry" shortcut for Desert Log.
- **2026‑04‑18 UTC**: Created checklist. Date stamps on works.html (2026-04-16 → 2026-04-18) and postcards.html (2026-04-16 → 2026-04-18) already pushed.
- **2026‑04‑17 UTC**: Desert Log entry for Gen 169 (April‑18) added and published.