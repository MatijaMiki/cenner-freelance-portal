#!/usr/bin/env node
/**
 * Verifies that every inline classic <script> and inline onload handler in dist/index.html
 * has its sha256 listed in the Content-Security-Policy(-Report-Only) header in vercel.json.
 *
 * WHY: the CSP allows the two inline scripts in index.html (scroll restoration and the Google
 * Consent Mode / gtag block) and the font-loading onload handler by hash. Any edit to those
 * bytes changes the hash; the browser would then block the script, which for the gtag block
 * means consent defaults stop being set before gtag.js runs. Run after `vite build`:
 *   node scripts/check-csp-hashes.mjs
 * Exits 1 and prints the new hashes when something is out of date.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

const policies = [];
for (const rule of vercel.headers || []) {
  for (const h of rule.headers || []) {
    if (/^content-security-policy(-report-only)?$/i.test(h.key) && /script-src/.test(h.value)) policies.push(h.value);
  }
}
if (policies.length === 0) {
  console.error('check-csp-hashes: no CSP with script-src found in vercel.json');
  process.exit(1);
}

const hash = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*\btype=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const handlers = [...new Set([...html.matchAll(/\bonload="([^"]*)"/g)].map((m) => m[1]))];

let bad = 0;
for (const policy of policies) {
  for (const [kind, items] of [['inline script', scripts], ['onload handler', handlers]]) {
    for (const item of items) {
      const h = hash(item);
      if (!policy.includes(h)) {
        bad++;
        console.error(`MISSING ${kind} hash ${h}  (${JSON.stringify(item.trim().slice(0, 60))})`);
      }
    }
  }
}
if (bad) {
  console.error(`\ncheck-csp-hashes: ${bad} hash(es) not in vercel.json. Update the CSP header with the values above.`);
  process.exit(1);
}
console.log(`check-csp-hashes: ok (${scripts.length} inline script(s), ${handlers.length} handler(s), ${policies.length} policy header(s))`);
