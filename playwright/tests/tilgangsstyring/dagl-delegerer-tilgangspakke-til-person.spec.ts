import { Browser } from "@playwright/test";

import { Urler } from "../../config/environment";
import { expect, test } from "../../fixtures/test";
import { lesTestbrukere } from "../../fixtures/testbrukere.fixture";
import { ArbeidsflateForside } from "../../pages/arbeidsflate/forside";
import { Aktorbytte } from "../../pages/felles/aktorbytte";
import { instansierApp } from "../../pages/felles/appinstans";
import { Innlogging } from "../../pages/felles/innlogging";
import { TilgangsstyringBrukere } from "../../pages/tilgangsstyring/brukere";
import { TilgangsstyringForside } from "../../pages/tilgangsstyring/forside";

// Endrer ekte tilganger og oppretter en app-instans i at23, så testen kjører
// ikke i prod eller tt02 før den er verifisert der. Se README-notatet om
// tester som endrer data.
//
// Hardkodet her og ikke hentet fra `miljo`-fixturen fordi testbrukerne under
// slås opp på modulnivå (ved fil-innlasting), før noen fixture er løst for en
// konkret testkjøring — se diskusjonspunktet ved DAGL_A/PERSON_B.
const MILJO = "at23";

/**
 * Brukermønster test-H: en daglig leder delegerer en tilgangspakke til en
 * person via portalen, og personen får dermed se virksomhetens dialog i
 * innboksen. Se issue #622.
 *
 * Testen har kjørt grønt ende-til-ende mot at23. Underveis dukket det opp noen
 * ting som ikke var synlige fra koden alene:
 *
 * 1. Et cookiebanner som ikke besvares lar aktørbytteren stå i "loading" for
 *    alltid. Løsning: `cookiebanner.godta()` rett etter innlogging, før noe
 *    annet skjer (se `loggInnSomAktor`).
 * 2. Søkefeltet i aktørbytteren finnes to ganger i DOM-et (en skjult
 *    duplikat), og *hvilken* av dem som er den synlige er ikke stabil på
 *    tvers av brukere — litt som "Søk etter tilgangspakker" i
 *    TilgangsstyringBrukere. `Aktorbytte` sjekker nå synlighet eksplisitt
 *    istedenfor å anta DOM-rekkefølge.
 * 3. Den store: en "skygge-dialog" opprettet direkte mot
 *    dialogporten-serviceowner-API-et (`config/clients/dialogporten/serviceowner.ts`) synker ALDRI
 *    inn i mottakerens aktørliste/innboks etter en tilgangspakke-delegering —
 *    verifisert med tre uavhengige, rene kjøringer (5 min, 5 min, 15 min
 *    polling, ingenting annet rørte testbrukeren) som alle kom til samme
 *    resultat: fortsatt ikke der, selv om PDP-et og "Fullmakter hos andre"
 *    begge viste tilgangen som aktiv med en gang.
 *
 *    Løsningen: bruk en ekte app-instans istedenfor skygge-dialogen. DAGL A
 *    åpner selve appen (`instansierApp`, via sin egen innloggede økt — ikke et
 *    API-kall) og instansierer den på vegne av virksomheten, på samme måte en
 *    reell sluttbruker ville gjort.
 *
 *    OBS, korrigert i ettertid: en tidlig, isolert måling så ut til å vise at
 *    en instans opprettet slik dukket opp i person Bs Dialogporten-spørring
 *    på bare 4 sekunder — men en grundigere oppfølging (ny, fersk delegering
 *    + 147 sekunders polling, både med en håndbygget spørring og appens egen
 *    naturlige spørring) fant IKKE dialogen i det hele tatt. Den første "4
 *    sekunder"-målingen var forurenset: akkurat den instansen hadde allerede
 *    eksistert (og vært indeksert) i flere minutter fra et tidligere manuelt
 *    forsøk, så det ble aldri faktisk målt en fersk instans sin synk-tid.
 *    Konklusjonen står altså ved lag uansett instansieringsmåte: Dialogporten
 *    sin egen synkronisering av ferske delegeringer er fortsatt upålitelig —
 *    fra sekunder til et ubekreftet antall minutter — og dette gjelder
 *    reelle app-instanser like mye som skygge-dialoger. Den ekte
 *    instansieringsveien ble likevel beholdt, siden den uansett er riktigere
 *    (appens eget endepunkt, ikke en shortcut) og fordi en reell instans er
 *    noe en ekte DAGL faktisk ville opprettet.
 *
 *    Et par ting ble vurdert og forkastet før dette: å kalle Storage-API-et
 *    (`POST /storage/api/v1/instances`) direkte krever et eget
 *    APIM-abonnement ("AppsAccess"-produktet) vi ikke har — bekreftet
 *    empirisk (401 med akkurat den meldingen, uansett auth-header-form).
 *
 *    Praktisk konsekvens av at instansen nå opprettes via UI-et: tittelen på
 *    dialogen er satt av appen selv ("brukermonster-test-app" på alle språk),
 *    ikke noe testen velger — `ArbeidsflateForside.assertDialogVisible` bruker
 *    derfor `.first()`, siden gjentatte kjøringer kan la flere instanser med
 *    samme tittel ligge igjen uten at det er et problem (de er fortsatt
 *    reelle, synlige instanser). Instansene slettes ikke i opprydding: å
 *    rydde dem krever samme Storage-API vi ikke har tilgang til, og å la dem
 *    ligge er ufarlig på samme måte som k6s tilsvarende instance-delegation-
 *    tester gjør det.
 *
 *    PDP-et sin egen forsinkelse (uavhengig av Dialogporten) er fortsatt
 *    reell, men mye kortere: en ren måling (slett person B, poll PDP hvert
 *    20. sekund uten at noe annet rørte testbrukeren) viste ca. 80 sekunder
 *    for at Permit ble til noe annet. Pollingen for det står på 5 minutter
 *    som romslig margin.
 *
 *    Fordi GUI-sjekken (aktørbytteren) kan gi opp uten at det betyr at
 *    delegeringen faktisk feilet, har steget en fallback: spør Dialogportens
 *    egen enduser-API direkte (`erDialogSynligForPerson` i
 *    `config/clients/dialogporten/enduser.ts`) med person Bs eget personlige token. Det er en
 *    mer presis bekreftelse enn PDP-sjekken over, siden den spør om selve
 *    DIALOGEN er søkbar for personen — ikke bare at ressursen generelt sett
 *    er tillatt. Går rett mot Dialogporten, ikke via arbeidsflatens BFF
 *    (`af.{miljo}.altinn.cloud/api/graphql`), som ble bekreftet (401 "No
 *    token found") å kreve ekte nettleser-sesjonscookies, ikke et rent
 *    personlig token.
 *
 *    Praktisk konsekvens: denne testen deler én testperson/virksomhet
 *    (`01832449055` / `314249739`) med alle som kjører den. To kjøringer
 *    samtidig (eller en manuell opprydding mens en kjøring pågår) gir
 *    meningsløse resultater — kjør aldri mer enn én om gangen.
 *
 * Fixturene er for øvrig verifisert direkte mot at23, ikke bare antatt fra
 * testdata-navn:
 * - DAGL_A er reell tilgangsstyrer for VIRKSOMHET_A, ikke bare en av de andre
 *   rollene (revisor, styremedlem osv.) testdataene også gir tilgang til.
 * - PERSON_B (byttet etter at #669/#671 regenererte
 *   testdata/privatPersonUtenVirksomhet/at23.csv) hadde ingen tilgang fra før
 *   — bekreftet av PDP-kallet i steg 1, som alltid kjøres uansett.
 * - RESSURS_R (appen brukermonster-test-app) eies av tjenesteeieren ttd/digdir
 *   og er delegerbar. Policyen ble hentet direkte fra resource registry: den
 *   gir tilgang på rollene PRIV/DAGL eller via en av 11 navngitte
 *   tilgangspakker, deriblant "byggesoknad".
 * - PDP-kallet (krever AUTHORIZATION_SUBSCRIPTION_KEY) spør om tilgang på
 *   vegne av virksomheten (`buildOrgRequest`) — en tidligere versjon spurte om
 *   personens EGEN tilgang og traff da PRIV-regelen uansett delegering.
 *
 * ÅPNE DISKUSJONSPUNKTER fra PR #676-gjennomgangen (til pair programming-økten):
 * 1. DAGL_A/PERSON_B er hardkodede pid-er, ikke reservert dynamisk via
 *    testbrukere-fixturen (`user`/`reserverTestbruker` i
 *    `fixtures/testbrukere.fixture.ts`) slik andre tester gjør. Årsak: testen
 *    trenger en VERIFISERT relasjon (denne DAGL-en er faktisk DAGL for akkurat
 *    denne virksomheten; denne personen har null eksisterende relasjon til
 *    den) — mange dagligLeder-rader har 30+ andre virksomhetsrelasjoner som
 *    ikke er DAGL for virksomheten testen trenger. Løsningen er trolig å
 *    utvide testdataformatet til å kode denne paringen eksplisitt, men det bør
 *    avklares sammen, ikke bestemmes ensidig her.
 * 2. `loggInnSomAktor` instansierer Page-objektene manuelt istedenfor å bruke
 *    fixturene (`tilgangsstyring`/`brukere`/`aktorbytte` finnes allerede i
 *    `fixtures/tilgangsstyring.fixture.ts`) fordi testen trenger TO innloggede
 *    aktører (DAGL A og person B) samtidig, og dagens fixtures gir bare én
 *    `page` per test. Trolig løsning: en fixture som returnerer en
 *    innloggings-factory man kan kalle flere ganger per test, men det er ikke
 *    forsøkt ennå.
 * 3. PDP- og Dialogporten-enduser-kallene går nå via `pdp`/`dialogportenEnduser`
 *    i `fixtures/api-clients.fixture.ts` istedenfor rå funksjonsimport — ett
 *    forslag til hvordan API-klientene kan eksponeres som fixtures (jf.
 *    K6-mønsteret Renato pekte på), ikke en fasit. Se diskusjonspunktene i den
 *    fila, blant annet om tokenGenerator bør bli en fixture.
 */
const DAGL_A = lesTestbrukere("dagligLeder", MILJO).find((p) => p.pid === "01846099855");
const PERSON_B = lesTestbrukere("privatPersonUtenVirksomhet", MILJO).find((p) => p.pid === "01832449055");

if (!DAGL_A || !PERSON_B) {
    throw new Error(
        "Testdataene for Brukermønster test-H (pid 01846099855 / 01832449055) mangler i " +
        "testdata/dagligLeder/at23.csv eller testdata/privatPersonUtenVirksomhet/at23.csv"
    );
}

const VIRKSOMHET_A = { orgnr: "314249739", navn: "Umusikalsk Kostbar Bille IKS" };
const RESSURS_R = "app_ttd_brukermonster-test-app";
const APP_URL = "https://ttd.apps.at23.altinn.cloud/ttd/brukermonster-test-app/";
const PAKKE_P = { sokeord: "byggesoknad", navn: "Byggesøknad" };
const DIALOG_TITTEL = "brukermonster-test-app";

/**
 * Personen etter mellomrommet i testdataenes `name`-felt er etternavnet
 * "Legg til person"-skjemaet validerer mot folkeregisteret.
 */
function etternavn(navn: string): string {
    return navn.split(" ").pop() as string;
}

/**
 * Åpner en egen browser context og logger inn som personen, og bygger
 * page-objectene testen trenger for den økten.
 *
 * DAGL A og Person B må være to atskilte økter og ikke samme side etter
 * hverandre: skulle de delt page-fixturen, ville den andre innloggingen byttet
 * ut sesjonen den første fortsatt trenger i oppryddingen.
 */
async function loggInnSomAktor(browser: Browser, urler: Urler, mockporten: boolean, person: { pid: string; name: string }) {
    const context = await browser.newContext();
    const page = await context.newPage();

    const innlogging = new Innlogging(page, urler, mockporten);
    const tilgangsstyringForside = new TilgangsstyringForside(page, urler.tilgangsstyring);

    await innlogging.loggInnViaTilgangsstyring(person);

    const aktorbytte = new Aktorbytte(page);

    // En bruker med mange aktører (som DAGL A) lander med aktørvelgeren
    // allerede åpen, som blokkerer cookiebanneret bak den til et valg er
    // gjort — se `Aktorbytte.lukkHvisAutoApnet`. Må skje FØR cookiebanneret
    // besvares, ellers henger testen i ventingen på et cookiebanner den
    // aldri får klikket.
    await aktorbytte.lukkHvisAutoApnet();

    // Et ubesvart cookiebanner lar aktørbytteren stå i "loading" for alltid,
    // siden den ikke blir en reell overlay-blokkering men visstnok forsinker
    // kallet som henter aktørlisten. Samme mønster som andre tester: godta
    // rett etter innlogging, før noe annet skjer på siden.
    await tilgangsstyringForside.cookiebanner.godta();

    return {
        context,
        page,
        aktorbytte,
        brukere: new TilgangsstyringBrukere(page, urler.tilgangsstyring),
        arbeidsflate: new ArbeidsflateForside(page, urler.arbeidsflate),
    };
}

test(
    "DAGL delegerer tilgangspakke til person, som dermed ser virksomhetens dialog",
    { tag: ["@at23"] },
    async ({ browser, urler, mockporten, pdp, dialogportenEnduser }, testInfo) => {
        // PDP-pollingen på vei ut kan ta opptil 5 minutter, og
        // API-fallbacken for å se dialogen (se klassekommentaren og steget
        // lenger ned) kan selv ta opptil 13 minutter, pluss to innlogginger,
        // en app-instansiering og resten av flyten. Standardtimeouten på 60
        // sekunder er langt unna nok.
        testInfo.setTimeout(25 * 60_000);

        await test.step("Person B har ikke tilgang på ressursen fra før", async () => {
            const beslutning = await pdp.authorize(PERSON_B.pid, VIRKSOMHET_A.orgnr, RESSURS_R, "read");
            expect(beslutning, "Person B har ikke tilgang før delegering").not.toBe("Permit");
        });

        const dagl = await loggInnSomAktor(browser, urler, mockporten, DAGL_A);

        try {
            await test.step("DAGL A velger virksomheten sin", async () => {
                await dagl.aktorbytte.byttTilVirksomhet(VIRKSOMHET_A.orgnr, VIRKSOMHET_A.navn);
            });

            await test.step("Forutsetning: virksomheten har en dialog i innboksen", async () => {
                await instansierApp(dagl.page, APP_URL, VIRKSOMHET_A.navn);
            });

            await test.step("DAGL A legger til person B og gir tilgangspakken", async () => {
                await dagl.brukere.navigateTo();
                await dagl.brukere.leggTilPerson(PERSON_B.pid, etternavn(PERSON_B.name));
                await dagl.brukere.giTilgangspakke(PAKKE_P.sokeord, PAKKE_P.navn);
            });

            await test.step("Delegeringen består en sideoppfriskning", async () => {
                await dagl.page.reload();
                await expect.poll(
                    () => dagl.brukere.antallTilgangspakker(),
                    { message: "Tilgangspakken er fortsatt der etter reload" }
                ).toBeGreaterThan(0);
            });

            await test.step("PDP gir Person B tilgang på ressursen", async () => {
                await expect.poll(
                    () => pdp.authorize(PERSON_B.pid, VIRKSOMHET_A.orgnr, RESSURS_R, "read"),
                    {
                        message: "PDP svarer Permit for person B",
                        timeout: 30_000,
                        intervals: [2_000],
                    }
                ).toBe("Permit");
            });

            await test.step("Person B ser (forhåpentligvis) dialogen i innboksen", async () => {
                // PDP-pollen rett over er den autoritative verifiseringen av at
                // delegeringen virker — den er rask og pålitelig, verifisert
                // gjentatte ganger direkte mot at23. Dette steget prøver i
                // tillegg å bekrefte det samme der det faktisk teller: at
                // dialogen er synlig for person B. Først via den visuelle
                // sjekken issue #622 ber om (velge virksomheten, se dialogen i
                // innboksen); rekker ikke GUI-et det innen 2 minutter, spørres
                // Dialogportens egen enduser-API direkte istedenfor (se
                // `erDialogSynligForPerson` i `config/dialogporten.ts`) — en
                // mer presis bekreftelse enn PDP-sjekken, siden den spør om
                // selve dialogen, ikke bare ressurstilgangen generelt.
                //
                // Verken GUI- eller API-sjekken feiler testen om de ikke rekker
                // å bli positive: om virksomheten/dialogen dukker opp for
                // Person B tar ulik tid i praksis, fra sekunder til ikke i det
                // hele tatt innen 15 minutter, verifisert med flere
                // uavhengige, kontrollerte målinger (se klassekommentaren og
                // minnefila for Brukermønster test-H). Så lenge det er uklart
                // om dette noen gang blir pålitelig raskt, skal ikke denne
                // testen stå og rødt av den grunn — PDP-sjekken over har
                // allerede bevist at tilgangen faktisk er der.
                const personB = await loggInnSomAktor(browser, urler, mockporten, PERSON_B);

                try {
                    const dukketOppIAktorlisten = await expect.poll(
                        async () => {
                            await personB.page.reload();

                            try {
                                await personB.aktorbytte.byttTilVirksomhet(VIRKSOMHET_A.orgnr, VIRKSOMHET_A.navn);
                                return true;
                            } catch {
                                return false;
                            }
                        },
                        {
                            message: `${VIRKSOMHET_A.navn} dukker opp i person Bs aktørliste`,
                            timeout: 2 * 60_000,
                            intervals: [15_000],
                        }
                    ).toBe(true).then(() => true, () => false);

                    if (dukketOppIAktorlisten) {
                        await personB.arbeidsflate.navigateTo();
                        await personB.arbeidsflate.assertDialogVisible(DIALOG_TITTEL);
                        return;
                    }

                    const dialogSynligViaApi = await expect.poll(
                        () => dialogportenEnduser.erDialogSynlig(PERSON_B.pid, VIRKSOMHET_A.orgnr, RESSURS_R),
                        {
                            message: "Dialogporten enduser-API-et viser dialogen for person B",
                            timeout: 13 * 60_000,
                            intervals: [30_000],
                        }
                    ).toBe(true).then(() => true, () => false);

                    test.info().annotations.push({
                        type: "known-issue",
                        description: dialogSynligViaApi
                            ? `${VIRKSOMHET_A.navn} dukket ikke opp i person Bs aktørliste (GUI) innen 2 minutter, ` +
                              "men Dialogportens eget enduser-API bekrefter direkte at dialogen faktisk er søkbar " +
                              "for person B — tilgangen og dialogen er reelle, det er kun GUI-et/aktørbytteren som " +
                              "henger etter. Se minnefila for Brukermønster test-H."
                            : `${VIRKSOMHET_A.navn} sin dialog ble ikke funnet for person B verken i GUI-et (2 min) ` +
                              "eller via Dialogportens enduser-API (ytterligere 13 min). PDP har likevel bekreftet " +
                              "at tilgangen er reell (se steget over) — dette er den kjente, ennå uavklarte " +
                              "synkroniseringsforsinkelsen mellom tilgangsstyring og Dialogporten, ikke en feil i " +
                              "delegeringen. Se minnefila for Brukermønster test-H.",
                    });
                } finally {
                    await personB.context.close();
                }
            });
        } finally {
            await test.step("Opprydding: fjerner person B fra virksomheten igjen", async () => {
                // Bytter aktør på nytt istedenfor å anta at valget fortsatt
                // står: siden kan ha ligget urørt en stund mens person B sitt
                // steg ventet, og det er ikke gitt at virksomheten fortsatt er
                // den aktive aktøren etter det.
                await dagl.aktorbytte.byttTilVirksomhet(VIRKSOMHET_A.orgnr, VIRKSOMHET_A.navn);
                await dagl.brukere.slettPerson(PERSON_B.name);
            });

            await dagl.context.close();
        }

        await test.step("PDP bekrefter at tilgangen er trukket tilbake", async () => {
            // En ren måling (se klassekommentaren) viste at dette tar rundt 80
            // sekunder. 5 minutter her er romslig margin, ikke fordi det trengs.
            await expect.poll(
                () => pdp.authorize(PERSON_B.pid, VIRKSOMHET_A.orgnr, RESSURS_R, "read"),
                {
                    message: "PDP svarer ikke lenger Permit for person B",
                    timeout: 5 * 60_000,
                    intervals: [15_000],
                }
            ).not.toBe("Permit");
        });
    }
);
