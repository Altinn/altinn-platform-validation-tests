import { expect, test } from "../../fixtures/test";
import { slettInstans } from "../../helpers/instanser";
import { Instans } from "../../pages/apps/app";

// Instansen testen oppretter og sender inn. Bare den slettes, så andre instanser brukeren har, blir stående.
let instans: Instans | undefined;

// Sletter instansen testen opprettet. Den kan slettes også etter at den er sendt inn.
test.afterEach(async ({ api, testAppConfig, page }) => {
    expect(instans, "Testen opprettet en instans").toBeDefined();
    const opprettet = instans!;
    instans = undefined;
    await slettInstans(api, page, testAppConfig.id, opprettet);
});

// Bruksmønster A, se #702.
test("Bruker logger inn fra altinn.no, sender inn app via dyplenke og ser innsendingen i innboksen", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    app,
}) => {
    await test.step("Bruker åpner altinn.no, logger inn og lander i innboksen", async () => {
        await innlogging.loggInnFraDyplenke(app.url, user);
        await app.assertLoggedIn(user);
    });

    const opprettet = await test.step("Bruker går til appen via dyplenke, og appen oppretter en instans", async () => {
        await app.assertPaInstans();
        await expect(app.presentationHeading).toContainText(app.visningsnavn);

        instans = app.aktivInstans();
        return instans;
    });

    await test.step("Bruker fyller ut og sender inn", async () => {
        await app.gaTilNesteSide();
        await app.fyllUtPersonoppslag(user);
        await app.sendInn();
    });

    await test.step("Bruker får kvittering", async () => {
        await app.assertKvittering(opprettet);
    });

    await test.step("Bruker går tilbake til innboksen og ser innsendingen under Sendt", async () => {
        await app.gaTilbakeTilInnboks();
        await arbeidsflate.apneSendt();
        await arbeidsflate.assertDialog(opprettet);
    });
});
