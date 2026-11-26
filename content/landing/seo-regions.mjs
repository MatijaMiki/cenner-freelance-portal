// Regional SEO landing pages (/usluge/seo-optimizacija-<regija>), appended to `services` in
// pages.mjs so the generator, sitemap and markdown twins pick them up like any service page.
//
// Why regions and not one page per town: GSC 2026-11-24 showed 49 "seo optimizacija <grad>"
// queries (1,366 impressions, avg position 70) and no page that names a town. One solid page per
// region, naming the towns people search, beats dozens of near-identical town pages.
// Facts only: no claims about how many freelancers live where, no invented results. Prices are the
// ranges from the blog post koliko-kosta-seo-optimizacija, so the two never disagree.

const PRICES =
  'Okvirno, prema našem <a href="/blog/koliko-kosta-seo-optimizacija">vodiču o cijeni SEO optimizacije</a>: jednokratni <strong>SEO audit od 200 € do 600 €</strong>, <strong>mjesečni paket za malu stranicu od 300 € do 800 €</strong>, veći web shopovi i nacionalne kampanje od 1.000 € mjesečno. Lokalni SEO u manjem mjestu obično je na donjem dijelu raspona, jer je konkurencija slabija i posla je manje.';

const REMOTE =
  'SEO se radi na daljinu: stručnjak treba pristup stranici, Google Search Consoleu i Google Business profilu, a ne ured u tvom gradu. Zato biraš po znanju lokalnog SEO-a i po izvještajima koje ti pokaže, a ne po adresi. Na Cenneru objaviš projekt, usporediš ponude i platiš pri narudžbi, a freelancer dobiva novac tek kad prihvatiš isporuku.';

const BASICS =
  'Lokalni SEO počinje istim koracima u svakom mjestu: <strong>Google Business profil</strong> s točnom kategorijom, radnim vremenom i fotografijama, <strong>isti naziv, adresa i telefon</strong> na stranici i u imenicima, <strong>stranica za svaku uslugu</strong> koja spominje mjesto gdje radiš, i <strong>recenzije</strong> na koje odgovaraš.';

function faqFor(place, extra) {
  return [
    {
      q: `Koliko košta SEO optimizacija u ${place}?`,
      a: `Jednokratni audit okvirno od 200 € do 600 €, mjesečni paket za malu stranicu od 300 € do 800 €. Točnu cijenu za tvoju stranicu dobiješ kad objaviš projekt na Cenneru i usporediš ponude. Rasponi su objašnjeni u <a href="/blog/koliko-kosta-seo-optimizacija">vodiču o cijeni SEO-a</a>.`,
    },
    {
      q: `Treba li mi SEO stručnjak iz ${extra.gen}?`,
      a: 'Ne nužno. SEO se radi na daljinu, a važnije je da stručnjak zna raditi lokalni SEO: Google Business profil, recenzije, lokalne ključne riječi i stranice po uslugama. Lokalno poznavanje tržišta je plus, ne uvjet.',
    },
    {
      q: 'Kada se vide prvi rezultati?',
      a: 'Popravci poput brzine, naslova i Google Business profila mogu se vidjeti za 2 do 4 tjedna. Stabilne pozicije za tražene pojmove obično traže 3 do 6 mjeseci rada.',
    },
    ...(extra.faq || []),
  ];
}

export const seoRegions = [
  {
    slug: 'seo-optimizacija-zagreb',
    area: 'Zagreb',
    title: 'SEO optimizacija Zagreb: cijena i lokalni SEO | Cenner',
    keyword: 'seo optimizacija zagreb, seo zagreb, seo optimizacija velika gorica, seo optimizacija samobor, seo optimizacija zaprešić',
    description:
      'SEO optimizacija u Zagrebu, Sesvetama, Velikoj Gorici, Samoboru i Zaprešiću: što radi lokalni SEO na najkonkurentnijem tržištu, cijene i kako odabrati stručnjaka.',
    h1: 'SEO optimizacija Zagreb',
    intro:
      'Zagreb je najkonkurentnije SEO tržište u Hrvatskoj: za gotovo svaku uslugu na prvoj stranici Googlea natječe se desetak firmi iz istog grada. Ovdje pobjeđuje stranica koja je preciznija od konkurencije, ne ona koja viče najglasnije.',
    sections: [
      {
        h2: 'Zašto je SEO u Zagrebu teži nego drugdje',
        body: [
          'Pojam kao "vodoinstalater Zagreb" ili "računovodstvo Zagreb" traži puno ljudi, ali ga cilja i puno firmi, mnoge s godinama starim stranicama i recenzijama. Zato opći pojmovi rijetko donose brze rezultate. Brže rade <strong>uži pojmovi</strong>: usluga plus kvart (Trešnjevka, Dubrava, Novi Zagreb), usluga plus problem koji kupac ima, ili usluga za određenu vrstu klijenta.',
          'Isto vrijedi za mjesta oko grada. <strong>SEO optimizacija u Sesvetama, Velikoj Gorici, Samoboru i Zaprešiću</strong> ima osjetno manje konkurencije nego u centru Zagreba, a kupci ondje često traže baš uslugu "blizu sebe".',
        ],
      },
      {
        h2: 'Što lokalni SEO u Zagrebu uključuje',
        body: [
          BASICS,
          'Za firmu koja radi po cijelom gradu to znači <strong>stranice po kvartovima ili dijelovima grada</strong> samo ondje gdje stvarno radiš i imaš što reći, a ne isti tekst s promijenjenim imenom kvarta. Google takve kopije prepoznaje i ne nagrađuje ih.',
          'Za B2B usluge, kojih je u Zagrebu najviše, pomaže sadržaj koji odgovara na pitanja kupaca prije poziva: cijene ili rasponi, rokovi, primjeri rada. Taj sadržaj donosi i upite iz ostatka Hrvatske.',
        ],
      },
      {
        h2: 'Cijena SEO optimizacije u Zagrebu',
        body: [
          PRICES,
          'U Zagrebu je za konkurentne pojmove realnije računati na mjesečni rad kroz duže razdoblje nego na jednokratni zahvat. Za kvartovske i prigradske pojmove često je dovoljan audit i dobar Google Business profil.',
        ],
      },
      { h2: 'Treba li SEO stručnjak biti iz Zagreba?', body: [REMOTE] },
    ],
    faq: faqFor('Zagrebu', { gen: 'Zagreba' }),
    related: ['seo-optimizacija', 'izrada-web-stranica', 'digitalni-marketing'],
  },
  {
    slug: 'seo-optimizacija-split-dalmacija',
    area: 'Dalmacija',
    title: 'SEO optimizacija Split i Dalmacija: cijena | Cenner',
    keyword: 'seo optimizacija split, seo optimizacija zadar, seo optimizacija šibenik, seo optimizacija dubrovnik, seo optimizacija trogir, seo optimizacija kaštela, seo optimizacija makarska',
    description:
      'SEO optimizacija za Split, Kaštela, Trogir, Omiš, Makarsku, Šibenik, Zadar, Biograd i Dubrovnik: SEO za turističku sezonu, strane jezike i lokalne usluge, s cijenama.',
    h1: 'SEO optimizacija Split i Dalmacija',
    intro:
      'U Dalmaciji SEO radi za dvije vrste kupaca: lokalne ljude koji traže uslugu cijele godine, i goste koji te traže na engleskom ili njemačkom mjesecima prije dolaska. Dobra stranica služi oboma.',
    sections: [
      {
        h2: 'SEO za Split, Kaštela, Trogir, Omiš i Makarsku',
        body: [
          'Split je najveće tržište u regiji i ondje je konkurencija za opće pojmove najjača. U <strong>Kaštelima, Trogiru, Omišu i Makarskoj</strong> konkurencija je slabija, pa stranica koja jasno navodi mjesto, uslugu i način kontakta može brzo doći na prvu stranicu za lokalne pretrage.',
          'Isto vrijedi južnije i sjevernije: <strong>SEO optimizacija u Zadru, Šibeniku, Biogradu na Moru i Dubrovniku</strong> prati isti obrazac. Grad sam za sebe je konkurentniji, a usluga plus manje mjesto ili usluga plus konkretan problem osvaja se brže.',
        ],
      },
      {
        h2: 'Turizam: gosti traže na svom jeziku, i to rano',
        body: [
          'Gost iz Njemačke ili Velike Britanije traži smještaj, izlet ili restoran na svom jeziku, često mjesecima prije putovanja. Za to trebaju <strong>prave stranice na stranim jezicima</strong> (ne automatski prijevod), ispravno označene za Google (hreflang), i Google Business profil s fotografijama i recenzijama na više jezika.',
          'Iznajmljivači se natječu s Bookingom i Airbnbom. Vlastita stranica rijetko ih nadmaši za opće pojmove, ali može osvojiti pretrage po imenu objekta, plaži ili kvartu i donijeti izravne rezervacije bez provizije.',
          'SEO treba mjesece da počne raditi, pa je za sezonu najbolje krenuti <strong>u jesen ili zimu</strong>, ne u svibnju.',
        ],
      },
      { h2: 'Što lokalni SEO u Dalmaciji uključuje', body: [BASICS] },
      { h2: 'Cijena SEO optimizacije u Splitu i Dalmaciji', body: [PRICES] },
      { h2: 'Treba li SEO stručnjak biti iz Splita?', body: [REMOTE] },
    ],
    faq: faqFor('Splitu i Dalmaciji', {
      gen: 'Splita ili Dalmacije',
      faq: [{
        q: 'Kada krenuti sa SEO-om za turističku sezonu?',
        a: 'Najkasnije u jesen ili zimu prije sezone. Nove stranice i jezične verzije trebaju nekoliko mjeseci da ih Google indeksira i rangira, a gosti rezerviraju rano.',
      }],
    }),
    related: ['seo-optimizacija', 'seo-optimizacija-istra', 'izrada-web-stranica'],
  },
  {
    slug: 'seo-optimizacija-istra',
    area: 'Istra',
    title: 'SEO optimizacija Istra: Pula, Poreč, Rovinj, Umag | Cenner',
    keyword: 'seo optimizacija pula, seo optimizacija poreč, seo optimizacija rovinj, seo optimizacija umag, seo istra',
    description:
      'SEO optimizacija u Istri: Pula, Poreč, Rovinj i Umag. SEO za goste koji traže na njemačkom, talijanskom i slovenskom, Google Business profil i cijene lokalnog SEO-a.',
    h1: 'SEO optimizacija Istra',
    intro:
      'U Istri velik dio pretraga dolazi izvan Hrvatske: iz Njemačke, Austrije, Italije i Slovenije. Stranica koja govori samo hrvatski propušta većinu ljudi koji bi te mogli pronaći.',
    sections: [
      {
        h2: 'SEO za Pulu, Poreč, Rovinj i Umag',
        body: [
          '<strong>Pula</strong> je najveći grad i ima najviše cjelogodišnjih lokalnih pretraga: zanati, zdravlje, servisi, poslovne usluge. <strong>Poreč, Rovinj i Umag</strong> jače ovise o turizmu, pa ondje presudnu ulogu imaju jezične verzije i Google Maps.',
          'Za ugostitelje, vinare, iznajmljivače i organizatore izleta najviše donosi Google Business profil s točnim radnim vremenom po sezoni, fotografijama i recenzijama, te stranica s jasnom ponudom na jezicima gostiju.',
        ],
      },
      {
        h2: 'Jezici: njemački, talijanski, slovenski, engleski',
        body: [
          'Svaka jezična verzija treba biti stvarno napisana za te goste, s pojmovima koje oni traže, i ispravno povezana oznakama hreflang. Automatski prijevod cijele stranice rijetko rangira i odbija ljude koji ga čitaju.',
          'Počni s jezikom iz kojeg dolazi najviše tvojih gostiju i dodaj ostale kad prvi proradi.',
        ],
      },
      { h2: 'Što lokalni SEO u Istri uključuje', body: [BASICS] },
      { h2: 'Cijena SEO optimizacije u Istri', body: [PRICES] },
      { h2: 'Treba li SEO stručnjak biti iz Istre?', body: [REMOTE] },
    ],
    faq: faqFor('Istri', {
      gen: 'Istre',
      faq: [{
        q: 'Na kojim jezicima treba biti stranica u Istri?',
        a: 'Na jezicima tvojih gostiju. Za većinu turističkih usluga to su njemački, talijanski i engleski, a uz granicu i slovenski. Bolje je imati dvije dobro napisane jezične verzije nego pet automatskih.',
      }],
    }),
    related: ['seo-optimizacija', 'seo-optimizacija-rijeka-kvarner', 'izrada-web-stranica'],
  },
  {
    slug: 'seo-optimizacija-rijeka-kvarner',
    area: 'Kvarner',
    title: 'SEO optimizacija Rijeka i Kvarner: cijena | Cenner',
    keyword: 'seo optimizacija rijeka, seo optimizacija rijeka cijena, seo optimizacija kastav, seo optimizacija crikvenica, seo optimizacija mali lošinj',
    description:
      'SEO optimizacija u Rijeci, Kastvu, Crikvenici, Opatiji i na Malom Lošinju: lokalni SEO za cjelogodišnje usluge i turizam na Kvarneru, s okvirnim cijenama.',
    h1: 'SEO optimizacija Rijeka i Kvarner',
    intro:
      'Kvarner spaja grad koji radi cijelu godinu i turistička mjesta i otoke koji žive od sezone. SEO za firmu iz Rijeke i SEO za apartman na Malom Lošinju nisu isti posao, i dobar stručnjak ih neće raditi isto.',
    sections: [
      {
        h2: 'SEO za Rijeku i Kastav',
        body: [
          '<strong>Rijeka</strong> ima stalno lokalno tržište: zanati, zdravstvo, obrazovanje, servisi i poslovne usluge. Ovdje rade stranice za svaku uslugu, Google Business profil i recenzije, kao u svakom većem gradu, uz manju konkurenciju nego u Zagrebu ili Splitu.',
          '<strong>Kastav</strong> i ostala mjesta oko Rijeke imaju još manje konkurencije, pa usluga plus mjesto često dolazi na prvu stranicu bez velikog ulaganja.',
        ],
      },
      {
        h2: 'SEO za Crikvenicu, Opatiju i Mali Lošinj',
        body: [
          'U turističkim mjestima vrijedi isto što i u ostatku Jadrana: gosti traže na svom jeziku, rano, i najčešće preko Google Mapsa. Trebaju ti prave jezične verzije stranice (najčešće njemački, talijanski i engleski), Google Business profil s fotografijama i recenzijama, i stranica koja jasno kaže što nudiš i kako rezervirati.',
          'Za otoke poput <strong>Lošinja</strong> pomaže sadržaj koji odgovara na pitanja prije dolaska: trajekt, parkiranje, plaže u blizini. Takve stranice donose posjete i kad gost još nije odabrao smještaj.',
        ],
      },
      { h2: 'Što lokalni SEO na Kvarneru uključuje', body: [BASICS] },
      { h2: 'Cijena SEO optimizacije u Rijeci', body: [PRICES] },
      { h2: 'Treba li SEO stručnjak biti iz Rijeke?', body: [REMOTE] },
    ],
    faq: faqFor('Rijeci', { gen: 'Rijeke' }),
    related: ['seo-optimizacija', 'seo-optimizacija-istra', 'wordpress-izrada'],
  },
  {
    slug: 'seo-optimizacija-osijek-slavonija',
    area: 'Slavonija',
    title: 'SEO optimizacija Osijek i Slavonija: cijena | Cenner',
    keyword: 'seo optimizacija osijek, seo optimizacija vukovar, seo optimizacija đakovo, seo optimizacija valpovo, seo optimizacija našice, seo optimizacija slatina, seo optimizacija požega',
    description:
      'SEO optimizacija u Osijeku, Vukovaru, Đakovu, Valpovu, Našicama, Slatini, Požegi i okolici. Manja konkurencija znači brže rezultate; što raditi i koliko košta.',
    h1: 'SEO optimizacija Osijek i Slavonija',
    intro:
      'U Slavoniji je konkurencija na Googleu slabija nego na obali ili u Zagrebu. Mnoge firme nemaju stranicu ili imaju zastarjelu, pa i osnovni lokalni SEO može brzo donijeti prvu stranicu za usluge u tvom mjestu.',
    sections: [
      {
        h2: 'SEO za Osijek i okolicu',
        body: [
          '<strong>Osijek</strong> je najveće tržište u regiji, s najviše pretraga i najviše firmi koje se natječu. I ondje su pojmovi puno lakši nego u Zagrebu. Mjesta uz Osijek, poput <strong>Višnjevca, Čepina, Valpova i Belišća</strong>, imaju još manje konkurencije, a kupci ondje često traže uslugu blizu sebe.',
        ],
      },
      {
        h2: 'SEO za Vukovar, Đakovo, Našice, Slatinu, Požegu i ostatak Slavonije',
        body: [
          'U <strong>Vukovaru, Đakovu, Našicama, Slatini, Požegi, Županji i Novoj Gradiški</strong> često je dovoljno imati stranicu koja jasno kaže što radiš i gdje, uređen Google Business profil i nekoliko recenzija da se pojaviš iznad konkurencije.',
          'Proizvođači, poljoprivredna gospodarstva i obrtnici koji prodaju izvan Slavonije trebaju drukčiji pristup: stranice za proizvode i kupce u cijeloj Hrvatskoj ili inozemstvu, a ne samo lokalne pojmove.',
        ],
      },
      { h2: 'Što lokalni SEO u Slavoniji uključuje', body: [BASICS] },
      {
        h2: 'Cijena SEO optimizacije u Osijeku i Slavoniji',
        body: [
          PRICES,
          'Za firmu koja cilja samo svoje mjesto često je dovoljan jednokratni audit, sređen Google Business profil i nekoliko dobro napisanih stranica, bez dugog mjesečnog ugovora.',
        ],
      },
      { h2: 'Treba li SEO stručnjak biti iz Osijeka?', body: [REMOTE] },
    ],
    faq: faqFor('Osijeku i Slavoniji', { gen: 'Osijeka ili Slavonije' }),
    related: ['seo-optimizacija', 'seo-optimizacija-sredisnja-hrvatska', 'izrada-web-stranica'],
  },
  {
    slug: 'seo-optimizacija-sredisnja-hrvatska',
    area: 'Središnja Hrvatska',
    title: 'SEO optimizacija Sisak, Bjelovar, Koprivnica, Daruvar | Cenner',
    keyword: 'seo optimizacija sisak, seo optimizacija daruvar, seo optimizacija bjelovar, seo optimizacija koprivnica, seo optimizacija petrinja, seo optimizacija čakovec, seo optimizacija kutina',
    description:
      'SEO optimizacija u Sisku, Petrinji, Kutini, Daruvaru, Bjelovaru, Koprivnici, Križevcima, Đurđevcu i Čakovcu: lokalni SEO uz slabu konkurenciju, i cijene.',
    h1: 'SEO optimizacija u središnjoj Hrvatskoj',
    intro:
      'U Sisku, Petrinji, Daruvaru, Bjelovaru, Koprivnici, Čakovcu i drugim gradovima središnje i sjeverne Hrvatske konkurencija za lokalne pojmove je slaba. Za većinu usluga tek nekoliko firmi ima stranicu koja ozbiljno cilja svoj grad, pa uredna stranica i Google Business profil brzo dolaze na vrh.',
    sections: [
      {
        h2: 'SEO za Sisak, Petrinju, Kutinu i Novsku',
        body: [
          'U <strong>Sisku, Petrinji, Kutini i Novskoj</strong> ljudi traže lokalne majstore, servise, zdravstvene i poslovne usluge, često s mobitela i preko Google Mapsa. Najviše donosi točan Google Business profil, stranica za svaku uslugu s mjestom u naslovu i recenzije zadovoljnih kupaca.',
        ],
      },
      {
        h2: 'SEO za Daruvar, Bjelovar, Koprivnicu, Križevce i Đurđevac',
        body: [
          '<strong>Daruvar</strong> uz lokalne usluge ima i lječilišni turizam, pa smještaj i wellness trebaju stranice koje odgovaraju na pitanja gostiju prije dolaska. <strong>Bjelovar, Koprivnica, Križevci i Đurđevac</strong> imaju jaku proizvodnju i obrt: firme koje prodaju izvan svog grada trebaju sadržaj za kupce u cijeloj Hrvatskoj, a ne samo lokalne pojmove.',
        ],
      },
      {
        h2: 'SEO za Čakovec i Međimurje',
        body: [
          '<strong>Čakovec</strong> i Međimurje blizu su Slovenije i Mađarske, a mnoge tamošnje firme izvoze. Ako prodaješ i preko granice, stranica na jeziku kupaca, uz ispravne oznake hreflang, otvara pretrage na koje domaća konkurencija ni ne cilja.',
        ],
      },
      { h2: 'Što lokalni SEO uključuje', body: [BASICS] },
      { h2: 'Cijena SEO optimizacije', body: [PRICES] },
      { h2: 'Treba li SEO stručnjak biti iz tvog grada?', body: [REMOTE] },
    ],
    faq: faqFor('Sisku, Bjelovaru ili Koprivnici', { gen: 'tvog grada' }),
    related: ['seo-optimizacija', 'seo-optimizacija-osijek-slavonija', 'izrada-web-stranica'],
  },
];
