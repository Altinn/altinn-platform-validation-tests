import {
    PersonalTokenGenerator,
    EnterpriseTokenGenerator,
    uuidv4,
    randomItem,
} from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import {
    BffAccessManagementApiClient,
    ConsentApiClient,
} from "../../../../clients/authentication/index.js";
import {
    ConsentScope,
    MaskinportenConsentScope,
    ENDUSER_SCOPE,
} from "../../../../scopes.js";
import {
    RequestConsent,
    ApproveConsent,
    LookupConsent,
} from "../../../building-blocks/authentication/consent/index.js";
import { GetConsentLog } from "../../../building-blocks/authentication/client-delegations/access-management.js";

import {
    consentValidTo,
    getBaseTokenOpts,
    getConsenteeOrgs,
    getConsenterPersons,
    getEnterpriseTokenOpts,
    getPersonalTokenOpts,
} from "./consent-commons.js";

// Labels for the different steps in the consent process, used for tagging requests in K6.
const requestConsentLabel = { action: "Request Consent" };
const approveConsentLabel = { action: "Approve Consent" };
const getConsentLogLabel = { action: "Get Consent Log" };
const lookupConsentLabel = { action: "Lookup Consent" };

export const options = getOptions([requestConsentLabel, approveConsentLabel, getConsentLogLabel, lookupConsentLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL", "BASE_URL"]);
    const env = __ENV.ENVIRONMENT;
    return {
        orgs: getConsenteeOrgs(env),
        persons: getConsenterPersons(env),
    };
}

let consenteeApiClient;
let consenterApiClient;
let consentLookupApiClient;
let accessManagementApiClient;
let consenteeTokenGenerator;
let consenterTokenGenerator;

/*
 * Build the clients once. The consentee (org) and consenter (person) token
 * generators are module-level singletons whose identity is set per iteration
 * via setTokenGeneratorOptions. The consent-lookup token (Maskinporten) has no
 * per-person identity, so it is built once.
 */
function getClients() {
    if (consenteeApiClient == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.WRITE)
        );
        consenteeApiClient = new ConsentApiClient(__ENV.BASE_URL, consenteeTokenGenerator);

        consenterTokenGenerator = new PersonalTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, ENDUSER_SCOPE)
        );
        consenterApiClient = new ConsentApiClient(__ENV.BASE_URL, consenterTokenGenerator);

        // Maskinporten uses this endpoint to look up consent before fetching the token.
        const consentLookupTokenGenerator = new EnterpriseTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, MaskinportenConsentScope.LOOKUP)
        );
        consentLookupApiClient = new ConsentApiClient(__ENV.BASE_URL, consentLookupTokenGenerator);

        accessManagementApiClient = new BffAccessManagementApiClient(
            __ENV.AM_UI_BASE_URL,
            consenterTokenGenerator
        );
    }
    return [consenteeApiClient, consenterApiClient, consentLookupApiClient, accessManagementApiClient];
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

export default function (data) {
    const [
        consenteeApiClient,
        consenterApiClient,
        consentLookupApiClient,
        accessManagementApiClient,
    ] = getClients();

    // Pick a random consentee org and consenter person for this iteration so
    // consents spread across all organizations and persons.
    const org = randomItem(data.orgs);
    const person = randomItem(data.persons);

    consenteeTokenGenerator.setTokenGeneratorOptions(
        getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.WRITE)
    );
    consenterTokenGenerator.setTokenGeneratorOptions(
        getPersonalTokenOpts(__ENV.ENVIRONMENT, person.partyUuid)
    );

    const id = uuidv4();
    const personIdentifierNo = `urn:altinn:person:identifier-no:${person.ssn}`;
    const orgIdentifierNo = `urn:altinn:organization:identifier-no:${org.orgNo}`;

    RequestConsent(
        consenteeApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        consentValidTo(),
        consentRights(),
        "https://altinn.no",
        requestConsentLabel
    );

    ApproveConsent(consenterApiClient, id, approveConsentLabel);

    GetConsentLog(accessManagementApiClient, person.partyUuid, getConsentLogLabel);

    LookupConsent(
        consentLookupApiClient,
        id,
        personIdentifierNo,
        orgIdentifierNo,
        lookupConsentLabel
    );
}
