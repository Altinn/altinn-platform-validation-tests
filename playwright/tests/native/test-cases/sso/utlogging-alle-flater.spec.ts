import { test } from '../../../../fixtures/app.fixture';

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
                await app.ssoFlow.navigateToAreaAndVerifyOnLogin(area.startarea);
            });

            await test.step('Bruker logger inn', async () => {
                await app.ssoFlow.login(user);
            });

            await test.step(`Bruker skal være innlogget på ${area.landingarea}`, async () => {
                await app.ssoFlow.checkLoggedIn(area.landingarea, user);
            });

            await test.step('Bruker logger ut', async () => {
                await app.ssoFlow.logout(area.startarea);
            });

            await test.step('Bruker skal være utlogget på infoportalen', async () => {
                await app.ssoFlow.checkLoggedOut("infoportalen");
                await app.ssoFlow.pause(2000); // legger inn en liten pause for å sikre at eventuelle asynkrone operasjoner er fullført før vi fortsetter testen
            });

            await test.step('Bruker skal være utlogget på alle områder', async () => {
                for (const a of areas) {
                    await app.ssoFlow.navigateToArea(a.startarea);
                    await app.ssoFlow.checkLoggedOut(a.startarea);
                }
            });
        }
    );
}
