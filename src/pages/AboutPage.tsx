import { ArrowLeft, Globe, Code, Users, Building2, MessageSquare, Shield, Sparkles, BookOpen, Scale, Landmark, FlaskConical, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout'
import { useAuth } from '../hooks/useAuth'

function PublicHeader() {
  return (
    <header className="bg-blue-900 px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <span className="text-blue-800 font-bold text-xl">E</span>
        </div>
        <span className="text-white font-semibold text-xl">Eulesia</span>
      </div>
      <Link
        to="/"
        className="text-blue-200 hover:text-white text-sm transition-colors"
      >
        Kirjaudu sisään
      </Link>
    </header>
  )
}

function AboutContent() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* Back navigation (only for authenticated users) */}
      {isAuthenticated && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Takaisin
          </Link>
        </div>
      )}

      {/* Hero */}
      <div className="bg-blue-900 px-4 py-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span className="text-blue-900 font-bold text-xl">E</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Eulesia</h1>
            <p className="text-blue-200 text-sm">Eurooppalainen kansalaisinfrastruktuuri</p>
          </div>
        </div>
        <p className="text-blue-100 leading-relaxed">
          Eulesia on sosiaalinen media, joka on suunniteltu kansalaisinfrastruktuuriksi
          kaupallisen median sijaan. Julkinen tila, ei yksityinen alusta.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-800/60 text-blue-200 text-xs px-3 py-1.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          Projekti on alkuvaiheessa &mdash; kehitys on aktiivista
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">

        {/* What is Eulesia */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Mikä on Eulesia?
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Yhteiskunnallinen keskustelu on siirtynyt kaupallisille alustoille, jotka on
              suunniteltu huomion kaappaamiseen ja mainosmyyntiin &mdash; eivät demokraattiseen
              keskusteluun. Kunnat tiedottavat Facebookissa, kansalaiset keskustelevat Redditissä,
              mutta näiden alustojen kannustinrakenteet eivät palvele kansalaiskeskustelua.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Eulesia on vastaus tähän ongelmaan: sosiaalinen media, jossa on tutut toiminnot
              (syötteet, viestit, yhteisöt, keskustelut), mutta joka on rakennettu alusta asti
              kansalaistoiminnan ehdoilla. Nimi viittaa antiikin agoraan &mdash; julkiseen tilaan,
              jossa yhteisistä asioista keskusteltiin yhteisten sääntöjen alla.
            </p>
          </div>
        </div>

        {/* Why does this exist */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Miksi tämä on tarpeen?
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Kun julkiset instituutiot luottavat kaupallisiin alustoihin kansalaisten
              tavoittamisessa, ne luovuttavat osan digitaalisesta julkisesta tilasta yksityisille
              toimijoille. Kunnan Facebook-sivu toimii Metan käyttöehdoilla, ei demokraattisella
              mandaatilla.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Olemassa olevat osallisuusalustat (kuten Decidim tai CONSUL) tarjoavat
              rakenteita osallistuvaan demokratiaan, mutta niistä puuttuu arjen sosiaalinen
              vuorovaikutus. Kaupalliset alustat taas tarjoavat sosiaalisen toimijuuden, mutta
              ilman kansalaisrakennetta. Eulesia yhdistää molemmat: sosiaalisen toimijuuden
              ja kansalaisuuden.
            </p>
          </div>
        </div>

        {/* Four spaces */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Neljä tilaa
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Landmark className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Agora</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Julkinen kansalaiskeskustelu, joka on jäsennetty hallinnollisen tason mukaan:
                  paikallinen, kansallinen, eurooppalainen. Keskustelu ankkuroituu todellisiin
                  päätöksentekoprosesseihin.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Klubit</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kansalaisyhteiskunnan ja kiinnostusryhmien tiloja, joissa ihmiset voivat
                  järjestäytyä vapaasti ilman institutionaalista välittäjää.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Koti</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Yksityinen viestintä ja omat tilat. Henkilökohtainen alue, jonka sisältöä
                  ei käytetä mainontaan tai profilointiin.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Palvelut</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ekosysteemikerros käytännön kansalaistoiminnoille ilman
                  huomiotalouden logiikkaa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Design principles */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Suunnitteluperiaatteet
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">Todennettu identiteetti</p>
              <p className="text-xs text-gray-600 mt-1">
                Yksi henkilö, yksi tili. Osallistuminen omalla nimellä, kuten agoralla.
                Tavoitteena integraatio eurooppalaiseen digitaaliseen identiteettilompakkoon (EUDI).
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">Institutionaalinen läsnäolo</p>
              <p className="text-xs text-gray-600 mt-1">
                Julkiset instituutiot osallistuvat kansalaistoimijoina, eivät mainostajina.
                Kunnan osallistuessa keskusteluun näkyviin tulevat viralliset asiakirjat,
                aikataulut ja yhteystiedot.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">Ei huomiotaloutta</p>
              <p className="text-xs text-gray-600 mt-1">
                Ei algoritmista syötettä, ei loputonta scrollausta, ei sitoutumismittareita.
                Sisältö näkyy aikajärjestyksessä tai käyttäjän valitsemassa järjestyksessä.
                Arvolupaus ei ole dopamiini vaan vaikuttavuus.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">Sosiaalinen toimijuus</p>
              <p className="text-xs text-gray-600 mt-1">
                Kansalaiset voivat järjestäytyä ja keskustella vapaasti ilman, että kaikki
                toiminta kulkee institutionaalisten prosessien kautta.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">Käyttäjäkeskeinen tietosuoja</p>
              <p className="text-xs text-gray-600 mt-1">
                Ei mainontaa, ei käyttäytymisen seurantaa, ei datan myyntiä. GDPR
                sisäänrakennettuna, ei jälkikäteen lisättynä.
              </p>
            </div>
          </div>
        </div>

        {/* Automated content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Automaattinen kansalaissisältö
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Kunnallisten kokousten pöytäkirjat haetaan automaattisesti, tiivistetään
              tekoälyllä (eurooppalainen Mistral-kielimalli) ja julkaistaan keskustelunavauksina.
              Tiivistelmät ovat pääsykerros virallisiin asiakirjoihin, eivät niiden korvike &mdash;
              alkuperäislähteisiin on aina suora linkki.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Tämä ratkaisee kansalaisalustojen perusongelman: sisällön puutteen alussa.
              Uudet käyttäjät kohtaavat heti aitoa kansalaissisältöä, ja keskustelu alkaa
              kun päätökset ovat vielä valmisteilla &mdash; ei vasta niiden jälkeen.
            </p>
          </div>
        </div>

        {/* Project status and getting involved */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              Projektin tilanne ja osallistuminen
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Eulesia on alkuvaiheessa oleva tutkimus- ja kehitysprojekti. Toimiva prototyyppi
              on olemassa ja sitä kehitetään iteratiivisesti pilottikäyttäjien palautteen pohjalta.
              Suunnitteluperiaatteet on johdettu alustahallinnan tutkimuskirjallisuudesta.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Kehitys etenee usealla rinnakkaisella raiteella: tutkimusrahoitus, vapaaehtoinen
              kehitystyö ja yhteisön rakentaminen. Hallintomalli on vielä avoin &mdash; mahdollisuuksia
              ovat mm. itsenäinen säätiö, yhdistys tai muu julkista etua palveleva organisaatiomuoto.
            </p>
            <div className="bg-blue-50 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-900 font-medium">Tule mukaan kehittämään</p>
              <p className="text-xs text-blue-700 mt-1">
                Projektiin pääsee mukaan Eulesian sisällä &mdash; liity keskusteluun, anna
                palautetta, tai osallistu kehitystyöhön. Alkuvaiheen käyttäjillä on
                merkittävä rooli alustan suunnan muodostamisessa.
              </p>
            </div>
          </div>
        </div>

        {/* What we're not */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Mitä Eulesia ei ole</h2>
          </div>
          <div className="p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&#x2715;</span>
                <span>Ei osakkeenomistajille tilivelvollinen (vrt. Meta, X)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&#x2715;</span>
                <span>Ei mainosrahoitteinen &mdash; ei käyttäytymisdataan perustuvaa liiketoimintamallia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&#x2715;</span>
                <span>Ei yksipuolisia sääntömuutoksia yksityisten toimijoiden toimesta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">&#x2715;</span>
                <span>Ei optimoitu sitoutumiselle, huomiolle tai riippuvuudelle</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Research */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Tutkimustausta
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Eulesian suunnittelu perustuu Design Science Research -metodologiaan.
              Kuusi suunnitteluvaatimusta on johdettu normatiivisella synteesillä
              alustahallinnan tutkimuskirjallisuudesta. Projektia kehitetään
              akateemisen tutkimuksen rinnalla Tampereen yliopistossa.
            </p>
          </div>
        </div>

        {/* Open source */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              Avoin lähdekoodi
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Eulesian koodi on avointa lähdekoodia. Kuka tahansa voi tarkastella,
              auditoida ja osallistua alustan kehitykseen. Läpinäkyvyys on keskeinen
              periaate.
            </p>
            <a
              href="https://github.com/markussjoberg/eulesia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Näytä GitHubissa →
            </a>
          </div>
        </div>

        {/* EU alignment */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">🇪🇺</span>
          <div>
            <p className="font-medium text-blue-900">Eurooppalainen digitaalinen julkinen infrastruktuuri</p>
            <p className="text-sm text-blue-700 mt-1">
              Suunniteltu EU:n arvojen mukaisesti: yksityisyys, ihmisarvo,
              demokraattinen hallinto. Linjassa GDPR:n, DSA:n ja EUDI-lompakkokehyksen kanssa.
            </p>
          </div>
        </div>

        {/* CTA for non-authenticated */}
        {!isAuthenticated && (
          <div className="bg-blue-900 rounded-xl p-5 text-center">
            <h3 className="text-white font-semibold mb-2">Kiinnostaako?</h3>
            <p className="text-blue-200 text-sm mb-4">
              Eulesia on tällä hetkellä kutsuvaiheessa. Jos tunnet jonkun joka on
              jo mukana, pyydä kutsukoodi.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              Kirjautumissivulle
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export function AboutPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <Layout>
        <AboutContent />
      </Layout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="max-w-4xl mx-auto">
        <AboutContent />
      </div>
    </div>
  )
}
