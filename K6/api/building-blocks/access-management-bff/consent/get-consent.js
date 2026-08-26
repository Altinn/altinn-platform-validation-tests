import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a single consent.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentId Consent UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The consent. The API does not publish a schema for
 * this response.
 */
export function GetConsent(consentClient, consentId, labels = null) {
    const res = withRetries(
        () => consentClient.GetConsent(consentId, labels),
        "GetConsent",
    );

    /** @type {any} */
    let consent = null;

    const succeed = check(res, {
        "GetConsent - status code is 200": (r) =>
            r.status === 200,
        "GetConsent - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consent;
    }

    check(res, {
        "GetConsent - body is valid": (r) => {
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
