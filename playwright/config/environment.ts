/**
 * Alt kommer fra miljøvariabler, på samme måte som k6-testene. Du sourcer et
 * miljø før du kjører, se example_env/ og K6/example_env/README.md. I Kubernetes
 * kommer de samme variablene fra configmap og secrets.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} må settes som miljøvariabel. Source et miljø først, se example_env/.`,
    );
  }

  return value;
}

export const baseUrls = {
  get arbeidsflate() {
    return requireEnv("AF_UI_BASE_URL");
  },
  get tilgangsstyring() {
    return requireEnv("AM_UI_BASE_URL");
  },
  get infoportal() {
    return requireEnv("INFO_CLOUD_URL");
  },
  // BASE_URL er platform-URLen i k6-oppsettet, se K6/example_env/at23.sh.
  get platform() {
    return requireEnv("BASE_URL");
  },
};
