import { group } from "k6";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { randomItem } from "../../../../common-imports.js";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../common-imports.js";
import { MaskinportenConsentScope } from "../../../../scopes.js";

import { LookupConsent } from "../../../building-blocks/authentication/consent/index.js";

import {
    getBaseTokenOpts,
    getLookupConsents,
} from "./consent-commons.js";

const lookupConsentLabel = { action: "Lookup Consent" };

export const options = getOptions([lookupConsentLabel]);

let consentApiClient;

/*
 * Build the client once. The lookup uses an enterprise token with the
 * Maskinporten consent.read scope (no per-iteration identity).
 */
function getClients() {
    if (consentApiClient == undefined) {
        const tokenGenerator = new EnterpriseTokenGenerator(
            getBaseTokenOpts(__ENV.ENVIRONMENT, MaskinportenConsentScope.LOOKUP)
        );
        consentApiClient = new ConsentApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [consentApiClient];
}

export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
    return getLookupConsents(__ENV.ENVIRONMENT);
}

export default function (rows) {
    const [lookupClient] = getClients();
    const row = randomItem(rows);

    group("LookupConsent", () => {
        const pidUrn = `urn:altinn:person:identifier-no:${row.Pid}`;
        const orgUrn = `urn:altinn:organization:identifier-no:${row.Org}`;

        LookupConsent(lookupClient, row.ConsentId, pidUrn, orgUrn, lookupConsentLabel);
    });
}
