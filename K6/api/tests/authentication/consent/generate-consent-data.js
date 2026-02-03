import http from "k6/http";
import exec from "k6/execution";

import { uuidv4 } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
} from "../../../../common-imports.js";

import {
    RequestConsent,
    ApproveConsent,
    LookupConsent,
} from "../../../building-blocks/authentication/consent/index.js";

const env = __ENV.ENVIRONMENT ?? "yt01";
const LOOKUPS = 10;

export const options = {
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 2,
            iterations: LOOKUPS,
            maxDuration: __ENV.MAX_DURATION ?? "15m",
        },
    },
};

function getClients(orgNo, userId, partyUuid) {
    const consentee = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.write"],
                ["orgNo", orgNo],
            ])
        )
    );

    const consenter = new ConsentApiClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:portal/enduser"],
                ["userId", userId],
                ["partyuuid", partyUuid],
            ])
        )
    );

    const lookup = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:maskinporten/consent.read"],
            ])
        )
    );

    return [consentee, consenter, lookup];
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
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${env}-with-party-uuid.csv`
    );

    const orgs = parseCsvData(res.body);
    const rows = [];

    for (let i = 0; i < LOOKUPS; i++) {
        const from = orgs[i % orgs.length];
        const to = orgs[(i + 1) % orgs.length];

        const consentId = uuidv4();

        const pid = String(from.ssn);
        const orgNo = String(to.orgNo);

        rows.push({ consentId, pid, orgNo });

        const [consentee, consenter] = getClients(
            to.orgNo,
            from.userId,
            from.partyUuid
        );

        RequestConsent(
            consentee,
            consentId,
            `urn:altinn:person:identifier-no:${pid}`,
            `urn:altinn:organization:identifier-no:${orgNo}`,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            consentRights(),
            "https://altinn.no"
        );

        ApproveConsent(consenter, consentId);

        console.log("Consent data: ", consentId, pid, orgNo);
        console.log(`Setup complete: prepared ${rows.length} consents`);
    }
    return rows;
}

/**
 * ===== The real (breakpoint test) starts here =====
 * Verify lookup endpoint used by Maskinporten in isolation after consent request and approval.
 */
export default function (data) {
    const i = exec.scenario.iterationInTest;
    const row = data[i % data.length];

    const lookupClient = new ConsentApiClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:maskinporten/consent.read"],
            ])
        )
    );

    LookupConsent(
        lookupClient,
        row.consentId,
        `urn:altinn:person:identifier-no:${row.pid}`,
        `urn:altinn:organization:identifier-no:${row.orgNo}`
    );
}

export function teardown(data) {
    console.log("test finished");
}
