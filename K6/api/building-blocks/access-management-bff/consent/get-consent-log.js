import { check } from "k6";

import { ConsentClient } from "../../../../../clients/access-management-bff/consent/index.js";

/**
 * Gets the consent log of a party.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} party Party UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The consent log. The API does not publish a schema
 * for this response.
 */
export function GetConsentLog(consentClient, party, labels = null) {
    const res = consentClient.GetConsentLog(party, labels);

    /** @type {object|null} */
    let consentLog = null;

    const succeed = check(res, {
        "GetConsentLog - status code is 200": (r) =>
            r.status === 200,
        "GetConsentLog - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consentLog;
    }

    check(res, {
        "GetConsentLog - body is valid": (r) => {
            try {
                consentLog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consentLog;
}
