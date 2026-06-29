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
} from "../../../../scopes.js";
import {
    RequestConsent,
    ApproveConsent,
    LookupConsent,
} from "../../../building-blocks/authentication/consent/index.js";
import { GetConsentLog } from "../../../building-blocks/authentication/client-delegations/access-management.js";

import {
    consentValidTo,
    getConsenteeOrgs,
    getConsenterPersons,
    getEnterpriseBaseTokenOpts,
    getEnterpriseTokenOpts,
    getPersonalBaseTokenOpts,
    getPersonalTokenOpts,
} from "./consent-commons.js";

// Labels for the different steps in the consent process, used for tagging requests in K6.
const requestConsentLabel = { step: "Request Consent" };
const approveConsentLabel = { step: "Approve Consent" };
const getConsentLogLabel = { step: "Get Consent Log" };
const lookupConsentLabel = { step: "Lookup Consent" };

export const options = getOptions([requestConsentLabel, approveConsentLabel, getConsentLogLabel, lookupConsentLabel]);

export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL", "BASE_URL"]);
    const env = __ENV.ENVIRONMENT;
    return {
        orgs: getConsenteeOrgs(env),
        persons: getConsenterPersons(env),
    };
}

/**
 * @type {ConsentApiClient | undefined}
 */
let consenteeApiClient = undefined;

/**
 * @type {ConsentApiClient | undefined}
 */
let consenterApiClient = undefined;

/**
 * Used for Maskinporten consent lookup operations and lazily initialized on
 * first use.
 *
 * @type {ConsentApiClient | undefined}
 */
let consentLookupApiClient = undefined;

/**
 * @type {BffAccessManagementApiClient | undefined}
 */
let accessManagementApiClient = undefined;

/**
 * Shared enterprise token generator for the consentee.
 *
 * Lazily initialized on first use.
 *
 * @type {EnterpriseTokenGenerator | undefined}
 */
let consenteeTokenGenerator = undefined;

/**
 * Shared personal token generator for the consenter.
 *
 * Lazily initialized on first use.
 *
 * @type {PersonalTokenGenerator | undefined}
 */
let consenterTokenGenerator = undefined;

/**
 * Creates and caches the API clients used by the test.
 *
 * The consentee client uses an enterprise token with the consent write scope,
 * the consenter client and access management client share a personal token,
 * and the consent lookup client uses a dedicated enterprise token for
 * Maskinporten consent lookup operations.
 *
 * Existing client instances are reused on subsequent calls.
 *
 * @returns {[
 *   ConsentApiClient,
 *   ConsentApiClient,
 *   ConsentApiClient,
 *   BffAccessManagementApiClient
 * ]} The initialized API clients.
 */
function getClients() {
    if (consenteeApiClient == undefined) {
        consenteeTokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.WRITE)
        );

        consenteeApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            consenteeTokenGenerator
        );

        consenterTokenGenerator = new PersonalTokenGenerator(
            getPersonalBaseTokenOpts(__ENV.ENVIRONMENT)
        );

        consenterApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            consenterTokenGenerator
        );

        // Maskinporten uses this endpoint to look up consent before fetching the token.
        const consentLookupTokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(
                __ENV.ENVIRONMENT,
                MaskinportenConsentScope.LOOKUP
            )
        );

        consentLookupApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            consentLookupTokenGenerator
        );

        accessManagementApiClient = new BffAccessManagementApiClient(
            __ENV.AM_UI_BASE_URL,
            consenterTokenGenerator
        );
    }

    return [
        consenteeApiClient,
        consenterApiClient,
        consentLookupApiClient,
        accessManagementApiClient,
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
