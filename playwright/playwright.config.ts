import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Env-varene kan komme fra shellet, slik k6-testene gjør det, eller fra en lokal
// fil for den som ikke vil source. Alle filene er gitignorert.
//
// .env.<miljø>.local overstyrer det som allerede ligger i shellet, ellers ville en
// gammel BASE_URL fra shell-profilen bestemt hvilket miljø testene traff. Filene
// finnes bare lokalt, så i Kubernetes gjelder configmap og secrets som før.
const environment = process.env.ENVIRONMENT || "at23";

dotenv.config({
  path: path.join(__dirname, `.env.${environment}.local`),
  override: true,
  quiet: true,
});

for (const file of [".env.local", ".env"]) {
  dotenv.config({ path: path.join(__dirname, file), quiet: true });
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // Minst én retry, slik at en flaky kjøring ikke rapporteres som feil.
  // Traces skrives ved første retry
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results.xml" }],
    ["json", { outputFile: "test-results.json" }],
  ],
  timeout: 60000,
  use: {
    headless: true,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
});
