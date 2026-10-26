# cenner.hr SEO page map

Source of truth for which URLs exist, which are indexable, and which redirect.
Written 2026-10-17 from the GSC export (3 months to 2026-10-16) and the redesign
working tree. Check any redesign or routing change against this file first.

## Rule zero

Never change or remove a URL that already has impressions without a permanent 301 to
a page with genuinely similar content. Merging low-traffic pages is fine. Renaming
ranking pages is not.

## Keep: indexable, URL frozen

| URL | Why it stays | GSC (3 mo) |
|---|---|---|
| `/` | brand + "freelance hrvatska"; 87 of 103 clicks | 1234 impr, pos 6.8 |
| `/marketplace` | the product | 23 impr |
| `/services` | hub; becomes the studio / services page in the redesign | 394 impr, pos 21.7 |
| `/usluge/izrada-web-stranica` | keyword page | 632 impr, pos 38 |
| `/usluge/seo-optimizacija` | keyword page | 879 impr, pos 80 |
| `/usluge/digitalni-marketing` | keyword page | 101 impr, pos 9.3 |
| `/usluge/dizajn-loga` | keyword page | 76 impr |
| `/usluge/wordpress-izrada` | keyword page | 7 impr |
| `/usluge/programiranje` | keyword page; query "usluge programiranja" sits at pos 3.7 (60 impr, Oct 18) | query-level only |
| `/usluge/web-developeri` | NEW, targets "usluge profesionalnih web developera" (267 impr, pos 19) | new |
| `/freelanceri/{zagreb,split,rijeka,osijek}` | best CTR on the site, 12-29% at pos 5-6 | 45 impr, 7 clicks |
| `/about` | also hosts contact (`#kontakt`) | 47 impr |
| `/blog`, `/blog/:slug` | content engine | 17 impr |
| `/subscription` | pricing | indexable |
| `/onboarding` | public guide to opening a paušalni obrt; prerendered, in the sitemap, linked from the footer | 12 impr |
| `/ranwhat` | sister product page | indexable |
| `/privacy`, `/terms`, `/cookies` | legal | indexable, low priority |
| `/service/:id`, `/freelancer/:id` | entity pages with their own heads | long tail |

Do not rename anything in `/usluge/*` or `/freelanceri/*`. Do not fold those pages into
`/services`: one hub cannot target seven different query clusters.

## Merge: permanent 301 (already in the redesign's `vercel.json` and `App.tsx`)

| Old URL | Target | Traffic lost |
|---|---|---|
| `/contact` | `/about#kontakt` | 17 impr |
| `/technology` | `/services#alati` | 9 impr |
| `/projects` | `/services#radovi` | 0 (was disallowed) |
| `/match` | `/marketplace#ai-matching` | none (noindex before) |
| `/dashboard`, `/saved`, `/earnings` | `/profile...` | private pages |
| `/blog-admin*` | `/admin/blog*` | private pages |

Conditions for these redirects to be safe:
- `/services` must contain real, substantive sections for `#radovi` (projects) and
  `#alati` (tools / technology). Google ignores the fragment, so a thin section risks a
  soft 404 on the old URLs.
- Redirected URLs must be removed from `public/sitemap.xml` and
  `scripts/generate-sitemap.mjs`, and must not appear in internal links.

## Do not index

| URL | Action |
|---|---|
| `/auth` | add `noindex`, remove from sitemap (currently indexed, 45 impr) |
| `/profile`, `/orders`, `/messages`, `/contracts`, `/checkout*`, `/reset-password`, `/admin/*` | already disallowed or behind login |

## Subdomains (separate repos, checked live 2026-10-17)

| Host | State | Action |
|---|---|---|
| `links.cenner.hr` (Cenner Links) | live, no canonical, no robots meta; `/robots.txt` returns the SPA HTML | add canonical to itself, real `robots.txt`, sitemap if it should rank |
| `cenner-links.vercel.app` | serves the same page as `links.cenner.hr` with 200, no canonical, no redirect | 301 to `links.cenner.hr` (or at least canonical to it) |
| `shorten.cenner.hr` | live; `/robots.txt` returns "Link not found" (shortener catch-all) | add a real `robots.txt`; keep short links out of the index |

Cross-links from the cenner.hr project cards should use the subdomain URLs, never the
`vercel.app` hosts. Each `vercel.app` duplicate should redirect to its subdomain.

## Positioning (decided by the owner, 2026-10-17)

Cenner is a **freelancer marketplace first**. It exists to fill the gap in Croatia:
trebam.hr is weak and charges 210 EUR/month, freelance.hr is dead. The owner also uses
Cenner to validate selling paid web dev services, so the studio is a **secondary offer**.

Consequences:
- `/`, `/marketplace`, `/usluge/*`, `/freelanceri/*` stay marketplace voice ("Cenner
  povezuje ... freelancere"). The homepage title / meta keep the brand and
  "freelance hrvatska" terms (87 of 103 clicks).
- `/services` is the studio hub. The web-type landing pages (`izrada-web-stranica`,
  `web-developeri`, `wordpress-izrada`, `programiranje`) end with a short cross-sell
  section linking to `/services` ("Želiš da Cenner tim napravi projekt umjesto tebe?").
- Landing page breadcrumb "Usluge" and the "Pregledaj sve usluge" button point to
  `/services` (parent hub), with `/marketplace` as the primary CTA. Done (merged 2026-10-18).

## Open opportunities (not built)

- Competitor intent: "trebam.hr alternativa", "freelance.hr alternativa", "trebam.hr
  cijena". No impressions yet. Check volume before building a comparison page.
- Supply side: "honorarni posao online", "dodatni posao preko interneta" already earn
  clicks at 50% CTR. A page aimed at freelancers looking for work is the best next page.

## Machine-readable (for AI agents, added 2026-10-26)

- Every page in `lib/md/routes.mjs` (`MD_ROUTES`) has a markdown version at `<path>.md`
  (`/index.md` for the homepage), also served for `Accept: text/markdown` and at `/api/md/<path>`.
  Markdown answers `X-Robots-Tag: noindex` and points at the HTML as canonical; `.md` URLs stay
  out of the sitemap.
- `/llms.txt`, `/llms-full.txt`, `/ai.txt` and `/api/md/_catalog` are generated by `api/md.js`
  from the same renderers. `public/robots.txt` is generated by `scripts/generate-robots.mjs`.
- Crawler policy: AI search bots allowed; training bots allowed except `/freelancer/`;
  Bytespider blocked.
- New public page: add it to `MD_ROUTES` and a renderer in `lib/md/registry.ts`, or to `MD_SKIP`
  with a reason. `npm run check:md` fails otherwise.

## Mechanics

- Landing pages are generated by `scripts/generate-landing-pages.mjs`. Edit the
  script, never `public/usluge/*` or `public/freelanceri/*`. `npm run build` regenerates
  them. The generated HTML is tracked, so commit it together with the script change
  that produced it (the repo then matches production); resolve any conflict in the
  script and regenerate, never by hand in `public/`.
- Static route heads come from `scripts/prerender-static-routes.mjs` and must agree
  with `components/SEO.tsx`.
- After any URL change: resubmit the sitemap in GSC, then watch Pages for "Redirect
  error" and "Soft 404" for 2-4 weeks.
