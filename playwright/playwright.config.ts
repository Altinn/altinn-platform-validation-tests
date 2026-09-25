import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { Sprak } from "./config/sprak";
import { Miljo, Urler } from "./miljo";

// Hemmelighetene kan komme fra shellet eller fra gitignorerte .env-filer. Shellet
// vinner, tomme verdier hoppes over.
function les(fil: string) {
    const sti = path.join(__dirname, fil);

    if (!fs.existsSync(sti)) {
        return;
    }

    for (const [navn, verdi] of Object.entries(
        dotenv.parse(fs.readFileSync(sti)),
    )) {
        if (verdi && !process.env[navn]) {
            process.env[navn] = verdi;
        }
    }
}

les(".env.local");
les(".env");

// Mockporten i stedet for TestID, for når ID-porten er nede i et testmiljø.
// `MOCKPORTEN=true npm run test:at23`. Prod-projectet angir det selv.
const mockporten = process.env.MOCKPORTEN === "true";
// Specene som tester innloggingsflyten gjennom ID-porten gir ikke mening uten den.
const krevIdporten = mockporten ? ["innlogging/innlogging-alle-flater.spec.ts"] : [];

// Bare Chrome inntil videre; Firefox, Edge og Safari er skrudd av, se #619.
const felles = { ...devices["Desktop Chrome"], mockporten };

export default defineConfig<
    { sprak: Sprak },
    { miljo: Miljo; urler: Urler; mockporten: boolean }
>({
    testDir: "./tests",
    testMatch: "**/*.spec.ts",
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
        trace: "on-first-retry",
        video: "retain-on-failure",
    },
    // Ett project per miljø, valgt med --project=<miljø>. En ny spec kjører i at23
    // og tt02 med en gang, og i prod først når den er verifisert der og føres opp.
    projects: [
        {
            name: "at23",
            testIgnore: krevIdporten,
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
            // Cookiebanneret er ikke kjørt ut i tt02 ennå.
            testIgnore: ["infoportal/cookiebanner-*.spec.ts", ...krevIdporten],
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
            // Bare tester som er verifisert i at23 og tt02, og som ikke endrer data.
            // Utlogging er ikke med, siden Mockportens utloggingsside svarer 404.
            testMatch: [
                "innlogging/innlogging-alle-flater.spec.ts",
                "innlogging/innlogging-refresh-alle-flater.spec.ts",
                "innlogging/innlogging-mockporten.spec.ts",
                "tilgangsstyring/tilgjengelige-seksjoner.spec.ts",
            ],
            use: {
                ...felles,
                // TestID finnes ikke i prod, så innloggingen går alltid via Mockporten.
                mockporten: true,
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
