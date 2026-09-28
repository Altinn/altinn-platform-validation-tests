import { test } from "../../fixtures/test";

// Endrer ingen data. Utloggingen går gjennom authentication /logout, som sender
// brukeren videre til /logout/handleloggedout, og det er de to endepunktene testen
// er her for.

/**
 * Flatene som skal være utlogget etterpå. Infoportalen er med her, men ikke som
 * utgangspunkt: den er åpen og har ikke hovednavigasjonen utloggingen ligger i, så
 * den kan sjekkes men ikke logges ut fra.
 */
const flater = [
    "arbeidsflate",
    "arbeidsflateProfil",
    "tilgangsstyring",
    "infoportal",
] as const;

const utloggingsflater = flater.filter((flate) => flate !== "infoportal");

for (const start of utloggingsflater) {
    // Sesjonen gjelder på tvers av flatene, så en utlogging fra én av dem skal ta
    // brukeren ut av alle.
    test(`Bruker er utlogget på alle flater etter utlogging fra ${start}`, { tag: ["@at23", "@tt02", "@prod"] }, async ({
        innlogging,
        user,
        arbeidsflate,
        arbeidsflateProfil,
        tilgangsstyring,
        infoportal,
    }) => {
        const sider = { arbeidsflate, arbeidsflateProfil, tilgangsstyring, infoportal };

        await test.step(`Bruker logger inn og lander på ${start}`, async () => {
            await innlogging.logIn(sider[start], user);
            await sider[start].assertLoggedIn();
        });

        await test.step("Bruker logger ut", async () => {
            await innlogging.logOut();
        });

        await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
            for (const flate of flater) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedOut(user);
            }
        });
    });
}
