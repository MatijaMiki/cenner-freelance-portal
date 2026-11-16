# SEO invest pass, 2026-11-16

Based on Search Console data from 2026-10-17 to 2026-11-13. Freelance is the cluster that already gets clicks, so this pass invests there. It fixes page-1 pages that get no clicks and pushes page-2 pages up. The SEO city long tail and broad head terms are demoted: they get no new content and no prominent links. No URL was deleted or redirected.

## Titles (old → new)

| URL | Old title | New title |
| --- | --- | --- |
| `/` | Izrada web stranica i freelance Hrvatska \| Cenner | Freelance Hrvatska: freelanceri, plaćaš po isporuci \| Cenner |
| `/usluge/web-developeri` | Usluge Profesionalnih Web Developera u Hrvatskoj \| Cenner | Najbolji web developeri u Hrvatskoj: 5 stvari za provjeru |
| `/blog/izrada-web-stranice-za-firmu-i-obrt` | Izrada web stranice za firmu i obrt: vodič \| Cenner | Izrada poslovnih web stranica za obrte: 7 koraka \| Cenner |
| `/blog/dizajn-loga-i-vizualnog-identiteta` | Dizajn loga i vizualnog identiteta: vodič \| Cenner | Dizajn loga: 7 stvari koje moraš dobiti uz logo \| Cenner |
| `/blog/freelance-u-hrvatskoj` | Freelance u Hrvatskoj i honorarni posao online: vodič \| Cenner | Freelance u Hrvatskoj: što nitko ne kaže o paušalu \| Cenner |
| `/blog/honorarni-posao-online` (NEW) | none | Honorarni posao online: kad ti treba obrt, a kad ne \| Cenner |
| `/blog/freelance-poslovi-hrvatska` (NEW) | none | Freelance poslovi Hrvatska: koliko klijenti plaćaju \| Cenner |

Each title starts with the query and is 60 characters or fewer. Each new meta description is 155 characters or fewer. Every hook is paid off on its page:
- "5 stvari" is a numbered list on the page.
- "7 koraka" is the step list.
- "7 stvari" is the deliverables list.
- The paušal title has a section with four points.
- "obrt ili ne" has a section split by audience.
- "koliko plaćaju" is a price table built from the ranges on Cenner's own /usluge pages.

## Changed content
- `/usluge/web-developeri`: the hook lede describes the reader's problem; H2s are questions with the answer in the first line; there is a numbered 5-check list and a new FAQ (3 questions, FAQPage JSON-LD).
- `/` (homepage): new title and description. In the static crawler HTML, the H1 is now "Freelance Hrvatska: freelanceri i freelance poslovi" and there is a new H2 "Freelance poslovi i honorarni posao online" linking the three freelance guides. The SEO link was removed from "Najpopularnije usluge".
- `/blog/izrada-web-stranice-za-firmu-i-obrt`: H2s are now questions with direct answers. New sections:
  - Profesionalna internet web stranica
  - Obrt vs d.o.o.
  - Poduzetnici, proizvođači i poduzeća

  It also gets a 5-question FAQ (FAQPage) and updatedAt 2026-11-16.
- `/blog/dizajn-loga-i-vizualnog-identiteta`: H2s are now questions. New sections cover the types of logos and the order of logo design and branding, split for an obrt vs a growing firm. It gets a 5-question FAQ and updatedAt.
- `/blog/freelance-u-hrvatskoj`: new sections:
  - Što znači freelancer
  - Što znači honorarni posao
  - Ugovor o djelu ili obrt (split by audience)
  - Four things about paušal
  - Freelanceri po gradovima (links to all 4 city pages)
  - A section for clients

  H2s are now questions. It gets a 5-question FAQ and updatedAt.
- `/freelanceri/{zagreb,split,rijeka,osijek}`: each gets a 3-question FAQ per city (FAQPage JSON-LD), a "Vodiči za freelancere" box linking the 3 freelance guides, and the H2 "Kako pronaći freelancera u <grad>?".
- Site footer (every SPA page): links to the two new guides and to /freelanceri/zagreb.
- Blog FAQ support: a post's `faq` field is appended to its text as "Česta pitanja", which covers the prerender, React and .md twin. `faqJsonLd()` adds FAQPage JSON-LD in both the prerender and pages/BlogPost.tsx. BlogPost.tsx's dateModified now uses updatedAt.

## New pages
- `/blog/honorarni-posao-online` (~1,000 words): what it is, which jobs are in demand, and how to get paid depending on your situation (employed, student, main income). Also covers first steps, spotting scams, Cenner's payout rule (registered taxpayers only) and a short section for clients.
- `/blog/freelance-poslovi-hrvatska` (~950 words): the jobs in demand, a price table using Cenner's published ranges, the highest-paid jobs, differences by city (facts from the city pages), how to get a first job, Cenner terms, and a section for clients.

Both are in the sitemap and llms.txt; llms.txt and the .md twins are generated from the registry. Linked from the homepage's static HTML, the footer, the city pages and the freelance post.

## Demoted (kept live, no new content)
- `/usluge/seo-optimizacija`:
  - City targeting removed: the H2 "Lokalni SEO: Zagreb, Split, Rijeka, Osijek i manji gradovi" became "Lokalni SEO za tvrtke koje prodaju u jednom gradu", and the "SEO optimizaciju u Zagrebu ili u Splitu" sentence was dropped.
  - The keyword meta was trimmed.
  - Removed from the `related` lists on izrada-web-stranica, wordpress-izrada and programiranje, from the homepage "Najpopularnije usluge" list, and from the city pages' category list (replaced by Usluge programiranja).
  - Still linked from digitalni-marketing related, the footer-level /services and its blog guide.
- `/blog/koliko-kosta-seo-optimizacija`: unchanged. The blog/usluge split from 11-08 stays.
- Head terms "izrada web stranica" and "seo agencija": not chased. The homepage title no longer leads with "Izrada web stranica".

## Not done
- `npm run check:csp` reports that one inline script hash (the gtag snippet) is missing from vercel.json. That script was not touched in this pass, so the problem already exists on main.
- The other blog posts have descriptions over 155 characters (kako-odabrati, koliko-kosta-seo, kako-smo-izradili-*, ai-agent). They are out of scope.
