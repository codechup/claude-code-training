// Where this site's source lives — used by the footer link and by the
// per-lesson "Edit this page on GitHub" link (D063).
export const REPO_URL = 'https://github.com/codechup/claude-code-training';

/**
 * The GitHub edit URL for a content file.
 *
 * `filePath` is the path RELATIVE TO THE REPO ROOT, e.g.
 * `content/en/l1-beginner/m01-start/01-what-claude-code-is.mdx`. Astro's
 * `entry.filePath` already has that shape for a `glob()` loader rooted at
 * `./content`.
 */
export function editUrl(filePath: string): string {
  return `${REPO_URL}/edit/main/${filePath.replace(/^\/+/, '')}`;
}
