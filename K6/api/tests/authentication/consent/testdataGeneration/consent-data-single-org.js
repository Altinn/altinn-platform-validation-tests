import http from "k6/http";
import exec from "k6/execution";
import { group } from "k6";

import { EnterpriseTokenGeneratorOptions, PersonalTokenGeneratorOptions, uuidv4 } from "../../../../../common-imports.js";
import { parseCsvData, requireEnv } from "../../../../../helpers.js";

import { ConsentApiClient } from "../../../../../clients/authentication/index.js";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
} from "../../../../../common-imports.js";

import {
    RequestConsent,
    ApproveConsent,
} from "../../../../building-blocks/authentication/consent/index.js";

//How many consent requests you want to generate (all for ONE organization)
const LOOKUPS = __ENV.LOOKUPS ? parseInt(__ENV.LOOKUPS) : 100;

const ORGANIZATION_PER_ENVIRONMENT = {
    "at23": "314084993",
    "tt02": "314084993",
    "yt01": "730077254",
};

const ORG_NO = ORGANIZATION_PER_ENVIRONMENT[__ENV.ENVIRONMENT];

export const options = {
    setupTimeout: "60s",
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 10,
            iterations: LOOKUPS,
            maxDuration: "10m",
        },
    },
};

function getClients(orgNo, userId, partyUuid) {
    const consentee = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new EnterpriseTokenGeneratorOptions([
                ["env", __ENV.ENVIRONMENT],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.write"],
                ["orgNo", orgNo],
            ])
        )
    );

    const consenter = new ConsentApiClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(
            new PersonalTokenGeneratorOptions([
                ["env", __ENV.ENVIRONMENT],
                ["ttl", 3600],
                ["scopes", "altinn:portal/enduser"],
                ["userId", userId],
                ["partyuuid", partyUuid],
            ])
        )
    );

    return [consentee, consenter];
}

function consentRights() {
    return [
        {
            action: ["consent"],
            resource: [
                { type: "urn:altinn:resource", value: "samtykke-performance-test" },
            ],
            metaData: { inntektsaar: "2026" },
        },
    ];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`,
        { tags: { action: "fetch-test-data" } }
    );

    const orgs = parseCsvData(res.body);

    const rows = [];

    for (let i = 0; i < LOOKUPS; i++) {
        // Cycle through the people in the CSV as consenters,
        // but every consent goes to the SAME organization (ORG_NO).
        const from = orgs[i % orgs.length];

        rows.push({
            consentId: uuidv4(),
            pid: String(from.ssn),
            orgNo: ORG_NO,
            fromUserId: from.userId,
            fromPartyUuid: from.partyUuid,
            toOrgNo: ORG_NO,
        });
    }
    console.log(
        `Setup complete: Planned ${rows.length} consent(s) for org ${ORG_NO}`
    );
    return rows;
}

export default function (rows) {
    group("Request + approve consent and generate .csv data", () => {
        const i = exec.scenario.iterationInTest;
        const row = rows[i];

        const [consentee, consenter] = getClients(
            row.toOrgNo,
            row.fromUserId,
            row.fromPartyUuid
        );

        const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

        RequestConsent(
            consentee,
            row.consentId,
            pidUrn,
            orgUrn,
            new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(), // Consent shouldn't expire in 100 years
            consentRights(),
            "https://altinn.no"
        );

        ApproveConsent(consenter, row.consentId);
    });
}
