/**
 * Load/smoke test for the enterprise consent request events endpoint.
 *
 * Picks a random organization from the list of consentee organizations that
 * hold the generated consents (see post-consent.js, which generates them)
 * and fetches the first page of consent request events for it. Because the
 * organization is chosen per iteration, the same script works both as a
 * smoke test (a few iterations) and as a functional test.
 *
 * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
 * Requires an org token with scope ConsentScope.READ.
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
 */

import { getOptions, requireEnv } from "../../../../helpers.js";
import { randomItem } from "../../../../common-imports.js";

import {
    ConsentApiClient,
    ConsentRequestEventsQueryBuilder,
} from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { ConsentScope } from "../../../../scopes.js";

import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";

import {
    getConsenteeOrgs,
    getEnterpriseBaseTokenOpts,
    getEnterpriseTokenOpts,
} from "./consent-commons.js";

const getConsentRequestEventsLabel = { step: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

/**
 * @type {ConsentApiClient | undefined}
 */
let consentApiClient = undefined;

/**
  * @type {EnterpriseTokenGenerator | undefined}
 */
let tokenGenerator = undefined;

/**
 * Creates and caches the client used to interact with the consent API.
 *
 * The same {@link EnterpriseTokenGenerator} and
 * {@link ConsentApiClient} instances are reused on subsequent calls.
 * The token generator's organization number is updated per iteration via
 * `setTokenGeneratorOptions`.
 *
 * @returns {[ConsentApiClient]} The initialized consent API client.
 */
function getClients() {
    if (consentApiClient == undefined) {
        tokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(__ENV.ENVIRONMENT, ConsentScope.READ)
        );

        consentApiClient = new ConsentApiClient(
            __ENV.BASE_URL,
            tokenGenerator
        );
    }

    return [consentApiClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return getConsenteeOrgs(__ENV.ENVIRONMENT);
}

export default function (orgs) {
    const [consentApiClient] = getClients();

    // Pick a random organization from the list that holds the generated consents.
    const org = randomItem(orgs);
    tokenGenerator.setTokenGeneratorOptions(
        getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.READ)
    );

    // No query parameters for now.
    const queryString =
        new ConsentRequestEventsQueryBuilder()
            .build();

    GetConsentRequestEvents(consentApiClient, queryString, getConsentRequestEventsLabel);
}
