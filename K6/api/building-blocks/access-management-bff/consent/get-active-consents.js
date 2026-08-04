import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";

/**
 * Gets the active consents of a party.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} party Party UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The active consents. The API does not publish a
 * schema for this response.
 */
export function GetActiveConsents(consentClient, party, labels = null) {
    const res = consentClient.GetActiveConsents(party, labels);

    /** @type {object|null} */
    let consents = null;

    const succeed = check(res, {
        "GetActiveConsents - status code is 200": (r) =>
            r.status === 200,
        "GetActiveConsents - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consents;
    }

    check(res, {
        "GetActiveConsents - body is valid": (r) => {
            try {
                consents = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consents;
}
