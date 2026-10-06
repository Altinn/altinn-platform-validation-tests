import { Sprak } from "./sprak";

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

/**
 * En app fra ttd som testene bruker. Visningsnavnet og tilgangspakken er slik de står i
 * Tilgangsstyring, og pakkenavnet oversettes, ikke bare UI-teksten rundt.
 */
export type Testapp = {
    // Appens navn i urlen.
    id: string;
    visningsnavn: string;
    tilgangspakke: Record<Sprak, string>;
};

export type TestUser = {
    pid: string;
    name: string;
};

export function etternavn(user: TestUser): string {
    return user.name.split(" ").at(-1)!;
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
