import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

import { Sprak } from "./config/sprak";
import { Options } from "./fixtures/options.fixture";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet vinner.
dotenv.config({
    path: [".env.local", ".env"].map((fil) => path.join(__dirname, fil)),
    quiet: true,
});

// Alt som skiller miljøene. Et miljø kjører bare testene som er tagget med det,
// for eksempel { tag: ["@at23", "@tt02"] }.
const miljoer = {
    at23: {
        mockporten: false,
        urler: {
            arbeidsflate: "https://af.at23.altinn.cloud",
            tilgangsstyring: "https://am.ui.at23.altinn.cloud",
            infoportal: "https://info.at23.altinn.cloud",
            platform: "https://platform.at23.altinn.cloud",
        },
    },
    tt02: {
        mockporten: false,
        urler: {
            arbeidsflate: "https://af.tt02.altinn.no",
            tilgangsstyring: "https://am.ui.tt02.altinn.no",
            infoportal: "https://info.tt02.altinn.no",
            platform: "https://platform.tt02.altinn.no",
        },
    },
    prod: {
        // TestID finnes ikke i prod, så innloggingen går via Mockporten.
        mockporten: true,
        urler: {
            arbeidsflate: "https://af.altinn.no",
            tilgangsstyring: "https://am.ui.altinn.no",
            infoportal: "https://info.altinn.no",
            platform: "https://platform.altinn.no",
        },
    },
} satisfies Record<string, Options>;

// Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
const nettlesere = {
    chromium: devices["Desktop Chrome"],
    // firefox: devices["Desktop Firefox"],
    // edge: devices["Desktop Edge"],
    // webkit: devices["Desktop Safari"],
};

export default defineConfig<{ sprak: Sprak } & Options>({
    testDir: "./tests",
    fullyParallel: true,
    // Minst én retry, slik at en flaky kjøring ikke rapporteres som feil.
    // Traces skrives ved første retry. --retries overstyrer.
    retries: process.env.CI ? 2 : 1,
    reporter: [
        ["html", { open: "never" }],
        ["junit", { outputFile: "test-results.xml" }],
        ["json", { outputFile: "test-results.json" }],
    ],
    timeout: 60000,
    expect: { timeout: 10_000 },
    use: {
    // Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
        ...devices["Desktop Chrome"],
        trace: "on-first-retry",
        video: "retain-on-failure",
    },

    // Ett project per miljø og nettleser, for eksempel at23-chromium. Scriptene kjører
    // alle nettleserne for ett miljø med --project=<miljø>-*.
    projects: Object.entries(miljoer).flatMap(([miljo, options]) =>
        Object.entries(nettlesere).map(([nettleser, device]) => ({
            name: `${miljo}-${nettleser}`,
            grep: new RegExp(`@${miljo}`),
            use: { ...device, ...options },
            metadata: { miljo, nettleser },
        })),
    ),
});
