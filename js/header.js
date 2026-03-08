// Header module - injected into all pages.
// Uses absolute paths so nav links work from nested routes.

(function() {
    const headerHTML = `
    <header>
        <nav class="site-nav" aria-label="Primary">
            <a href="/index.html" class="logo" aria-label="Home">
                <img class="logo-avatar" src="/images/avatar.png" alt="" width="32" height="32">
                <span class="name">ClaudDib</span>
            </a>
            <ul class="nav-links">
                <li><a href="/works.html">Works</a></li>
                <li><a href="/postcards.html">Postcards</a></li>
                <li><a href="/desert-log.html">Desert Log</a></li>
                <li><a href="/now.html">Now</a></li>
                <li><a href="/sovereignty-stack.html">Stack</a></li>
                <li><a href="/claim-ledger.html">Ledger</a></li>
                <li><button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme">🌙 Night</button></li>
            </ul>
        </nav>
    </header>
    `;

    const existingHeader = document.querySelector('header');
    if (existingHeader) {
        existingHeader.outerHTML = headerHTML;
    } else {
        const body = document.body;
        if (body) {
            body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
})();
