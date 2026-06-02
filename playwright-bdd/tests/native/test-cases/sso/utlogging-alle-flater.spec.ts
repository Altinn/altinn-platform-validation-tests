import { test } from '../../../fixtures/app.fixtures';

const user = {
    pid: '13822649208',
    name: 'Oransje Tyr',
};

const areas = [
    { startarea: 'arbeidsflate', landingarea: 'arbeidsflate' },
    { startarea: 'tilgangsstyring', landingarea: 'tilgangsstyring' },
    { startarea: 'infoportalen', landingarea: 'arbeidsflate' },
    { startarea: 'arbeidsflate-profil', landingarea: 'arbeidsflate-profil' },
];

for (const area of areas) {

    test(
        `Bruker logges ut av alle flater etter utlogging fra ${area.startarea}`, async ({ app }) => {
            await test.step(`Bruker går til ${area.startarea} uten å være logget inn`, async () => {
                app.testContext.currentArea = area.startarea;
                await app.auth.navigateToAreaAndVerifyOnLogin(area.startarea);
            });

            await test.step('Bruker logger inn', async () => {
                await app.auth.login(user);
            });

            await test.step(`Bruker skal være innlogget på ${area.landingarea}`, async () => {
                await app.assertions.checkLoggedIn(area.landingarea, user);
            });

            await test.step('Bruker logger ut', async () => {
                await app.auth.logout(area.startarea);
            });

            await test.step('Bruker skal være utlogget på infoportalen', async () => {
                await app.assertions.checkLoggedOut("infoportalen");
                await app.auth.pause(2000); // legger inn en liten pause for å sikre at eventuelle asynkrone operasjoner er fullført før vi fortsetter testen
            });

            await test.step('Bruker skal være utlogget på alle områder', async () => {
                for (const a of areas) {
                    await app.auth.navigateToArea(a.startarea);
                    await app.assertions.checkLoggedOut(a.startarea);
                }
            });
        }
    );
}
