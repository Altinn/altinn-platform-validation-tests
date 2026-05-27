import { test } from '../../fixtures/app.fixtures';

const user = {
    pid: '13822649208',
    name: 'Oransje Tyr',
};

test(
    'Bruker er innlogget på arbeidsflate etter innlogging på infoportalen', async ({ app }) => {

        await test.step('Bruker går til infoportalen uten å være logget inn', async () => {
            app.testContext.currentArea = 'infoportalen';
            await app.auth.navigateToAreaAndVerify('infoportalen');
        });

        await test.step('Bruker logger inn', async () => {
            await app.auth.login(user);
        });

        await test.step('Bruker skal være innlogget på arbeidsflate', async () => {
            await app.assertions.checkLoggedIn('arbeidsflate', user);
        });

        await test.step('Bruker skal fortsatt være innlogget på andre områder', async () => {
            const areas = [
                'tilgangsstyring',
                'infoportalen',
            ];

            for (const area of areas) {
                await app.auth.navigateToArea(area);
                await app.assertions.checkLoggedIn(area, user);
            }
        });
    }
);