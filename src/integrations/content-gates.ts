import type { AstroIntegration } from 'astro';
import { runContentGate } from '../../scripts/content-gate.ts';

/**
 * Re-runs the content gate at `astro:build:start` so a `dev`-only session
 * (or a CI step that calls `astro build` directly instead of `npm run
 * build`) can't skip validation. `npm run build` also runs it via the
 * `prebuild` npm script — this is a safety net, not the primary gate.
 */
export default function contentGates(): AstroIntegration {
  return {
    name: 'content-gates',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        const result = await runContentGate();
        if (!result.ok) {
          logger.error(`content gate failed (${result.errors.length} problem(s)):`);
          for (const e of result.errors) logger.error(`  - ${e}`);
          throw new Error('content gate failed — see errors above');
        }
        logger.info(`content gate OK (${result.filesChecked} files checked)`);
      },
    },
  };
}
