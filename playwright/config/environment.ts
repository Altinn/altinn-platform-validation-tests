/**
 * Miljøet velges med TEST_ENV, og verdiene lastes fra .env-filene i
 * playwright.config.ts. Alt leses late, slik at en test som ikke bruker en
 * variabel heller ikke krever at den er satt.
 */
function requireEnv(name: string): string {
    const environment = process.env.TEST_ENV || 'at23';
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `${name} er ikke satt. Sjekk .env, .env.${environment} og .env.${environment}.local, og at testene kjøres via npm-scriptene.`
        );
    }

    return value;
}

export const baseUrls = {
    get arbeidsflate() {
        return requireEnv('AF_BASE_URL');
    },
    get tilgangsstyring() {
        return requireEnv('AM_UI_BASE_URL');
    },
    get infoportal() {
        return requireEnv('INFO_CLOUD_URL');
    },
    get platform() {
        return requireEnv('PLATFORM_BASE_URL');
    },
};

/**
 * Innloggings-URLen Altinn Authentication genererer authorize-forespørselen fra.
 * `iss=mockporten` velger Test-IDP-en som upstream i stedet for ID-porten.
 * URLen til upstream kan ikke bygges her: `state` opprettes serverside per
 * innlogging, så en gjenbrukt authorize-URL gir "Unknown or expired upstream state".
 */
export function getLoginUrl(targetUrl: string): string {
    const goto = encodeURIComponent(targetUrl);
    return `${baseUrls.platform}/authentication/api/v1/authentication?goto=${goto}&iss=mockporten`;
}

export type TestUser = {
    pid: string;
    name: string;
};

/**
 * Testbrukeren er miljøspesifikk og syntetisk. Testmiljøene har sin i
 * .env.<miljø>, prod-brukeren ligger i .env.prod.local og er ikke sjekket inn.
 *
 * TEST_USER_NAME trengs bare av testene som slår opp navnet på skjermen, altså
 * infoportalen, så den kreves først når den faktisk leses.
 */
export function getTestUser(): TestUser {
    return {
        pid: requireEnv('TEST_USER_PID'),
        get name() {
            return requireEnv('TEST_USER_NAME');
        },
    };
}

/**
 * Det delte tilgangspassordet til Test-IDP. Den låser seg globalt etter fem
 * feilforsøk, så testen skal feile umiddelbart framfor å prøve seg fram.
 */
export function getSharedPassword(): string {
    return requireEnv('TEST_IDP_PASSWORD');
}
