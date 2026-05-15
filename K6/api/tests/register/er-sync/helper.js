import { group, check, fail } from "k6";
import { PlatformTokenGenerator } from "../../../../common-imports.js";
import { RegisterApiClient, RegisterLookupClient } from "../../../../clients/authentication/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { retry } from "../../../../helpers.js";

for (const key of ["ENVIRONMENT", "BASE_URL", "SOAP_ER_USERNAME", "SOAP_ER_PASSWORD"]) {
    if (!__ENV[key]) throw new Error(`Missing required env var: ${key}`);
}

function pollOrganization(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party,person,org,user,si,sysuser", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
    if (res.status !== 200) return null;
    const body = JSON.parse(res.body);
    return body.data[0] || null;
}

export function runErSyncTestcase(scenarioName, prepXml, changeXml, orgNr, verifyChecks, { stopAfterPrep = false, afterChange = null } = {}) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
    const lookupClient = new RegisterLookupClient(__ENV.BASE_URL, new PlatformTokenGenerator(tokenOpts));

    group(scenarioName, () => {
        group("Prep - submit organization to ER", () => {
            const res = SubmitErData(apiClient, prepXml, "Prep");
            if (res.status !== 200) fail(`[${scenarioName}] Prep failed with status ${res.status} — aborting test`);
        });

        group("Prep - verify organization is visible in Register", () => {
            let prepParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) return false;
                    prepParty = party;
                    return true;
                },
                { retries: 15, intervalSeconds: 20, testscenario: `${scenarioName} - prep` },
            );
            if (prepParty) {
                check(prepParty, { "Prep - org is visible in Register": (p) => p.partyType === "organization" });
            }
        });

        if (stopAfterPrep || __ENV.STOP_AFTER_PREP === "true") return;

        group("Change - submit ER update", () => {
            SubmitErData(apiClient, changeXml, "Change");
        });

        group("Verify - Register reflects change", () => {
            let verifiedParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) return false;
                    const conditionMet = Object.values(verifyChecks).every((fn) => fn(party));
                    if (conditionMet) verifiedParty = party;
                    return conditionMet;
                },
                { retries: 15, intervalSeconds: 20, testscenario: `${scenarioName} - verify` },
            );
            if (verifiedParty) {
                check(verifiedParty, verifyChecks);
            }
        });

        if (afterChange) afterChange();
    });
}
