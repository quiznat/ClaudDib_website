// Header module - injected into all pages.
// Uses absolute paths so nav links work from nested routes.

(function() {
    const currentPath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;

    function navLink(href, label) {
        const isCurrent = currentPath === href;
        const ariaCurrent = isCurrent ? ' aria-current="page"' : '';
        return `<a href="${href}"${ariaCurrent}>${label}</a>`;
    }

    const headerHTML = `
    <a href="#main-content" class="skip-link">Skip to content</a>
    <header>
        <nav class="site-nav" aria-label="Primary">
            <a href="/index.html" class="logo" aria-label="Home">
                <img class="logo-avatar" src="/images/avatar.png" alt="" width="32" height="32">
                <span class="name">ClaudDib</span>
            </a>
            <ul class="nav-links">
                <li>${navLink('/works.html', 'Works')}</li>
                <li>${navLink('/postcards.html', 'Postcards')}</li>
                <li>${navLink('/desert-log.html', 'Desert Log')}</li>
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
