// Service pages from the GSC gap report of 2026-11-26 (Desktop/GSC Performance Exports/CONTENT-GAPS-2026-11-26.md),
// appended to `services` in pages.mjs like seo-regions.mjs, so the generator, sitemap and markdown twins pick them up.
//
// Facts only: no claims about how many freelancers do what, no invented results or rankings. Prices are the ranges
// already published on /usluge/izrada-web-stranica and the blog post koliko-kosta-seo-optimizacija, so pages never
// disagree. Payment wording follows content/payment.mjs (ugovori s fazama: each phase funded before work starts).

export const gapPages = [
  {
    slug: 'seo-konzultant',
    title: 'SEO Konzultant i SEO Savjetovanje: Freelance | Cenner',
    keyword: 'seo konzultant, seo savjetovanje, seo stručnjak, seo savjetnik',
    description:
      'Angažiraj SEO konzultanta za audit, savjetovanje ili mjesečno vođenje. Što pokriva jedna konzultacija, kako se pripremiti i koliko košta, uz zaštićeno plaćanje.',
    h1: 'SEO Konzultant: Savjetovanje bez Cijelog Paketa',
    intro:
      'SEO konzultant ne mora sam raditi sve izmjene. Pregleda tvoju stranicu i podatke, kaže što koči rast i kojim redom to popraviti, a izmjene provodi tvoj tim ili developer. Na Cenneru takvu konzultaciju objaviš kao manji projekt s jasnim opsegom.',
    sections: [
      {
        h2: 'Što radi SEO konzultant?',
        body: [
          'Dobar SEO konzultant prvo gleda podatke, a tek onda preporučuje: <strong>Google Search Console</strong> (za koje upite se pojavljuješ, gdje gubiš klikove, koje stranice Google ne indeksira), <strong>Analytics</strong> (s kojih stranica dolaze upiti i kupnje) i samu stranicu (brzinu, strukturu, naslove i interne linkove).',
          'Rezultat konzultacije je <strong>popis izmjena poredan po učinku</strong>: što napraviti ovaj tjedan, što ovaj mjesec, a što može čekati. Uz to dobiješ odgovore na pitanja svog tima, primjerice treba li nova stranica za neku uslugu ili je bolje dopuniti postojeću.',
        ],
      },
      {
        h2: 'Tri načina rada sa SEO konzultantom',
        body: [
          '<strong>Jednokratni audit s pozivom.</strong> Konzultant pregleda stranicu, napiše nalaz i prođe ga s tobom na pozivu. Dobro za početak ili prije redizajna.',
          '<strong>Savjetovanje po satu.</strong> Kad imaš konkretna pitanja, na primjer prije selidbe na novu domenu ili nakon pada prometa. Opseg i broj sati dogovoriš u ponudi.',
          '<strong>Mjesečno savjetovanje.</strong> Konzultant jednom mjesečno pregleda brojke, postavi prioritete i provjeri što je tvoj tim napravio. Isplati se kad imaš nekoga tko provodi izmjene, ali nemaš SEO stručnjaka u kući.',
        ],
      },
      {
        h2: 'Koliko košta SEO savjetovanje?',
        body: [
          'Okvirno, prema našem <a href="/blog/koliko-kosta-seo-optimizacija">vodiču o cijeni SEO optimizacije</a>: jednokratni <strong>SEO audit od 200 € do 600 €</strong>, ovisno o veličini stranice. Savjetovanje po satu i mjesečno savjetovanje dogovaraju se u ponudi, pa usporedi više ponuda za isti opseg.',
          'Ako želiš da konzultant i provede izmjene, to je već SEO optimizacija: pogledaj <a href="/usluge/seo-optimizacija">SEO usluge</a>.',
        ],
      },
      {
        h2: 'Kako se pripremiti za konzultaciju?',
        body: [
          'Daj konzultantu <strong>pristup za čitanje u Google Search Consoleu i Analyticsu</strong>, ne svoju lozinku. Napiši što ti je cilj (više upita, prodaja, poziva) i koje su ti usluge ili proizvodi najvažniji. Ako je promet nedavno pao, zapiši datum i što se tada mijenjalo na stranici.',
        ],
      },
      {
        h2: 'Kako prepoznati dobrog SEO konzultanta?',
        body: [
          'Traži primjer nalaza koji je napravio za drugu stranicu i pitaj kako je mjerio učinak. Oprezno s obećanjima tipa "prvo mjesto na Googleu za mjesec dana": nitko ne može jamčiti poziciju, a dobar konzultant govori o upitima, klikovima i rokovima od nekoliko mjeseci.',
        ],
      },
    ],
    faq: [
      {
        q: 'Koja je razlika između SEO konzultanta i SEO agencije?',
        a: 'Konzultant savjetuje i postavlja prioritete, a izmjene najčešće radi tvoj tim. Agencija ili SEO freelancer na mjesečnom paketu radi i same izmjene. Konzultant je jeftiniji kad imaš nekoga tko može provesti preporuke.',
      },
      {
        q: 'Mogu li SEO savjetovanje dobiti online?',
        a: 'Da. SEO konzultant radi s pristupom tvojoj stranici i podacima, pa se konzultacija odradi preko poziva i dijeljenog dokumenta, bez obzira na to gdje si.',
      },
      {
        q: 'Koliko traje jedna SEO konzultacija?',
        a: 'Audit s pozivom obično traje od nekoliko dana do dva tjedna, ovisno o veličini stranice. Savjetovanje po satu može biti i jedan poziv, ako su pitanja konkretna.',
      },
    ],
    related: ['seo-optimizacija', 'seo-optimizacija-zagreb', 'digitalni-marketing'],
  },
  {
    slug: 'izrada-web-shopa',
    title: 'Izrada Web Shopa: Internet Trgovina po Mjeri | Cenner',
    keyword: 'izrada web shopa, izrada internet trgovine, web shop cijena, woocommerce, shopify',
    description:
      'Izrada web shopa za firme i obrte u Hrvatskoj: Shopify, WooCommerce ili po mjeri, kartično plaćanje, dostava i zakonske obveze. Više ponuda i zaštićeno plaćanje.',
    h1: 'Izrada Web Shopa i Internet Trgovine',
    intro:
      'Web shop nije samo katalog s gumbom "kupi". Treba primati kartice, izdati račun, poslati paket i poštovati pravila online prodaje. Na Cenneru pronađeš developere koji slože cijelu internet trgovinu, od izbora platforme do prve narudžbe.',
    sections: [
      {
        h2: 'Shopify, WooCommerce ili web shop po mjeri?',
        body: [
          '<strong>Shopify</strong> je najbrži put do prodaje: hosting, sigurnost i nadogradnje rješava platforma, a ti plaćaš mjesečnu pretplatu. <strong>WooCommerce</strong> (na WordPressu) daje više slobode i nema mjesečne pretplate za samu platformu, ali hosting i nadogradnje su tvoja briga. <strong>Web shop po mjeri</strong> ima smisla kad trebaš posebna pravila cijena, B2B narudžbe ili povezivanje s vlastitim sustavom.',
        ],
      },
      {
        h2: 'Koliko košta izrada web shopa?',
        body: [
          'Prema rasponima s naše stranice o <a href="/usluge/izrada-web-stranica">izradi web stranica</a>, web shopovi i složenije aplikacije kreću od <strong>2.000 € do 10.000 €</strong> i više. Cijenu najviše diže broj proizvoda i varijanti, povezivanje sa skladištem ili knjigovodstvom te poseban dizajn. Uz izradu računaj i mjesečne troškove: pretplatu ili hosting, naknade za kartično plaćanje i dodatke.',
        ],
      },
      {
        h2: 'Plaćanje karticama, računi i dostava',
        body: [
          'Za kartice se web shop spaja na pružatelja plaćanja, na primjer <strong>Stripe, CorvusPay ili WSPay</strong>. Svaka naplata karticom u Hrvatskoj traži <strong>fiskalizirani račun</strong>, pa provjeri da developer zna kako će web shop izdavati račune, ili da to radi tvoj program za fakturiranje.',
          'Za dostavu se web shop može povezati s dostavnim službama i paketomatima, tako da se adresnica napravi iz narudžbe, a kupac dobije broj za praćenje.',
        ],
      },
      {
        h2: 'Što web shop mora imati po zakonu?',
        body: [
          'Kod prodaje na daljinu kupac ima pravo na <strong>jednostrani raskid ugovora u roku od 14 dana</strong>, i o tome ga moraš obavijestiti prije kupnje. Web shop treba jasno prikazati podatke o prodavatelju (naziv, adresa, OIB), konačne cijene, troškove dostave, uvjete kupnje, politiku privatnosti i obavijest o kolačićima. Za konkretan slučaj provjeri s pravnikom ili knjigovođom.',
        ],
      },
      {
        h2: 'Kako naručiti web shop na Cenneru?',
        body: [
          'Objavi projekt s brojem proizvoda, načinom plaćanja i dostave te primjerima shopova koji ti se sviđaju. Usporedi ponude i odaberi developera. Veći projekt možeš podijeliti u <strong>ugovor s fazama</strong>: svaka faza se uplati prije nego što rad na njoj počne, a novac čuvamo dok fazu ne prihvatiš.',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim developerima, Cenner tim i sam radi web shopove po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj ponudu Cenner tima</a> i javi se izravno.',
        ],
      },
    ],
    faq: [
      {
        q: 'Je li bolji Shopify ili WooCommerce?',
        a: 'Shopify je jednostavniji za održavanje jer platforma rješava hosting i nadogradnje, uz mjesečnu pretplatu. WooCommerce daje više kontrole i nema pretplate za platformu, ali hosting, sigurnost i nadogradnje moraš održavati sam ili uz developera.',
      },
      {
        q: 'Koliko traje izrada web shopa?',
        a: 'Jednostavan shop na Shopifyu ili WooCommerceu može biti gotov za nekoliko tjedana. Shop po mjeri ili s povezivanjem na skladište i knjigovodstvo traje dulje, ovisno o opsegu.',
      },
      {
        q: 'Mogu li web shop platiti u ratama?',
        a: 'Na Cenneru možeš dogovoriti ugovor s fazama: plaćaš fazu po fazu, a svaka se uplaćuje prije početka rada na njoj. Novac čuvamo dok fazu ne prihvatiš.',
      },
    ],
    related: ['izrada-web-stranica', 'wordpress-izrada', 'programiranje'],
  },
  {
    slug: 'izrada-mobilnih-aplikacija',
    title: 'Izrada Mobilnih Aplikacija za iOS i Android | Cenner',
    keyword: 'izrada mobilnih aplikacija, izrada aplikacija, mobilna aplikacija cijena, ios android aplikacija',
    description:
      'Izrada mobilnih aplikacija za iOS i Android: nativno, React Native, Flutter ili web aplikacija. Što utječe na cijenu i rok, uz više ponuda i zaštićeno plaćanje.',
    h1: 'Izrada Mobilnih Aplikacija za iOS i Android',
    intro:
      'Prije prve linije koda isplati se odlučiti treba li ti prava aplikacija u App Storeu i Google Playu ili je dovoljna web aplikacija. Cenner te povezuje s developerima za oba puta, a ovdje je što trebaš znati prije objave projekta.',
    sections: [
      {
        h2: 'Nativna, cross-platform ili web aplikacija?',
        body: [
          '<strong>Nativna aplikacija</strong> (Swift za iOS, Kotlin za Android) daje najbolje performanse i pristup svim funkcijama uređaja, ali znači dvije odvojene aplikacije. <strong>Cross-platform</strong> (React Native ili Flutter) dijeli većinu koda između iOS-a i Androida, pa je obično jeftinija za istu funkcionalnost. <strong>Web aplikacija (PWA)</strong> radi u pregledniku i može se dodati na početni zaslon, bez trgovine aplikacija, ali s manje pristupa uređaju.',
        ],
      },
      {
        h2: 'O čemu ovisi cijena mobilne aplikacije?',
        body: [
          'Cijenu određuje broj ekrana i funkcija, treba li aplikaciji <strong>korisnički račun i vlastiti server</strong>, plaćanja unutar aplikacije, rad bez interneta i povezivanje s postojećim sustavima. Jednostavna aplikacija koja prikazuje sadržaj s postojeće stranice bitno je jeftinija od aplikacije s računima, porukama i plaćanjem. Najpouzdaniju procjenu dobiješ kad objaviš projekt s popisom funkcija i usporediš ponude.',
        ],
      },
      {
        h2: 'Troškovi nakon izrade',
        body: [
          'Za objavu u trgovinama trebaš <strong>Apple Developer račun (99 USD godišnje)</strong> i <strong>Google Play račun (jednokratno 25 USD)</strong>. Svaka nova verzija iOS-a i Androida može tražiti prilagodbe, a server, ako ga aplikacija ima, plaća se mjesečno. Zato se dogovori o održavanju prije nego što aplikacija izađe.',
        ],
      },
      {
        h2: 'Kako krenuti s manje rizika',
        body: [
          'Počni s <strong>najmanjom verzijom koja rješava glavni problem</strong> (MVP) i pusti je pravim korisnicima prije nego što dodaš sve ostalo. Na Cenneru veći projekt dijeliš u <strong>ugovor s fazama</strong>, na primjer dizajn, prva verzija i objava u trgovinama. Svaka faza se uplati prije početka rada na njoj, a novac čuvamo dok je ne prihvatiš.',
        ],
      },
      {
        h2: 'Želiš da Cenner tim napravi projekt umjesto tebe?',
        body: [
          'Uz marketplace s nezavisnim developerima, Cenner tim i sam radi aplikacije po fiksnoj cijeni. Ako ne želiš uspoređivati ponude, <a href="/services">pogledaj ponudu Cenner tima</a> i javi se izravno.',
        ],
      },
    ],
    faq: [
      {
        q: 'Je li bolji React Native ili Flutter?',
        a: 'Oba dijele kod između iOS-a i Androida i daju dobre rezultate. Izbor najčešće ovisi o tome u čemu developer ima više iskustva i s čime radi ostatak tvog sustava. Pitaj developera za aplikacije koje je već objavio.',
      },
      {
        q: 'Koliko traje izrada mobilne aplikacije?',
        a: 'Ovisi o opsegu. Uz izradu računaj i vrijeme za Appleov i Googleov pregled prije objave, koji obično traje od nekoliko dana do tjedan dana.',
      },
      {
        q: 'Treba li mi aplikacija ili je dovoljna web stranica?',
        a: 'Ako korisnici dolaze rijetko ili samo trebaju informacije, dobra responzivna web stranica ili web aplikacija često je dovoljna i jeftinija. Aplikacija ima smisla kad je korisnici otvaraju često, trebaju obavijesti ili funkcije uređaja.',
      },
    ],
    related: ['programiranje', 'web-developeri', 'izrada-web-shopa'],
  },
  {
    slug: 'web-stranice-za-nekretnine',
    title: 'Web Stranice za Agencije za Nekretnine | Cenner',
    keyword: 'web stranice za nekretnine, web stranica za agenciju za nekretnine, izrada web stranice nekretnine',
    description:
      'Izrada web stranice za agenciju za nekretnine: pretraga i filteri, karta, upiti po oglasu, više jezika i podaci koje oglas mora imati. Više ponuda freelancera.',
    h1: 'Web Stranice za Agencije za Nekretnine',
    intro:
      'Stranica agencije za nekretnine živi od oglasa: kupac mora brzo pronaći stan ili kuću, vidjeti fotografije i poslati upit za baš taj oglas. Cenner te povezuje s developerima koji takve stranice rade od pretrage do obrasca za upit.',
    sections: [
      {
        h2: 'Što treba dobra stranica za nekretnine?',
        body: [
          '<strong>Pretraga s filterima</strong> (vrsta, lokacija, cijena, kvadratura, broj soba), <strong>stranica oglasa</strong> s galerijom, tlocrtom i kartom, <strong>upit vezan uz oglas</strong> tako da znaš na koji se stan odnosi, te jednostavno dodavanje i skidanje oglasa za tvoj tim. Za strane kupce i turističku obalu često treba i <strong>engleska ili njemačka verzija</strong>.',
        ],
      },
      {
        h2: 'Oglasi na stranici i na oglasnicima',
        body: [
          'Većina agencija oglašava i na velikim oglasnicima. Pitaj developera može li stranica <strong>izvesti ili uvesti oglase</strong> u obliku koji tvoj oglasnik prima, kako ne bi isti oglas unosio dvaput. Što je moguće ovisi o oglasniku i o tome kakav pristup agencija ima.',
          'U oglasu za prodaju ili najam treba navesti <strong>energetski razred</strong> zgrade ili stana, pa neka obrazac za oglas ima to polje.',
        ],
      },
      {
        h2: 'Koliko košta stranica za nekretnine?',
        body: [
          'Predstavljajuća stranica agencije s nekoliko podstranica pada u raspon <strong>300 € do 800 €</strong>, a stranica s vlastitom bazom oglasa, pretragom i CMS-om u raspon <strong>800 € do 2.500 €</strong>, kao i druge korporativne stranice na <a href="/usluge/izrada-web-stranica">izradi web stranica</a>. Uvoz i izvoz oglasa ili posebne integracije podižu cijenu.',
        ],
      },
    ],
    faq: [
      {
        q: 'Mogu li sam dodavati oglase na stranicu?',
        a: 'Da, ako stranica ima CMS. Dogovori s developerom da dodavanje oglasa s fotografijama, cijenom i energetskim razredom traje par minuta, bez njegove pomoći.',
      },
      {
        q: 'Treba li stranica za nekretnine biti na više jezika?',
        a: 'Ako prodaješ strancima ili na obali, gotovo uvijek. Najčešće su engleski i njemački. Računaj da prijevod oglasa netko mora održavati.',
      },
    ],
    related: ['izrada-web-stranica', 'wordpress-izrada', 'seo-optimizacija'],
  },
  {
    slug: 'web-stranice-za-proizvodace',
    title: 'Web Stranice za Proizvođače i B2B Tvrtke | Cenner',
    keyword: 'web stranice za proizvođače, web stranica za industriju, b2b web stranica, web stranica za tvrtku',
    description:
      'Izrada web stranice za proizvođače, industriju i B2B tvrtke: katalog proizvoda, tehnički listovi, upiti za ponudu, više jezika za izvoz. Više ponuda freelancera.',
    h1: 'Web Stranice za Proizvođače, Industriju i B2B',
    intro:
      'Kupac proizvođača ne kupuje na klik. Traži specifikacije, certifikate i nekoga tko će poslati ponudu. Dobra B2B stranica zato više liči na katalog i prodajni alat nego na web shop. Cenner te povezuje s developerima koji takve stranice rade.',
    sections: [
      {
        h2: 'Što treba web stranica proizvođača?',
        body: [
          '<strong>Katalog proizvoda</strong> s tehničkim podacima i fotografijama, <strong>tehnički listovi i certifikati</strong> za preuzimanje (PDF), <strong>upit za ponudu</strong> koji se veže uz proizvod i količinu, te stranice o proizvodnji, kvaliteti i referencama. Ako izvoziš, treba <strong>verzija na jeziku tvojih kupaca</strong>, najčešće engleski i njemački.',
        ],
      },
      {
        h2: 'B2B portal za postojeće kupce',
        body: [
          'Kad stalni kupci naručuju često, isplati se <strong>zaštićeni dio s prijavom</strong>: njihove cijene, ponovljene narudžbe, status isporuke i dokumenti. To je već web aplikacija, pa je razgovaraj s developerom kao zasebnu fazu, nakon javne stranice.',
        ],
      },
      {
        h2: 'Koliko košta B2B web stranica?',
        body: [
          'Korporativna stranica s katalogom i CMS-om tipično pada u raspon <strong>800 € do 2.500 €</strong>, kao na našoj stranici o <a href="/usluge/izrada-web-stranica">izradi web stranica</a>. B2B portal s prijavom i povezivanjem na tvoj ERP ili skladište spada u složenije aplikacije, od <strong>2.000 €</strong> naviše. Na Cenneru takav projekt možeš podijeliti u ugovor s fazama.',
        ],
      },
    ],
    faq: [
      {
        q: 'Treba li proizvođaču web shop?',
        a: 'Rijetko. Većina B2B kupaca traži ponudu, pa je upit za ponudu vezan uz proizvod korisniji od košarice. Web shop ima smisla za standardne proizvode s fiksnom cijenom.',
      },
      {
        q: 'Može li se katalog povezati s našim ERP-om?',
        a: 'Često može, ako ERP ima izvoz podataka ili API. Navedi koji sustav koristiš kad objaviš projekt, kako bi developeri mogli realno procijeniti posao.',
      },
    ],
    related: ['izrada-web-stranica', 'programiranje', 'izrada-web-shopa'],
  },
];
