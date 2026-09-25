import { test } from "../../fixtures/test";

test(
    "Cookievalg fra arbeidsflate tas hensyn til i infoportalen",
    async ({ innlogging, privatPerson, arbeidsflate, infoportal, cookiebanner }) => {
        await test.step("Bruker godtar informasjonskapsler på arbeidsflate", async () => {
            await innlogging.logIn(arbeidsflate.forside, privatPerson);
            await cookiebanner.godta();
        });

        await test.step("Banneret vises ikke igjen i infoportalen", async () => {
            await infoportal.forside.navigateTo();
            // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
            // er sant også på en tom side.
            await infoportal.forside.assertLoggedIn(privatPerson);
            await cookiebanner.assertHidden();
        });
    },
);
