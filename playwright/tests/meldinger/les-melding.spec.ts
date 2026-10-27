import { expect, test } from "../../fixtures/test";
import { Melding, sendMelding, slettMelding } from "../../helpers/meldinger";

// Meldingen testen sender. Bare den slettes, så andre meldinger brukeren har, blir stående.
let melding: Melding | undefined;

// Tjenesteeieren sender en melding til brukeren før testen.
test.beforeEach(async ({ api, miljo, user }) => {
    melding = await sendMelding(api, miljo, user);
});

// Sletter meldingen som mottakeren. Det går bare når testen har kommet så langt at meldingen
// er bekreftet, ellers blir den liggende i innboksen til brukeren.
test.afterEach(async ({ api, page, miljo, user }) => {
    expect(melding, "Testen sendte en melding").toBeDefined();
    const sendt = melding!;
    melding = undefined;
    await slettMelding(api, page, miljo, user, sendt);
});

// Bruksmønster D, se #616.
test("Bruker logger inn, leser en melding fra innboksen og bekrefter den", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflate,
}) => {
    const sendt = melding!;

    await test.step("Bruker logger inn og lander i innboksen", async () => {
        await innlogging.loggInnViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker åpner dialogen for meldingen", async () => {
        await arbeidsflate.ventPaMelding(sendt);
        await arbeidsflate.apneMelding(sendt);
    });

    await test.step("Bruker ser innholdet fra Correspondence", async () => {
        await arbeidsflate.assertViserMelding(sendt);
    });

    await test.step("Bruker bekrefter at meldingen er lest", async () => {
        await arbeidsflate.bekreftMelding();
        await arbeidsflate.assertMeldingBekreftetAv(user);
    });

    await test.step("Aktivitetsloggen viser at bruker har åpnet meldingen", async () => {
        await arbeidsflate.assertMeldingApnetAv(user);
    });
});
