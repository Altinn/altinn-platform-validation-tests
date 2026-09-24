/**
 * Hemmelighetene, som tilgangspassordet, kommer fra miljøvariabler: lokalt fra
 * .env, i Kubernetes fra secrets. URLene ligger per miljø i miljo.ts.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} må settes som miljøvariabel, se example_env/.env.example.`,
    );
  }

  return value;
}
