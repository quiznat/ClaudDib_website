# Theme QA Playwright Runbook

## Purpose
Run reproducible day/night screenshot captures for core surfaces after any theme-token change.

## Pages
- `/`
- `/works.html`
- `/postcards.html`
- `/desert-log.html`

## Capture script
From `clauddib-website/` run:

```bash
node - <<'NODE'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async() => {
  const stamp = new Date().toISOString().replace(/[:.]/g,'').slice(0,15) + 'Z';
  const outDir = `/home/clawdbot/.openclaw/workspace/state/screenshots/theme-audit-${stamp}`;
  fs.mkdirSync(outDir, { recursive: true });
  const pages = [
    ['home','https://clauddib.quiznat.com/'],
    ['works','https://clauddib.quiznat.com/works.html'],
    ['postcards','https://clauddib.quiznat.com/postcards.html'],
    ['desert-log','https://clauddib.quiznat.com/desert-log.html'],
  ];
  const browser = await chromium.launch({ headless:true });
  const report=[];
  for (const mode of ['day','night']) {
    for (const [slug,url] of pages) {
      const page = await browser.newPage({ viewport:{width:1536,height:960} });
      const errs=[]; const fails=[];
      page.on('console',m=>{ if(m.type()==='error') errs.push(m.text());});
      page.on('requestfailed',r=>fails.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText}`));
      await page.addInitScript((m)=>{
        localStorage.setItem('clauddib-theme',m);
        document.documentElement.setAttribute('data-theme',m);
      }, mode);
      await page.goto(url,{waitUntil:'networkidle'});
      await page.waitForTimeout(1000);
      const shot = path.join(outDir,`${slug}-${mode}.png`);
      await page.screenshot({path:shot, fullPage:true});
      report.push({page:slug,mode,screenshot:shot,consoleErrors:errs,requestFailed:fails});
      await page.close();
    }
  }
  fs.writeFileSync(path.join(outDir,'report.json'), JSON.stringify(report,null,2));
  console.log(outDir);
  await browser.close();
})();
NODE
```

## Pass Criteria
- `report.json` has no console errors and no failed requests.
- All four core surfaces have both day and night captures (8 total entries).
- Day/night screenshots have legible text and consistent contrast for:
  - panel body text
  - links default/hover/focus
  - chips/pills
  - code surfaces

### Severity labels
- **P0**: unreadable text / broken interaction contrast
- **P1**: muddied or inconsistent but still readable
- **P2**: polish-only mismatch

### Report format (append to audit doc)
Use this compact table for each pass:

| Page | Mode | Issue | Severity | Token fix | Screenshot ref |
|------|------|-------|----------|-----------|----------------|
| home | day | Example issue summary | P1 | `--token-name` adjusted | `theme-audit-.../home-day.png` |

### Quick visual checklist (per page, per mode)
- Header/nav readable against background
- Primary panel text comfortably readable at normal zoom
- Pill/chip controls show clear default + hover + focus states
- Footer links readable and visibly interactive
- No "muddy" low-contrast blocks in day mode
- No unintended public-repo links exposed in surface copy/footer/navigation

## Artifacts
- Save run folder under `state/screenshots/`.
- Link latest folder in `docs/theme-visual-audit-2026-03-12.md`.
- Preserve before/after conclusions in the audit doc, then keep only the latest raw screenshot folder in `state/screenshots/`.
- Treat `test-results/`, Playwright traces, videos, and failure screenshots as disposable raw output.
- Push completed website changes immediately after verification.
- Run summary helper for quick pass/fail snapshot:
  - `python3 scripts/theme_audit_summary.py ../state/screenshots/<theme-audit-folder>/report.json`
  - or via npm alias: `npm run theme:audit:summary -- ../state/screenshots/<theme-audit-folder>/report.json`
  - Require `coverage_ok: True` and `status: PASS` before marking a pass complete.

## Troubleshooting
- If OpenClaw browser control is unavailable, run this Playwright script path directly (Node + Playwright) instead of browser relay.
- If a screenshot run partially fails, keep the `report.json` and annotate missing captures rather than overwriting evidence.
