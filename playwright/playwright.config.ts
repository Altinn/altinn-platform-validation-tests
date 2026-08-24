import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { stopp } from "./feil";
import { MILJOER, Miljo } from "./miljo";

const environment = process.env.ENVIRONMENT;

// Sjekker verdien og ikke bare at den finnes: et ukjent miljønavn matcher ingen
// runInEnvironment-deklarasjon, så en skrivefeil ville gitt en helgrønn kjøring
// der hver eneste test skippet seg selv.
if (!environment || !MILJOER.includes(environment as Miljo)) {
  stopp(
    `ENVIRONMENT må være ett av ${MILJOER.join(", ")}, ikke ${environment ? `"${environment}"` : "tom"}. Bruk npm run test:<miljø>.`
  );
}

// Verdiene kan komme fra shellet eller fra gitignorerte .env-filer. Miljøfila
// overstyrer shellet, tomme verdier hoppes over.
function les(fil: string, overstyr: boolean) {
  const sti = path.join(__dirname, fil);

  if (!fs.existsSync(sti)) {
    return;
  }

  for (const [navn, verdi] of Object.entries(dotenv.parse(fs.readFileSync(sti)))) {
    if (verdi && (overstyr || !process.env[navn])) {
      process.env[navn] = verdi;
    }
  }
}

les(`.env.${environment}.local`, true);
les(".env.local", false);
les(".env", false);

// Flagg som ikke kommer etter `--` ser Playwright aldri; npm gjør dem om til
// npm_config_*. Disse tre plukkes opp her, slik at både `npm run test:prod --headed`
// og `npm run test:prod -- --headed` virker. Resten, som --grep, går etter `--`.
function npmFlag(name: string): string | undefined {
  const value = process.env[`npm_config_${name}`];
  return value && value !== "false" ? value : undefined;
}

const headed = npmFlag("headed") !== undefined;
const workers = npmFlag("workers");
const retries = npmFlag("retries");

export default defineConfig({
  // Sjekker at hver spec sier hvilke miljøer den er satt opp for, før noe kjøres.
  globalSetup: "./global-setup.ts",
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Minst én retry, slik at en flaky kjøring ikke rapporteres som feil.
  // Traces skrives ved første retry
  retries: retries ? Number(retries) : process.env.CI ? 2 : 1,
  workers: workers ? Number(workers) : undefined,
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
