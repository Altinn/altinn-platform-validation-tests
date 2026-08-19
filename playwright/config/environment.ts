/**
 * Alt kommer fra miljøvariabler, på samme måte som k6-testene. Du sourcer et
 * miljø før du kjører, se example_env/ og K6/example_env/README.md. I Kubernetes
 * kommer de samme variablene fra configmap og secrets.
 */
export type TestUser = {
    pid: string;
    name: string;
};

export function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `${name} må settes som miljøvariabel. Source et miljø først, se example_env/.`
        );
    }

    return value;
}

/**
 * Første variabel som er satt vinner. Brukes der k6-testene har et etablert navn
 * fra før, slik at et sourcet miljø gjelder for begge testsettene.
 */
function requireOneOf(names: string[]): string {
    for (const name of names) {
        const value = process.env[name];

        if (value) {
            return value;
        }
    }

    return requireEnv(names[0]);
}

export const baseUrls = {
    get arbeidsflate() {
        return requireEnv('AF_UI_BASE_URL');
    },
    get tilgangsstyring() {
        return requireEnv('AM_UI_BASE_URL');
    },
    get infoportal() {
        return requireEnv('INFO_CLOUD_URL');
    },
    // BASE_URL er platform-URLen i k6-testene, så den gjelder også her.
    get platform() {
        return requireOneOf(['PLATFORM_BASE_URL', 'BASE_URL']);
    },
};

/**
 * Den syntetiske testbrukeren for miljøet. Fødselsnummeret må være et Tenor-nummer,
 * altså måned 81-92. TEST_USER_NAME leses late, siden bare testene som slår opp
 * navnet på skjermen trenger det.
 */
export function getTestUser(): TestUser {
    return {
        pid: requireEnv('TEST_USER_PID'),
        get name() {
            return requireEnv('TEST_USER_NAME');
        },
    };
}
