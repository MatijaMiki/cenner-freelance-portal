#!/usr/bin/env node
// Tell Bing (and the other IndexNow engines) which cenner.hr pages changed.
//   node scripts/indexnow.mjs              -> every URL in the live sitemap
//   node scripts/indexnow.mjs URL [URL...] -> only those URLs
// Run it after the deploy is live: the engines fetch the key file from the site.
const HOST = 'cenner.hr';
const KEY = 'c1b90ea2f6268f3d52219845b1a7e2d0';
const KEY_URL = `https://${HOST}/${KEY}.txt`;

async function main() {
  const keyRes = await fetch(KEY_URL);
  const keyText = (await keyRes.text()).trim();
  if (!keyRes.ok || keyText !== KEY) {
    throw new Error(`key file not live at ${KEY_URL} (HTTP ${keyRes.status}); nothing sent`);
  }

  let urls = process.argv.slice(2);
  if (urls.length === 0) {
    const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  }
  urls = [...new Set(urls)].filter((u) => new URL(u).host === HOST);
  if (urls.length === 0) throw new Error('no cenner.hr URLs to send');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_URL, urlList: urls }),
  });
  console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URLs`);
  urls.forEach((u) => console.log(`  ${u}`));
  // 200 = accepted, 202 = accepted, key validation pending.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow rejected the submission: ${res.status} ${await res.text()}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
