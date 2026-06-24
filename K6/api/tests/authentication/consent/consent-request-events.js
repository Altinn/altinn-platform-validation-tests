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

import { getOptions } from "../../../../helpers.js";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";

import { GetConsentRequestEvents } from "../../../building-blocks/authentication/consent/index.js";

const env = __ENV.ENVIRONMENT ?? "yt01";

// The organization that holds all the generated consents
const ORGANIZATION_PER_ENVIRONMENT = {
    "at23": "314084993",
    "tt02": "314084993",
    "yt01": "730077254",
};
const ORG_NO = ORGANIZATION_PER_ENVIRONMENT[env];

const getConsentRequestEventsLabel = { action: "Get Consent Request Events" };

export const options = getOptions([getConsentRequestEventsLabel]);

function getEventsClient() {
    return new ConsentApiClient(
        __ENV.BASE_URL,
        new EnterpriseTokenGenerator(
            new Map([
                ["env", env],
                ["ttl", 3600],
                ["scopes", "altinn:consentrequests.read"],
                ["orgNo", ORG_NO],
            ])
        )
    );
}

export default function () {
    const eventsClient = getEventsClient();

    GetConsentRequestEvents(eventsClient, {}, getConsentRequestEventsLabel);
}
