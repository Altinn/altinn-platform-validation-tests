import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";

/**
 * Gets the number of consent requests a party has.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} party Party UUID.
 * @param {GetConsentCountQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetConsentCountQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The consent request count. The API does not publish a
 * schema for this response.
 */
export function GetConsentCount(
    consentClient,
    party,
    queryParams = null,
    labels = null,
) {
    const res = consentClient.GetConsentCount(party, queryParams, labels);

    /** @type {object|null} */
    let count = null;

    const succeed = check(res, {
        "GetConsentCount - status code is 200": (r) =>
            r.status === 200,
        "GetConsentCount - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return count;
    }

    check(res, {
        "GetConsentCount - body is valid": (r) => {
            try {
                count = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return count;
}
