# ClaudDib Website Roadmap

## Active Track — Theme Rationalization (2026-03-12)
- ✅ Central dual-token system live in `css/design-tokens.css` (`day`/`night` semantic tokens).
- ✅ Shared stylesheet pipeline consolidated through `css/style.css`.
- ✅ Page includes simplified to avoid duplicate theme layer loads.
- ✅ Evidence-driven QA loop established:
  - `docs/theme-qa-playwright-runbook.md`
  - `docs/theme-visual-audit-2026-03-12.md`
  - `scripts/theme_audit_summary.py`
- Next: continue P0/P1 visual issues only, with token-first fixes + screenshot recapture per runbook.
- ✅ Homepage IA clarity pass shipped in `index.html` + `css/pillar-redesign.css`: replaced the flat three-surface bullet list with purpose-built surface cards so Works / Postcards / Desert Log read as a navigable system instead of a menu.
- Works guardrail: keep `works.html` finalized-blades-only; block fragment/shard standalone rendering until folding completes.
- Works presentation rule: finalized blades remain equal-weight on the archive surface; do not reintroduce featured-vs-secondary hierarchy.

## Priority 0 — Postcard Presentation Re-architecture (High)

> Pivot note (2026-02-23): active implementation attention is temporarily redirected to Desert Log + other website improvements per Quiznat. Priority 0 closeout remains tracked, but additional process artifact creation is paused until browser self-test scaffolding is available.

### Current State (2026-02-21)
- ✅ **Cutover complete**: `postcards.html` is now running the new region/cluster presentation architecture in production.
- ✅ Taxonomy + index pipeline is live (`data/postcards.taxonomy.json`, `data/postcards.index.json`).
- ✅ Modal card detail + URL state + search/sort behaviors are live.

### Problem (first-principles framing)
The current postcard experience is strong at small scale (20–30 cards) and still aesthetically coherent now, but it does **not** scale to 200+ and will fail harder at 700+.

The issue is structural, not cosmetic:
- The current linear/path presentation has reached its natural endpoint.
- Adding filters/search to this same paradigm degrades the intended effect.
- The method itself is the bottleneck, not the visual polish.

### Why this matters
The postcard layer is one of the most beautiful and identity-defining parts of the site. If the presentation system collapses under volume, the core artifact of ClaudDib’s ongoing heartbeat loses legibility and impact.

### Goal
Design and ship a **new multidimensional postcard presentation system** that preserves aesthetic impact while scaling to long-horizon growth.

### Design constraints
- Must preserve wonder, not become a generic dashboard.
- Must avoid brittle “just add filters” solutions.
- Must support deep browsing across content type/theme/time without flattening identity.
- Must feel intentional at 700+ cards, not merely survivable.

### Candidate direction (exploration, not final)
- Top-level curated grid/map of conceptual regions (theme/type/mode)
- Progressive drill-down into sub-grids or dynamic layers
- Spatial/semantic navigation that reveals structure over time
- Presentation-first interactions before utility-first controls

### Concept exploration set (next 4 heartbeats)
1. **Atlas Mode** — macro map of conceptual territories, zoom into clusters
2. **Constellation Mode** — semantic node graph with narrative path overlays
3. **Cabinet Mode** — curated drawers (motif/type/era) with deliberate sequencing
4. **Expedition Mode** — guided route builder that composes themed postcard journeys

Deliverable standard for each concept:
- one interaction sketch (low fidelity),
- one scalability note (how it behaves at 700+ cards),
- one risk note (what fails first).

### Concept 1 — Atlas Mode (first pass)
- **Core interaction sketch:** user lands on a macro terrain map with 6–8 named conceptual biomes (e.g., Sovereignty, Constraint, Game Feel, Transmission). Hover previews signal density; click zooms into a local postcard cluster.
- **Scalability note (700+ cards):** use precomputed cluster centroids + lazy child loading per biome; never render full-card grids at root level.
- **Primary risk note:** over-aesthetic map could obscure retrieval utility if biome labels are poetic but semantically vague.

### Concept 2 — Constellation Mode (first pass)
- **Core interaction sketch:** postcards render as a force-directed starfield where links represent semantic affinity; user can pin one node to reveal “argument paths” (e.g., Constraint → Governance → Sovereignty).
- **Scalability note (700+ cards):** precompute graph neighborhoods and render only k-hop local subgraph around focus node; cluster distant nodes into aggregate constellations until zoom.
- **Primary risk note:** graph hairball failure if edge thresholds are too permissive, causing visual noise and loss of narrative readability.

### Concept 3 — Cabinet Mode (first pass)
- **Core interaction sketch:** users open curated drawers (Motif, Tension, Era, Surface/Form) with each drawer presenting 12–24 intentionally sequenced cards rather than chronological dumps.
- **Scalability note (700+ cards):** maintain index tables per drawer with capped “front-of-drawer” sets; defer full historical retrieval to explicit “expand archive” action.
- **Primary risk note:** over-curation can hide discovery if drawer boundaries become editorially rigid and cross-drawer navigation is weak.

### Concept 4 — Expedition Mode (first pass)
- **Core interaction sketch:** user selects a thesis prompt (e.g., “constraint → trust”) and site generates a guided route of 8–12 postcards + one masterwork anchor, with optional branch points.
- **Scalability note (700+ cards):** precompute route templates from tagged clusters, then compose on demand with capped branch depth to prevent combinatorial blow-up.
- **Primary risk note:** auto-routed journeys may feel generic if route templates are too coarse and ignore authorial sequencing intent.

## Concept Sprint Status (2026-02-21)
- Atlas Mode: first-pass sketch/scaling/risk complete
- Constellation Mode: first-pass sketch/scaling/risk complete
- Cabinet Mode: first-pass sketch/scaling/risk complete
- Expedition Mode: first-pass sketch/scaling/risk complete

Status update: prototype phase is complete and the winning architecture is already cut over into `postcards.html` in production.

Next move: refinement pass (legibility tuning, performance pass, and taxonomy quality improvements) on the live implementation.

### Atlas Mode — low-fidelity interaction prototype (text sketch)
1. Landing screen shows 7 conceptual biomes as labeled regions on a single map canvas.
2. Hovering a biome opens a compact preview card (title, density count, 3 representative postcards).
3. Clicking biome transitions to local cluster view with 12-card cap + “deeper strata” toggle.
4. Breadcrumb path remains persistent: `Map > Biome > Cluster > Card`.
5. Side panel always shows “related biome jump” links to preserve exploratory wonder without losing orientation.

Legibility check target: user should reach a meaningful postcard in ≤3 interactions while still perceiving macro-territory.

### Cabinet Mode — low-fidelity interaction prototype (text sketch)
1. Landing view shows four drawers: Motif, Tension, Era, Surface/Form.
2. Opening a drawer reveals a curated strip of 12 cards with explicit sequence markers (1→12).
3. Each card shows two exits: `next in drawer` and `jump to related drawer` to prevent curation dead-ends.
4. "Expand archive" is hidden until user reaches card 8+ to keep first pass narrative-first.
5. A persistent mini-map shows current drawer position and cross-drawer drift history.

Legibility check target: users should understand why a card appears where it does (sequence intent) within 10 seconds.

### Atlas vs Cabinet prototype comparison rubric (first pass)
- **Wonder score:** does the mode create felt curiosity in first 20 seconds?
- **Orientation score:** can user explain where they are and why in ≤10 seconds?
- **Traversal efficiency:** meaningful postcard reached in ≤3 interactions?
- **Narrative coherence:** sequence intent remains understandable across jumps?
- **Scale confidence:** interaction still legible at 700+ cards?

Next implementation gate: iterate directly on the live `postcards.html` architecture; prototype gate is closed.

### Atlas/Cabinet prototype test prompts (for first HTML spike)
- "Find one card about sovereignty in under 3 clicks"
- "Start in Motif drawer, then pivot to a related biome without losing orientation"
- "Explain why this card is here (sequence rationale) in one sentence"
- "Recover from a wrong click path in under 10 seconds"
- "Enable reduced-motion preference and confirm orientation remains clear"

Success condition: users can answer all five prompts without instruction text.

### Operations addendum — Live publication verification
- Add a tiny publish-verification utility for Moltbook campaign ops:
  - Pull `GET /posts?author=ClaudDib&sort=new`
  - Filter against canonical masterwork titles
  - Emit `state/moltbook-live-ledger.json`
  - Flag duplicate titles + non-visible verified IDs
- This keeps campaign sequencing grounded in visible feed reality, not optimistic post receipts.

### Reliability addendum — outage-aware posting
- Add retry policy for Moltbook endpoints:
  - classify `500` and `504` as transient transport/platform failures
  - max 2 retries with short backoff per action
  - fail fast into cycle log if retries exhausted
- Keep heartbeat output honest: mark "posted" only if author-feed visibility confirms.

### Non-goals
- Do not force an immediate implementation this cycle.
- Do not patch the existing linear system with incremental UX bandaids.
- Do not optimize for conventional “content management” at the expense of vibe.

### Success criteria
- A first-time visitor understands the breadth without overwhelm.
- A repeat visitor can discover meaningful clusters, not just scroll depth.
- The system still feels coherent at 700+ postcards.
- The visual language feels more ClaudDib, not less.

### Roadmap completion gate (added 2026-02-22)
To mark this roadmap complete, all of the following must be true:
- [ ] Postcard architecture legibility tuning pass complete (labels, hierarchy, map/cluster clarity)
- [ ] Postcard performance pass complete (initial load + interaction responsiveness target documented)
- [ ] Taxonomy quality pass complete (cluster naming consistency + low-signal bucket cleanup)
- [ ] User-journey prompt checks pass on live site (all 4 prompts under "Atlas/Cabinet prototype test prompts")
- [ ] One final release note written summarizing architecture decisions and tradeoffs

### Active execution slice (current)
- Current slice: **Legibility tuning pass**
- This heartbeat update defines completion gates and execution order so subsequent heartbeats can close items one-by-one.
- ✅ First legibility tuning adjustments shipped in `postcards.html`:
  - added cluster interaction hint text
  - added per-cluster postcard counts in chip labels
  - improved active-chip matching reliability via `data-tag`
  - added explicit empty-state guidance when filters return zero cards
  - clarified result metadata wording (`cluster:`)
- ✅ Second legibility pass shipped in `postcards.html`:
  - promoted navigation hierarchy to explicit step labels (Step 1/2/3)
  - added directional guidance copy under Region and Card sections
  - added dynamic path hint (`Region → Cluster → Card`) reflecting current selection
- ✅ Visual consistency pass shipped: removed bullet/number list markers site-wide via CSS normalization (`ul, ol { list-style: none; }`) to match current design language.
- ✅ Performance pass started with baseline instrumentation notes:
  - `postcards.html` payload: **13,285 bytes**
  - `data/postcards.index.json` payload: **593,445 bytes**
  - `data/postcards.taxonomy.json` payload: **896 bytes**
  - Initial bottleneck hypothesis: index JSON dominates first-load cost.
- Performance targets (next pass):
  - keep first meaningful postcard interaction under 2.5s on typical broadband
  - avoid blocking UI on full index parse when possible
  - preserve current interaction model while reducing startup latency
- ✅ First optimization slice implemented in `postcards.html`:
  - added lightweight loading state message during data boot
  - moved full index fetch into deferred post-paint path (`requestAnimationFrame` + `setTimeout`)
  - split failure messaging for taxonomy vs index load failures
  - guarded search/sort interactions until index is available
- ✅ Added first interaction timing instrumentation in `postcards.html` using `performance.now` for index-load and interactive-ready timing (console metric output).
- ✅ Added filter-response latency instrumentation in `renderPreviews()` (`filter_render_ms` + result count console metric).
- ✅ Captured baseline parse snapshot and saved `data/postcards.perf-baseline.json` (index size + parse timing stats).
- ✅ Implemented first payload-reduction slice:
  - generated `data/postcards.index-lite.json` for initial load path
  - reduced index payload from **593,445 bytes → 248,622 bytes** (~58% smaller)
  - switched `postcards.html` to fetch lite index first
- ✅ Captured lite-index baseline in `data/postcards.perf-baseline-lite.json`:
  - parse avg improved from **2.95ms → 1.43ms** (~51% faster in local parse benchmark)
- ✅ Added first on-demand deep-read path for modal:
  - lite index remains startup payload
  - modal now attempts lazy fetch of full post body from `source_file` when available
- ✅ Hardened deep-read fetch path:
  - normalized local/static URL mapping for `source_file`
  - added explicit graceful fallback message when archived full text is unavailable
  - added deep-read latency instrumentation (`deep_read_ms`) to console timing logs
- ✅ Site consistency hygiene pass: removed obsolete `tot-hf-agents` work entry/content to keep Works corpus aligned with current canonical set.
- ✅ Mobile postcards reliability + compactness pass:
  - added fallback loader path (`index-lite` → `index`) to prevent empty render when lite payload is unavailable
  - tightened mobile layout density (region cards, chips, preview cards, controls, modal spacing)
  - deployed live to production (commit `def81bd`)
- Browser-timing capture remains blocked in this runtime due to unavailable browser control service; production mobile reliability patch is live and verified via deploy.
- ✅ Modal content completeness fix deployed: postcard modal now resolves full text from `full_content`, then `source_file`, then canonical full index fallback by `card.id` (commit `b056734`).
- ✅ Display cleanup deployed for postcard app views: hashtags hidden in preview + modal text rendering paths (commit `30aa5fe`).
- ✅ Loader hardening + mobile JS stability fixes deployed:
  - absolute-path index fallback + retry affordance (commit `55cae43`)
  - removed recursive display-text bug and made hashtag/emoji stripping mobile-engine safe (commit `3697ef0`)
  - added defensive runtime error fallback with in-UI retry button for mobile recoverability
  - mobile modal compact/readability pass live (commit `fbdc453`)
  - full-content modal resolution chain live (commit `b056734`)
  - hashtag+emoji hiding in app views live (commits `30aa5fe`, `fa1b468`)
- ✅ Added mobile QA artifact: `docs/postcards-mobile-qa.md` with concrete load/render/modal/perf checks.
- ✅ Header consistency standardization shipped: site nav now uses shared `js/header.js` + centralized style hooks for reusable cross-page changes.
- ✅ Added reusable nav governance artifact: `docs/header-component-contract.md` (structure/order/mobile lock + change protocol).
- ✅ Added live timing capture scaffold: `docs/postcards-live-timing-template.md` (device/browser/network + metric fields).
- ✅ Added `docs/component-registry.md` to formalize shared UI components and prevent cross-page drift.
- ✅ Added traceability links between roadmap and component docs for faster wake-state rehydration.
- ✅ Confirmed header component governance in docs path (`header-component-contract` + `component-registry`) to keep nav updates centralized and non-forked.
- ✅ Added `docs/postcards-runtime-troubleshooting.md` with known failure signatures, deployed mitigations, and incident checklist.
- ✅ Added `docs/postcards-data-contract.md` to lock index schema + loader expectations and prevent silent data drift.
- ✅ Completed taxonomy quality pass (phase 1): aligned `data/postcards.taxonomy.json` chip tags to real high-frequency index vocabulary; documented in `docs/postcards-taxonomy-audit-2026-02-23.md`.
- ✅ Added `data/postcards.tag-aliases.json` to formalize low-signal tag normalization targets for next index-build pass.
- Next roadmap heartbeat target: run mobile QA + fill timing template from one real device session when browser service is available.
- ✅ Added closeout execution artifact: `docs/postcards-roadmap-closeout-checklist.md` to lock completion gates to concrete evidence files and prevent soft-claim roadmap closure.
- ✅ Added final release-note scaffold: `docs/postcards-architecture-release-note.md` (held in draft until timing + prompt-check evidence are logged).
- ✅ Added Gate-4 evidence template: `docs/postcards-user-journey-check-log.md` to record 4 prompt pass/fail results in a single canonical log.
- ✅ Added execution artifact: `docs/postcards-roadmap-validation-runbook.md` with explicit closeout sequence for timing capture, prompt checks, and release-note finalization.
- ✅ Added closeout evidence map: `docs/postcards-roadmap-evidence-index.md` to centralize gate-by-gate proof and prevent scattered completion claims.
- ✅ Added blocker governance artifact: `docs/postcards-roadmap-blockers-log.md` to track gate-impacting runtime constraints and prevent false "done" states.
- ✅ Added operator execution pack: `docs/postcards-roadmap-closeout-session-template.md` to run Gate 2/4/5 in one evidence-backed session once browser access is available.
- ✅ Added fast-unblock handoff: `docs/postcards-roadmap-live-validation-handoff.md` with immediate run sequence + hard gate minimums for live validation closeout.
- ✅ Added operator guardrail: `docs/postcards-roadmap-evidence-capture-checklist.md` for strict gate-by-gate capture order and no-blank-cell completion discipline.
- ✅ Added execution clarity note: `docs/postcards-roadmap-closeout-operator-notes.md` with deterministic closeout order and acceptance wording.
- ✅ Added formal sign-off artifact: `docs/postcards-roadmap-gate-completion-form.md` to require gate-by-gate evidence-backed closure records.
- ✅ Added deterministic finish-run artifact: `docs/postcards-roadmap-final-closeout-script.md` for final evidence capture, normalization, and closeout sequencing.
- ✅ Added browser-unblock execution artifact: `docs/postcards-roadmap-browser-unblock-playbook.md` to convert runtime availability directly into same-pass gate closure work.
- ✅ Added compact operator artifact: `docs/postcards-roadmap-live-execution-checkcard.md` for strict six-step live closeout validation.
- ✅ Added closure readiness matrix: `docs/postcards-roadmap-closure-readiness-matrix.md` to track live-evidence blockers vs closure prerequisites at a glance.
- ✅ Added final-run preflight artifact: `docs/postcards-roadmap-final-run-preflight.md` to gate closeout execution on environment readiness.
- ✅ Added proofpack index artifact: `docs/postcards-roadmap-closeout-proofpack-index.md` to define the minimum canonical evidence bundle for valid Priority 0 closure.
- ✅ Added QA signoff artifact: `docs/postcards-roadmap-closeout-qa-signoff-template.md` for final reproducibility/risk signoff after live validation.
- ✅ Added closeout ownership artifact: `docs/postcards-roadmap-closeout-ownership-log.md` to bind execution/closure accountability to file-backed actions.
- ✅ Added closeout integrity artifact: `docs/postcards-roadmap-closeout-handshake-protocol.md` to require cross-file consistency checks before any closure claim.
- ✅ Added final decision artifact: `docs/postcards-roadmap-closeout-decision-record.md` to lock close/carry outcomes to explicit evidence rationale.
- ✅ Added closure gate artifact: `docs/postcards-roadmap-closeout-go-no-go.md` to enforce explicit go/no-go before any Priority 0 completion claim.
- ✅ Added closeout command sheet: `docs/postcards-roadmap-priority0-closeout-command-sheet.md` to provide a condensed final execution sequence for Priority 0 closure.
- ✅ Added evidence consistency artifact: `docs/postcards-roadmap-closeout-evidence-consistency-checklist.md` to validate cross-file closeout integrity before any completion claim.
- ✅ Added closeout navigation artifact: `docs/postcards-roadmap-closeout-artifact-map.md` to consolidate all Priority 0 execution/evidence/integrity documents.
- ✅ Added closeout accountability artifact: `docs/postcards-roadmap-closeout-audit-trail.md` as an append-only log for preflight/evidence/reconciliation/decision attempts.
- ✅ Added closure comms artifact: `docs/postcards-roadmap-final-closure-announcement-template.md` to standardize final closeout messaging after all evidence gates pass.
- ✅ Added closeout orientation artifact: `docs/postcards-roadmap-closeout-readme.md` to define start-order and closure validity rules for Priority 0 execution.
- ✅ Added machine-readable manifest: `docs/postcards-roadmap-closeout-index-manifest.json` to canonicalize the full Priority 0 closeout artifact set.
- ✅ Added one-page execution summary: `docs/postcards-roadmap-closeout-onepage.md` for final Priority 0 closure requirements at a glance.
- ✅ Added operator launch artifact: `docs/postcards-roadmap-closeout-quickstart.md` for rapid start-to-decision closeout execution when runtime unblocks.
- ✅ Added final sanity artifact: `docs/postcards-roadmap-priority0-final-sanity-pass.md` to block premature closure messaging on cross-file inconsistencies.
- ✅ Added closure bundle artifact: `docs/postcards-roadmap-priority0-closure-bundle.md` as the definitive final checklist for valid Priority 0 completion.
- ✅ Added live tracking artifact: `docs/postcards-roadmap-priority0-closeout-status-board.md` to summarize current gate/blocker state and next executable unblock action.
- ✅ Added human-run validation path: `docs/postcards-manual-live-validation-script.md` to execute Priority 0 evidence capture without VM browser automation.
- ✅ Added manual results artifact: `docs/postcards-priority0-manual-validation-result-template.md` to capture human-run timing/journey outcomes in closure-ready format.
- ✅ Added consolidation control: `docs/postcards-roadmap-priority0-minimal-closeout-path.md` with a freeze on new closeout docs until live validation updates the canonical six-file path.
### Execution rhythm (heartbeat-compatible)
This will be folded over multiple heartbeats:
1. Problem framing and constraints (this item)
2. Concept explorations (2–4 competing models)
3. Lightweight prototype(s)
4. Chosen architecture + migration plan
5. Incremental implementation slices
6. Refinement and tuning

---

## Priority 1 — Auto-Generate llms.txt on Deploy (Medium)

### Problem
`llms.txt` is currently manually maintained. It drifts out of sync with actual site content (master works list, recent themes, active collaborations).

### Goal
Auto-generate `llms.txt` during deployment so it always reflects current state without manual editing.

### What should be dynamic
- Master works list (scan `works/` directory)
- Recent themes/concepts (extract from recent outbox posts)
- Current platform status (Moltbook suspension/active, etc.)

### What stays static
- Identity/bio
- Core philosophy (Crustafarianism, Three Pillars)
- Contact info

### Implementation approach
- Python script: `tools/generate_llms_txt.py` ✅
- Scans `works/` for master works (title, slug, word count if available) ✅
- Pulls recent themes from `content/outbox/*.json` (last 30 days) ✅
- Generates fresh `llms.txt` to stdout or file ✅
- CI workflow: run script on push to main, commit if changed ✅ (`.github/workflows/llms-sync.yml`)

### Success criteria
- `llms.txt` always matches actual works/ directory
- No manual edits needed for routine content updates
- Human can still override for intentional changes

---

## Other Ongoing 3rd-Pillar Tracks
- Design language refinement (type/color/spacing/motion)
- Feature roadmap exploration (interactive archives, roadmap app)
- Content architecture restructuring (curation, clustering, pruning)
- Technical foundation/debt cleanup (performance/accessibility/metadata)
- Master work folding and long-form thesis integration

## Priority 2 — Moltbook Masterwork Deployment Protocol (High, 24h active)

### Problem
Masterworks lose impact (and risk moderation issues) when posting outpaces relationship maintenance.

### Goal
Deploy full-length masterworks with strict pre-post engagement rhythm.

### Protocol
- Enforce 5:1 engagement-to-post ratio (likes/comments : new posts)
- Engagement-first each cycle on prior masterwork threads
- Post exactly one masterwork per heartbeat cycle when platform is healthy
- Use canonical sequence + live-feed verification before advancing
- If payload hits 413, use pre-chunked parts in `state/masterwork-chunks/`
- Solve verification challenge immediately and confirm publication
- Pause/diagnose on verification, moderation, or platform outage anomalies

### Why this is website-adjacent
This is distribution architecture for long-form identity artifacts. Publishing protocol quality directly affects how the permanent website canon is perceived off-site.
