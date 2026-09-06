// Sets `data-theme` on <html> before first paint, to avoid a flash of the
// wrong theme (D030: dark and light, follows the system preference by
// default, manual toggle overrides it). Loaded as a blocking, render-
// blocking external <script src> (`is:inline src="/theme-init.js"`, never
// an inline body — see scripts/check-no-inline-script.mjs) from
// src/layouts/Base.astro, placed in <head> before any stylesheet that
// would otherwise paint the wrong theme first.
//
// ThemeToggle.astro writes one of three literal values to the same
// localStorage key: 'light', 'dark' (explicit override — always wins), or
// 'system' (explicit "follow the OS" choice). Anything else — including
// the key being absent on a first visit — is treated the same as
// 'system'. Only 'light'/'dark' ever reach `data-theme`; tokens.css has no
// `[data-theme="system"]` block; instead `data-theme` is always resolved
// to a concrete 'light' or 'dark' before paint, right here.
//
// Every storage access is wrapped in try/catch — localStorage can throw
// (private browsing, disabled storage, cross-origin iframe, etc.) and must
// never break the page.
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
      // stored === 'system', or nothing stored yet, or a corrupt value.
      var prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    // If anything above throws, fall back to no attribute — the CSS
    // @media (prefers-color-scheme) rules in tokens.css still apply.
  }
})();
