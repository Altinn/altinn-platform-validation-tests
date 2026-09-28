import { test } from "../../fixtures/test";

// Verifisert i prod, og endrer ingen data.

const flater = [
    "arbeidsflate",
    "arbeidsflateProfil",
    "tilgangsstyring",
    "infoportal",
] as const;

for (const start of flater) {
    // Det testen verifiserer er at sesjonen gjelder på tvers av flatene og tåler refresh.
    test(`Bruker forblir innlogget på alle flater etter innlogging fra ${start}`, { tag: ["@at23", "@tt02", "@prod"] }, async ({
        page,
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
            await sider[start].assertLoggedIn(user);
        });

        await test.step("Bruker er innlogget på de andre flatene, også etter refresh", async () => {
            for (const flate of flater.filter((f) => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(user);

                await page.reload();
                await sider[flate].assertLoggedIn(user);
            }
        });
    });
}
