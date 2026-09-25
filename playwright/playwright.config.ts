import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

import { Sprak } from "./config/sprak";
import { Urler } from "./fixtures/miljo.fixture";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet vinner.
dotenv.config({
    path: [".env.local", ".env"].map((fil) => path.join(__dirname, fil)),
    quiet: true,
});

export default defineConfig<
    { sprak: Sprak },
    { urler: Urler; mockporten: boolean }
>({
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

    // Ett project per miljø, valgt med --project=<miljø>. Et project kjører alle
    // specene, eller bare dem i testMatch når miljøet skal ha færre.
    projects: [
        {
            name: "at23",
            use: {
                urler: {
                    arbeidsflate: "https://af.at23.altinn.cloud",
                    tilgangsstyring: "https://am.ui.at23.altinn.cloud",
                    infoportal: "https://info.at23.altinn.cloud",
                    platform: "https://platform.at23.altinn.cloud",
                },
            },
        },
        {
            name: "tt02",
            use: {
                urler: {
                    arbeidsflate: "https://af.tt02.altinn.no",
                    tilgangsstyring: "https://am.ui.tt02.altinn.no",
                    infoportal: "https://info.tt02.altinn.no",
                    platform: "https://platform.tt02.altinn.no",
                },
            },
        },
        {
            name: "prod",
            use: {
                mockporten: true,
                urler: {
                    arbeidsflate: "https://af.altinn.no",
                    tilgangsstyring: "https://am.ui.altinn.no",
                    infoportal: "https://info.altinn.no",
                    platform: "https://platform.altinn.no",
                },
            },
        },
    ],
});
