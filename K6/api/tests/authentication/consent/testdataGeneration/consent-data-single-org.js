import { group } from "k6";

import { randomItem, uuidv4 } from "../../../../../common-imports.js";
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
    ENDUSER_SCOPE,
    getBaseTokenOpts,
    getConsenteeOrgs,
    getConsenterPersons,
    getEnterpriseTokenOpts,
    getPersonalTokenOpts,
} from "../request-events-commons.js";

// How many consent requests to generate, spread across all consentee organizations.
const LOOKUPS = __ENV.LOOKUPS ? parseInt(__ENV.LOOKUPS) : 10;

export const options = {
    setupTimeout: "60s",
    scenarios: {
        default: {
            executor: "shared-iterations",
            vus: 1,
            iterations: LOOKUPS,
            maxDuration: "10m",
        },
    },
};

let consenteeClient;
let consenterClient;
let consenteeTokenGenerator;
let consenterTokenGenerator;

/*
 * Build the consentee (enterprise) and consenter (personal) clients once.
 * The token generators are module-level singletons whose identity (orgNo /
 * user) is set per iteration via setTokenGeneratorOptions.
 */
function getClients() {
    if (consenteeClient == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.WRITE)
        );
        consenteeClient = new ConsentApiClient(__ENV.BASE_URL, consenteeTokenGenerator);
    }
    if (consenterClient == undefined) {
        consenterTokenGenerator = new PersonalTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ENDUSER_SCOPE)
        );
        consenterClient = new ConsentApiClient(__ENV.BASE_URL, consenterTokenGenerator);
    }
    return [consenteeClient, consenterClient];
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
    return {
        orgs: getConsenteeOrgs(env),
        persons: getConsenterPersons(env),
    };
}

export default function (data) {
    group("Request + approve consent and generate .csv data", () => {
        const [consenteeClient, consenterClient] = getClients();

        // Pick a random consentee org and consenter person for this iteration.
        const org = randomItem(data.orgs);
        const person = randomItem(data.persons);
        const consentId = uuidv4();

        consenteeTokenGenerator.setTokenGeneratorOptions(
            getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.WRITE)
        );
        consenterTokenGenerator.setTokenGeneratorOptions(
            getPersonalTokenOpts(__ENV.ENVIRONMENT, person.userId, person.partyUuid)
        );

        const pidUrn = `urn:altinn:person:identifier-no:${person.ssn}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${org.orgNo}`;

        RequestConsent(
            consenteeClient,
            consentId,
            pidUrn,
            orgUrn,
            new Date(Date.now() + 36500 * 60 * 60 * 1000).toISOString(), // Consent shouldn't expire in 100 years
            consentRights(),
            "https://altinn.no"
        );

        ApproveConsent(consenterClient, consentId);
    });
}
