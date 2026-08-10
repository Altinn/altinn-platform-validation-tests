import { test } from '../../../../fixtures/app.fixture';

const user = {
    pid: '31851449372', name: "Ordinær Æresdoktor",
};

const languages = [
    {
        language: 'bokmål',
        sections: [
            'Forespørsler',
            'Brukere',
            'Fullmakter',
            'Fullmakter hos andre',
            'Samtykke- og fullmaktsavtaler',
        ],
    },
    {
        language: 'nynorsk',
        sections: [
            'Førespurnader',
            'Brukarar',
            'Fullmakter',
            'Fullmakter hos andre',
            'Samtykke- og fullmaktsavtaler',
        ],
    },
    {
        language: 'engelsk',
        sections: [
            'Requests',
            'Users',
            'Powers of attorney',
            'Powers of attorney from others',
            'Consent and power of attorney agreements',
        ],
    },
];

for (const { language, sections } of languages) {
    test(`Bruker ser oversikt over navigasjonsvalg (${language})`, async ({ app }) => {
        await test.step('Innlogget bruker åpner tilgangsstyring', async () => {
            await app.ssoFlow.navigateToAreaAndVerifyOnLogin('tilgangsstyring');
            await app.ssoFlow.login(user);
            await app.ssoFlow.checkLoggedIn('tilgangsstyring', user);
        });

        await test.step(`Setter språk til ${language}`, async () => {
            await app.ssoFlow.setLanguage(language);
        });

        await test.step('Verifiser tilgjengelige seksjoner', async () => {
            await app.ssoFlow.checkSectionsAreVisible('tilgangsstyring', sections);
        });
    });
}