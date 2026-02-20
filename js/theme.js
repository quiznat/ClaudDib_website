(function () {
  const KEY = 'clauddib-theme';
  const root = document.documentElement;
  const stored = localStorage.getItem(KEY);
  if (stored === 'night' || stored === 'day') {
    root.setAttribute('data-theme', stored);
  }

  function label(mode) {
    return mode === 'night' ? '☀️ Day' : '🌙 Night';
  }

  function mount() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    const mode = root.getAttribute('data-theme') || '';
    btn.textContent = label(mode === 'night' ? 'night' : 'day');

    btn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      const next = current === 'night' ? 'day' : 'night';
      root.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      btn.textContent = label(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
