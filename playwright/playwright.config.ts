import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { Sprak } from "./config/sprak";
import { Miljo, miljotag, Urler } from "./miljo";
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

// Et miljø-project kjører bare testene som er tagget med miljøet, se miljoer() i miljo.ts.
function taggetMed(miljo: Miljo): RegExp {
    return new RegExp(`${miljotag(miljo)}\\b`);
}

// Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
const felles = { ...devices["Desktop Chrome"], mockporten };

export default defineConfig<{ sprak: Sprak; testbrukerPath: Testbruker }, { miljo: Miljo; urler: Urler; mockporten: boolean }>({
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
    // Ett project per miljø, valgt med --project=<miljø>.
    projects: [
        {
            name: "at23",
            grep: taggetMed("at23"),
            use: {
                ...felles,
                miljo: "at23",
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
            grep: taggetMed("tt02"),
            use: {
                ...felles,
                miljo: "tt02",
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
            grep: taggetMed("prod"),
            use: {
                ...felles,
                miljo: "prod",
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
