import { etternavn } from "../../config/environment";
import { expect, test } from "../../fixtures/test";
import { antallAktorer } from "../../helpers/aktorer";
import { slettAlleInstanser } from "../../helpers/instanser";
import { merkSesjon } from "../../helpers/merkelapp";
import { rettighetshaverUuid } from "../../helpers/rettighetshavere";
import { aktivAktorPartyId, aktivAktorUuid, altinnToken } from "../../helpers/sesjonsdata";

// Settes før person-B legges til, så oppryddingen finner person-B selv om testen feiler rett etterpå.
let kobling: { fra: string; navn: string; token: string } | undefined;

// Sletter alle aktive instanser person-A har av appen, og person-B med tilgangspakken uansett.
test.afterEach(async ({ api, testapp, page }) => {
    try {
        const token = await altinnToken(page);
        const partyId = await aktivAktorPartyId(page);
        await slettAlleInstanser(api, token, testapp.id, partyId);
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
    api,
    innlogging,
    aktorvelger,
    nySesjon,
    testbrukere,
    arbeidsflate,
    tilgangsstyring,
    sprak,
    app,
    testapp,
    miljo,
}) => {
    const [personA, personB] = testbrukere.reserver("privatPersonUtenVirksomhet", 2);
    const sesjonB = await nySesjon();
    await merkSesjon(page.context(), `Person-A · ${personA.name} · ${miljo}`, "#1f5fa8");
    await merkSesjon(sesjonB.page.context(), `Person-B · ${personB.name} · ${miljo}`, "#b5531c");

    const bInnlogget = test.step("Person-B logger inn i en egen sesjon, parallelt med person-A", async () => {
        await sesjonB.innlogging.loggInnViaTilgangsstyring(personB);
    });

    // Feiler innloggingen, kastes feilen der testen venter på person-B.
    bInnlogget.catch(() => {});

    await test.step("Person-A logger inn via lenken til appen", async () => {
        await innlogging.loggInnFraDyplenke(app.url, personA);
    });

    const opprettet = await test.step("Appen oppretter en instans for person-A", async () => {
        await app.assertPaInstans();
        await expect(app.presentationHeading).toContainText(app.navn);
        await expect(app.hovedinnhold).toContainText("Testdepartementet");

        const instans = app.aktivInstans();
        await app.gaTilbakeTilInnboks();
        return instans;
    });

    await test.step("Person-A går til Tilgangsstyring og velger seg selv som aktør", async () => {
        await arbeidsflate.meny.gaTilTilgangsstyring();
        await tilgangsstyring.meny.setLanguage(sprak);

        const tokenA = await altinnToken(page);
        const aktorerA = await antallAktorer(api, tokenA);
        await aktorvelger.velgAktorFraHeader(personA.name, aktorerA);

        const fra = await aktivAktorUuid(page);
        kobling = { fra, navn: personB.name, token: tokenA };
    });

    await test.step("Person-A legger til person-B som ny bruker", async () => {
        await tilgangsstyring.brukereLink.click();
        await tilgangsstyring.brukere.leggTilNyBruker(personB.pid, etternavn(personB));
    });

    await test.step("Person-A gir person-B tilgangspakken som gir tilgang til appen", async () => {
        const tilgangspakke = testapp.tilgangspakke[sprak];
        const pakke = await tilgangsstyring.brukere.apnePakkeDetaljer(personB.name, tilgangspakke);
        await pakke.giFullmakt();
        await pakke.assertHarFullmakt();
        await pakke.assertInneholderApp(testapp.visningsnavn);
        await pakke.lukk();
    });

    await test.step("Person-B har tilgang til instansen til person-A", async () => {
        await bInnlogget;
        await sesjonB.app.gaTilInstans(opprettet);
        await sesjonB.app.assertViserInstans(opprettet);
    });
});
