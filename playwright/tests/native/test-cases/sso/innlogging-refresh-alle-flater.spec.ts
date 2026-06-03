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

    test(`Bruker forblir innlogget på alle flater etter refresh fra ${area.startarea}`, async ({ app }) => {

        await test.step(`Bruker går til ${area.startarea} uten å være logget inn`, async () => {
            app.testContext.currentArea = area.startarea;
            await app.ssoFlow.navigateToAreaAndVerifyOnLogin(area.startarea);
        });

        await test.step('Bruker logger inn', async () => {
            await app.ssoFlow.login(user);
        });

        await test.step(`Bruker skal være innlogget på ${area.landingarea} også etter refresh`, async () => {
            await app.ssoFlow.checkLoggedIn(area.landingarea, user);
            await app.ssoFlow.refresh();
            await app.ssoFlow.checkLoggedIn(area.landingarea, user);
        });

        await test.step('Bruker skal fortsatt være innlogget på andre områder også etter refresh', async () => {
            const otherAreas = areas.filter(a => a.startarea !== area.startarea);

            for (const a of otherAreas) {
                await app.ssoFlow.navigateToArea(a.startarea);
                await app.ssoFlow.checkLoggedIn(a.startarea, user);
                await app.ssoFlow.refresh();
                await app.ssoFlow.checkLoggedIn(a.startarea, user);
            }
        });
    });
}