import http from "k6/http";
import { group } from "k6";
import { uuidv4 } from "../../../../common-imports.js";
import { parseCsvData } from "../../../../helpers.js";
import { getItemFromList } from "../../../../helpers.js";

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

export const options = {
    setupTimeout: "300s",
};

function getClients(orgNo, userId, partyUuid) {
    const consentee = new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
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
            new Map([
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
    const LOOKUPS = __ENV.LOOKUPS ?? 1;

    if (!__ENV.ENVIRONMENT) throw new Error("Missing ENVIRONMENT");

    const res = http.get(
        `https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/orgs-in-${__ENV.ENVIRONMENT}-with-party-uuid.csv`
    );

    const orgs = parseCsvData(res.body);
    const rows = [];

    for (let i = 0; i < LOOKUPS; i++) {
        const row = getItemFromList(orgs, true);

        const consentId = uuidv4();

        const pid = String(row.ssn);
        const orgNo = String(row.orgNo);

        rows.push({ consentId, pid, orgNo });

        const [consentee, consenter] = getClients(
            row.orgNo,
            row.userId,
            row.partyUuid
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
    }
    console.log(`Setup complete: prepared ${rows.length} consents`);
    return rows;
}

/**
 * Verify lookup endpoint used by Maskinporten. Only works if consent request is already approved.
 */
export default function (data) {
    group("Look up consent after user approval", () => {
        const row = getItemFromList(data, false);

        const lookupClient = new ConsentApiClient(
            __ENV.BASE_URL,
            new PersonalTokenGenerator(
                new Map([
                    ["env", __ENV.ENVIRONMENT],
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
    });
}

export function teardown(data) {
    console.log("test finished");
}
