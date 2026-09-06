// Sets `data-theme` on <html> before first paint, to avoid a flash of the
// wrong theme. Loaded as a blocking external <script src> (never
// `is:inline`) from src/layouts/Base.astro. Every storage access is wrapped
// in try/catch — localStorage can throw (private browsing, disabled
// storage, etc.) and must never break the page.
(function () {
  try {
    var STORAGE_KEY = 'cc:theme';
    var stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    var theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      var prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    // If anything above throws, fall back to no attribute — the CSS
    // @media (prefers-color-scheme) rules still apply.
  }
})();
