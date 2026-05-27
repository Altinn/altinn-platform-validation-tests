import { test } from '../../fixtures/app.fixtures';

const user = {
    pid: '13822649208',
    name: 'Oransje Tyr',
};

const startAreas = [
    'arbeidsflate',
    'arbeidsflate-profil',
    'tilgangsstyring',
    'infoportalen',
];

const allAreas = [
    'arbeidsflate',
    'tilgangsstyring',
    'infoportalen',
    'arbeidsflate-profil',
];

for (const startArea of startAreas) {

    test(
        `Bruker logges ut av alle flater etter utlogging fra ${startArea}`, async ({ app }) => {
            await test.step(`Bruker går til ${startArea} uten å være logget inn`, async () => {
                app.testContext.currentArea = startArea;
                await app.auth.navigateToAreaAndVerify(startArea);
            });

            await test.step('Bruker logger inn', async () => {
                await app.auth.login(user);
            });

            await test.step('Bruker logger ut igjen', async () => {
                await app.auth.logout(startArea);
            });

            await test.step('Bruker skal være utlogget på alle områder', async () => {
                for (const area of allAreas) {
                    await app.auth.navigateToArea(area);
                    await app.assertions.checkLoggedOut(area);
                }
            });
        }
    );
}