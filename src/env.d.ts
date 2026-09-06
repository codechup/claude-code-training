/// <reference types="astro/client" />

// Typings for this site's custom `PUBLIC_*` environment variables, so
// `import.meta.env.PUBLIC_GISCUS_REPO` and friends are real, typed reads
// instead of the `Record<string, string | undefined>` cast P08 had to use
// while this file did not exist (see plans/P08-mdx-components-b.md's
// Handoff notes).
//
// All of these are owner-set at build time and all are optional: every
// component that reads one renders a clearly-labelled "not enabled" state
// when it is missing, so a build without them is a valid build.
interface ImportMetaEnv {
  /** giscus repository, e.g. "owner/repo" (owner action O6). */
  readonly PUBLIC_GISCUS_REPO?: string;
  /** giscus repository id (owner action O6). */
  readonly PUBLIC_GISCUS_REPO_ID?: string;
  /** giscus discussion category id (owner action O6). */
  readonly PUBLIC_GISCUS_CATEGORY_ID?: string;
  /** Cloudflare Web Analytics beacon token (D066, owner action O7). */
  readonly PUBLIC_CF_BEACON_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
