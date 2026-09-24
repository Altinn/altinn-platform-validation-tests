import { test } from "../../fixtures/test";
import { miljoer } from "../../miljo";
import { Testbruker } from "../../testdata";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

test(
    "Cookievalg fra infoportalen tas hensyn til i arbeidsflate, profil og tilgangsstyring",
    miljoer("at23"),
    async ({
        innlogging,
        user,
        arbeidsflate,
        tilgangsstyring,
        infoportal,
        cookiebanner,
    }) => {
        await test.step("Bruker avslår informasjonskapsler i infoportalen", async () => {
            await infoportal.forside.navigateTo();
            await cookiebanner.avsla();
        });

        await test.step("Banneret vises ikke igjen på arbeidsflate", async () => {
            await innlogging.logIn(arbeidsflate.forside, user);
            // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
            // er sant også på en tom side.
            await arbeidsflate.forside.assertLoggedIn();
            await cookiebanner.assertHidden();
        });

        await test.step("Banneret vises ikke igjen på profilen", async () => {
            await arbeidsflate.profil.navigateTo();
            await arbeidsflate.profil.assertLoggedIn();
            await cookiebanner.assertHidden();
        });

        await test.step("Banneret vises ikke igjen på tilgangsstyring", async () => {
            await tilgangsstyring.forside.navigateTo();
            await tilgangsstyring.forside.assertLoggedIn();
            await cookiebanner.assertHidden();
        });
    },
);
