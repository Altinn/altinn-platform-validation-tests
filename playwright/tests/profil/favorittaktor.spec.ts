import { expect, test } from "../../fixtures/test";
import { fjernNyeFavoritter, hentFavoritter, hentPartyUuid } from "../../helpers/favoritter";
import { hentPostadresse } from "../../helpers/profil";
import { altinnToken } from "../../helpers/sesjonsdata";

// Favorittene brukeren hadde før testen, og tokenet de ble lest med. Bare favoritten testen
// legger til, fjernes etterpå, så favoritter brukeren hadde fra før, blir stående.
let utgangspunkt: { token: string; favoritter: string[] } | undefined;

// Fjerner favoritten testen la til, også når testen feilet før den rakk å fjerne den selv.
// Er utgangspunktet ikke lest, feilet testen før den endret favorittene, og da er det ingen
// favoritter å rydde. Språket testen har satt, blir stående: det er lagret i profilen, og
// testene setter det selv etter innlogging, som i instansiereapp.spec.ts.
test.afterEach(async ({ api }) => {
    if (!utgangspunkt) {
        return;
    }
    const { token, favoritter } = utgangspunkt;
    utgangspunkt = undefined;
    await fjernNyeFavoritter(api, token, favoritter);
});

// Bruksmønster G, se #716. Aktører og favoritter finnes bare for brukere som kan representere
// flere enn seg selv, så testen bruker en daglig leder.
test("Bruker logger inn, ser profilen sin og legger til og fjerner en virksomhet som favoritt", { tag: ["@at23", "@tt02"] }, async ({
    page,
    api,
    innlogging,
    aktorvelger,
    testbrukere,
    sprak,
    arbeidsflate,
    arbeidsflateProfil,
    arbeidsflateAktorer,
}) => {
    const [user] = testbrukere.reserver("dagligLeder", 1);
    console.log(`Testbruker: ${user.name}`);

    await test.step("Bruker logger inn, lander i innboksen og setter språk", async () => {
        await innlogging.loggInnViaArbeidsflate(user);
        // En daglig leder kan få aktørlisten etter innlogging, og står da på seg selv etterpå.
        await aktorvelger.velgAktorEtterInnlogging(user.name);
        await arbeidsflate.assertLoggedIn();
        // Språket er lagret i profilen, og noen av brukerne står på nynorsk.
        await arbeidsflate.meny.setLanguage(sprak);
    });

    const { token, favoritter: opprinnelige } = await test.step("Bruker åpner profilen og ser navnet og postadressen sin", async () => {
        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();
        await arbeidsflateProfil.assertViserBruker(user);

        // Adressen er ulik for hver testbruker, så den viser at det er profilen til brukeren som vises.
        const altinntoken = await altinnToken(page);
        await arbeidsflateProfil.assertViserPostadresse(await hentPostadresse(api, altinntoken));

        utgangspunkt = { token: altinntoken, favoritter: await hentFavoritter(api, altinntoken) };
        return utgangspunkt;
    });

    const { virksomhet, virksomhetUuid } = await test.step("Bruker åpner Aktører og favoritter og finner en virksomhet som ikke er favoritt", async () => {
        await arbeidsflateProfil.gaTilAktorer();
        await arbeidsflateAktorer.assertLoggedIn();

        const forste = await arbeidsflateAktorer.forsteVirksomhetSomIkkeErFavoritt();
        console.log(`Virksomhet: ${forste.navn} (${forste.orgnr})`);
        // Party UUID-en, så det kan sjekkes at det er denne virksomheten Profil lagrer, og ikke
        // en annen aktør med samme navn, som hovedenheten til en underenhet.
        return { virksomhet: forste, virksomhetUuid: await hentPartyUuid(api, token, forste.orgnr) };
    });

    // Favorittene Profil har lagret, utenom dem brukeren hadde før testen.
    const nyeFavoritter = async () => (await hentFavoritter(api, token)).filter((uuid) => !opprinnelige.includes(uuid));

    await test.step("Bruker legger til virksomheten som favoritt", async () => {
        await arbeidsflateAktorer.leggTilFavoritt(virksomhet);
        await arbeidsflateAktorer.assertErFavoritt(virksomhet);
    });

    await test.step("Favoritten er lagret i Profil, og står der etter at siden er lastet på nytt", async () => {
        await expect.poll(nyeFavoritter, { message: `Profil har lagret ${virksomhet.navn} som favoritt` }).toEqual([virksomhetUuid]);
        await page.reload();
        await arbeidsflateAktorer.assertErFavoritt(virksomhet);
    });

    await test.step("Bruker fjerner virksomheten som favoritt", async () => {
        await arbeidsflateAktorer.fjernFavoritt(virksomhet);
        await arbeidsflateAktorer.assertErIkkeFavoritt(virksomhet);
    });

    await test.step("Favoritten er fjernet i Profil, og er borte etter at siden er lastet på nytt", async () => {
        await expect.poll(nyeFavoritter, { message: "Profil har fjernet favoritten" }).toHaveLength(0);
        await page.reload();
        await arbeidsflateAktorer.assertErIkkeFavoritt(virksomhet);
    });
});
