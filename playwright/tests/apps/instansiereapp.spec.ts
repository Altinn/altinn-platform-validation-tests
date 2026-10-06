import { etternavn } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { expect, test } from "../../fixtures/test";
import { App, Instans } from "../../pages/apps/app";

// Pakkenavnet oversettes også, ikke bare UI-teksten rundt, se brukere.ts.
const FRITIDSAKTIVITETER_OG_FRILUFTSLIV: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Fritidsaktiviteter og friluftsliv",
    [Sprak.Nynorsk]: "Fritidsaktivitetar og friluftsliv",
    [Sprak.Engelsk]: "Leisure activities and outdoor life",
};

// Instansen testen opprettet, med sluttbrukertokenet som kan slette den. Én per worker,
// siden hver worker laster fila på nytt og kjører testene sine etter hverandre.
let instans: (Instans & { token: string }) | undefined;

// Hard-slett instansen, så testkjøringene ikke fyller opp innboksen til testbrukeren.
test.afterEach(async ({ appsApi, testapp }) => {
    if (!instans) {
        return;
    }
    const { partyId, guid, token } = instans;
    instans = undefined;

    const response = await appsApi.instances.DeleteInstance(
        token, testapp, partyId, guid, true,
    );
    expect(response.ok(), `Sletting av instans ${partyId}/${guid}: ${response.status()}`).toBe(true);
});

test("Bruker instansierer app", { tag: ["@at23"] }, async ({
    innlogging,
    aktorvelger,
    nySesjon,
    testbrukere,
    arbeidsflate,
    brukere,
    tilgangsstyring,
    sprak,
    urler,
    app,
}) => {
    // A oppretter instansen og gir B tilgangspakken; B åpner instansen på vegne av A.
    const [personA, personB] = testbrukere.reserver("privatPersonUtenVirksomhet", 2);

    await test.step("Privatperson navigerer til appen", async () => {
        await app.navigateTo();
        await innlogging.loggInnMedTestId(personA);
    });

    await test.step("Verifisere bruker får instansiert appen", async () => {
        // Har A fått fullmakt fra andre testbrukere i tidligere kjøringer, spør appen
        // hvem A vil sende inn for. Da velger A seg selv.
        await app.velgAktorHvisSpurt(personA.name);
        await expect(app.presentationHeading).toContainText(app.navn);
        await expect(app.hovedinnhold).toContainText("Testdepartementet");

        instans = { ...app.aktivInstans(), token: await innlogging.altinnToken() };

        await app.gaTilbakeTilInnboks();
    });

    await test.step("Delegere tilgangspakke til person-B", async () => {
        await arbeidsflate.meny.gaTilTilgangsstyring();
        // Tilgangsstyring vises på språket i brukerens profil, ikke projectets. Tekstene
        // i brukere.ts og pakkenavnet følger projectet, så språket må settes først.
        await tilgangsstyring.meny.setLanguage(sprak);
        // Fullmakten skal gis fra A selv, ikke fra en aktør A tidligere har fått fullmakt fra.
        await aktorvelger.velgAktorFraHeader(personA.name);
        await tilgangsstyring.brukereLink.click();
        await brukere.leggTilNyBruker(personB.pid, etternavn(personB));

        const tilgangspakke = FRITIDSAKTIVITETER_OG_FRILUFTSLIV[sprak];
        await brukere.giFullmaktForTilgangspakke(personB.name, tilgangspakke);
        await brukere.assertHarTilgangspakke(personB.name, tilgangspakke);
        await brukere.assertTilgangspakkeInneholderApp(personB.name, tilgangspakke, "Bruksmønster-test");
    });

    // B får sin egen nettleserøkt, så ingenting fra A sin innlogging følger med.
    const sesjonB = await nySesjon();

    await test.step("Person-B logger inn i en ny sesjon og velger bruker A som aktør", async () => {
        await sesjonB.innlogging.loggInnViaTilgangsstyring(personB);
        await sesjonB.aktorvelger.velgAktor(personA.name);
    });

    await test.step("Verifisere person-B har tilgang til instansen", async () => {
        const appB = new App(sesjonB.page, urler.apps, app.navn);
        await appB.gaTilInstans(instans!);
        await appB.assertViserInstans(instans!);
    });
});
