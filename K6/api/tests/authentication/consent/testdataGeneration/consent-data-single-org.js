import exec from "k6/execution";
import { group } from "k6";

import { uuidv4 } from "../../../../../common-imports.js";
import { requireEnv } from "../../../../../helpers.js";

import { ConsentApiClient } from "../../../../../clients/authentication/index.js";
import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
} from "../../../../../common-imports.js";

import {
    RequestConsent,
    ApproveConsent,
} from "../../../../building-blocks/authentication/consent/index.js";

import {
    ConsentScope,
    getConsenteeOrgs,
    getConsenterUsers,
    getEnterpriseTokenOpts,
    getPersonalTokenOpts,
} from "../request-events-commons.js";

// How many consent requests to generate, spread across all consentee organizations.
const LOOKUPS = __ENV.LOOKUPS ? parseInt(__ENV.LOOKUPS) : 100;

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

let consenteeClient = undefined;
let consenterClient = undefined;
let consenteeTokenGenerator = undefined;
let consenterTokenGenerator = undefined;

/*
 * Build the consentee (enterprise) and consenter (personal) clients once and
 * return their token generators so the caller can set the orgNo / user per
 * iteration via setTokenGeneratorOptions.
 */
function getClients() {
    if (consenteeTokenGenerator == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseTokenOpts(__ENV.ENVIRONMENT, undefined, ConsentScope.WRITE)
        );
        consenteeClient = new ConsentApiClient(__ENV.BASE_URL, consenteeTokenGenerator);
    }
    if (consenterTokenGenerator == undefined) {
        consenterTokenGenerator = new PersonalTokenGenerator(
            getPersonalTokenOpts(__ENV.ENVIRONMENT, undefined, undefined)
        );
        consenterClient = new ConsentApiClient(__ENV.BASE_URL, consenterTokenGenerator);
    }
    return [
        consenteeClient,
        consenterClient,
        consenteeTokenGenerator,
        consenterTokenGenerator,
    ];
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

    const env = __ENV.ENVIRONMENT;
    const orgs = getConsenteeOrgs(env);
    const users = getConsenterUsers(env);

    const rows = [];
    for (let i = 0; i < LOOKUPS; i++) {
        // Spread consents across all consentee organizations, cycling through
        // both lists so every organization receives consents.
        const toOrg = orgs[i % orgs.length];
        const from = users[i % users.length];

        rows.push({
            consentId: uuidv4(),
            pid: String(from.ssn),
            orgNo: String(toOrg.orgNo),
            fromUserId: from.userId,
            fromPartyUuid: from.partyUuid,
        });
    }
    console.log(
        `Setup complete: Planned ${rows.length} consent(s) across ${orgs.length} organization(s)`
    );
    return rows;
}

export default function (rows) {
    group("Request + approve consent and generate .csv data", () => {
        const i = exec.scenario.iterationInTest;
        const row = rows[i];

        const [
            consenteeClient,
            consenterClient,
            consenteeTokenGenerator,
            consenterTokenGenerator,
        ] = getClients();

        // Set the consentee org and consenter user for this iteration.
        consenteeTokenGenerator.setTokenGeneratorOptions(
            getEnterpriseTokenOpts(__ENV.ENVIRONMENT, row.orgNo, ConsentScope.WRITE)
        );
        consenterTokenGenerator.setTokenGeneratorOptions(
            getPersonalTokenOpts(__ENV.ENVIRONMENT, row.fromUserId, row.fromPartyUuid)
        );

        const pidUrn = `urn:altinn:person:identifier-no:${row.pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.orgNo}`;

        RequestConsent(
            consenteeClient,
            row.consentId,
            pidUrn,
            orgUrn,
            new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(), // Consent shouldn't expire in 100 years
            consentRights(),
            "https://altinn.no"
        );

        ApproveConsent(consenterClient, row.consentId);
    });
}
