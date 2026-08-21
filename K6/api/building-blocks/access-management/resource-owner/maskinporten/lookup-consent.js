import { check } from "k6";

import { MaskinportenClient } from "../../../../../clients/access-management/resource-owner/maskinporten/index.js";
import { ConsentLookupRequest } from "../../../../../clients/access-management/resource-owner/maskinporten/maskinporten.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Looks up a consent.
 *
 * The API does not publish a schema for this response, so the parsed body is
 * returned as is.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten API.
 * @param {ConsentLookupRequest} request Consent to look up. Use
 * {@link ConsentLookupRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The looked up consent.
 */
export function LookupConsent(maskinportenClient, request, labels = null) {
    const res = withRetries(
        () => maskinportenClient.LookupConsent(request, labels),
        "LookupConsent",
    );

    /** @type {any} */
    let consent = null;

    const succeed = check(res, {
        "LookupConsent - status code is 200": (r) => r.status === 200,
        "LookupConsent - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consent;
    }

    check(res, {
        "LookupConsent - body is valid": (r) => {
            try {
                consent = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consent;
}
