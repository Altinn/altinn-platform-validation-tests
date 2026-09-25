import { Flate, test } from "../../fixtures/test";

const flater: Flate[] = [
    "arbeidsflate",
    "arbeidsflate-profil",
    "tilgangsstyring",
    "infoportalen",
];

for (const start of flater) {
    // Det testen verifiserer er at sesjonen gjelder på tvers av flatene og tåler refresh.
    test(
        `Bruker forblir innlogget på alle flater etter innlogging fra ${start}`,
        async ({ innlogging, privatPerson, sider }) => {
            await test.step(`Bruker logger inn og lander på ${start}`, async () => {
                await innlogging.logIn(sider[start], privatPerson);
                await sider[start].assertLoggedIn(privatPerson);
            });

            await test.step("Bruker er innlogget på de andre flatene, også etter refresh", async () => {
                for (const flate of flater.filter((f) => f !== start)) {
                    await sider[flate].navigateTo();
                    await sider[flate].assertLoggedIn(privatPerson);

                    await innlogging.refresh();
                    await sider[flate].assertLoggedIn(privatPerson);
                }
            });
        },
    );
}
