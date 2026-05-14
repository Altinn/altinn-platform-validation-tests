import { group, check } from "k6";
import { PlatformTokenGenerator } from "../../../../common-imports.js";
import { RegisterApiClient, RegisterLookupClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { retry } from "../../../../helpers.js";

function pollOrganization(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party,person,org,user,si,sysuser", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
    if (res.status !== 200) return null;
    const body = JSON.parse(res.body);
    return body.data[0] || null;
}

export function runErSyncTestcase(scenarioName, preps, changeXml, orgNr, verifyChecks) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
    const lookupClient = new RegisterLookupClient(__ENV.BASE_URL, new PlatformTokenGenerator(tokenOpts));

    console.log(`[${scenarioName}] BASE_URL: ${__ENV.BASE_URL}`);
    console.log(`[${scenarioName}] Target org: ${orgNr}`);

    group(scenarioName, () => {
        group("Prep - submit organization to ER", () => {
            for (const prep of preps) {
                SubmitErData(apiClient, prep);
                console.log(`[${scenarioName}] Prep: ER data processed ok`);
            }
        });

        group("Prep - verify organization is visible in Register", () => {
            let prepParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) {
                        console.log(`[${scenarioName}] Prep: Waiting for org to be added to register`);
                        return false;
                    }
                    prepParty = party;
                    return true;
                },
                { retries: 15, intervalSeconds: 20, testscenario: scenarioName },
            );
            if (prepParty) {
                console.log(`[${scenarioName}] Prep - org displayName: ${prepParty.displayName}`);
                check(prepParty, { "Prep - org is visible in Register": (p) => p.partyType === "organization" });
            }
        });

        group("Change - submit ER update", () => {
            SubmitErData(apiClient, changeXml);
            console.log(`[${scenarioName}] Change: ER data processed ok`);
        });

        group("Verify - Register reflects change", () => {
            let verifiedParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) {
                        console.log(`[${scenarioName}] Waiting for org to be updated in Register`);
                        return false;
                    }
                    const conditionResults = Object.entries(verifyChecks).map(([label, fn]) => {
                        const result = fn(party);
                        if (!result) console.log(`[${scenarioName}] Condition not met: "${label}"`);
                        return result;
                    });
                    const conditionMet = conditionResults.every(Boolean);
                    if (conditionMet) verifiedParty = party;
                    return conditionMet;
                },
                { retries: 15, intervalSeconds: 20, testscenario: scenarioName },
            );
            if (verifiedParty) {
                check(verifiedParty, verifyChecks);
            }
        });
    });
}
