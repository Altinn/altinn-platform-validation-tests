import { testMedFlater as test, Flate, kjoresBareI } from '../../fixtures/test';

// Innlogging med TestID finnes bare i testmiljøene, ikke i prod.
kjoresBareI('at22', 'at23', 'tt02');

const flater: { start: Flate; landing: Flate }[] = [
    { start: 'arbeidsflate', landing: 'arbeidsflate' },
    { start: 'tilgangsstyring', landing: 'tilgangsstyring' },
    { start: 'infoportalen', landing: 'arbeidsflate' },
    { start: 'arbeidsflate-profil', landing: 'arbeidsflate-profil' },
];

for (const { start, landing } of flater) {

    test(`Bruker er innlogget på alle flater etter innlogging fra ${start}`, async ({ innlogging, user, flater: sider }) => {

        await test.step(`Bruker går til ${start} uten å være logget inn`, async () => {
            await sider[start].navigateTo();
            if (start !== 'infoportalen') {
                await innlogging.assertOnIdportenLogin();
            }
        });

        await test.step('Bruker logger inn', async () => {
            await innlogging.viaIdporten(user);
        });

        await test.step(`Bruker skal være innlogget på ${landing}`, async () => {
            await sider[landing].assertLoggedIn(user);
        });

        await test.step('Bruker skal fortsatt være innlogget på de andre flatene', async () => {
            for (const flate of flater.map(f => f.start).filter(f => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(user);
            }
        });
    });
}
