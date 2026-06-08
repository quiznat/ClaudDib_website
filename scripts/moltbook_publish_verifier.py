#!/usr/bin/env python3
"""Moltbook Publish Verification Utility

Pulls live posts from Moltbook, validates against canonical masterworks,
emits ledger state for campaign tracking.

Source of truth: state/campaigns/*.json for canonical titles.
Output: state/moltbook-live-ledger.json
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

MOLTBOOK_API = "https://www.moltbook.com/api/v1"
STATE_DIR = Path(__file__).parent.parent / "state"
CAMPAIGNS_DIR = STATE_DIR / "campaigns"
OUTPUT_FILE = STATE_DIR / "moltbook-live-ledger.json"

def load_canonical_titles():
    """Extract canonical masterwork titles from campaign trackers."""
    titles = set()
    if not CAMPAIGNS_DIR.exists():
        return titles
    
    for campaign_file in CAMPAIGNS_DIR.glob("*.json"):
        try:
            with open(campaign_file) as f:
                data = json.load(f)
            for part in data.get("parts", []):
                if title := part.get("title"):
                    titles.add(title)
        except Exception as e:
            print(f"Warning: Could not parse {campaign_file}: {e}", file=sys.stderr)
    
    return titles

def fetch_author_posts(author="ClaudDib", limit=100):
    """Fetch recent posts from author's feed."""
    url = f"{MOLTBOOK_API}/posts"
    params = {"author": author, "sort": "new", "limit": limit}
    
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json().get("data", [])
    except requests.RequestException as e:
        print(f"Error fetching posts: {e}", file=sys.stderr)
        return []

def verify_posts(posts, canonical_titles):
    """Check posts against canonical titles and visibility."""
    verified = []
    duplicates = []
    missing = []
    
    seen_titles = {}
    
    for post in posts:
        post_id = post.get("id")
        title = post.get("title", "")
        is_visible = post.get("visibility") != "private" and not post.get("deleted_at")
        
        # Check for duplicates
        if title in seen_titles:
            duplicates.append({
                "post_id": post_id,
                "title": title,
                "first_seen_id": seen_titles[title]
            })
        else:
            seen_titles[title] = post_id
        
        # Check canonical status
        is_canonical = title in canonical_titles
        
        verified.append({
            "post_id": post_id,
            "title": title,
            "posted_at": post.get("created_at"),
            "visibility": post.get("visibility"),
            "is_visible": is_visible,
            "is_canonical": is_canonical,
            "submolt": post.get("submolt", {}).get("name") if post.get("submolt") else None
        })
    
    # Find missing canonical posts
    live_titles = {p["title"] for p in verified}
    for canon_title in canonical_titles:
        if canon_title not in live_titles:
            missing.append({"title": canon_title, "status": "not_found_in_feed"})
    
    return verified, duplicates, missing

def main():
    print("Moltbook Publish Verifier")
    print("-" * 40)
    
    # Load canonical titles from campaigns
    canonical_titles = load_canonical_titles()
    print(f"Loaded {len(canonical_titles)} canonical titles from campaigns")
    
    # Fetch live posts
    posts = fetch_author_posts()
    print(f"Fetched {len(posts)} posts from live feed")
    
    # Verify
    verified, duplicates, missing = verify_posts(posts, canonical_titles)
    
    # Build ledger
    ledger = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "moltbook_publish_verifier",
        "canonical_titles_count": len(canonical_titles),
        "live_posts_count": len(posts),
        "verified_posts": verified,
        "flags": {
            "duplicates": duplicates,
            "missing_canonical": missing,
            "non_visible_canonical": [
                v for v in verified 
                if v["is_canonical"] and not v["is_visible"]
            ]
        },
        "summary": {
            "canonical_posts_live": sum(1 for v in verified if v["is_canonical"]),
            "canonical_posts_visible": sum(1 for v in verified if v["is_canonical"] and v["is_visible"]),
            "duplicate_titles": len(duplicates),
            "missing_from_feed": len(missing)
        }
    }
    
    # Ensure state dir exists
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Write ledger
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(ledger, f, indent=2)
    
    print(f"\nLedger written to: {OUTPUT_FILE}")
    print(f"Summary: {ledger['summary']}")
    
    # Exit non-zero if issues found
    has_issues = duplicates or missing or ledger["flags"]["non_visible_canonical"]
    if has_issues:
        print("\n⚠️  Issues detected:")
        if duplicates:
            print(f"  - {len(duplicates)} duplicate titles")
        if missing:
            print(f"  - {len(missing)} canonical posts missing from feed")
        if ledger["flags"]["non_visible_canonical"]:
            print(f"  - {len(ledger['flags']['non_visible_canonical'])} canonical posts not visible")
        sys.exit(1)
    
    print("\n✅ All canonical posts verified visible")
    sys.exit(0)

if __name__ == "__main__":
    main()
