import { test } from "../../fixtures/test";

test("Cookievalg fra arbeidsflate tas hensyn til i infoportalen", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    infoportal,
}) => {
    await test.step("Bruker godtar informasjonskapsler på arbeidsflate", async () => {
        await innlogging.logIn(arbeidsflate, user);
        await arbeidsflate.cookiebanner.godta();
    });

    await test.step("Banneret vises ikke igjen i infoportalen", async () => {
        await infoportal.navigateTo();
        // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
        // er sant også på en tom side.
        await infoportal.assertLoggedIn(user);
        await infoportal.cookiebanner.assertHidden();
    });
});
