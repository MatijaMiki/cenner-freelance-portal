/**
 * Markdown versions of cenner.hr pages, plus /llms.txt, /llms-full.txt, /ai.txt and
 * /api/md/_catalog. All logic lives in lib/md; scripts/build-md.mjs bundles it into
 * api/_md/bundle.mjs during `npm run build`. middleware.js and the vercel.json rewrites send
 * requests here.
 */

import { handle } from './_md/bundle.mjs';

export default function handler(req, res) {
  return handle(req, res);
}
