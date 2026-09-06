import { test } from '@playwright/test';

// The build already runs `pagefind --site dist` as a postbuild step, but no
// page renders a search box or wires up the pagefind UI/API yet — that's
// P09's job. Un-skip these once P09 lands a search entry point (a `/search/`
// page, a header search box, or similar) to drive.

test.fixme('search box returns results for a known lesson title — pending P09 (search UI)', async () => {});

test.fixme('search is reachable from the header on every page — pending P09 (search UI)', async () => {});
