import { expect, test } from "../../fixtures/test";
import { Melding, meldingsstatuser, sendMelding, slettMelding } from "../../helpers/meldinger";

// Meldingen testen sender. Bare den slettes, så andre meldinger brukeren har, blir stående.
let melding: Melding | undefined;

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
    api,
    miljo,
    innlogging,
    user,
    arbeidsflate,
}) => {
    const sendt = await test.step("Tjenesteeieren sender en melding til brukeren", async () => {
        melding = await sendMelding(api, miljo, user);
        return melding;
    });

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
        await expect.poll(() => meldingsstatuser(api, miljo, sendt), {
            message: "Correspondence har registrert at meldingen er lest",
        }).toContain("Read");
    });

    await test.step("Bruker bekrefter at meldingen er lest", async () => {
        await arbeidsflate.bekreftMelding();
        await arbeidsflate.assertMeldingBekreftet();
        // Correspondence registrerer bekreftelsen noen sekunder etter klikket.
        await expect.poll(() => meldingsstatuser(api, miljo, sendt), {
            message: "Correspondence har registrert bekreftelsen",
            timeout: 30_000,
        }).toContain("Confirmed");
    });

    await test.step("Aktivitetsloggen viser at bruker har åpnet meldingen", async () => {
        await arbeidsflate.assertMeldingApnetAv(user);
    });
});
