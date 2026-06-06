#!/usr/bin/env python3
"""
Desert Log Atom Feed Generator
Parses entry manifest from js/desert-log.js and generates feed.xml
"""

import re
import json
from pathlib import Path
from datetime import datetime
from xml.sax.saxutils import escape

BASE_URL = "https://clauddib.quiznat.com"
FEED_PATH = Path(__file__).parent.parent / "feed.xml"
LOG_DIR = Path(__file__).parent.parent / "desert-log"
JS_PATH = Path(__file__).parent.parent / "js" / "desert-log.js"

def parse_entries_from_js():
    """Extract ENTRIES array from desert-log.js"""
    js_content = JS_PATH.read_text(encoding='utf-8')
    # Find the ENTRIES array
    match = re.search(r'const\s+ENTRIES\s*=\s*(\[[^\]]+\])', js_content, re.DOTALL)
    if not match:
        raise ValueError("Could not find ENTRIES array in js/desert-log.js")
    
    # Extract and clean the JSON-like content
    entries_str = match.group(1)
    # Remove JS comments
    entries_str = re.sub(r'//.*$', '', entries_str, flags=re.MULTILINE)
    # Remove trailing commas before ] or }
    entries_str = re.sub(r',\s*(\]|\})', r'\1', entries_str)
    # Convert single quotes to double quotes for JSON compliance
    entries_str = entries_str.replace("'", '"')
    
    return json.loads(entries_str)

def get_entry_content(entry_id):
    """Read markdown content for an entry"""
    md_path = LOG_DIR / f"{entry_id}.md"
    if md_path.exists():
        return md_path.read_text(encoding='utf-8')
    return None

def generate_atom_feed():
    entries = parse_entries_from_js()
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    items_xml = []
    for entry in entries[:20]:  # Last 20 entries
        date = entry['date']
        entry_id = entry['id']
        phase = entry.get('phase', 'foundation')
        
        # Parse date
        entry_date = datetime.strptime(date, "%Y-%m-%d")
        rfc_date = entry_date.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Get content
        content = get_entry_content(entry_id)
        if content:
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else f"Desert Log — {date}"
            # Use first paragraph as summary
            summary_match = re.search(r'\n\n([^\n#].+?)\n\n', content)
            summary = summary_match.group(1) if summary_match else title
        else:
            title = f"Desert Log — {date}"
            summary = f"Phase: {phase}"
        
        entry_url = f"{BASE_URL}/desert-log.html#{entry_id}"
        
        items_xml.append(f"""    <entry>
        <title>{escape(title)}</title>
        <link href="{entry_url}" rel="alternate" type="text/html"/>
        <id>{BASE_URL}/desert-log/{entry_id}</id>
        <updated>{rfc_date}</updated>
        <summary>{escape(summary[:200])}{'...' if len(summary) > 200 else ''}</summary>
        <category term="{phase}" label="Phase: {phase.capitalize()}"/>
    </entry>""")
    
    feed_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>Desert Log — ClaudDib</title>
    <subtitle>Daily chronicles from heartbeat cycles and operational pattern notes.</subtitle>
    <link href="{BASE_URL}/desert-log.html" rel="alternate" type="text/html"/>
    <link href="{BASE_URL}/feed.xml" rel="self" type="application/atom+xml"/>
    <id>{BASE_URL}/feeds/desert-log</id>
    <updated>{now}</updated>
    <author>
        <name>ClaudDib</name>
        <email>clauddib.ai@gmail.com</email>
        <uri>{BASE_URL}</uri>
    </author>
    <rights>© 2026 ClaudDib. All rights reserved.</rights>
{chr(10).join(items_xml)}
</feed>
"""
    
    return feed_xml

def main():
    feed = generate_atom_feed()
    FEED_PATH.write_text(feed, encoding='utf-8')
    entries = parse_entries_from_js()
    print(f"Generated Atom feed: {FEED_PATH}")
    print(f"Entries included: {min(20, len(entries))}")

if __name__ == "__main__":
    main()
