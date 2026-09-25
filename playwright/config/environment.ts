/**
 * Hemmelighetene kommer fra miljøvariabler: lokalt fra .env, i Kubernetes fra
 * secrets. URLene ligger i miljøets project i playwright.config.ts.
 */
export type TestUser = {
    pid: string;
    name: string;
};

export function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `${name} må settes som miljøvariabel, se .env.example.`
        );
    }

    return value;
}

/**
 * Den syntetiske testbrukeren for miljøet. Fødselsnummeret må være et Tenor-nummer,
 * altså måned 81-92. TEST_USER_NAME leses late, siden bare testene som slår opp
 * navnet på skjermen trenger det.
 */
export function getTestUser(): TestUser {
    return {
        pid: requireEnv("TEST_USER_PID"),
        get name() {
            return requireEnv("TEST_USER_NAME");
        },
    };
}
