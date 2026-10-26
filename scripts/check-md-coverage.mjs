#!/usr/bin/env node
/**
 * Fails when a public page has no markdown version:
 *   - every <Route path> in App.tsx must be in MD_ROUTES or MD_SKIP (with a reason), and
 *   - every MD_ROUTES id must have a renderer in the bundled registry.
 * Then renders each static route once, so a renderer that throws fails here, not in production.
 *
 * Run: npm run check:md   (bundles lib/md first)
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MD_ROUTES, MD_SKIP } from '../lib/md/routes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

const appRoutes = [...readFileSync(join(ROOT, 'App.tsx'), 'utf8').matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const covered = new Set(MD_ROUTES.map((r) => r.path));
for (const path of appRoutes) {
  if (!covered.has(path) && !(path in MD_SKIP)) problems.push(`App.tsx route ${path} has no markdown renderer and is not in MD_SKIP`);
}
for (const [path, reason] of Object.entries(MD_SKIP)) {
  if (!String(reason).trim()) problems.push(`MD_SKIP ${path} needs a reason`);
}

const { RENDERERS } = await import(pathToFileURL(join(ROOT, 'api/_md/bundle.mjs')).href);
for (const route of MD_ROUTES) {
  if (!RENDERERS[route.id]) problems.push(`MD_ROUTES ${route.path} (id "${route.id}") has no renderer in lib/md/registry.ts`);
}

// Static pages that read nothing from the API must render offline.
const OFFLINE = MD_ROUTES.filter((r) => !r.path.includes(':') && !['marketplace', 'community', 'blog'].includes(r.id));
for (const route of OFFLINE) {
  try {
    const page = await RENDERERS[route.id]?.render({});
    if (!page?.title || !page?.summary || !page?.body) problems.push(`${route.path} rendered without a title, summary or body`);
  } catch (err) {
    problems.push(`${route.path} threw: ${err.message}`);
  }
}

if (problems.length) {
  console.error(`[md] coverage check failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`[md] ${appRoutes.length} App.tsx routes: ${MD_ROUTES.length} with markdown, ${Object.keys(MD_SKIP).length} skipped with a reason; ${OFFLINE.length} static pages render.`);
