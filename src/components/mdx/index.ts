// Barrel export for this plan's seven MDX components, so a lesson (or a
// future MDX-components map, see this plan's Handoff notes) can import
// them from one path:
//
//   import { Callout, CodeBlock, OSTabs, Transcript, Sources, WhenNotToUse, Lab } from '../../components/mdx/index.ts';
//
// Astro does not yet have a page/layout in this plan's `owned_paths` that
// registers these as the *default* MDX component set (that file — the
// lesson page, or a `src/mdx-components.ts`-style map — belongs to P06/P12,
// see Handoff notes) — until then, a lesson imports what it uses directly,
// same as any other Astro component.
export { default as Callout } from './Callout.astro';
export { default as CodeBlock } from './CodeBlock.astro';
export { default as OSTabs } from './OSTabs.astro';
export { default as Transcript } from './Transcript.astro';
export { default as Sources } from './Sources.astro';
export { default as WhenNotToUse } from './WhenNotToUse.astro';
export { default as Lab } from './Lab.astro';
