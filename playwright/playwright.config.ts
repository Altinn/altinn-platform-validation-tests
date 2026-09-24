import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { Sprak } from "./config/sprak";
import { MILJOER, Miljo, miljotag } from "./miljo";
import { Testbruker } from "./testdata";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet
// vinner, tomme verdier hoppes over.
function les(fil: string) {
  const sti = path.join(__dirname, fil);

  if (!fs.existsSync(sti)) {
    return;
  }

  for (const [navn, verdi] of Object.entries(dotenv.parse(fs.readFileSync(sti)))) {
    if (verdi && !process.env[navn]) {
      process.env[navn] = verdi;
    }
  }
}

les(".env.local");
les(".env");

// Flagg som ikke kommer etter `--` ser Playwright aldri; npm gjør dem om til
// npm_config_*. Disse plukkes opp her, slik at både `npm run test:at23 --headed`
// og `npm run test:at23 -- --headed` virker. Resten, som --grep, går etter `--`.
function npmFlag(name: string): string | undefined {
  const value = process.env[`npm_config_${name}`];
  return value && value !== "false" ? value : undefined;
}

const headed = npmFlag("headed") !== undefined;
const workers = npmFlag("workers");
const retries = npmFlag("retries");
// Mockporten i stedet for TestID i alle miljøer, for når ID-porten er nede.
// `npm run test:at23 --mockporten`, eller MOCKPORTEN=true med npx.
const mockporten = npmFlag("mockporten") !== undefined || process.env.MOCKPORTEN === "true";

export default defineConfig<{ sprak: Sprak; testbrukerPath: Testbruker }, { miljo: Miljo; mockporten: boolean }>({
  // Sjekker at hver spec sier hvilke miljøer den er satt opp for, før noe kjøres.
  globalSetup: "./global-setup.ts",
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Én retry som standard; kan overstyres med --retries.
  // Traces skrives ved første retry.
  retries: retries ? Number(retries) : 1,
  workers: workers ? Number(workers) : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results.xml" }],
    ["json", { outputFile: "test-results.json" }],
  ],
  timeout: 60000,
  // Playwrights standard er fem sekunder, og det er for stramt her: en assertion
  // venter typisk på at flaten har hentet parter og rettigheter etter innlogging,
  // og en hel test bruker 2-7 sekunder når alt går bra. Standarden står her, slik
  // at page objectene bare sier fra når de trenger noe annet enn den.
  //
  // At taket er romslig gjør oss ikke blinde for en flate som blir tregere, for det
  // er ikke timeouten som skal fange den. Hvor lang tid testene bruker eksporteres
  // som playwright_test_duration_seconds fra junit-rapporten, se helpers/junitparser,
  // og en jevn økning der sier fra lenge før en test tilfeldigvis bikker over taket.
  // Timeouten er sikkerhetsnettet for kjøringen, tallene over tid er målingen.
  expect: { timeout: 10_000 },
  use: {
    headless: !headed,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  // Ett project per miljø. Projectet velger testene som er tagget med miljøet,
  // se miljoer() i miljo.ts, og gir fixturene miljøet og URLene som følger av det.
  projects: MILJOER.map((miljo) => ({
    name: miljo,
    grep: new RegExp(`${miljotag(miljo)}\\b`),
    use: { miljo, mockporten },
  })),
});
