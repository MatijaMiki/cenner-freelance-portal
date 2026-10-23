#!/usr/bin/env node
/**
 * Writes Cenner's price list (lib/cjenik.js) to public/cjenik/ as the machine-readable .csv the
 * Odluka o objavi cjenika proizvoda i usluga (NN 101/26) asks for:
 *   - one file per price-list version, under the ministry's file name, so the superseded lists
 *     stay public (the Odluka asks for at least 30 days; we keep them all)
 *   - cjenik.csv, the list in force, at a URL that never changes, for scrapers
 * The /cjenik page links both.
 *
 * Files are regenerated on every build from lib/cjenik.js; a price change is a new version there,
 * so the published file changes exactly when a price does (not on a timer: the rule is "by 08:00
 * on the day the change takes effect", and a re-dated file with unchanged prices would only
 * misstate when prices last changed).
 *
 * Run: node scripts/generate-cjenik.mjs   (part of `npm run build`, before vite build)
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRICE_LISTS, currentList, fileName, toCsv } from '../lib/cjenik.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'cjenik');

// Mistakes here would publish a wrong legal document, so they stop the build.
PRICE_LISTS.forEach((list, i) => {
  const prev = PRICE_LISTS[i - 1];
  if (list.no !== i + 1) throw new Error(`cjenik: version ${i + 1} has no ${list.no}`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(list.publishedAt)) throw new Error(`cjenik: version ${list.no} publishedAt "${list.publishedAt}" is not YYYY-MM-DDTHH:MM`);
  if (prev && list.publishedAt <= prev.publishedAt) throw new Error(`cjenik: version ${list.no} is not later than version ${prev.no}`);
  const ids = list.items.map(it => it.id);
  if (new Set(ids).size !== ids.length) throw new Error(`cjenik: version ${list.no} repeats an id`);
  for (const it of list.items) {
    if (!(it.price >= 0) || !(it.anchor.price >= 0)) throw new Error(`cjenik: ${it.id} has no valid price`);
    if (it.anchor.date.slice(0, 10) > list.publishedAt.slice(0, 10)) throw new Error(`cjenik: ${it.id} anchor date is after its list`);
    const before = prev?.items.find(p => p.id === it.id);
    if (before && (before.anchor.price !== it.anchor.price || before.anchor.date !== it.anchor.date)) {
      throw new Error(`cjenik: ${it.id} changed its anchor price; the reference price stays fixed when the price changes`);
    }
  }
});

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const list of PRICE_LISTS) await writeFile(join(OUT, fileName(list)), toCsv(list), 'utf8');
await writeFile(join(OUT, 'cjenik.csv'), toCsv(currentList()), 'utf8');

console.log(`cjenik: ${PRICE_LISTS.length} version(s), in force: ${fileName(currentList())}`);
