import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Env-varene kan komme fra shellet, slik k6-testene gjør det, eller fra en lokal
// fil for den som ikke vil source. Alle filene er gitignorert.
//
// .env.<miljø>.local overstyrer det som allerede ligger i shellet, ellers ville en
// gammel BASE_URL fra shell-profilen bestemt hvilket miljø testene traff. Filene
// finnes bare lokalt, så i Kubernetes gjelder configmap og secrets som før.
const environment = process.env.ENVIRONMENT || "at23";

function les(fil: string, overstyr: boolean) {
  const sti = path.join(__dirname, fil);

  if (!fs.existsSync(sti)) {
    return;
  }

  for (const [navn, verdi] of Object.entries(dotenv.parse(fs.readFileSync(sti)))) {
    // Tomme verdier står i malene som utfyllingspunkt, og skal ikke skygge for en
    // verdi satt et annet sted.
    if (verdi && (overstyr || !process.env[navn])) {
      process.env[navn] = verdi;
    }
  }
}

les(`.env.${environment}.local`, true);
les(".env.local", false);
les(".env", false);

// Flagg som ikke kommer etter `--` ser Playwright aldri; npm gjør dem om til
// npm_config_*. De mest brukte plukkes opp her, slik at både
// `npm run test:prod --headed` og `npm run test:prod -- --headed` virker.
function npmFlag(name: string): string | undefined {
  const value = process.env[`npm_config_${name}`];
  return value && value !== "false" ? value : undefined;
}

const headed = npmFlag("headed") !== undefined;
const grep = npmFlag("grep");
const workers = npmFlag("workers");
const retries = npmFlag("retries");

/**
 * Prod er opt-in: bare tester merket @prod kjøres der, så en ny test ikke kan havne i
 * prod ved en forglemmelse. Filteret ligger her framfor i npm-scriptet, slik at det
 * også gjelder når Playwright kalles direkte.
 *
 * `--grep=bokmål` fra npm kombineres med, ikke erstatter, prod-filteret. Likhetstegnet
 * er nødvendig, ellers tolker npm neste ord som eget argument.
 */
function grepFilter(): RegExp | undefined {
  const fraBruker = grep && grep !== "true" ? grep : undefined;

  if (environment === "prod") {
    return fraBruker
      ? new RegExp(`(?=.*@prod)(?=.*${fraBruker})`, "i")
      : /@prod/;
  }

  return fraBruker ? new RegExp(fraBruker, "i") : undefined;
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Minst én retry, slik at en flaky kjøring ikke rapporteres som feil.
  // Traces skrives ved første retry
  retries: retries ? Number(retries) : process.env.CI ? 2 : 1,
  workers: workers ? Number(workers) : undefined,
  grep: grepFilter(),
  reporter: [
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results.xml" }],
    ["json", { outputFile: "test-results.json" }],
  ],
  timeout: 60000,
  use: {
    headless: !headed,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
});
