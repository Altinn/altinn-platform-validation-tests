/**
 * Hemmelighetene, som tilgangspassordet, kommer fra miljøvariabler: lokalt fra
 * .env, i Kubernetes fra secrets. URLene ligger i miljøets project i playwright.config.ts.
 */
export function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
            `${name} må settes som miljøvariabel, se .env.example.`,
        );
    }

    return value;
}
