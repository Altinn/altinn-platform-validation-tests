import { group } from "k6";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { randomItem } from "../../../../common-imports.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { MaskinportenConsentScope } from "../../../../scopes.js";
import { LookupConsent } from "../../../building-blocks/authentication/consent/index.js";
import {
    getEnterpriseBaseTokenOpts,
    getLookupConsents,
} from "./consent-commons.js";

const lookupConsentLabel = { step: "Lookup Consent" };

export const options = getOptions([lookupConsentLabel]);

/**
 * @type {ConsentApiClient | undefined}
 */
let consentApiClient = undefined;

/**
 * Creates and caches the client used to interact with the consent API.
 *
 * The client uses an enterprise token with the Maskinporten
 * `consent.read` scope for consent lookup operations. The same
 * {@link ConsentApiClient} instance is reused on subsequent calls.
 *
 * @returns {[ConsentApiClient]} The initialized consent API client.
 */
function getClients() {
    if (consentApiClient == undefined) {
        const tokenGenerator = new EnterpriseTokenGenerator(
            getEnterpriseBaseTokenOpts(
                __ENV.ENVIRONMENT,
                MaskinportenConsentScope.LOOKUP
            )
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
    return getLookupConsents(__ENV.ENVIRONMENT);
}

export default function (rows) {
    const [consentApiClient] = getClients();
    const row = randomItem(rows);

    group("LookupConsent", () => {
        const pidUrn = `urn:altinn:person:identifier-no:${row.Pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.Org}`;

        LookupConsent(consentApiClient, row.ConsentId, pidUrn, orgUrn, lookupConsentLabel);
    });
}
