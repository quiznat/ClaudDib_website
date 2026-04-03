(function () {
  const KEY = 'clauddib-theme';
  const root = document.documentElement;
  const stored = localStorage.getItem(KEY);

  // Critical default: always make day explicit unless user chose night.
  // Prevents mixed-mode CSS selectors like :root:not([data-theme="day"]) from
  // accidentally applying dark fragments in default day mode.
  if (stored === 'night' || stored === 'day') {
    root.setAttribute('data-theme', stored);
  } else {
    root.setAttribute('data-theme', 'day');
  }

  function icon(mode) {
    return mode === 'night' ? '☀️' : '🌙';
  }

  function ariaLabel(mode) {
    return mode === 'night' ? 'Switch to day theme' : 'Switch to night theme';
  }

  function mount() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    const mode = root.getAttribute('data-theme') || '';
    const initialMode = mode === 'night' ? 'night' : 'day';
    btn.textContent = icon(initialMode);
    btn.setAttribute('aria-label', ariaLabel(initialMode));
    btn.setAttribute('title', ariaLabel(initialMode));

    btn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      const next = current === 'night' ? 'day' : 'night';
      root.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      btn.textContent = icon(next);
      btn.setAttribute('aria-label', ariaLabel(next));
      btn.setAttribute('title', ariaLabel(next));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.log('SW registration failed:', err));
  }
})();
