import { test } from "../../fixtures/test";
import { miljoer } from "../../miljo";
import { Testbruker } from "../../testdata";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

test(
    "Cookievalg fra arbeidsflate tas hensyn til i infoportalen",
    miljoer("at23"),
    async ({ innlogging, user, arbeidsflate, infoportal, cookiebanner }) => {
        await test.step("Bruker godtar informasjonskapsler på arbeidsflate", async () => {
            await innlogging.logIn(arbeidsflate.forside, user);
            await cookiebanner.godta();
        });

        await test.step("Banneret vises ikke igjen i infoportalen", async () => {
            await infoportal.forside.navigateTo();
            // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
            // er sant også på en tom side.
            await infoportal.forside.assertLoggedIn(user);
            await cookiebanner.assertHidden();
        });
    },
);
