import { check } from "k6";

import { ConsentApiClient } from "../../../../clients/authentication/index.js";

/**
 * Lookup Maskinporten consent token for a consent request.
 *
 * @param {ConsentApiClient} consentApiClient A client to interact with the Consent API
 * @param {string} id TODO: description
 * @param {string} from TODO: description
 * @param {string} to TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {import("k6/http").RefinedResponse} TODO: description
 */
export function LookupConsent(consentApiClient, id, from, to, labels = null) {
    const res = consentApiClient.LookupConsent(id, from, to, labels);

    const success = check(res, {
        "Lookup consent: - status code should be 200": (r) => r.status === 200,
        "Lookup consent - status text is 200 OK": (r) => r.status_text == "200 OK",
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res;
}
