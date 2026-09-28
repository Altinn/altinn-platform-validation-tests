import { test } from "../../fixtures/test";

const flater = [
    "arbeidsflate",
    "arbeidsflateProfil",
    "tilgangsstyring",
    "infoportal",
] as const;

for (const start of flater) {
    test(`Bruker er innlogget på alle flater etter innlogging fra ${start}`, { tag: ["@at23", "@tt02", "@prod"] }, async ({
        innlogging,
        user,
        arbeidsflate,
        arbeidsflateProfil,
        tilgangsstyring,
        infoportal,
    }) => {
        const sider = { arbeidsflate, arbeidsflateProfil, tilgangsstyring, infoportal };

        await test.step(`Bruker går til ${start} uten å være logget inn`, async () => {
            await sider[start].navigateTo();
            if (start !== "infoportal") {
                await innlogging.assertOnIdporten();
            }
        });

        await test.step("Bruker logger inn", async () => {
            await innlogging.logIn(sider[start], user);
        });

        await test.step(`Bruker skal være innlogget på ${start}`, async () => {
            await sider[start].assertLoggedIn(user);
        });

        await test.step("Bruker skal fortsatt være innlogget på de andre flatene", async () => {
            for (const flate of flater.filter((f) => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(user);
            }
        });
    });
}
