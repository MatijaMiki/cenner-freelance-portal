#!/usr/bin/env node
/**
 * Bundles lib/md/index.ts (the markdown renderers, with the i18n copy and the price list they read)
 * into api/_md/bundle.mjs for api/md.js.
 *
 * WHY a bundle: the renderers import the same TypeScript the pages use (i18n.tsx, lib/plans.ts,
 * lib/company.ts), so the markdown and the HTML cannot drift on copy or prices. Vercel's Node
 * functions do not compile that import graph on their own; Vite (already the site's build tool)
 * does. Runs in `npm run build` before Vercel packages the functions.
 *
 * Run: node scripts/build-md.mjs
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

await build({
  root: ROOT,
  configFile: false,
  logLevel: 'warn',
  publicDir: false,
  resolve: { alias: { '@': ROOT } },
  // Everything inlined, so the function needs nothing beyond this one file.
  ssr: { noExternal: true },
  build: {
    ssr: join(ROOT, 'lib/md/index.ts'),
    outDir: join(ROOT, 'api/_md'),
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    rollupOptions: { output: { entryFileNames: 'bundle.mjs', format: 'es' } },
  },
});

console.log('[md] bundled lib/md -> api/_md/bundle.mjs');
