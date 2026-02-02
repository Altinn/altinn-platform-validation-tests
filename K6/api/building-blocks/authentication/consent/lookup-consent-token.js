import { check } from "k6";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";

/**
 * Lookup Maskinporten consent token for a consent request.
 *
 * @param {ConsentApiClient} consentApiClient A client to interact with the Consent API
 * @param {string} id
 * @param {string} from
 * @param {string} to
 * @param {string | null} label - Optional label for the request tag.
 * @returns {import("k6/http").RefinedResponse}
 */
export function LookupConsent(consentApiClient, id, from, to, label = null) {
    const res = consentApiClient.LookupConsent(id, from, to, label);

    const success = check(res, {
        "LookupConsentToken - status code should be 200": (r) => r.status === 200,
        "LookupConsentToken - status text is 200 OK": (r) =>
            r.status_text == "200 OK",
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res;
}
