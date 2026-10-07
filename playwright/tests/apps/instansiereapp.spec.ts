import { etternavn } from "../../config/environment";
import { expect, test } from "../../fixtures/test";
import { antallAktorer } from "../../helpers/aktorer";
import { slettAlleInstanser } from "../../helpers/instanser";
import { rettighetshaverUuid } from "../../helpers/rettighetshavere";
import { aktivAktorPartyId, aktivAktorUuid, altinnToken } from "../../helpers/sesjonsdata";

// Brukeren A la til, med tokenet til A. Å slette brukeren sletter også tilgangspakkene den har fått.
let kobling: { fra: string; til: string; token: string } | undefined;

// Rydder opp app-instanser og delegeringer gjort til brukere. Alle aktive instanser A har av
// appen slettes, ikke bare den testen opprettet. Brukeren slettes også når slettingen av
// instansene feiler, så testbrukerne ikke frigis med fullmakten i behold.
test.afterEach(async ({ api, testapp, page }) => {
    try {
        const token = await altinnToken(page);
        const partyId = await aktivAktorPartyId(page);
        await slettAlleInstanser(api, token, testapp.id, partyId);
    } finally {
        expect(kobling, "Testen la til en bruker").toBeDefined();
        const { fra, til, token } = kobling!;
        kobling = undefined;
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
}) => {
    // A oppretter instansen og gir B tilgangspakken; B åpner instansen på vegne av A.
    const [personA, personB] = testbrukere.reserver("privatPersonUtenVirksomhet", 2);

    await test.step("Privatperson navigerer til appen", async () => {
        await innlogging.loggInnFraDyplenke(app.url, personA);
    });

    const opprettet = await test.step("Verifisere bruker får instansiert appen", async () => {
        await app.assertPaInstans();
        await expect(app.presentationHeading).toContainText(app.navn);
        await expect(app.hovedinnhold).toContainText("Testdepartementet");

        const instans = app.aktivInstans();

        await app.gaTilbakeTilInnboks();
        return instans;
    });

    await test.step("Delegere tilgangspakke til person-B", async () => {
        await arbeidsflate.meny.gaTilTilgangsstyring();
        await tilgangsstyring.meny.setLanguage(sprak);

        // Fullmakten skal gis fra A selv, ikke fra en aktør A tidligere har fått fullmakt fra.
        await aktorvelger.velgAktorFraHeader(personA.name, await antallAktorer(api, await altinnToken(page)));

        await tilgangsstyring.brukereLink.click();
        await tilgangsstyring.brukere.leggTilNyBruker(personB.pid, etternavn(personB));

        const fra = await aktivAktorUuid(page);
        const token = await altinnToken(page);
        kobling = { fra, til: await rettighetshaverUuid(api, token, fra, personB.name), token };

        const tilgangspakke = testapp.tilgangspakke[sprak];
        const pakke = await tilgangsstyring.brukere.apnePakkeDetaljer(personB.name, tilgangspakke);
        await pakke.giFullmakt();
        await pakke.assertHarFullmakt();
        await pakke.assertInneholderApp(testapp.visningsnavn);
        await pakke.lukk();
    });

    // B får sin egen nettleserøkt, så ingenting fra A sin innlogging følger med.
    const sesjonB = await nySesjon();

    await test.step("Person-B logger inn i en ny sesjon og velger bruker A som aktør", async () => {
        await sesjonB.innlogging.loggInnViaTilgangsstyring(personB);
        await sesjonB.aktorvelger.velgAktor(personA.name, await antallAktorer(api, await altinnToken(sesjonB.page)));
    });

    await test.step("Verifisere person-B har tilgang til instansen", async () => {
        await sesjonB.app.gaTilInstans(opprettet);
        await sesjonB.app.assertViserInstans(opprettet);
    });
});
