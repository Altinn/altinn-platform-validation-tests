import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

import { TestAppConfig, Urler } from "./config/environment";
import { Sprak } from "./config/sprak";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet vinner.
dotenv.config({
    path: [".env.local", ".env"].map((fil) => path.join(__dirname, fil)),
    quiet: true,
});

const bruksmoensterTestApp = (sprak: Sprak): TestAppConfig => ({
    id: "brukermonster-test-app",
    visningsnavn: {
        [Sprak.Bokmaal]: "Bruksmønster-testtjeneste",
        [Sprak.Nynorsk]: "Bruksmønster-testteneste",
        [Sprak.Engelsk]: "Userpattern test service",
    }[sprak],
    tilgangspakke: {
        [Sprak.Bokmaal]: "Fritidsaktiviteter og friluftsliv",
        [Sprak.Nynorsk]: "Fritidsaktivitetar og friluftsliv",
        [Sprak.Engelsk]: "Leisure activities and outdoor life",
    }[sprak],
});

// Alt som skiller miljøene. Et miljø kjører bare testene som er tagget med det,
// for eksempel { tag: ["@at23", "@tt02"] }.
const miljoer = {
    at23: {
        mockporten: false,
        testAppConfig: bruksmoensterTestApp,
        urler: {
            arbeidsflate: "https://af.at23.altinn.cloud",
            tilgangsstyring: "https://am.ui.at23.altinn.cloud",
            infoportal: "https://info.at23.altinn.cloud",
            platform: "https://platform.at23.altinn.cloud",
            apps: "https://ttd.apps.at23.altinn.cloud/ttd",
        },
    },
    tt02: {
        mockporten: false,
        testAppConfig: bruksmoensterTestApp,
        urler: {
            arbeidsflate: "https://af.tt02.altinn.no",
            tilgangsstyring: "https://am.ui.tt02.altinn.no",
            infoportal: "https://info.tt02.altinn.no",
            platform: "https://platform.tt02.altinn.no",
            apps: "https://ttd.apps.tt02.altinn.no/ttd",
        },
    },
    prod: {
        // TestID finnes ikke i prod, så innloggingen går via Mockporten.
        mockporten: true,
        testAppConfig: bruksmoensterTestApp,
        urler: {
            arbeidsflate: "https://af.altinn.no",
            tilgangsstyring: "https://am.ui.altinn.no",
            infoportal: "https://info.altinn.no",
            platform: "https://platform.altinn.no",
            apps: "https://ttd.apps.altinn.no/ttd",
        },
    },
} satisfies Record<string, { mockporten: boolean; testAppConfig: (sprak: Sprak) => TestAppConfig; urler: Urler }>;

// Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
// Større enn standardstørrelsen i devices (1280 × 720), så det er lettere å følge med når
// testene debugges og deles.
const skjerm = { width: 1920, height: 1080 };

const nettlesere = {
    chromium: devices["Desktop Chrome"],
    // firefox: devices["Desktop Firefox"],
    edge: devices["Desktop Edge"],
    webkit: devices["Desktop Safari"],
};

// Bare bokmål inntil appen slutter å mellomlagre språket, se #694.
const sprakene = [Sprak.Bokmaal];

export default defineConfig<{
    miljo: string;
    mockporten: boolean;
    testAppConfig: TestAppConfig;
    urler: Urler;
    sprak: Sprak;
}>({
    testDir: "./tests",
    fullyParallel: true,
    // Minst én retry, slik at en flaky kjøring ikke rapporteres som feil.
    // Traces skrives ved første retry. --retries overstyrer.
    retries: 1,
    reporter: [
        ["html", { open: "never", port: 6060 }],
        ["junit", { outputFile: "test-results.xml" }],
        ["json", { outputFile: "test-results.json" }],
    ],
    timeout: 60000,
    expect: { timeout: 10_000 },
    use: {
        trace: "on-first-retry",
        video: "retain-on-failure",
    },

    // Ett project per miljø, nettleser og språk, for eksempel at23-chromium-bokmål.
    projects: Object.entries(miljoer).flatMap(([miljo, { testAppConfig, ...options }]) =>
        Object.entries(nettlesere).flatMap(([nettleser, device]) =>
            sprakene.map((sprak) => ({
                name: `${miljo}-${nettleser}-${sprak}`,
                grep: new RegExp(`@${miljo}`),
                use: { ...device, viewport: skjerm, ...options, testAppConfig: testAppConfig(sprak), miljo, sprak },
            })),
        ),
    ),
});
