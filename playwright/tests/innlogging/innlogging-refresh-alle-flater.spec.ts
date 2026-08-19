import { testMedFlater as test, Flate } from '../../fixtures/test';
import { runInEnvironment } from '../../miljo';

// Verifisert i prod, og endrer ingen data. Innloggingen skjer med logIn, altså uten
// ID-porten-skjermbildene, som ikke finnes i prod.
runInEnvironment('at22', 'at23', 'tt02', 'prod');

const flater: Flate[] = [
    'arbeidsflate',
    'arbeidsflate-profil',
    'tilgangsstyring',
    'infoportalen',
];

for (const start of flater) {

    // Det testen verifiserer er at sesjonen gjelder på tvers av flatene og tåler refresh.
    test(`Bruker forblir innlogget på alle flater etter innlogging fra ${start}`, async ({ innlogging, user, flater: sider }) => {

        await test.step(`Bruker logger inn og lander på ${start}`, async () => {
            await innlogging.logIn(sider[start], user);
            await sider[start].assertLoggedIn(user);
        });

        await test.step('Bruker er innlogget på de andre flatene, også etter refresh', async () => {
            for (const flate of flater.filter(f => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(user);

                await innlogging.refresh();
                await sider[flate].assertLoggedIn(user);
            }
        });
    });
}
