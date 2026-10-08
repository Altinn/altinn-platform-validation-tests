import { etternavn } from "../../config/environment";
import { expect, test } from "../../fixtures/test";
import { rettighetshaverUuid } from "../../helpers/rettighetshavere";
import { aktivAktorUuid, altinnToken } from "../../helpers/sesjonsdata";
import { Instans } from "../../pages/apps/app";

// Instansen person-A oppretter. Bare den slettes, så andre instanser person-A har, blir stående.
let instans: Instans | undefined;

// Settes før person-B legges til, så oppryddingen finner person-B selv om testen feiler rett etterpå.
let kobling: { fra: string; navn: string; token: string } | undefined;

// Sletter instansen testen opprettet, og person-B med tilgangspakken uansett.
test.afterEach(async ({ api, testapp, page }) => {
    try {
        expect(instans, "Testen opprettet en instans").toBeDefined();
        const { partyId, guid } = instans!;
        instans = undefined;
        const token = await altinnToken(page);
        const slettInstans = await api.apps.instances.DeleteInstance(token, testapp.id, partyId, guid, true);
        expect(slettInstans.ok(), `Sletting av instans ${partyId}/${guid}: ${slettInstans.status()}`).toBe(true);
    } finally {
        expect(kobling, "Testen la til en bruker").toBeDefined();
        const { fra, navn, token } = kobling!;
        kobling = undefined;
        const til = await rettighetshaverUuid(api, token, fra, navn);
        const slettBruker = await api.accessManagementBff.connection.RevokeRightHolder(token, { party: fra, from: fra, to: til });
        expect(slettBruker.ok(), `Sletting av bruker ${til} hos ${fra}: ${slettBruker.status()}`).toBe(true);
    }
});

test("Bruker instansierer app", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    page,
    innlogging,
    aktorvelger,
    nySesjon,
    testbrukere,
    arbeidsflate,
    tilgangsstyring,
    sprak,
    app,
    testapp,
}) => {
    // Innboksen kan bruke opptil et kvarter på å vise den nye aktøren og utkastet, se DIALOGPORTEN_TIMEOUT.
    test.setTimeout(40 * 60_000);
    const [personA, personB] = testbrukere.reserver("privatPersonUtenVirksomhet", 2);
    console.log(`Person-A: ${personA.name}, person-B: ${personB.name}`);

    await test.step("Person-A logger inn via Tilgangsstyring, velger seg selv som aktør og setter språk", async () => {
        await innlogging.loggInnViaTilgangsstyring(personA);
        await aktorvelger.velgAktorFraHeader(personA.name);
        await tilgangsstyring.meny.setLanguage(sprak);

        const tokenA = await altinnToken(page);
        const fra = await aktivAktorUuid(page);
        kobling = { fra, navn: personB.name, token: tokenA };
    });

    const opprettet = await test.step("Person-A går til appen, som oppretter en instans", async () => {
        await app.navigateTo();
        await app.assertPaInstans();
        await expect(app.presentationHeading).toContainText(app.visningsnavn);
        await expect(app.hovedinnhold).toContainText(app.tjenesteeier);

        instans = app.aktivInstans();
        return instans;
    });

    await test.step("Person-A ser instansen som utkast i innboksen", async () => {
        await app.gaTilbakeTilInnboks();
        await arbeidsflate.apneUtkast();
        await arbeidsflate.ventPaDialog(opprettet);
    });

    await test.step("Person-A går til Tilgangsstyring", async () => {
        await arbeidsflate.meny.gaTilTilgangsstyring();
    });

    await test.step("Person-A legger til person-B som ny bruker", async () => {
        await tilgangsstyring.brukereLink.click();
        await tilgangsstyring.brukere.leggTilNyBruker(personB.pid, etternavn(personB));
    });

    await test.step("Person-A gir person-B tilgangspakken som gir tilgang til appen", async () => {
        const tilgangspakke = testapp.tilgangspakke;
        const pakke = await tilgangsstyring.brukere.apnePakkeDetaljer(personB.name, tilgangspakke);
        await pakke.giFullmakt();
        await pakke.assertHarFullmakt();
        await pakke.assertInneholderApp(testapp.visningsnavnITilgangspakke);
        await pakke.lukk();
    });

    const sesjonB = await test.step("Person-B logger inn via Tilgangsstyring, velger person-A som aktør, setter språk og går til innboksen", async () => {
        const sesjon = await nySesjon();
        await sesjon.innlogging.loggInnViaTilgangsstyring(personB);

        await sesjon.aktorvelger.ventPaOgVelgAktorFraHeader(personA.name);
        await sesjon.tilgangsstyring.meny.setLanguage(sprak);

        // Aktøren B velger i Tilgangsstyring følger ikke alltid med til innboksen.
        await sesjon.tilgangsstyring.meny.gaTilInnboks();
        await sesjon.aktorvelger.ventPaOgVelgAktorFraHeader(personA.name);
        return sesjon;
    });

    await test.step("Person-B åpner instansen til person-A fra utkastene i innboksen", async () => {
        await sesjonB.arbeidsflate.apneUtkast();
        await sesjonB.arbeidsflate.ventPaDialog(opprettet);
        await sesjonB.arbeidsflate.dialogLink(opprettet).click();
        await sesjonB.arbeidsflate.gaTilSkjemautfylling();
        await sesjonB.app.assertViserInstans(opprettet);
        await sesjonB.app.assertPaVegneAv(personB, personA);
    });
});
