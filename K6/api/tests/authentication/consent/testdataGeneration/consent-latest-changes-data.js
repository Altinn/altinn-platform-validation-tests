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
import { ConsentApiClient, BffAccessManagementApiClient } from "../../../../../clients/authentication/index.js";
import { PersonalTokenGenerator, EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { RequestConsent, ApproveConsent, RevokeConsent } from "../../../../building-blocks/authentication/consent/index.js";

const ACCEPTED_COUNT = 1000;
const REVOKED_COUNT = 50;
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
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/api/tests/authentication/consent/testdataGeneration/testdata-${__ENV.ENVIRONMENT}.csv`
    );
    if (testdataRes.status !== 200) throw new Error(`Failed to fetch testdata for environment: ${__ENV.ENVIRONMENT}`);
    const testdata = getItemFromList(parseCsvData(testdataRes.body));
    if (!testdata.orgNo) throw new Error(`Missing orgNo in testdata for environment: ${__ENV.ENVIRONMENT}`);
    if (!testdata.pid) throw new Error(`Missing pid in testdata for environment: ${__ENV.ENVIRONMENT}`);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
    );
    const orgs = parseCsvData(res.body);

    const consenter = orgs.find(o => String(o.ssn) === String(testdata.pid));
    if (!consenter) throw new Error(`Consenter with pid ${testdata.pid} not found in orgs CSV for ${__ENV.ENVIRONMENT}`);

    const rows = [];
    for (let i = 0; i < TOTAL; i++) {
        rows.push({
            consentId: uuidv4(),
            shouldRevoke: i < REVOKED_COUNT,
            orgNo: String(testdata.orgNo),
            pid: String(consenter.ssn),
            fromUserId: consenter.userId,
            fromPartyUuid: consenter.partyUuid,
        });
    }
    console.log(`Setup complete: ${ACCEPTED_COUNT} to accept, ${REVOKED_COUNT} to accept then revoke`);
    return rows;
}

export default function (rows) {
    const i = exec.scenario.iterationInTest;
    const row = rows[i];

    const consenteeClient = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(new Map([
            ["env", __ENV.ENVIRONMENT],
            ["ttl", 3600],
            ["scopes", "altinn:consentrequests.write"],
            ["orgNo", row.orgNo],
        ]))
    );
    const consenterClient = new ConsentApiClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(new Map([
            ["env", __ENV.ENVIRONMENT],
            ["ttl", 3600],
            ["scopes", "altinn:portal/enduser"],
            ["userId", row.fromUserId],
            ["partyuuid", row.fromPartyUuid],
        ]))
    );
    const bffClient = new BffAccessManagementApiClient(
        __ENV.AM_UI_BASE_URL,
        new PersonalTokenGenerator(new Map([
            ["env", __ENV.ENVIRONMENT],
            ["ttl", 3600],
            ["scopes", "altinn:portal/enduser"],
            ["userId", row.fromUserId],
            ["partyuuid", row.fromPartyUuid],
        ]))
    );

    const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
    const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

    group("Request and approve consent", () => {
        RequestConsent(
            consenteeClient,
            row.consentId,
            pidUrn,
            orgUrn,
            new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(),
            consentRights(),
            "https://altinn.no"
        );
        ApproveConsent(consenterClient, row.consentId);
    });

    if (row.shouldRevoke) {
        group("Revoke consent", () => {
            RevokeConsent(bffClient, row.consentId);
        });
    }
}

export function teardown(rows) {
    // The endpoint returns only the latest event per consent request.
    // Revoked consents only appear as 'revoked', not as 'accepted' + 'revoked'.
    let csv = "ConsentId,EventType,OrgNo,Pid\n";
    try {
        rows.forEach((row) => {
            const eventType = row.shouldRevoke ? "revoked" : "accepted";
            csv += `${row.consentId},${eventType},${row.orgNo},${row.pid}\n`;
        });
        console.log(csv);
    } catch (e) {
        console.log(`\nCSV_PRINT_FAILED: ${String(e)}\n`);
        console.log("\nWhat you have so far:" + csv + "\n");
    }
}
