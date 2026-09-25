import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

import { Sprak } from "./config/sprak";
import { Urler } from "./miljo";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet vinner.
dotenv.config({
    path: [".env.local", ".env"].map((fil) => path.join(__dirname, fil)),
    quiet: true,
});

// Mockporten i stedet for TestID, for når ID-porten er nede i et testmiljø.
// `MOCKPORTEN=true npm run test:at23`. Prod-projectet angir det selv.
const mockporten = process.env.MOCKPORTEN === "true";

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
    // Playwrights standard er fem sekunder, og det er for "tight" - vi laster ofte mange elementer på de ulike
    expect: { timeout: 10_000 },
    use: {
        // Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
        ...devices["Desktop Chrome"],
        trace: "on-first-retry",
        video: "retain-on-failure",
        mockporten,
    },
    // Ett project per miljø, valgt med --project=<miljø>. En ny spec kjører i at23
    // med en gang, og i tt02 og prod først når den føres opp i testMatch.
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
            testMatch: [
                "infoportal/header-gjenspeiler-bruker.spec.ts",
                "infoportal/sprak-fra-profil.spec.ts",
                "innlogging/innlogging-alle-flater.spec.ts",
                "innlogging/innlogging-mockporten.spec.ts",
                "innlogging/innlogging-refresh-alle-flater.spec.ts",
                "innlogging/utlogging-alle-flater.spec.ts",
                "tilgangsstyring/tilgjengelige-seksjoner.spec.ts",
            ],
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
            testMatch: [
                "innlogging/innlogging-refresh-alle-flater.spec.ts",
                "innlogging/innlogging-mockporten.spec.ts",
                "tilgangsstyring/tilgjengelige-seksjoner.spec.ts",
            ],
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
