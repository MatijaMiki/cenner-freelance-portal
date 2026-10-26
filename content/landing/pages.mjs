// The copy of the /usluge/* and /freelanceri/* landing pages. scripts/generate-landing-pages.mjs
// turns it into the static HTML; lib/md/pages/landing.ts into the markdown versions. Body strings
// may carry inline <strong>, <em> and <a>.
//
// Plain .mjs so the Node build script can import it without a TypeScript step.

// ---- service landing pages ----
export const services = [
  {
    slug: 'izrada-web-stranica',
    title: 'Profesionalna Izrada Web Stranica u Hrvatskoj | Cenner',
    keyword: 'izrada web stranica, profesionalna izrada web stranica, izrada internet stranica',
    description:
      'Profesionalna izrada web stranica za firme, obrte i male tvrtke u Hrvatskoj. Provjereni web developeri, više ponuda, cijene od 300 €. Bez agencijskih marži.',
    h1: 'Profesionalna Izrada Web Stranica u Hrvatskoj',
    intro:
      'Tražiš profesionalnu izradu web stranice ili internet stranice za svoju firmu po pristupačnoj cijeni? Cenner povezuje hrvatske tvrtke, obrte i poduzetnike s provjerenim web developerima koji rade brzo, kvalitetno i bez skupih agencijskih marži.',
    sections: [
      {
        h2: 'Izrada web stranica za male firme i obrtnike',
        body: [
          'Mala firma ili obrt rijetko treba kompliciran sustav. Najčešće je dovoljna <strong>responzivna web stranica od 5 do 8 podstranica</strong>: početna, usluge, o nama, reference i kontakt, uz osnovnu SEO postavku i Google Business profil. Takva izrada web stranice obično staje u <strong>300 € do 800 €</strong> i gotova je za 1 do 3 tjedna.',
          'Za ugostitelje, agencije za nekretnine, obrtnike i servise freelanceri na Cenneru rade i stranice s <strong>upitnicima, rezervacijama i prikazom ponude</strong> (npr. oglasi za nekretnine), a po potrebi i web shop s online plaćanjem.',
        ],
      },
      {
        h2: 'Koliko košta izrada web stranice u Hrvatskoj?',
        body: [
          'Cijena izrade web stranice u Hrvatskoj ovisi o složenosti projekta. Jednostavna landing stranica ili predstavljajuća web stranica obrta kreće od <strong>300 € do 800 €</strong>. Korporativne web stranice s više podstranica i CMS-om kreću se od <strong>800 € do 2.500 €</strong>. Web shopovi i složenije aplikacije idu od <strong>2.000 € pa do 10.000 €</strong> i više.',
          'Na Cenneru možeš dobiti <strong>više ponuda</strong> od različitih freelancera i odabrati onu koja najbolje odgovara tvom proračunu i očekivanjima. Sve cijene su transparentne, bez skrivenih troškova.',
        ],
      },
      {
        h2: 'Što sve uključuje izrada web stranice?',
        body: [
          'Profesionalna izrada web stranice obično uključuje: <strong>dizajn</strong> (Figma macke i finalni mockup-ovi), <strong>responsive HTML/CSS implementaciju</strong>, <strong>integraciju s CMS-om</strong> (najčešće WordPress, Webflow ili custom rješenje), <strong>SEO osnovu</strong> (meta tagovi, sitemap, brzina), <strong>postavljanje na hosting</strong> i <strong>jamstvo na rad</strong>.',
          'Naši freelanceri rade s modernim tehnologijama poput Reacta, Next.jsa, Astra i Vuea, ali i s WordPressom, Shopifyem i Webflowom kad je to bolji izbor za projekt.',
        ],
      },
      {
        h2: 'Zašto angažirati freelancera umjesto agencije?',
        body: [
          'Agencija u Hrvatskoj za istu web stranicu naplaćuje <strong>2x do 3x više</strong> jer pokriva fiksne režije (uredi, account manageri, marketing). Freelancer ti dolazi izravno: niža cijena, brža komunikacija, jednako kvalitetan rezultat.',
          'Na Cenneru su svi freelanceri prošli <strong>KYC verifikaciju</strong>, a plaćanje ide kroz osigurani escrow sustav. Plaćaš tek kad si zadovoljan rezultatom.',
        ],
      },
      {
        h2: 'Kako pronaći pravog web developera?',
        body: [
          'Klikni na "Pronađi freelancera" ispod, opiši svoj projekt u par rečenica, i naš AI matching će ti predložiti 3–5 najprikladnijih kandidata u roku od minute. Pregledaj njihove portfolije, ocjene i prethodne projekte, pa odaberi najboljeg.',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim freelancerima, Cenner tim i sam izrađuje web stranice po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj što Cenner tim radi</a> i javi se izravno.',
        ],
      },
    ],
    related: ['web-developeri', 'seo-optimizacija', 'wordpress-izrada'],
  },
  {
    slug: 'dizajn-loga',
    title: 'Dizajn Loga i Vizualnog Identiteta | Cenner',
    keyword: 'dizajn loga',
    description:
      'Pronađi grafičkog dizajnera za izradu loga, vizualnog identiteta i brendinga u Hrvatskoj. Ponude od provjerenih freelancera. Cijene od 80 €.',
    h1: 'Dizajn Loga i Vizualnog Identiteta',
    intro:
      'Tvoj brend zaslužuje logo koji ostaje u sjećanju. Cenner povezuje hrvatske tvrtke s vrhunskim grafičkim dizajnerima koji izrađuju logotipe, vizualne identitete i branding pakete po fer cijenama.',
    sections: [
      {
        h2: 'Koliko košta dizajn loga u Hrvatskoj?',
        body: [
          'Cijena dizajna loga ovisi o iskustvu dizajnera i opsegu posla. Jednostavan logo s par revizija kreće od <strong>80 € do 250 €</strong>. Kompletan vizualni identitet (logo, paleta boja, tipografija, mockup-ovi) ide od <strong>300 € do 1.200 €</strong>. Brending paket s brand guideom, social media template-ima i print materijalima kreće od <strong>800 € pa naviše</strong>.',
        ],
      },
      {
        h2: 'Što ulazi u kvalitetan vizualni identitet?',
        body: [
          'Profesionalan brending uključuje: <strong>logo u svim formatima</strong> (vektor, raster, transparentna i monokromatska verzija), <strong>brand guide</strong> s pravilima korištenja, <strong>paletu boja s HEX i CMYK kodovima</strong>, <strong>tipografski sustav</strong>, te <strong>mockup-ove primjene</strong> na vizitkama, web stranici, društvenim mrežama i print materijalima.',
        ],
      },
      {
        h2: 'Kako odabrati pravog dizajnera?',
        body: [
          'Pogledaj portfolio. Dobar dizajner pokazuje raznoliku stilsku paletu i jasno objašnjava razmišljanje iza svakog projekta. Na Cenneru svi profili sadrže ocjene prijašnjih klijenata, vrijeme isporuke i postotak zadovoljstva.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'digitalni-marketing', 'wordpress-izrada'],
  },
  {
    slug: 'seo-optimizacija',
    title: 'SEO Optimizacija: Cijene i Usluge u Hrvatskoj | Cenner',
    keyword: 'seo optimizacija, seo optimizacija cijena, usluge seo optimizacije, seo stručnjak',
    description:
      'Usluge SEO optimizacije u Hrvatskoj (Zagreb, Split i cijela zemlja): cijena audita od 200 €, mjesečni paketi od 300 €. SEO marketing i lokalni SEO.',
    h1: 'SEO Optimizacija: Cijene i Usluge u Hrvatskoj',
    intro:
      'Ako te kupci ne mogu pronaći na Googleu, ne postojiš. Ovdje je pregled što SEO optimizacija stvarno košta u Hrvatskoj i što uključuje, a Cenner te povezuje sa SEO stručnjacima koji znaju kako tehnički, sadržajno i autoritativno postaviti web stranicu da rangira za prave ključne riječi.',
    sections: [
      {
        h2: 'SEO optimizacija cijena: koliko košta SEO u Hrvatskoj?',
        body: [
          'Jednokratni SEO audit s preporukama kreće od <strong>200 € do 600 €</strong>. Mjesečni paket optimizacije za malu web stranicu ide od <strong>300 € do 800 € mjesečno</strong>. Veći e-commerce projekti i nacionalne kampanje kreću od <strong>1.000 € mjesečno</strong> i više. Ako te zanima cijena SEO optimizacije za tvoju konkretnu stranicu, objavi projekt i usporedi ponude više freelancera.',
          'Za razliku od plaćenih oglasa, SEO daje <strong>dugoročne rezultate</strong>. Jednom kad rangiraš, dolazi besplatan promet mjesecima.',
        ],
      },
      {
        h2: 'Lokalni SEO: Zagreb, Split, Rijeka, Osijek i manji gradovi',
        body: [
          'Lokalna SEO optimizacija radi za tvrtke koje prodaju u jednom gradu ili regiji: <strong>Google Business profil</strong>, NAP podaci, lokalne ključne riječi (npr. "frizer Split", "odvjetnik Osijek"), recenzije i lokalni linkovi. Naši SEO freelanceri rade za klijente u Zagrebu, Splitu, Rijeci i Osijeku, ali i u manjim mjestima gdje je konkurencija znatno slabija, pa se rezultati vide brže.',
          'Tražiš <strong>SEO optimizaciju u Zagrebu</strong> ili u Splitu? SEO se radi na daljinu, pa biraš stručnjaka po rezultatima, a ne po adresi. Uz optimizaciju same stranice dobivaš i <strong>SEO marketing</strong>: sadržaj, Google Business profil i mjesečno izvještavanje, uz cijenu koju dogovoriš unaprijed.',
        ],
      },
      {
        h2: 'Što uključuje SEO optimizacija?',
        body: [
          'Profesionalna SEO usluga obuhvaća: <strong>tehnički audit</strong> (brzina, indeksabilnost, struktura), <strong>keyword research</strong> za hrvatsko tržište, <strong>on-page optimizaciju</strong> (title, meta, headings, internal linking), <strong>strukturirane podatke</strong> (Schema.org), <strong>link building</strong> i <strong>kontinuirano izvještavanje</strong> kroz Google Search Console i Analytics.',
        ],
      },
      {
        h2: 'Koliko brzo se vide rezultati?',
        body: [
          'Realističan vremenski okvir za prve značajne pomake je <strong>3–6 mjeseci</strong>. Mali popravci (brzina, meta opisi) mogu pokazati učinak za 2–4 tjedna, ali stabilno rangiranje za konkurentne pojmove zahtijeva strpljenje i konzistentan rad.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'digitalni-marketing', 'wordpress-izrada'],
  },
  {
    slug: 'digitalni-marketing',
    title: 'Digitalni Marketing: Freelance Marketinški Stručnjaci | Cenner',
    keyword: 'digitalni marketing',
    description:
      'Pronađi marketinškog freelancera u Hrvatskoj: Google Ads, Meta oglasi, social media, email marketing. Provjereni stručnjaci, transparentne cijene.',
    h1: 'Digitalni Marketing: Freelance Stručnjaci',
    intro:
      'Treba ti više kvalificiranih leadova, povratnih kupaca ili pratitelja na društvenim mrežama? Cenner povezuje hrvatske tvrtke s marketinškim freelancerima koji znaju što rade, bez gubljenja proračuna na neučinkovite kampanje.',
    sections: [
      {
        h2: 'Koje marketing usluge možeš pronaći?',
        body: [
          'Na Cenneru pronalaziš stručnjake za: <strong>Google Ads i Performance Max</strong>, <strong>Meta oglase</strong> (Facebook i Instagram), <strong>TikTok Ads</strong>, <strong>SEO i sadržajni marketing</strong>, <strong>email marketing</strong> (Klaviyo, Mailchimp), <strong>upravljanje društvenim mrežama</strong>, <strong>influencer outreach</strong> i <strong>marketinšku strategiju</strong>.',
        ],
      },
      {
        h2: 'Koliko izdvojiti za digitalni marketing?',
        body: [
          'Za male tvrtke i obrte, mjesečni proračun za oglase trebao bi biti minimalno <strong>500 € do 1.500 €</strong> da bi se vidjeli rezultati. Honorar freelancera za upravljanje kampanjama dodatno kreće od <strong>200 € do 800 € mjesečno</strong>, ovisno o opsegu.',
          'Pravilo: <strong>20% proračuna na honorar, 80% na sam media spend.</strong> Ako agencija traži obrnuto, bježi.',
        ],
      },
      {
        h2: 'Agencija ili freelancer?',
        body: [
          'Za male i srednje tvrtke u Hrvatskoj, dobar freelancer daje <strong>jednako kvalitetan rad uz upola manju cijenu</strong>. Direktna komunikacija, brže odluke, niži troškovi. Agencije imaju smisla samo kad ti treba paralelno više stručnjaka i veliki tim.',
        ],
      },
    ],
    related: ['seo-optimizacija', 'dizajn-loga', 'izrada-web-stranica'],
  },
  {
    slug: 'wordpress-izrada',
    title: 'WordPress Izrada: Freelanceri u Hrvatskoj | Cenner',
    keyword: 'wordpress izrada',
    description:
      'Trebaš WordPress web stranicu? Pronađi WordPress developera u Hrvatskoj. Tema, plugin, WooCommerce, optimizacija. Cijene od 250 €.',
    h1: 'WordPress Izrada: Freelance Developeri',
    intro:
      'WordPress pokreće više od 40% svih web stranica na svijetu i ostaje najpouzdaniji izbor za blogove, korporativne stranice i web shopove. Cenner ti pomaže pronaći WordPress developera koji izrađuje brze, sigurne i SEO-prijateljske stranice.',
    sections: [
      {
        h2: 'Koliko košta WordPress web stranica u Hrvatskoj?',
        body: [
          'WordPress stranica s gotovom temom i osnovnom prilagodbom kreće od <strong>250 € do 700 €</strong>. Custom tema rađena od nule s jedinstvenim dizajnom ide od <strong>800 € do 2.500 €</strong>. WooCommerce shop s katalogom, plaćanjem i dostavom kreće od <strong>1.200 € pa naviše</strong>.',
        ],
      },
      {
        h2: 'Što naši WordPress developeri rade?',
        body: [
          'Naši freelanceri pokrivaju cijeli WordPress stack: <strong>custom teme</strong> (PHP, ACF, Gutenberg blokovi), <strong>WooCommerce</strong> i e-commerce, <strong>plugin razvoj</strong>, <strong>migracije i performance optimizacija</strong>, <strong>sigurnosnu reviziju</strong>, te <strong>kontinuirano održavanje</strong>.',
        ],
      },
      {
        h2: 'WordPress ili Webflow / custom?',
        body: [
          'Ako trebaš stranicu koju će klijent moći sam ažurirati i kojoj treba bogat ekosustav plugina (npr. WooCommerce, formular, booking), <strong>WordPress je najbolji izbor</strong>. Za pure marketing stranice s naprednim animacijama često je bolji Webflow ili Astro. Za složene aplikacije: custom (Next.js, Remix).',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim WordPress developerima, Cenner tim i sam izrađuje WordPress stranice po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj što Cenner tim radi</a> i javi se izravno.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'seo-optimizacija', 'dizajn-loga'],
  },
  {
    slug: 'web-developeri',
    title: 'Usluge Profesionalnih Web Developera u Hrvatskoj | Cenner',
    keyword: 'usluge profesionalnih web developera, najbolji web developeri u hrvatskoj, web developer hrvatska',
    description:
      'Usluge profesionalnih web developera u Hrvatskoj: front-end, back-end, WordPress i web shopovi. Satnica od 25 €, plaćanje tek po isporuci.',
    h1: 'Profesionalni Web Developeri u Hrvatskoj',
    intro:
      'Trebaš web developera koji isporučuje na vrijeme i piše kod koji se može održavati? Cenner okuplja provjerene hrvatske web developere za front-end, back-end, WordPress i e-commerce projekte, uz osigurano plaćanje i više ponuda na jednom mjestu.',
    sections: [
      {
        h2: 'Koje usluge nude profesionalni web developeri?',
        body: [
          'Naši web developeri pokrivaju cijeli razvoj web stranica: <strong>front-end</strong> (React, Next.js, Vue, Astro, responzivni UI), <strong>back-end</strong> (Node.js, PHP, Python, baze podataka i API-ji), <strong>WordPress i WooCommerce</strong>, <strong>web shopove i integracije plaćanja</strong>, <strong>performance i SEO tehničku optimizaciju</strong> te <strong>održavanje i nadogradnju postojećih stranica</strong>.',
        ],
      },
      {
        h2: 'Koliko košta web developer u Hrvatskoj?',
        body: [
          'Satnica iskusnog web developera u Hrvatskoj kreće se od <strong>25 € do 70 € po satu</strong>, ovisno o tehnologiji i seniornosti. Fiksne cijene projekata: prezentacijska stranica od <strong>300 €</strong>, korporativna stranica s CMS-om od <strong>800 €</strong>, web shop ili aplikacija od <strong>2.000 €</strong> pa naviše.',
          'Na Cenneru objaviš projekt, dobiješ <strong>više ponuda</strong> i sam biraš. Plaćanje je u escrowu i oslobađa se tek kad si zadovoljan isporukom.',
        ],
      },
      {
        h2: 'Kako prepoznati najboljeg web developera?',
        body: [
          'Najbolji web developeri u Hrvatskoj razlikuju se po provjerljivim stvarima: <strong>portfolio sa živim stranicama</strong>, ocjene prijašnjih klijenata, jasan opseg i rok u ponudi, brzina učitavanja (Core Web Vitals) i spremnost da objasne tehničke odluke jednostavnim jezikom. Na Cenneru su svi developeri prošli <strong>KYC verifikaciju</strong>, a profili prikazuju ocjene, vrijeme isporuke i prethodne projekte.',
        ],
      },
      {
        h2: 'Freelance web developer ili agencija?',
        body: [
          'Za većinu malih i srednjih projekata freelance web developer daje <strong>jednaku kvalitetu uz 2 do 3 puta nižu cijenu</strong> jer nema fiksnih režija agencije. Agencija ima smisla kad ti paralelno treba dizajn, razvoj, copywriting i marketing pod jednim ugovorom, a i to često možeš složiti na Cenneru iz više freelancera.',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim developerima, Cenner tim i sam razvija web stranice, aplikacije i automatizacije po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj što Cenner tim radi</a> i javi se izravno.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'wordpress-izrada', 'programiranje'],
  },
  {
    slug: 'programiranje',
    title: 'Usluge Programiranja: Programeri po Projektu od 500 € | Cenner',
    keyword: 'usluge programiranja',
    description:
      'Usluge programiranja od 500 €: freelance programeri za web, mobilne aplikacije i API integracije. Više ponuda, escrow plaćanje, bez agencijskih marži.',
    h1: 'Usluge Programiranja: Freelance Developeri',
    intro:
      'Od web aplikacija i API integracija do mobilnih aplikacija i automatizacije, Cenner te povezuje s provjerenim hrvatskim programerima koji rade s modernim tehnologijama. Profesionalno programiranje po transparentnim cijenama, bez skupih agencijskih marži.',
    sections: [
      {
        h2: 'Koje usluge programiranja možeš pronaći?',
        body: [
          'Na Cenneru pronalaziš profesionalne developere za: <strong>web aplikacije</strong> (React, Next.js, Vue, Angular), <strong>backend i API razvoj</strong> (Node.js, Python, PHP, .NET, Java), <strong>mobilne aplikacije</strong> (React Native, Flutter, iOS, Android), <strong>e-commerce i integracije plaćanja</strong>, <strong>automatizaciju i skripte</strong>, <strong>bazu podataka i DevOps</strong>, te <strong>održavanje i nadogradnju postojećeg koda</strong>.',
        ],
      },
      {
        h2: 'Koliko koštaju usluge programiranja u Hrvatskoj?',
        body: [
          'Satnica iskusnog freelance developera u Hrvatskoj kreće se od <strong>25 € do 70 € po satu</strong>, ovisno o tehnologiji i seniornosti. Manji projekti (landing aplikacija, integracija, automatizacija) kreću od <strong>500 € do 2.000 €</strong>. Kompletne web ili mobilne aplikacije idu od <strong>3.000 € pa naviše</strong>, ovisno o opsegu.',
          'Na Cenneru dobivaš <strong>više ponuda</strong> od različitih programera i biraš onu koja odgovara tvom proračunu. Plaćanje ide kroz osigurani escrow sustav. Plaćaš tek kad je posao isporučen.',
        ],
      },
      {
        h2: 'Zašto freelance programer umjesto agencije?',
        body: [
          'Za većinu projekata dobar freelance developer isporučuje <strong>jednaku kvalitetu uz 2–3x nižu cijenu</strong> od agencije. Direktna komunikacija s osobom koja piše kod znači brže odluke, manje nesporazuma i transparentniji napredak.',
          'Svi programeri na Cenneru prošli su <strong>KYC verifikaciju</strong>, a njihovi profili sadrže portfolio, ocjene prijašnjih klijenata i tehnologije kojima vladaju.',
        ],
      },
      {
        h2: 'Kako pronaći pravog programera?',
        body: [
          'Klikni na "Pronađi freelancera", opiši svoj projekt i tehnički zahtjev u par rečenica, a naš AI matching predlaže 3–5 najprikladnijih developera u roku od minute. Pregledaj portfolije i reference, zatraži ponudu i kreni.',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim programerima, Cenner tim i sam preuzima razvoj web aplikacija i automatizacija po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj što Cenner tim radi</a> i javi se izravno.',
        ],
      },
    ],
    related: ['izrada-web-stranica', 'wordpress-izrada', 'seo-optimizacija'],
  },
];

// ---- city landing pages ----
export const cities = [
  {
    slug: 'zagreb',
    name: 'Zagreb',
    loc: 'Zagrebu',   // u ...
    gen: 'Zagreba',   // iz ...
    acc: 'Zagreb',   // Što čini ...
    title: 'Freelanceri Zagreb: Honorarni Posao u Zagrebu | Cenner',
    description:
      'Pronađi provjerene freelancere u Zagrebu: web developere, dizajnere, marketinške stručnjake. Honorarni posao u Zagrebu, brzo i sigurno.',
    h1: 'Freelanceri u Zagrebu',
    intro:
      'Zagreb je freelance metropola Hrvatske. Više od 60% svih registriranih freelancera na Cenneru radi iz glavnog grada. Bez obzira tražiš li web developera, grafičkog dizajnera ili marketinškog stručnjaka, na jednom mjestu pregledavaš ponudu vrhunskih zagrebačkih kreatora.',
    extra:
      'Zagreb je posebno jak u <strong>tech sektoru</strong> (web razvoj, mobile aplikacije, AI/ML), <strong>kreativnim industrijama</strong> (UX/UI, branding, motion design) i <strong>digitalnom marketingu</strong>. Mnogi naši zagrebački freelanceri rade za inozemne klijente, što jamči visoku razinu kvalitete i komunikacijskih vještina.',
  },
  {
    slug: 'split',
    name: 'Split',
    loc: 'Splitu',   // u ...
    gen: 'Splita',   // iz ...
    acc: 'Split',   // Što čini ...
    title: 'Freelanceri Split: Honorarni Posao u Splitu | Cenner',
    description:
      'Pronađi vrhunske freelancere u Splitu i Dalmaciji. Web razvoj, dizajn, marketing, prijevodi. Provjereni stručnjaci, sigurno plaćanje.',
    h1: 'Freelanceri u Splitu',
    intro:
      'Split i Dalmacija imaju brzorastuću freelance scenu, posebno u području web razvoja, turizma, hospitalityja i digitalnog marketinga. Cenner te povezuje s provjerenim splitskim freelancerima za honorarni posao u svim ključnim industrijama.',
    extra:
      'Mnogi splitski freelanceri specijalizirani su za <strong>turistički sektor</strong>: izradu booking stranica, marketing za hotele i privatne smještaje, multilingual SEO. Drugi rade s globalnim klijentima u tech-u i dizajnu, koristeći prednost mediteranskog načina života.',
  },
  {
    slug: 'rijeka',
    name: 'Rijeka',
    loc: 'Rijeci',   // u ...
    gen: 'Rijeke',   // iz ...
    acc: 'Rijeku',   // Što čini ...
    title: 'Freelanceri Rijeka: Honorarni Posao u Rijeci | Cenner',
    description:
      'Pronađi freelancere u Rijeci i Primorsko-goranskoj županiji. Web izrada, dizajn, marketing, copywriting. Cenner je vodeća freelance platforma u Hrvatskoj.',
    h1: 'Freelanceri u Rijeci',
    intro:
      'Rijeka je važno sveučilišno i tech središte sjeverne Hrvatske s rastućom freelance zajednicom. Na Cenneru pronalaziš riječke web developere, dizajnere, marketinške stručnjake i copywritere s referencama iz hrvatskih i međunarodnih projekata.',
    extra:
      'Rijeka ima jako tehničko sveučilište što znači <strong>stalan priljev mladih, kvalificiranih developera i inženjera</strong>. Posebno snažna kategorija su backend razvoj, embedded sustavi i industrijski softver.',
  },
  {
    slug: 'osijek',
    name: 'Osijek',
    loc: 'Osijeku',   // u ...
    gen: 'Osijeka',   // iz ...
    acc: 'Osijek',   // Što čini ...
    title: 'Freelanceri Osijek: Honorarni Posao u Slavoniji | Cenner',
    description:
      'Pronađi freelancere u Osijeku i Slavoniji. Web izrada, dizajn, marketing, prijevodi. Profesionalni rad po pristupačnim cijenama.',
    h1: 'Freelanceri u Osijeku',
    intro:
      'Osijek ima izuzetno aktivnu IT i kreativnu zajednicu, posebno povezanu s FERIT-om i Osječkim softverskim klubom. Na Cenneru pronalaziš osječke freelancere koji nude profesionalan rad po vrlo konkurentnim cijenama u odnosu na zagrebačko tržište.',
    extra:
      'Slavonski freelanceri poznati su po <strong>jakoj radnoj etici i fer cijenama</strong>. Mnogi rade i za inozemne klijente, što znači visoku razinu profesionalizma uz lokalnu dostupnost i razumijevanje hrvatskog tržišta.',
  },
];
