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
};

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
