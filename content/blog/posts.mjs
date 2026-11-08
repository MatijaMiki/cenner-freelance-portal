// Blog posts written in the repo (not in the admin CMS), so they ship with the build:
// pages/Blog.tsx and pages/BlogPost.tsx show them next to the CMS posts, and
// scripts/prerender-static-routes.mjs bakes each one into dist/blog/<slug>/index.html
// with its own <head> and the full article text, before any JS runs.
// scripts/generate-sitemap.mjs lists them, and scripts/generate-landing-pages.mjs links
// each /usluge page to the posts that name it in `services`.
//
// Each post targets one cluster of Search Console queries (GSC export 2026-10-23, last
// 3 months); `keywords` keeps that cluster next to the text it was written for.
// Facts about Cenner must come from the site itself (pages/Subscription.tsx,
// pages/Services.tsx, pages/Onboarding.tsx): no invented numbers, clients or quotes.
//
// Plain .mjs so the Node build scripts can import it without a TypeScript step.

export const BLOG_POSTS = [
  {
    slug: 'izrada-web-stranice-za-firmu-i-obrt',
    title: 'Izrada web stranice za firmu ili obrt: vodič od ideje do objave',
    seoTitle: 'Izrada web stranice za firmu i obrt: vodič',
    description:
      'Profesionalna izrada web stranice bez iznenađenja: što mala firma ili obrt stvarno treba, kojim redom ide posao, o čemu ovisi cijena i što provjeriti prije potpisa.',
    excerpt:
      'Što mala firma ili obrt stvarno treba od web stranice, kojim redom ide izrada, o čemu ovisi cijena i što provjeriti prije nego što nekome platiš.',
    keywords: [
      'izrada web stranica',
      'profesionalna izrada web stranica',
      'izrada web stranica firma',
      'izrada internet stranica',
      'izrada web rješenja',
      'izrada web stranica za male firme',
      'izrada naprednih web stranica po mjeri',
    ],
    services: ['izrada-web-stranica', 'wordpress-izrada'],
    publishedAt: '2026-10-23',
    author: 'Cenner',
    content: `Većina malih firmi i obrta ne treba "najbolju web stranicu na svijetu". Treba stranicu koja se brzo otvara na mobitelu, jasno kaže što radiš i gdje si, i kupcu omogućuje da te nazove, pošalje upit ili rezervira termin. Sve ostalo je dodatak koji ima smisla tek kad osnova radi.

Ovaj vodič prolazi cijeli put: od toga što ti zaista treba, preko izbora tehnologije i koraka izrade, do pitanja koja trebaš postaviti prije nego što nekome platiš.

## Što web stranica male firme stvarno treba

Za obrt, ured ili malu tvrtku dovoljna je kratka, uredna stranica sa sljedećim dijelovima:

- **Početna** koja u jednoj rečenici kaže što radiš, za koga i gdje.
- **Usluge ili ponuda**, svaka s kratkim opisom, a po mogućnosti i okvirnom cijenom ili načinom obračuna.
- **O nama**: tko stoji iza posla, koliko dugo to radite, fotografije pravih ljudi i prostora.
- **Reference ili radovi**, ako ih imaš. Tri dobra primjera vrijede više od dvadeset osrednjih.
- **Kontakt**: telefon koji se na mobitelu može kliknuti, e-mail, adresa, radno vrijeme i karta.

Uz to dolaze stvari koje se ne vide, a jednako su važne: stranica mora raditi na svim veličinama ekrana, brzo se učitavati, imati SSL certifikat (lokot u pregledniku), osnovnu SEO postavku i povezan Google Business profil. Bez toga i najljepši dizajn ostaje nevidljiv.

## Prezentacijska stranica, web shop ili rješenje po mjeri?

Prije traženja ponuda odluči koju vrstu projekta zapravo naručuješ, jer se razlikuju u trajanju i cijeni:

1. **Prezentacijska stranica.** Nekoliko podstranica, kontakt obrazac, Google karta. To je ono što treba većini obrtnika, ordinacija, ureda i lokalnih servisa.
2. **Web shop.** Katalog proizvoda, košarica, online plaćanje, dostava, računi. Posla je znatno više, a i odgovornosti: plaćanja, uvjeti prodaje, povrati.
3. **Napredna web stranica ili aplikacija po mjeri.** Rezervacije, korisnički računi, pretraga oglasa, više jezika, povezivanje s CRM-om ili knjigovodstvom.

Primjer iz naše prakse: za agenciju za nekretnine Selected Real Estate Cenner tim izradio je portal s oglasima, pretragom, profilima agenata i više jezika, a za zagrebačku firmu za čišćenje Čistimo platformu za online rezervacije s jasnim cijenama. Takvi projekti traže drugačiji opseg od stranice s pet podstranica, pa ih ne treba uspoređivati istom mjerom.

## WordPress ili izrada od nule?

**WordPress** je dobar izbor kad želiš sam mijenjati tekstove, dodavati objave ili voditi manji web shop (WooCommerce), a stranica ne treba neobične funkcije. Prednost je velik izbor gotovih dodataka i lako pronalaženje nekoga tko ga zna održavati. Više o tome piše na stranici o [izradi WordPress stranica](/usluge/wordpress-izrada).

**Izrada od nule** (npr. React, Next.js ili Astro) isplati se kad su ti presudni brzina, poseban dizajn ili funkcije koje dodaci ne pokrivaju dobro. Zauzvrat ovisiš više o developeru koji je stranicu napravio, pa traži da kod bude dokumentiran i predan tebi.

Nijedno nije "bolje" samo po sebi. Dobar izvođač preporučit će ono što odgovara tvom poslu, a ne ono što on najčešće radi.

## Kako izgleda izrada web stranice, korak po korak

1. **Cilj i sadržaj.** Zapiši što stranica treba postići (pozivi, upiti, prodaja, rezervacije) i skupi tekstove, fotografije i logo. Nedostatak sadržaja najčešći je razlog kašnjenja.
2. **Domena i hosting.** Domenu registriraj na svoje ime ili ime firme. Ako je za tebe registrira izvođač, provjeri da si ti vlasnik.
3. **Struktura i dizajn.** Prvo raspored podstranica i sadržaja, zatim izgled. Traži da vidiš dizajn i za mobitel, ne samo za računalo.
4. **Razvoj.** Izrada stranice, obrasci, integracije (karte, rezervacije, plaćanje, newsletter).
5. **SEO osnova.** Naslovi i opisi stranica, čitljivi URL-ovi, sitemap, brzina učitavanja, povezivanje s Google Search Consoleom i Google Business profilom.
6. **Testiranje i objava.** Provjera na više uređaja i preglednika, test obrazaca, preusmjeravanja sa stare stranice ako je imaš.
7. **Održavanje.** Ažuriranja, sigurnosne kopije i sitne izmjene. Dogovori unaprijed tko to radi i koliko košta.

## O čemu ovisi cijena izrade web stranice

Cijena ovisi o broju podstranica, tome tko piše tekstove, posebnim funkcijama (rezervacije, plaćanje, više jezika), dizajnu po mjeri ili gotovoj temi te o tome uključuje li ponuda hosting i održavanje. Okvirne raspone za različite vrste projekata držimo na stranici o [profesionalnoj izradi web stranica](/usluge/izrada-web-stranica).

Kad uspoređuješ ponude, nemoj gledati samo ukupan iznos. Usporedi **što je točno uključeno**: broj revizija dizajna, unos sadržaja, SEO postavku, obuku za uređivanje i rok. Jeftinija ponuda koja ne uključuje unos sadržaja ili mobilnu verziju dizajna na kraju često ispadne skuplja.

## Što provjeriti prije nego što platiš

- **Opseg u pisanom obliku**: koje podstranice, koje funkcije, koliko revizija, koji rok.
- **Vlasništvo**: domena, hosting, pristupni podaci i (kod izrade od nule) izvorni kod moraju na kraju biti tvoji.
- **Plaćanje po fazama**: dio na početku, ostatak po isporuci ili po dogovorenim etapama, nikad cijeli iznos unaprijed nekome koga ne poznaješ.
- **Reference koje se mogu otvoriti**: žive stranice, ne samo slike.
- **Što je nakon objave**: tko popravlja greške i koliko se dugo to radi bez naplate.

## Kako to ide preko Cennera

Na Cenneru imaš dva puta.

**Marketplace s freelancerima.** Pregledaš gotove pakete web developera s fiksnom cijenom i rokom ili objaviš projekt i usporediš ponude. Freelanceri prolaze KYC provjeru identiteta, a plaćanje ide kroz platformu: novac se drži dok posao nije isporučen, a veći projekti mogu se podijeliti na etape koje se plaćaju jedna po jedna.

**Cenner tim.** Ako ne želiš uspoređivati ponude, Cenner i sam izrađuje web stranice po fiksnoj cijeni: web stranice po mjeri od 800 €, WordPress stranice od 500 €. Prvo razgovaramo o tome što trebaš, zatim dobiješ jasan opseg, rok i cijenu, gradimo u fazama koje vidiš, a hosting i objava dio su posla. Više na stranici [usluga Cenner tima](/services).

### Kratki popis za kraj

- Znam što stranica treba postići i imam sadržaj.
- Domena je (ili će biti) na moje ime.
- Ponude uspoređujem po opsegu, ne samo po cijeni.
- Plaćanje je po fazama ili zaštićeno.
- Nakon objave znam tko održava stranicu.
`,
  },
  {
    slug: 'kako-odabrati-web-developera',
    title: 'Kako odabrati web developera: 10 pitanja prije nego što ga angažiraš',
    seoTitle: 'Kako odabrati web developera u Hrvatskoj: 10 pitanja',
    description:
      'Usluge profesionalnih web developera razlikuju se više nego što cijena pokazuje. Deset pitanja koja razdvajaju dobrog developera od lošeg izbora, i znakovi za uzbunu.',
    excerpt:
      'Najbolji web developer nije onaj s najljepšim portfoliom, nego onaj koji odgovara tvom projektu. Deset pitanja koja to brzo pokažu.',
    keywords: [
      'usluge profesionalnih web developera',
      'najbolji web developeri u hrvatskoj',
      'freelance web dizajner hrvatska',
      'web developer hrvatska',
      'web dizajner',
      'web development',
    ],
    services: ['web-developeri', 'programiranje'],
    publishedAt: '2026-10-23',
    author: 'Cenner',
    content: `"Najbolji web developer u Hrvatskoj" ne postoji kao jedna osoba. Postoji developer koji najbolje odgovara tvom projektu: tvom roku, proračunu, tehnologiji i načinu na koji voliš raditi. Netko tko je izvrstan za složenu web aplikaciju može biti loš izbor za brzu prezentacijsku stranicu, i obrnuto.

Dobra vijest je da se to može provjeriti prije nego što potrošiš novac. Evo kako.

## Što zapravo uključuju usluge web developera

Pod "web developer" kriju se prilično različiti poslovi:

- **Front-end**: ono što posjetitelj vidi i koristi, izgled na svim ekranima, brzina, pristupačnost.
- **Back-end**: baze podataka, korisnički računi, plaćanja, API-ji i sve što radi "iza".
- **WordPress i web shopovi**: prilagodba tema i dodataka, WooCommerce, održavanje.
- **Održavanje i nadogradnja**: popravci, ažuriranja, nove funkcije na postojećoj stranici.

Web dizajner i web developer nisu isto: dizajner osmišljava izgled i iskustvo, developer to pretvara u stranicu koja radi. Mnogi freelanceri rade oboje, ali pitaj izravno tko će raditi dizajn.

## Freelancer, agencija ili studio?

**Freelancer** je najčešće najisplativiji za male i srednje projekte: razgovaraš izravno s osobom koja radi posao, odluke su brže, a nema režija agencije. Rizik je ovisnost o jednoj osobi, pa je važno da kod, pristupi i dokumentacija budu kod tebe.

**Agencija** ima smisla kad ti istovremeno treba više ljudi (dizajn, razvoj, tekstovi, marketing) pod jednim ugovorom i jednim odgovornim.

**Manji studio** je između: mali tim, izravna komunikacija, ali i zamjena ako netko otpadne.

## 10 pitanja koja trebaš postaviti

1. **Možeš li mi pokazati tri slična projekta koja su živa?** Ne slike, nego stranice koje možeš otvoriti na mobitelu i vidjeti kako se ponašaju.
2. **Koju tehnologiju predlažeš i zašto baš nju?** Dobar developer objasni izbor jednostavnim riječima i spomene alternative.
3. **Što točno ulazi u ponudu?** Broj stranica, funkcije, revizije, unos sadržaja, SEO osnova, obuka.
4. **Što ne ulazi?** Ovo je često korisnije pitanje od prethodnog.
5. **Kakav je raspored i kada vidim prve rezultate?** Traži etape s datumima, ne samo konačan rok.
6. **Kako se plaća?** Po fazama ili kroz zaštićeno plaćanje. Cijeli iznos unaprijed je loš znak.
7. **Kome pripadaju domena, hosting, kod i pristupi?** Odgovor mora biti: tebi.
8. **Kako izgleda održavanje nakon objave?** Koliko dugo se greške popravljaju besplatno i koliko košta mjesečno održavanje.
9. **Kako ćemo komunicirati?** Kanal, učestalost javljanja i tko odgovara kad je hitno.
10. **Kako ćeš znati da je stranica brza?** Dobar developer spomene konkretna mjerenja (npr. Core Web Vitals), a ne samo "bit će brza".

## Znakovi za uzbunu

- Ponuda bez opisa opsega, samo s jednim iznosom.
- Traženje cijelog iznosa unaprijed.
- Odbijanje da domena ili pristupi budu na tvoje ime.
- Portfolio od kojeg se ništa ne može otvoriti.
- Obećanje "prvog mjesta na Googleu" kao dijela izrade stranice.

## Kako usporediti ponude

Stavi ponude jednu pored druge i za svaku zapiši: opseg, rok, način plaćanja, što je nakon objave i ukupnu cijenu. Tek kad su opsezi usporedivi, cijena postaje smislena usporedba. Okvirne satnice i cijene projekata navodimo na stranici o [uslugama profesionalnih web developera](/usluge/web-developeri).

## Kako pomaže Cenner

Na Cenneru možeš pregledati profile i gotove pakete web developera i programera s fiksnom cijenom i rokom isporuke, ili objaviti svoj projekt i dobiti više ponuda na jednom mjestu. Freelanceri prolaze KYC provjeru identiteta, profili prikazuju ocjene prijašnjih klijenata, a plaćanje ide kroz platformu i oslobađa se po isporuci. Za veće projekte posao se može podijeliti na etape.

Ako trebaš razvoj aplikacije, integraciju ili automatizaciju, pogledaj i [usluge programiranja](/usluge/programiranje). A ako ne želiš sam birati, [Cenner tim](/services) preuzima projekt po fiksnoj cijeni.
`,
  },
  {
    slug: 'koliko-kosta-seo-optimizacija',
    title: 'SEO optimizacija cijena: koliko košta SEO i kako odabrati stručnjaka',
    seoTitle: 'SEO optimizacija cijena: koliko košta SEO?',
    description:
      'SEO optimizacija cijena: okvirni rasponi za SEO audit i mjesečne pakete, zašto se ponude toliko razlikuju i kako prepoznati SEO stručnjaka kojem se isplati platiti.',
    excerpt:
      'Zašto jedna ponuda za SEO košta pet puta više od druge, što bi trebalo biti uključeno i kako prepoznati SEO stručnjaka kojemu se isplati platiti.',
    keywords: [
      'seo optimizacija cijena',
      'cijena seo optimizacije',
      'koliko košta seo optimizacija',
      'seo marketing cijena',
      'seo stručnjak',
      'seo konzultant',
      'seo agencija',
    ],
    services: ['seo-optimizacija', 'digitalni-marketing'],
    publishedAt: '2026-10-23',
    author: 'Cenner',
    content: `Kad pitaš za cijenu SEO optimizacije, možeš dobiti tri ponude koje se razlikuju nekoliko puta, a sve se zovu isto. Razlog nije (samo) pohlepa: pod "SEO" se prodaju vrlo različiti poslovi. Ovaj članak objašnjava što zapravo plaćaš, o čemu ovisi cijena i kako odabrati SEO stručnjaka, konzultanta ili agenciju.

Usput, i ovaj blog nastao je iz SEO posla: pogledali smo u Google Search Consoleu za koje pretrage se Cenner pojavljuje, a pitanja o cijeni SEO-a bila su među onima s najviše prikaza.

## Tri načina na koja se SEO naplaćuje

### 1. Jednokratni SEO audit

Stručnjak pregleda stranicu i preda ti popis problema i preporuka: tehničko stanje (indeksiranje, brzina, struktura), sadržaj, ključne riječi i konkurenciju. Dobar audit ne završava popisom od 200 stavki, nego redoslijedom: što popraviti prvo i zašto.

Audit ima smisla kad imaš developera ili nekoga u firmi tko će preporuke provesti.

### 2. Mjesečni paket

Kontinuirani rad: popravci, novi i bolji sadržaj, interne poveznice, lokalni SEO, praćenje rezultata i izvještaj. Ovdje plaćaš vrijeme i iskustvo kroz duže razdoblje, jer se rezultati SEO-a grade mjesecima.

### 3. Projekt ili satnica

Konkretan zadatak s početkom i krajem: migracija na novu stranicu bez gubitka pozicija, postavljanje strukturiranih podataka, optimizacija web shopa ili SEO konzultacije za tvoj tim.

## Okvirne cijene SEO optimizacije u Hrvatskoj

- **Jednokratni SEO audit** s preporukama: od **200 € do 600 €**.
- **Mjesečni paket** optimizacije za malu web stranicu: od **300 € do 800 € mjesečno**.
- **Veći e-commerce projekti i nacionalne kampanje**: od **1.000 € mjesečno** i više.

To su rasponi, ne cjenik: tvoja cijena ovisi o stvarima iz sljedećeg odjeljka. Što sve ulazi u pojedine [SEO usluge](/usluge/seo-optimizacija) opisali smo na zasebnoj stranici.

## O čemu ovisi cijena SEO optimizacije

- **Veličina stranice.** Stranica obrta s deset podstranica i web shop s tisućama proizvoda nisu isti posao.
- **Konkurencija.** Pojam koji traži cijela Hrvatska teže je osvojiti od lokalne usluge u manjem gradu.
- **Početno stanje.** Spora stranica s tehničkim greškama prvo treba popravak, pa tek onda sadržaj.
- **Tko piše sadržaj.** Ako tekstove piše SEO stručnjak, to je velik dio posla i cijene.
- **Poveznice.** Rad na tome da te drugi relevantni webovi spominju i povezuju dugotrajan je i zahtjevan.
- **Izvještavanje.** Mjesečni izvještaj s jasnim brojkama iz Search Consolea i Analyticsa traži vrijeme, ali bez njega ne znaš za što plaćaš.

## Lokalni SEO: trebaš li stručnjaka iz svog grada?

Ne nužno. SEO se radi na daljinu, pa za SEO optimizaciju u Zagrebu, Splitu, Sisku ili Poreču ne trebaš nekoga iz istog grada, nego nekoga tko zna raditi lokalni SEO: Google Business profil, točne i ujednačene podatke o firmi (naziv, adresa, telefon), recenzije, lokalne ključne riječi i stranice po lokacijama kad imaju smisla. U manjim mjestima konkurencija je obično slabija, pa se pomaci mogu vidjeti brže.

## Kako odabrati SEO stručnjaka, konzultanta ili agenciju

Pitaj:

1. **Što bi prvo napravio na mojoj stranici i zašto?** Dobar stručnjak već nakon kratkog pregleda zna navesti dva ili tri konkretna problema.
2. **Kako ćemo mjeriti napredak?** Očekuj prikaze, klikove i pozicije iz Search Consolea te upite ili prodaju, a ne samo "rangiranje".
3. **Tko radi posao?** Kod agencije pitaj hoće li tvoj projekt voditi iskusna osoba ili junior.
4. **Što od tebe treba?** SEO bez pristupa stranici, Search Consoleu i bez tvog znanja o kupcima ide sporo.
5. **Možeš li pokazati primjer izvještaja?** Izvještaj puno govori o načinu rada.

### Znakovi za uzbunu

- Jamstvo "prvog mjesta na Googleu". To nitko ne može obećati.
- Tajne metode koje ti ne smiju objasniti.
- Kupovina velikog broja poveznica za malo novca.
- Ugovor na godinu dana bez mogućnosti izlaska i bez mjesečnih izvještaja.

## Što možeš napraviti sam, danas

- Poveži stranicu s **Google Search Consoleom** i pogledaj za koje se pretrage već pojavljuješ.
- Otvori ili uredi **Google Business profil**: radno vrijeme, fotografije, kategorije, odgovori na recenzije.
- Provjeri da svaka važna stranica ima **jedinstven naslov i opis** koji kaže što na njoj piše.
- Napiši sadržaj koji odgovara na pitanja koja kupci stvarno postavljaju, kao što je ovaj članak.

## SEO stručnjaci na Cenneru

Na Cenneru možeš pronaći SEO freelancere i stručnjake za [digitalni marketing](/usluge/digitalni-marketing), usporediti gotove pakete s fiksnom cijenom ili objaviti projekt i dobiti više ponuda. Freelanceri prolaze KYC provjeru identiteta, a plaćanje se oslobađa po isporuci dogovorenog posla. Ako SEO dolazi uz novu stranicu, dobra je ideja odmah ga uključiti u [izradu web stranice](/usluge/izrada-web-stranica) umjesto da se kasnije popravlja.
`,
  },
  {
    slug: 'freelance-u-hrvatskoj',
    title: 'Freelance u Hrvatskoj: kako početi i pronaći honorarni posao online',
    seoTitle: 'Freelance u Hrvatskoj i honorarni posao online: vodič',
    description:
      'Kako početi s freelanceom u Hrvatskoj: registracija (paušalni obrt ili tvrtka), gdje tražiti honorarni posao online, kako složiti profil i ponudu te kako izbjeći prevare.',
    excerpt:
      'Od registracije do prvog klijenta: kako zakonito početi raditi kao freelancer u Hrvatskoj, gdje tražiti honorarni posao online i kako ne naletjeti na prevaru.',
    keywords: [
      'freelance hrvatska',
      'freelance',
      'freelancer hrvatska',
      'freelance platforma',
      'freelanceri',
      'honorarni posao online',
      'honorarni poslovi online',
      'freelance poslovi hrvatska',
    ],
    services: ['digitalni-marketing', 'programiranje'],
    publishedAt: '2026-10-23',
    author: 'Cenner',
    content: `Freelance je u Hrvatskoj sve češći način rada: dizajneri, programeri, prevoditelji, marketinški stručnjaci i mnogi drugi rade za više klijenata umjesto za jednog poslodavca. Sloboda je stvarna, ali i odgovornost: sam tražiš posao, sam određuješ cijenu i sam brineš o porezima.

Ovaj vodič je za one koji tek kreću ili žele honorarni posao online pretvoriti u nešto stabilnije.

## Što je freelance, a što honorarni posao

U svakodnevnom govoru znače gotovo isto: radiš na projektima za klijente, bez ugovora o radu. Razlika je obično u opsegu. Honorarni posao često je dodatak uz stalni posao, a freelance je glavni izvor prihoda. Pravila oko računa i poreza vrijede za oboje.

## Prvi korak: zakonita registracija

Da bi u Hrvatskoj mogao izdavati račune klijentima, trebaš registriran oblik djelatnosti. Za većinu freelancera koji kreću najjednostavniji je **paušalni obrt**: umjesto vođenja poslovnih knjiga plaća se paušalni porez prema razredu godišnjeg primitka. Kad posao naraste, mnogi prelaze na obrt koji vodi knjige ili osnivaju j.d.o.o. ili d.o.o.

Iznose poreza, doprinosa i pragova godišnjeg primitka uvijek provjeri na stranicama Porezne uprave ili kod knjigovođe, jer se mijenjaju. Korake otvaranja paušalnog obrta opisali smo u vodiču [Početak rada: otvaranje paušalnog obrta](/onboarding).

Važno ako radiš preko Cennera: platforma isplaćuje zaradu samo registriranim poreznim obveznicima (obrt, paušalni obrt ili tvrtka), jer bez registriranog subjekta ne možeš izdati račun.

## Gdje tražiti honorarni posao online

- **Vlastita mreža.** Prvi klijenti vrlo često dolaze preko bivših kolega, poslodavaca i poznanika. Javi im da radiš i što točno nudiš.
- **Freelance platforme.** Prednost je što klijenti tamo već traže izvođača, a plaćanje je zaštićeno. Nedostatak je konkurencija, pa profil mora biti dobar.
- **LinkedIn i društvene mreže.** Objavljuj konkretne radove i rezultate, ne samo "dostupan sam za posao".
- **Lokalne firme.** Obrti i male tvrtke u tvom kraju često trebaju web stranicu, grafike ili oglase, a nemaju koga pitati.

## Profil koji dobiva posao

1. **Jasna specijalizacija.** "Izrađujem WordPress stranice za ordinacije i salone" prodaje bolje od "radim sve vezano uz web".
2. **Portfolio s pravim radovima.** Ako tek krećeš, napravi dva ili tri projekta za sebe ili neprofitnu udrugu i pokaži ih.
3. **Konkretna ponuda.** Paket s opisom što je uključeno, rokom i cijenom klijentu skraćuje odluku.
4. **Brz i jasan odgovor.** Na upite odgovaraj isti dan, čak i ako je odgovor "javim se sutra s ponudom".
5. **Provjeren identitet.** Klijenti radije biraju nekoga čiji je identitet potvrđen.

## Kako odrediti cijenu

Kreni od toga koliko trebaš zaraditi mjesečno, dodaj poreze i doprinose, troškove alata i opreme te vrijeme koje nije naplativo (komunikacija, ponude, administracija). Tek onda usporedi s tržištem. Pogreška početnika je cijena koja pokriva samo sate rada na projektu.

## Kako izbjeći prevare

- Nikad ne plaćaj "klijentu" za materijale, licence ili "ulaznu naknadu" da bi dobio posao.
- Ne radi veliki posao bez pisanog dogovora o opsegu, roku i cijeni.
- Budi oprezan kad netko inzistira da komunikacija i plaćanje odmah idu izvan platforme.
- Kod većih projekata traži plaćanje po etapama.

## Kako freelance izgleda na Cenneru

Cenner je hrvatska freelance platforma na kojoj freelanceri nude gotove pakete (opis, fiksna cijena, rok isporuke) i odgovaraju na projekte koje objavljuju klijenti. Identitet se potvrđuje KYC provjerom, a plaćanje ide kroz platformu: klijent plaća unaprijed, novac se drži dok posao nije isporučen, a veći ugovori mogu se podijeliti na etape.

Otvaranje profila je besplatno. Na besplatnom planu provizija je 15 %, Pro (19 € mjesečno) spušta je na 10 %, Ultra (59 € mjesečno) na 5 %, a Enterprise (99 € mjesečno) na 0 %. Klijent pri plaćanju plaća naknadu od 5 %, osim kod Enterprise prodavatelja. Sve je na stranici [planova i cijena](/subscription).

U studenom stiže i **job matching**: poslovi rangirani prema tvojim vještinama, oglasima i profilu, tako da prvo vidiš projekte za koje imaš najviše šanse.

Ako tek krećeš, prvo uredi profil i objavi jedan dobro opisan paket. To je najbrži put do prvog upita.
`,
  },
  {
    slug: 'dizajn-loga-i-vizualnog-identiteta',
    title: 'Dizajn loga i vizualnog identiteta: kako naručiti logo koji traje',
    seoTitle: 'Dizajn loga i vizualnog identiteta: vodič',
    description:
      'Što je razlika između loga i vizualnog identiteta, kako napisati dobar brief za dizajnera, koje datoteke i prava moraš dobiti i o čemu ovisi cijena dizajna loga.',
    excerpt:
      'Logo nije cijeli brend, ali je početak. Kako napisati brief, što tražiti od dizajnera i koje datoteke i prava moraš dobiti na kraju.',
    keywords: [
      'dizajn loga',
      'izrada vizualnog identiteta',
      'izrada loga',
      'vizualni identitet',
      'izrada vizuala',
      'grafički dizajn',
    ],
    services: ['dizajn-loga'],
    publishedAt: '2026-10-23',
    author: 'Cenner',
    content: `Dobar logo prepoznaje se i na kartici od nekoliko milimetara i na kombiju. Loš logo radi samo na slici koju ti je dizajner poslao. Razlika najčešće ne ovisi o talentu, nego o tome koliko je dobro bio postavljen zadatak.

Ovaj vodič je za naručitelje: kako se pripremiti, što tražiti i što moraš dobiti na kraju.

## Logo, vizualni identitet i brend nisu isto

- **Logo** je znak i/ili ime u određenom pismu. To je jedna, istina najvažnija, stavka.
- **Vizualni identitet** je sustav: logo, boje, tipografija, način korištenja fotografija i grafika, pravila primjene.
- **Brend** je ono što ljudi misle i osjećaju o tebi. Vizualni identitet ga podržava, ali ga ne može sam stvoriti.

Za mali obrt ponekad je dovoljan logo s osnovnim bojama. Firma koja će imati web, društvene mreže, ambalažu i vozila treba cijeli vizualni identitet, inače svaka primjena izgleda malo drugačije. Što ulazi u [izradu vizualnog identiteta](/usluge/dizajn-loga) i kako pronaći dizajnera, pregledali smo na posebnoj stranici.

## Kako napisati brief za dizajnera

Brief ne mora biti dug. Dobar brief odgovara na ova pitanja:

1. **Tko ste i što radite**, u dvije ili tri rečenice.
2. **Tko su kupci**: dob, gdje vas susreću, što im je važno.
3. **Kako želite djelovati**: tri pridjeva (npr. pouzdano, toplo, moderno) i tri koja izbjegavate.
4. **Konkurencija**: dva ili tri konkurenta i što vam se kod njih sviđa ili ne.
5. **Gdje će se logo koristiti**: web, društvene mreže, vizitke, natpisi, ambalaža, vez na odjeći.
6. **Ograničenja**: postojeće boje, naziv koji se ne mijenja, rok, proračun.

Primjeri logotipa koji vam se sviđaju korisni su, ali objasni *zašto* vam se sviđaju. Dizajneru to govori više od same slike.

## Kako izgleda proces

Uobičajeno: brief i razgovor, istraživanje, nekoliko početnih smjerova, odabir jednog, dorade, pa izrada finalnih datoteka i pravila korištenja. Prije početka dogovori **koliko je smjerova i koliko krugova izmjena uključeno**. Neograničene izmjene zvuče dobro, ali obično znače da zadatak nije jasno postavljen.

Traži da vidiš logo **u primjeni**: na mobitelu, u maloj veličini, u jednoj boji, na tamnoj i svijetloj podlozi.

## Što moraš dobiti na kraju

- **Vektorske datoteke** (SVG, PDF ili AI/EPS) za tisak i natpise.
- **Rasterske datoteke** (PNG s prozirnom pozadinom) za web i društvene mreže.
- **Varijante**: puni logo, skraćeni znak, jednobojna i inverzna verzija.
- **Kodove boja** za ekran (HEX, RGB) i tisak (CMYK, po potrebi Pantone).
- **Nazive fontova** i informaciju o licenci.
- **Kratka pravila korištenja**: minimalna veličina, zaštitni prostor, što se ne smije.
- **Prijenos imovinskih autorskih prava** u pisanom obliku, ako želiš logo koristiti bez ograničenja. Bez toga autor zadržava prava, što može biti problem kod registracije žiga ili prodaje firme.

## O čemu ovisi cijena dizajna loga

Cijena ovisi o iskustvu dizajnera, broju početnih smjerova i krugova izmjena, tome je li to samo logo ili cijeli vizualni identitet, broju primjena koje treba pripremiti (vizitke, predlošci za društvene mreže, ambalaža) i o prijenosu prava. Okvirne raspone za logo i vizualni identitet navodimo na stranici [dizajn loga i vizualnog identiteta](/usluge/dizajn-loga).

Jeftin logo iz generatora ili gotovog predloška može poslužiti za početak, ali ga vjerojatno nećeš moći zaštititi, a ista slika možda se nalazi i kod nekog drugog.

## Izrada vizuala nakon loga

Kad imaš identitet, slijede vizuali za društvene mreže, oglase i tisak. Ako su pravila jasna, izrada vizuala je brža i jeftinija, a sve objave izgledaju kao da dolaze od iste firme, čak i kad ih radi netko drugi.

## Dizajneri na Cenneru

Na Cenneru možeš pregledati gotove pakete grafičkih dizajnera s fiksnom cijenom i rokom isporuke ili objaviti projekt i usporediti ponude. Dizajneri prolaze KYC provjeru identiteta, a plaćanje se oslobađa po isporuci. Ako želiš da posao preuzme Cenner tim, grafički dizajn (logo, vizualni identitet, grafike za društvene mreže i oglase, datoteke spremne za tisak) radimo od 300 €. Pogledaj [usluge Cenner tima](/services).
`,
  },
  {
    slug: 'kako-smo-izradili-ranwhat',
    title: 'Kako smo izradili ranwhat: od problema do proizvoda koji radi',
    seoTitle: 'Kako smo izradili ranwhat: studio iza proizvoda',
    description:
      'Priča o izradi ranwhata, besplatnog alata koji provjerava što su AI agenti za kodiranje zapisali na tvoje računalo: zašto smo ga napravili, što je bilo teško i što smo naučili.',
    excerpt:
      'Zašto smo napravili alat za sigurnost AI agenata, koje smo odluke donijeli, gdje smo pogriješili i što iz toga vrijedi za svaki web projekt.',
    keywords: [
      'izrada web aplikacije',
      'izrada web stranica',
      'razvoj softvera po mjeri',
      'web developer Hrvatska',
      'izrada web rješenja',
    ],
    services: ['izrada-web-stranica', 'web-developeri'],
    publishedAt: '2026-11-02',
    pinned: 1,
    author: 'Cenner',
    content: `Uz klijentske projekte, Cenner tim gradi i vlastite proizvode. Jedan od njih je [ranwhat](https://ranwhat.com), besplatan alat otvorenog koda koji provjerava što su AI agenti za kodiranje (Claude Code, Codex, Cursor i drugi) ostavili na tvom računalu. Ovdje pišemo kako je nastao, što nas je namučilo i što iz toga vrijedi za svakoga tko naručuje ili gradi web proizvod. Namjerno ne ulazimo u tehničke detalje: priča je zanimljivija od recepta.

## Zašto smo ga uopće napravili

I sami svaki dan radimo s AI agentima. Primijetili smo nešto što gotovo nitko ne gleda: agent sve što radi sprema u običnu tekstualnu datoteku na disku. Ako je neka naredba ispisala lozinku ili ključ za pristup, taj je podatak sada zapisan u povijesti razgovora. Alati koji traže tajne u kodu to ne vide, jer tajna nije u kodu nego u zapisu razgovora.

Pitanje "što je moj agent zapravo radio i što je usput pročitao?" nije imalo dobar odgovor. Zato smo ga napravili sami.

## Odluke koje su oblikovale proizvod

- **Sve se događa na tvom računalu.** Alat nema račun, ne šalje podatke i ne treba internet. Za alat koji dira osjetljive podatke to nije marketing, nego uvjet da mu itko vjeruje.
- **Besplatno mora ostati besplatno.** Plaćeni dio rastemo samo funkcijama koje bez poslužitelja ne mogu postojati. Ništa što se računa lokalno ne zaključavamo iza pretplate, jer bi to prije ili kasnije slomilo povjerenje korisnika.
- **Prvo mjerenje, onda tvrdnje.** Napravili smo vlastiti test s unaprijed postavljenim tajnama i mamcima te objavljujemo samo ono što bilo tko može ponoviti. U proizvodu koji govori o sigurnosti, preuveličana tvrdnja je najgora moguća pogreška.
- **Ne kopiramo konkurenciju.** Kad se pojavio sličan alat, odlučili smo ugraditi vlastite verzije zamisli koje vrijede, ali nikad tuđi kod, tekst ni pravila. Ideje su slobodne, tuđi rad nije.

![Terminal: ranwhat bench javlja da je pronašao svih 12 podmetnutih tajni i nije dirao nijedan mamac](/blog/ranwhat-bench.webp)

*Isječak izlaza naredbe ranwhat bench, na izmišljenim podacima. Potpuni izlaz uključuje i popis stvari koje alat ne hvata.*

## Što je bilo teško

**Svaki alat piše svoj format.** Što više agenata podržavaš, to više različitih zapisa moraš razumjeti, a oni se s novim verzijama mijenjaju. Naučili smo sve svesti na jedan zajednički oblik čim podaci uđu u alat, tako da novi agent znači jedan novi čitač, a ne promjene posvuda.

**Kod koji čita tuđi tekst mora biti otporan na zloban tekst.** Pokazalo se da se jedan naoko bezazlen izraz za prepoznavanje na neobičnom ulazu uspori do te mjere da se alat praktički zaledi. Našla ga je provjera koda, ne naši testovi. Od tada svaki dio koji čita nepouzdan tekst ima testove s namjerno pakosnim ulazima.

**"Radi kod mene" nije dovoljno.** Dio testova pretpostavljao je Mac, pa su na Linuxu i Windowsu pali. Naučili smo da se prenosivost ne dodaje na kraju, nego se provjerava od prvog dana, na svim sustavima koje obećavaš.

**Lažni alarmi su jednako loši kao propušteni.** Alat koji viče na svaku sitnicu korisnik ugasi. Dugo smo ugađali granicu između "upozori" i "šuti", i svaku promjenu mjerili na istom testu.

## Web stranica je dio proizvoda

Stranica nije samo ulaz, nego dio onoga što isporučujemo: vodiči odgovaraju na pitanja koja ljudi doista postavljaju, a svaka stranica ima i verziju koju strojevi lako čitaju. Realno, rezultati dolaze sporo. Prvih nekoliko tjedana pretraživač je stranicu pokazivao tek nekoliko stotina puta, uz samo nekoliko klikova. Za novu domenu bez poveznica to je normalno, i dobar podsjetnik klijentima: SEO nije prekidač, nego rad koji se zbraja tjednima.

Ni objava na Hacker Newsu nije prošla iz prve. Nove račune zajednica filtrira i cijeni sudjelovanje više od reklame. Prošli smo kroz to i naučili da proizvod ne postoji dok ga netko ne pronađe, a to treba graditi odvojeno od koda.

## Što iz ovoga vrijedi za tvoj projekt

1. **Odluči što nikad nećeš naplaćivati** prije nego što prvi put naplatiš nešto.
2. **Mjeri prije nego što tvrdiš.** Brojke bez načina da ih netko ponovi ne vrijede.
3. **Nepouzdan ulaz tretiraj kao neprijatelja.** Obrasci, uploadi i uvezeni podaci jednako vrijede kao i alati.
4. **Provjera koda od druge osobe (ili drugog alata) hvata ono što autor ne vidi.**
5. **Planiraj vidljivost kao dio projekta**, ne kao nešto što dolazi nakon objave.

Ako razmišljaš o web stranici ili aplikaciji i želiš s timom koji ovako razmišlja, pogledaj [izradu web stranica](/usluge/izrada-web-stranica) ili [usluge Cenner tima](/services). Alat možeš isprobati besplatno na [ranwhat.com](https://ranwhat.com).
`,
  },
  {
    slug: 'kako-smo-izradili-stenvakt',
    title: 'Kako smo izradili Stenvakt: aplikacija za održavanje servera bez straha',
    seoTitle: 'Kako smo izradili Stenvakt: studio iza proizvoda',
    description:
      'Priča o izradi Stenvakta, Mac aplikacije za pregled, zaštitu i ažuriranje Linux servera: zašto smo je napravili, kako smo se riješili straha od zaključavanja i što smo naučili.',
    excerpt:
      'Zašto smo napravili aplikaciju za održavanje servera, kako smo riješili najveći strah administratora i što smo usput naučili o dizajnu i proizvodima.',
    keywords: [
      'izrada web aplikacije',
      'razvoj aplikacija po mjeri',
      'izrada web stranica',
      'web developer Hrvatska',
      'održavanje servera',
    ],
    services: ['izrada-web-stranica', 'web-developeri'],
    publishedAt: '2026-11-02',
    pinned: 2,
    author: 'Cenner',
    content: `Cenner, kao i svaki projekt koji ima korisnike, radi na serverima, i netko ih mora održavati. Iz tog posla nastao je [Stenvakt](https://stenvakt.com), Mac aplikacija koja pregledava, nadzire i ažurira Linux servere koje sami vodite, preko SSH-a. Evo kako je nastala i što smo naučili. Bez recepata i detalja: priča je važnija.

## Problem koji smo imali

Održavanje servera ručno je dosadno i opasno u isto vrijeme. Dosadno jer se isti koraci ponavljaju: ažuriranja, vatrozid, pristup, sigurnosne kopije. Opasno jer jedna pogrešna naredba može zaključati tebe izvan tvog servera. Svatko tko to radi zna taj trenutak kad pritisneš Enter i moliš se da se veza ne prekine.

Alati koji to rješavaju ili su preteški (agenti i paneli koje treba instalirati na svaki server) ili prelaki (skripta iz tutorijala koju slijepo pokreneš). Htjeli smo nešto između: jednostavnu aplikaciju koja ništa ne instalira na servere, pokazuje što je loše i mijenja samo ono što odobriš.

## Ideja koja je sve odredila: promjena se mora moći poništiti

Cijeli dizajn proizašao je iz jednog pitanja: što ako nešto pođe po zlu? Izmjene vatrozida i SSH-a, koje su najopasnije za zaključavanje, stoga imaju sigurnosnu mrežu: server prije izmjene postavlja mjerač vremena za povratak, a promjena se zadržava tek kad se aplikacija uspije ponovno prijaviti novom vezom. Ako ne uspije, server se vraća na prethodno stanje sam, bez ičije intervencije. Najveći strah administratora tako postaje običan korak u postupku.

Tek kad je to radilo, imalo je smisla dodavati ostalo: pregled s ocjenama i popisom što riješiti prvo, praćenje neobične aktivnosti i ažuriranje programa s provjerom prije i poslije.

![Stenvakt, zaslon Review: ocjene sigurnosti i zdravlja servera i popis što treba popraviti](/blog/stenvakt-review.webp)

*Zaslon Review: ocjene i popis što riješiti prvo. Prikaz s izmišljenim serverima i adresama za primjer.*

![Stenvakt, zaslon Watch: tko se spaja na server i odakle](/blog/stenvakt-watch.webp)

*Zaslon Watch: što je stiglo do servera u zadnji sat. Također izmišljeni podaci.*

## Pametni pomoćnici, ali s pravilima

Danas se sve više radi uz AI asistente, pa smo omogućili da i oni čitaju izvještaje i predlažu izmjene. Pravilo je jednostavno: asistent predlaže, čovjek odobrava. Asistent nikad ne dobiva lozinke ni ključeve, ne može isključiti sigurnosni način, a sve što dolazi sa servera smatra se nepouzdanim tekstom. Iz toga smo naučili nešto korisno i za druge projekte: kad u sustav pustiš automatiku, najprije odluči što joj je zabranjeno, tek onda što smije.

## Na čemu radimo sada: čišćenje servera u jednom prolazu

Posljednja stvar na kojoj radimo zove se Polish, a nastala je iz našeg vlastitog posla: nakon ručnog čišćenja servera ostao je dugačak lanac koraka koje nitko ne želi voditi napamet. Sigurnosna kopija baze i provjera da se može pročitati, osvježavanje zastarjelih slika kontejnera, zatvaranje portova koji ne trebaju biti vani, prijava samo ključem, ažuriranja. Svaki korak ima uvjet prije, provjeru poslije i povratak na staro ako provjera padne. Ponovno pokretanje servera uvijek pita tebe.

Isto pravilo kao i s asistentima vrijedi i tu: asistent smije pratiti tijek, dodati bilješku, pauzirati ili prekinuti, ali nastaviti može samo čovjek. Za sada je isprobano na probnom serveru, još nije objavljeno i dio je plana Autopilot, koji se još ne prodaje.

## Što smo naučili usput

**Ime je teže nego što izgleda.** Većina riječi i elegantnih izmišljotina već je zauzeta. Završili smo s izmišljenom riječju, jer ime koje je moguće steći i zadržati vrijedi više od zgodnog imena koje ti nikad neće pripadati.

**Inspiracija nije kopiranje.** Prvi dizajn aplikacije bio je preblizu jednom uzoru koji smo gledali. Primijetili smo to na vrijeme i uklonili baš ona mjesta koja su bila preuzeta, a ostavili ono što radi: raspored, boje i način rada su naši. Pouka za svakog klijenta koji kaže "želim kao kod njih": uzori su dobri za smjer, ali konačan izgled mora biti vlastiti.

**Jedan problem, jedna stranica.** Web stranica ima vodiče, svaki odgovara na jedno konkretno pitanje koje smo i sami googlali dok smo održavali servere. To je ista lekcija kao kod svakog sadržaja: ljudi ne traže tvoj proizvod, traže rješenje svog problema.

**Dovrši, pa objavi.** Aplikacija je dugo bila "skoro gotova". Pravu kvalitetu dobila je tek kad smo je pustili svima i počeli ispravljati ono što stvarni korisnici pronađu. Prvo javno izdanje objavljeno je početkom studenog 2026, a besplatna verzija radi bez računa i bez ograničenja broja servera.

## Što to znači za tvoj projekt

1. **Najprije osmisli što se događa kad nešto pođe po zlu**, tek onda što se događa kad sve radi.
2. **Automatiku ograniči prije nego joj daš moć.**
3. **Uzori određuju smjer, ne izgled.**
4. **Sadržaj piši oko pitanja koja ljudi postavljaju**, ne oko onoga što ti želiš reći.
5. **Objavi prije nego što bude savršeno**, ali nikad prije nego što je sigurno.

Ako želiš web stranicu ili aplikaciju od tima koji svoje proizvode gradi na isti način, pogledaj [izradu web stranica](/usluge/izrada-web-stranica) ili [usluge Cenner tima](/services). Stenvakt možeš pogledati na [stenvakt.com](https://stenvakt.com), a priču o našem drugom proizvodu pročitaj u članku [Kako smo izradili ranwhat](/blog/kako-smo-izradili-ranwhat).
`,
  },
  {
    slug: 'ai-agent-na-serveru-odobri-pa-provjeri',
    title: 'AI agent na tvom serveru: odobri prije, provjeri poslije',
    seoTitle: 'AI agent na serveru: odobri prije, provjeri poslije',
    description:
      'Kako pustiti AI agenta (Claude Code, Codex, Cursor) do Linux servera bez straha: promjene idu preko odobrenja, a poslije provjeriš što je agent zaista pokrenuo.',
    excerpt:
      'Dva alata koja smo sami napravili, Stenvakt i ranwhat, pokrivaju dva trenutka rada s AI agentom na serveru: prije promjene i poslije nje.',
    keywords: [
      'AI agent server sigurnost',
      'Claude Code server',
      'održavanje servera',
      'izrada web aplikacije',
      'razvoj softvera po mjeri',
    ],
    services: ['izrada-web-stranica', 'web-developeri'],
    publishedAt: '2026-11-04',
    author: 'Cenner',
    content: `Svi koji danas održavaju server pitaju se isto: smijem li agentu dati pristup? Dok sami radimo s agentima svaki dan, na vlastitim serverima, naučili smo da odgovor nije "da" ni "ne", nego "uz dvije provjere". Obje smo pretvorili u alate: [Stenvakt](https://stenvakt.com) i [ranwhat](https://ranwhat.com). Ovo je kratka priča o tome kako rade zajedno.

## Najgori način je i najčešći

Zalijepiš SSH naredbu u razgovor i agent radi. Od tog trenutka drži tvoj ključ, tvoju ljusku i tvoj server, a jedini zapis o tome što je napravio je povijest razgovora. Ako nešto pođe po zlu, ne znaš ni što je pokrenuto ni kada.

## Prije promjene: agent predlaže, čovjek odobrava

Većina onoga što tražiš od agenta na serveru je čitanje: koji su portovi otvoreni, čekaju li ažuriranja, tko se prijavljivao. Čitanje ništa ne mijenja, pa može teći bez pitanja. Svaka promjena je drugačija. U Stenvaktu agent promjenu samo predlaže, ti vidiš naredbe koje bi se pokrenule i odobriš ih, a rizični koraci (vatrozid, SSH) imaju sigurnosnu mrežu: ako nakon promjene ne možeš ući, server se sam vraća na staro. Agent pritom nikad ne dobiva lozinke ni ključeve, jer vezu drži aplikacija na tvom računalu.

## Poslije: pročitaj što je agent stvarno napravio

Odobravanje pokriva samo ono što je prošlo kroz odobravanje. Agent koji ima i ljusku može pokrenuti naredbe mimo toga. Zato smo napravili ranwhat: čita zapise koje agenti već spremaju na tvoje računalo i izdvaja radnje koje vrijedi pogledati, poput brisanja, čitanja ključeva ili objave paketa. Radi lokalno, bez računa i bez slanja podataka. Jedna naredba, uvx ranwhat check, dovoljna je za početak.

## Rutina od pet minuta

1. Prije rada napravi sigurnosnu kopiju ili snimku servera.
2. Pusti agenta da čita i predlaže, a naredbe u svakom prijedlogu pročitaj prije odobrenja.
3. Sigurnosnu mrežu ostavi uključenu.
4. Kad sesija završi, pregledaj što je agent pokrenuo.
5. Na serveru provjeri zapis prijava ima li nepoznatih.

Detaljan vodič, s naredbama, nalazi se na [stenvakt.com](https://stenvakt.com/guides/ai-agent-on-your-server).

## Što smo iz toga naučili za tvoj projekt

Isto razmišljanje vrijedi za bilo koji sustav u koji pustiš automatiku: odluči što smije čitati, što smije mijenjati samo uz odobrenje, i kako ćeš poslije provjeriti što je napravila. Ako želiš aplikaciju ili web stranicu od tima koji svoje proizvode gradi na isti način, pogledaj [izradu web stranica](/usluge/izrada-web-stranica) ili [usluge Cenner tima](/services). Priče o samim alatima pročitaj u člancima [Kako smo izradili Stenvakt](/blog/kako-smo-izradili-stenvakt) i [Kako smo izradili ranwhat](/blog/kako-smo-izradili-ranwhat).
`,
  },
];

/** Pinned posts first (1 is the very first), then newest first, as the blog index lists them. */
export const sortedBlogPosts = () =>
  [...BLOG_POSTS].sort(
    (a, b) =>
      (a.pinned || 99) - (b.pinned || 99) ||
      (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0),
  );

export const findBlogPost = (slug) => BLOG_POSTS.find((p) => p.slug === slug) || null;
