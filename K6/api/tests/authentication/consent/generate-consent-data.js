import http from "k6/http";
import exec from "k6/execution";
import { check } from "k6";

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

/**
 * ===== INIT =====
 */
const env = __ENV.ENVIRONMENT ?? "yt01";
const PREP = Math.max(Number.parseInt(__ENV.PREP ?? "10", 10), 1);
const LOOKUPS = Math.max(Number.parseInt(__ENV.ITERATIONS ?? PREP, 10), 1);

export const options = {
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: Math.max(Number.parseInt(__ENV.VUS ?? "1", 10), 1),
            iterations: LOOKUPS,
            maxDuration: __ENV.MAX_DURATION ?? "30m",
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
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", orgNo],
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

/**
 * ===== SETUP =====
 * Fetch orgs via HTTP, prepare consents, return lookup data
 */
export function setup() {
    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${env}-with-party-uuid.csv`
    );

    const orgs = parseCsvData(res.body);
    const rows = [];

    for (let i = 0; i < PREP; i++) {
        const from = orgs[i % orgs.length];
        const to = orgs[(i + 1) % orgs.length];

        const consentId = uuidv4();
        const pid = String(from.ssn);
        const orgNo = String(to.orgNo);

        console.log("Testdata used: ", from.ssn, to.orgNo, consentId);

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

        rows.push({ consentId, pid, orgNo });

        if (i > 0 && i % 500 === 0) {
            console.log(`Prepared ${i}/${PREP} consents`);
        }
    }

    console.log(`Setup complete: prepared ${rows.length} consents`);
    return rows;
}

/**
 * ===== VU =====
 * Lookup only (breakpoint here)
 */
export default function (data) {
    const i = exec.scenario.iterationInTest;
    const row = data[i % data.length];
    console.log("Lookup data: ", row.consentId, row.pid, row.orgNo);

    check(row, { "lookup row exists": (r) => !!r });
    if (!row) return;

    const lookupClient = new ConsentApiClient(
        __ENV.BASE_URL,
        new PersonalTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", row.orgNo],
                ["scopes", "altinn:portal/enduser"],
            ])
        )
    );

    // 🔴 BREAKPOINT HERE
    LookupConsent(
        lookupClient,
        row.consentId,
        `urn:altinn:person:identifier-no:${row.pid}`,
        `urn:altinn:organization:identifier-no:${row.orgNo}`
    );
}

/**
 * ===== TEARDOWN =====
 */
export function teardown(data) {
    console.log(`Teardown finished. Rows prepared: ${data?.length ?? 0}`);
}
