/**
 * Test data generation for the consent latest changes status API:
 * https://docs.altinn.studio/nb/authorization/guides/system-vendor/consent/liststatuschanges/
 *
 * The goal is to provide test data for easily being able to use the status API
 * and navigating to the next page. Page sizes differ per environment:
 *   - AT22 and AT23: 5 consents per page
 *   - TT02: 100 consents per page
 *   - YT01: 1000 consents per page
 *
 * Run this script to generate consents and capture the CSV output from teardown,
 * then commit it as the test data file for the corresponding environment.
 * 
 * It is recommended to vary the PIDs (person identifiers) to not generate too many consents per person, 
 * but use the same org to be able to have paginated data for the same org which fetches the consent statuses
 */

import http from "k6/http";
import exec from "k6/execution";
import { group } from "k6";

import { uuidv4 } from "../../../../../common-imports.js";
import { parseCsvData, getItemFromList } from "../../../../../helpers.js";
import { BffAccessManagementApiClient, ConsentApiClient, RegisterLookupClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator, EnterpriseTokenGenerator, PlatformTokenGenerator } from "../../../../../common-imports.js";
import { RequestConsent, ApproveConsent, RevokeConsent } from "../../../../building-blocks/authentication/consent/index.js";
import { LookupPartiesInRegister } from "../../../../building-blocks/register/index.js";

const ACCEPTED_COUNT = 5;
const REVOKED_COUNT = 1;
const TOTAL = ACCEPTED_COUNT + REVOKED_COUNT;

export const options = {
    setupTimeout: "30s",
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 5,
            iterations: TOTAL,
        },
    },
};

function consentRights() {
    return [
        {
            action: ["consent"],
            resource: [{ type: "urn:altinn:resource", value: "enkelt-samtykke" }],
            metaData: { simpletag: "test" },
        },
    ];
}

export function setup() {
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");
    if (!__ENV.BASE_URL) throw new Error("Missing BASE_URL");
    if (!__ENV.AM_UI_BASE_URL) throw new Error("Missing AM_UI_BASE_URL");

    const testdataRes = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/consent/get-status/K6/api/tests/authentication/consent/testdataGeneration/testdata-${__ENV.ENVIRONMENT}.csv`
    );
    if (testdataRes.status !== 200) throw new Error(`Failed to fetch testdata for environment: ${__ENV.ENVIRONMENT}`);
    const testdata = parseCsvData(testdataRes.body);
    if (!testdata.length || !testdata[0].orgNo) throw new Error(`Missing orgNo in testdata for environment: ${__ENV.ENVIRONMENT}`);

    const registerClient = new RegisterLookupClient(
        __ENV.BASE_URL,
        new PlatformTokenGenerator(new Map([["env", __ENV.ENVIRONMENT], ["ttl", 3600]]))
    );

    const urns = testdata.map(td => `urn:altinn:person:identifier-no:${td.pid}`);
    const partiesRes = LookupPartiesInRegister(registerClient, "person,party,user", { data: urns });
    if (!partiesRes) throw new Error("Failed to query parties from register");
    const parties = JSON.parse(partiesRes.body).data;

    const resolvedTestdata = testdata.map(td => {
        const party = parties.find(p => p.personIdentifier === String(td.pid));
        if (!party) throw new Error(`Party not found for pid ${td.pid}`);
        return { orgNo: td.orgNo, pid: td.pid, partyUuid: party.partyUuid, userId: party.user.userId };
    });

    const consents = [];
    for (let i = 0; i < TOTAL; i++) {
        consents.push({ consentId: uuidv4(), shouldRevoke: i < REVOKED_COUNT });
    }

    console.log(`Setup complete: ${ACCEPTED_COUNT} to accept, ${REVOKED_COUNT} to accept then revoke`);
    return { testdata: resolvedTestdata, consents };
}

export default function ({ testdata, consents }) {
    const i = exec.scenario.iterationInTest;
    const consent = consents[i];
    const { orgNo, pid, partyUuid, userId } = getItemFromList(testdata);

    const consenteeClient = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(new Map([
            ["env", __ENV.ENVIRONMENT],
            ["ttl", 3600],
            ["scopes", "altinn:consentrequests.write"],
            ["orgNo", orgNo],
        ]))
    );
    const personalTokenGenerator = new PersonalTokenGenerator(new Map([
        ["env", __ENV.ENVIRONMENT],
        ["ttl", 3600],
        ["scopes", "altinn:portal/enduser"],
        ["userId", userId],
        ["partyuuid", partyUuid],
    ]));
    const consenterClient = new ConsentApiClient(__ENV.BASE_URL, personalTokenGenerator);
    const bffClient = new BffAccessManagementApiClient(__ENV.AM_UI_BASE_URL, personalTokenGenerator);

    const pidUrn = `urn:altinn:person:identifier-no:${pid}`;
    const orgUrn = `urn:altinn:organization:identifier-no:${orgNo}`;

    group("Request and approve consent", () => {
        RequestConsent(
            consenteeClient,
            consent.consentId,
            pidUrn,
            orgUrn,
            new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(),
            consentRights(),
            "https://altinn.no"
        );
        ApproveConsent(consenterClient, consent.consentId);
    });

    if (consent.shouldRevoke) {
        group("Revoke consent", () => {
            RevokeConsent(bffClient, consent.consentId);
        });
    }
}

export function teardown({ testdata, consents }) {
    // The endpoint returns only the latest event per consent request.
    // Revoked consents only appear as 'revoked', not as 'accepted' + 'revoked'.
    let csv = "ConsentId,EventType,OrgNo,Pid\n";
    try {
        consents.forEach((consent, i) => {
            const { orgNo, pid } = testdata[i % testdata.length];
            const eventType = consent.shouldRevoke ? "revoked" : "accepted";
            csv += `${consent.consentId},${eventType},${orgNo},${pid}\n`;
        });
        console.log(csv);
    } catch (e) {
        console.log(`\nCSV_PRINT_FAILED: ${String(e)}\n`);
        console.log("\nWhat you have so far:" + csv + "\n");
    }
}
