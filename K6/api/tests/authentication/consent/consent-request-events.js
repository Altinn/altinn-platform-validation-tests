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
    getConsenteeOrgs,
    getConsenteeTokenOpts,
} from "./request-events-commons.js";

const getConsentRequestEventsLabel = { action: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

let consentApiClient;
let tokenGenerator;

/*
 * Build the client once. The token generator is a module-level singleton whose
 * orgNo is set per iteration via setTokenGeneratorOptions.
 */
function getClients() {
    if (consentApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:consentrequests.read");
        tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        consentApiClient = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [consentApiClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return getConsenteeOrgs(__ENV.ENVIRONMENT);
}

export default function (orgs) {
    const [eventsClient] = getClients();

    // Pick a random organization from the list that holds the generated consents.
    const org = randomItem(orgs);
    tokenGenerator.setTokenGeneratorOptions(
        getConsenteeTokenOpts(org.orgNo, "altinn:consentrequests.read")
    );

    // No query parameters for now.
    const queryString =
        new ConsentRequestEventsQueryBuilder()
            .build();

    GetConsentRequestEvents(eventsClient, queryString, getConsentRequestEventsLabel);
}
