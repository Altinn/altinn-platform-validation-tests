/**
 * Load test for the enterprise consent request events endpoint.
 *
 * Fetches the first page of consent request events for the
 * organization that holds all the generated consents (see consent-data-single-org.js).
 *
 * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
 * Requires a Maskinporten token with scope `altinn:consentrequests.read`.
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
 */

import { getOptions, requireEnv } from "../../../../helpers.js";

import {
    ConsentApiClient,
    ConsentRequestEventsQueryBuilder,
} from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator, EnterpriseTokenGeneratorOptions } from "../../../../common-imports.js";

import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";

// The organization that holds all the generated consents
const ORGANIZATION_PER_ENVIRONMENT = {
    "at23": "314084993",
    "tt02": "314084993",
    "yt01": "730077254",
};

const getConsentRequestEventsLabel = { action: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

let consentApiClient = undefined;

function getEventsClient() {
    if (consentApiClient == undefined) {

        const env = __ENV.ENVIRONMENT;
        const ORG_NO = ORGANIZATION_PER_ENVIRONMENT[env];

        if (ORG_NO === undefined) {
            throw new Error(`Unknown environment: ${env}`);
        }

        const tokenOpts = new EnterpriseTokenGeneratorOptions([
            ["env", env],
            ["ttl", 3600],
            ["scopes", "altinn:consentrequests.read"],
            ["orgNo", ORG_NO],
        ]);

        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        consentApiClient = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [consentApiClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return;
}

export default function () {
    const [eventsClient] = getEventsClient();

    // No query parameters for now.
    const queryString =
        new ConsentRequestEventsQueryBuilder()
            .build();

    GetConsentRequestEvents(eventsClient, queryString, getConsentRequestEventsLabel);
}
