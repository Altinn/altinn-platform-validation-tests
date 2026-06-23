import { check } from "k6";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get the first page of consent request events for an organization.
 *
 * @param {ConsentApiClient} consentApiClient A client to interact with the Consent API
 * @param {string | null} labels - Optional label for the request tag.
 * @returns {import("k6/http").RefinedResponse}
 */
export function GetConsentRequestEvents(consentApiClient, queryParams = {}, labels = null) {
    const res = consentApiClient.GetConsentRequestEvents(queryParams, labels);

    const success = check(res, {
        "GetConsentRequestEvents - status code should be 200": (r) => r.status === 200,
        "GetConsentRequestEvents - status text is 200 OK": (r) => r.status_text == "200 OK",
    });

    if (!success) {
        console.error(res.status);
        console.error(res.body);
    }

    return res;
}
