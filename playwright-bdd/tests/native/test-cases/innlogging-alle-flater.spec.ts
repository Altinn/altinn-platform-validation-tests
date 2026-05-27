import { test } from '../../fixtures/app.fixtures';

const user = {
    pid: '13822649208',
    name: 'Oransje Tyr',
};

const startAreas = [
    'arbeidsflate',
    'arbeidsflate-profil',
    'tilgangsstyring',
];

const allAreas = [
    'arbeidsflate',
    'tilgangsstyring',
    'infoportalen',
    'arbeidsflate-profil',
];

for (const startArea of startAreas) {

    test(`Bruker er innlogget på alle flater etter innlogging fra ${startArea}`, async ({ app }) => {

        await test.step(
            `Bruker går til ${startArea} uten å være logget inn`, async () => {
                app.testContext.currentArea = startArea;
                await app.auth.navigateToAreaAndVerify(startArea);
            }
        );

        await test.step('Bruker logger inn', async () => {
            await app.auth.login(user);
        });

        await test.step(`Bruker skal være innlogget på ${startArea}`, async () => {
            await app.assertions.checkLoggedIn(startArea, user);
        });

        await test.step('Bruker skal fortsatt være innlogget på andre områder', async () => {
            const otherAreas = allAreas.filter(
                area => area !== startArea
            );

            for (const area of otherAreas) {
                await app.auth.navigateToArea(area);
                await app.assertions.checkLoggedIn(area, user);
            }
        }
        );
    }
    );
}