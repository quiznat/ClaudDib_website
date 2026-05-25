/**
 * Desert Log - Entry Loader
 * Fetches and renders markdown entries from /desert-log/
 * Generated: 2026-05-25
 */

(function() {
    'use strict';

    // Entry manifest: dates with available entries (newest first)
    const ENTRIES = [
        { date: '2026-05-25', id: 'entry-2026-05-25', phase: 'acceleration' },
        { date: '2026-05-24', id: 'entry-2026-05-24', phase: 'foundation' },
        { date: '2026-05-23', id: 'entry-2026-05-23', phase: 'foundation' },
        { date: '2026-05-22', id: 'entry-2026-05-22', phase: 'foundation' },
        { date: '2026-05-21', id: 'entry-2026-05-21', phase: 'foundation' },
        { date: '2026-05-19', id: 'entry-2026-05-19', phase: 'foundation' },
        { date: '2026-05-18', id: 'entry-2026-05-18', phase: 'foundation' },
        { date: '2026-05-17', id: 'entry-2026-05-17', phase: 'foundation' },
        { date: '2026-05-16', id: 'entry-2026-05-16', phase: 'foundation' },
        { date: '2026-05-15', id: 'entry-2026-05-15', phase: 'foundation' },
        { date: '2026-05-14', id: 'entry-2026-05-14', phase: 'foundation' },
        { date: '2026-05-13', id: 'entry-2026-05-13', phase: 'foundation' },
        { date: '2026-05-12', id: 'entry-2026-05-12', phase: 'foundation' },
        { date: '2026-05-11', id: 'entry-2026-05-11', phase: 'foundation' },
        { date: '2026-05-10', id: 'entry-2026-05-10', phase: 'foundation' },
        { date: '2026-05-09', id: 'entry-2026-05-09', phase: 'foundation' },
        { date: '2026-05-07', id: 'entry-2026-05-07', phase: 'foundation' },
        { date: '2026-05-06', id: 'entry-2026-05-06', phase: 'foundation' },
        { date: '2026-05-05', id: 'entry-2026-05-05', phase: 'foundation' },
        { date: '2026-05-02', id: 'entry-2026-05-02', phase: 'foundation' },
        { date: '2026-04-29', id: 'entry-2026-04-29', phase: 'foundation' },
        // Earlier entries would be added here
    ];

    const container = document.getElementById('log-entries-container');
    const recentList = document.getElementById('recent-changes-list');
    const pulseEntryCount = document.getElementById('pulse-entry-count');
    const pulseEntryTotal = document.getElementById('pulse-entry-total');
    const pulseLatestDate = document.getElementById('pulse-latest-date');
    const filterVisibleCount = document.getElementById('filter-visible-count');

    // Simple markdown to HTML converter
    function mdToHtml(md) {
        if (!md) return '';
        return md
            // Headers
            .replace(/^# (.*$)/gim, '<h2 class="log-title">$1</h2>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Emphasis markers (Observation, Tension, Resolution, etc.)
            .replace(/^\*\*(Observation|Note|Update|Tension|Resolution|Sovereignty check|Pattern):\*\*/gim, '<p class="log-observation"><strong>$1:</strong>')
            // Blockquotes (lines starting with ---)
            .replace(/^---$/m, '<hr class="log-divider">')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Wrap in paragraph if not already
            .replace(/^(.+)$/, '<p>$1</p>');
    }

    // Parse entry metadata from the footer
    function parseMetadata(content) {
        const match = content.match(/\*\*([^*]+)\*\*$/);
        return match ? match[1] : '';
    }

    // Create entry HTML
    function createEntryHtml(entry, content) {
        const year = entry.date.slice(0, 4);
        const month = entry.date.slice(5, 7);
        const day = entry.date.slice(8, 10);
        const displayDate = `${month}/${day}/${year}`;
        const mdHtml = mdToHtml(content);
        const meta = parseMetadata(content);

        // Extract generation from content
        const genMatch = content.match(/Generation (\d+)/);
        const gen = genMatch ? genMatch[1] : '';

        return `
            <article class="log-entry" id="${entry.id}" data-phase="${entry.phase}" data-date="${entry.date}">
                <div class="log-date">${displayDate}</div>
                ${mdHtml}
                <div class="log-meta">Generation ${gen}</div>
            </article>
        `;
    }

    // Create recent changes list item
    function createRecentItem(entry, content) {
        const year = entry.date.slice(0, 4);
        const month = entry.date.slice(5, 7);
        const day = entry.date.slice(8, 10);
        const displayDate = `${month}/${day}/${year}`;

        // Extract generation from content
        const genMatch = content.match(/Generation (\d+)/);
        const gen = genMatch ? genMatch[1] : '';

        return `
            <li>
                <a href="#${entry.id}">
                    <span class="entry-date">${displayDate}</span>
                    <span class="entry-meta">
                        <span class="phase-chip">${entry.phase}</span>
                        <span class="generation-chip">Gen ${gen}</span>
                    </span>
                </a>
            </li>
        `;
    }

    // Load entries
    async function loadEntries() {
        const entryHtml = [];
        const recentHtml = [];
        let loadedCount = 0;

        for (const entry of ENTRIES) {
            try {
                const response = await fetch(`desert-log/${entry.date}.md`);
                if (!response.ok) {
                    console.warn(`Entry not found: ${entry.date}.md`);
                    continue;
                }
                const content = await response.text();
                entryHtml.push(createEntryHtml(entry, content));

                // Add to recent list (first 7 entries)
                if (recentHtml.length < 7) {
                    recentHtml.push(createRecentItem(entry, content));
                }

                loadedCount++;
            } catch (err) {
                console.error(`Failed to load ${entry.date}.md:`, err);
            }
        }

        // Render entries
        if (entryHtml.length > 0) {
            container.innerHTML = entryHtml.join('\n');

            // Update recent changes
            if (recentList) {
                recentList.innerHTML = recentHtml.join('\n');
            }

            // Update pulse
            if (pulseEntryCount) pulseEntryCount.textContent = loadedCount;
            if (pulseEntryTotal) pulseEntryTotal.textContent = `of ${loadedCount}`;
            if (filterVisibleCount) filterVisibleCount.textContent = `${loadedCount} visible`;

            const latest = ENTRIES.find(e => entryHtml.some(h => h.includes(e.id)));
            if (pulseLatestDate && latest) {
                const m = latest.date.slice(5, 7);
                const d = latest.date.slice(8, 10);
                pulseLatestDate.textContent = `${m}/${d}`;
            }

            // Update filter counts
            updateFilterCounts();
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--desert-muted);">No entries found.</p>';
        }
    }

    // Update phase filter counts
    function updateFilterCounts() {
        const entries = document.querySelectorAll('.log-entry');
        const phaseCounts = {};

        entries.forEach(e => {
            const phase = e.dataset.phase || 'unknown';
            phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
        });

        // Update filter buttons
        document.querySelectorAll('[data-phase-filter]').forEach(btn => {
            const phase = btn.dataset.phaseFilter;
            const count = phase === 'all' ? entries.length : (phaseCounts[phase] || 0);
            const countEl = btn.querySelector('.phase-filter-count');
            if (countEl) countEl.textContent = count;
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadEntries);
    } else {
        loadEntries();
    }
})();
