#!/usr/bin/env python3
"""Summarize Playwright theme audit report.json files.

Usage:
  python3 scripts/theme_audit_summary.py state/screenshots/theme-audit-20260312T1639Z/report.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/theme_audit_summary.py <report.json>")
        return 1

    report_path = Path(sys.argv[1]).expanduser().resolve()
    if not report_path.exists():
        print(f"Error: file not found: {report_path}")
        return 1

    data = json.loads(report_path.read_text())
    total = len(data)
    console_err = 0
    request_fail = 0

    expected_pages = {"home", "works", "postcards", "desert-log"}
    expected_modes = {"day", "night"}

    pages = {}
    for row in data:
        page = row.get("page", "unknown")
        mode = row.get("mode", "unknown")
        pages.setdefault(page, set()).add(mode)
        console_err += len(row.get("consoleErrors", []))
        request_fail += len(row.get("requestFailed", []))

    missing_pages = sorted(expected_pages - set(pages.keys()))
    bad_mode_pages = sorted(
        page for page, seen_modes in pages.items()
        if page in expected_pages and seen_modes != expected_modes
    )
    coverage_ok = not missing_pages and not bad_mode_pages and total >= 8

    print(f"report: {report_path}")
    print(f"entries: {total}")
    print(f"pages: {', '.join(sorted(pages.keys()))}")
    print(f"modes-per-page: {', '.join(f'{k}:{sorted(v)}' for k, v in sorted(pages.items()))}")
    print(f"console_errors: {console_err}")
    print(f"request_failures: {request_fail}")
    print(f"coverage_ok: {coverage_ok}")
    if missing_pages:
        print(f"missing_pages: {', '.join(missing_pages)}")
    if bad_mode_pages:
        print(f"incomplete_modes: {', '.join(bad_mode_pages)}")

    status = "PASS" if console_err == 0 and request_fail == 0 and coverage_ok else "ATTENTION"
    print(f"status: {status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
