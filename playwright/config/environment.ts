/**
 * Miljøene testene kan kjøre mot. Alt som ikke er hemmelig står her framfor i
 * .env-filer, og hemmeligheter kommer utelukkende fra env-vars: TEST_IDP_PASSWORD
 * alltid, og TEST_USER_PID mot prod, der testbrukeren ikke skal sjekkes inn.
 *
 * URLene kan overstyres med de samme env-varene som k6-testene bruker, se
 * K6/example_env/at23.sh, slik at et sourcet miljø gjelder for begge.
 */
export type Miljo = "at22" | "at23" | "prod";

export type TestUser = {
  pid: string;
  name: string;
};

type Miljokonfigurasjon = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
  readonly testUser: TestUser;
};

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} må settes som miljøvariabel. Se README.`);
  }

  return value;
}

// Syntetisk Tenor-bruker, altså måned 81-92. Ikke hemmelig i testmiljøene.
const testmiljoBruker: TestUser = {
  pid: "31851449372",
  name: "Ordinær Æresdoktor",
};

const miljoer: Record<Miljo, Miljokonfigurasjon> = {
  at22: {
    arbeidsflate: "https://af.at22.altinn.cloud",
    tilgangsstyring: "https://am.ui.at22.altinn.cloud",
    infoportal: "https://info.at22.altinn.cloud",
    platform: "https://platform.at22.altinn.cloud",
    testUser: testmiljoBruker,
  },
  at23: {
    arbeidsflate: "https://af.at23.altinn.cloud",
    tilgangsstyring: "https://am.ui.at23.altinn.cloud",
    infoportal: "https://info.at23.altinn.cloud",
    platform: "https://platform.at23.altinn.cloud",
    testUser: testmiljoBruker,
  },
  prod: {
    arbeidsflate: "https://af.altinn.no",
    tilgangsstyring: "https://am.ui.altinn.no",
    infoportal: "https://info.altinn.no",
    platform: "https://platform.altinn.no",

    // TEST_USER_NAME trengs bare av testene som slår opp navnet på skjermen.
    get testUser() {
      return {
        pid: requireEnv("TEST_USER_PID"),
        get name() {
          return requireEnv("TEST_USER_NAME");
        },
      };
    },
  },
};

export function miljo(): Miljo {
  const valgt = process.env.TEST_ENV || "at23";

  if (!(valgt in miljoer)) {
    throw new Error(
      `Ukjent TEST_ENV "${valgt}". Gyldige verdier: ${Object.keys(miljoer).join(", ")}.`,
    );
  }

  return valgt as Miljo;
}

export const baseUrls = {
  get arbeidsflate() {
    return miljoer[miljo()].arbeidsflate;
  },
  get tilgangsstyring() {
    return miljoer[miljo()].tilgangsstyring;
  },
  get infoportal() {
    return miljoer[miljo()].infoportal;
  },
  get platform() {
    return miljoer[miljo()].platform;
  },
};

export function getTestUser(): TestUser {
  return miljoer[miljo()].testUser;
}

/**
 * Det delte tilgangspassordet til Test-IDP. Den låser seg globalt etter fem
 * feilforsøk, så testen skal feile umiddelbart framfor å prøve seg fram.
 */
export function getSharedPassword(): string {
  return requireEnv("TEST_IDP_PASSWORD");
}

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
