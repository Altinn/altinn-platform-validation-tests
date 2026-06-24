/**
 * Load/smoke test for the enterprise consent request events endpoint.
 *
 * Picks a random organization from the list of consentee organizations that
 * hold the generated consents (see testdataGeneration/consent-data-single-org.js)
 * and fetches the first page of consent request events for it. Because the
 * organization is chosen per iteration, the same script works both as a
 * smoke test (a few iterations) and as a functional test.
 *
 * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
 * Requires a Maskinporten token with scope `altinn:consentrequests.read`.
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
 */

import { getOptions, requireEnv } from "../../../../helpers.js";
import { randomItem } from "../../../../common-imports.js";

import {
    ConsentApiClient,
    ConsentRequestEventsQueryBuilder,
} from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";

import {
    ConsentScope,
    getConsenteeOrgs,
    getEnterpriseTokenOpts,
} from "./request-events-commons.js";

const getConsentRequestEventsLabel = { action: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

let consentApiClient = undefined;
let tokenGenerator = undefined;

/*
 * Build the client and token generator once and return the token generator so
 * the caller can set the orgNo per iteration via setTokenGeneratorOptions.
 */
function getClients() {
    if (tokenGenerator == undefined) {
        tokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseTokenOpts(__ENV.ENVIRONMENT, undefined, ConsentScope.READ)
        );
        consentApiClient = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [consentApiClient, tokenGenerator];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return getConsenteeOrgs(__ENV.ENVIRONMENT);
}

export default function (orgs) {
    const [eventsClient, tokenGenerator] = getClients();

    // Pick a random organization from the list that holds the generated consents.
    const org = randomItem(orgs);
    tokenGenerator.setTokenGeneratorOptions(
        getEnterpriseTokenOpts(__ENV.ENVIRONMENT, org.orgNo, ConsentScope.READ)
    );

    // No query parameters for now.
    const queryString =
        new ConsentRequestEventsQueryBuilder()
            //.withConsentRequestId("e1775061-491a-4857-9703-5841e74d8564")
            // .withEventType(["accepted", "rejected", "created"])
            .build();

    GetConsentRequestEvents(eventsClient, queryString, getConsentRequestEventsLabel);
}
