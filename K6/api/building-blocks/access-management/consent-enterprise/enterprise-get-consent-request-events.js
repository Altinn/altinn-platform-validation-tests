import { check } from "k6";

import { EnterpriseClient } from "../../../../clients/enterprise/index.js";

/**
 * Gets consent request events.
 *
 * @param {EnterpriseClient} enterpriseClient Client for the Enterprise API.
 * @param {{[key:string]: string}} query Query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ConsentStatusChangeDtoPaginatedResult|null} Consent request events.
 */
export function EnterpriseGetConsentRequestEvents(
    enterpriseClient,
    query,
    labels = null,
) {
    const res = enterpriseClient.EnterpriseGetConsentRequestEvents(
        query,
        labels,
    );

    /** @type {ConsentStatusChangeDtoPaginatedResult|null} */
    let consentRequestEvents = null;

    const succeed = check(res, {
        "EnterpriseGetConsentRequestEvents - status code is 200": (r) =>
            r.status === 200,
        "EnterpriseGetConsentRequestEvents - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consentRequestEvents;
    }

    check(res, {
        "EnterpriseGetConsentRequestEvents - body is valid": (r) => {
            try {
                consentRequestEvents = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consentRequestEvents;
}
