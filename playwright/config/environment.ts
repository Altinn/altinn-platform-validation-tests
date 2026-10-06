/**
 * Hemmelighetene kommer fra miljøvariabler: lokalt fra .env, i Kubernetes fra
 * secrets. URLene ligger i miljøets project i playwright.config.ts, og testbrukerne
 * i testdata/.
 */
export type Urler = {
    arbeidsflate: string;
    tilgangsstyring: string;
    infoportal: string;
    platform: string;
    // Appene til ttd, den eneste virksomheten testene bruker apper fra: {apps}/{app}.
    apps: string;
};

export type TestUser = {
    pid: string;
    name: string;
};

// Etternavnet, slik Tilgangsstyring vil ha det når en ny bruker legges til.
export function etternavn(user: TestUser): string {
    return user.name.trim().split(/\s+/).at(-1)!.toUpperCase();
}

export function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `${name} må settes som miljøvariabel, se .env.example.`
        );
    }

    return value;
}
