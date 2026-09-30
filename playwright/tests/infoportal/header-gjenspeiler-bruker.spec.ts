import { test } from "../../fixtures/test";

test("Infoportalens header gjenspeiler pålogget bruker og valgt aktør etter navigering ut fra arbeidsflate", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    infoportal,
}) => {
    await test.step("Bruker logger inn på arbeidsflate", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker navigerer ut til infoportalen", async () => {
        await infoportal.navigateTo();
    });

    await test.step("Infoportalens header viser pålogget bruker som valgt aktør", async () => {
        await infoportal.assertLoggedIn(user);
    });
});
