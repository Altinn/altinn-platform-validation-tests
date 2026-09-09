import { check } from "k6";

import { ConsentRequestEventsQuery, ConsentStatusChangeDtoPaginatedResult } from "../../../../clients/access-management/consent-enterprise/consent-enterprise.types.js";
import { EnterpriseClient } from "../../../../clients/access-management/consent-enterprise/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets consent request events.
 *
 * @param {EnterpriseClient} enterpriseClient Client for the Enterprise API.
 * @param {ConsentRequestEventsQuery} query Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ConsentStatusChangeDtoPaginatedResult|null} Consent request events.
 */
export function EnterpriseGetConsentRequestEvents(
    enterpriseClient,
    query,
    labels = null,
) {
    const res = withRetries(
        () =>
            enterpriseClient.EnterpriseGetConsentRequestEvents(
                query,
                labels,
            ),
        "EnterpriseGetConsentRequestEvents",
    );

    /** @type {ConsentStatusChangeDtoPaginatedResult|null} */
    let consentRequestEvents = null;

    const succeed = check(res, {
        "EnterpriseGetConsentRequestEvents - status code is 200": (r) =>
            r.status === 200,
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
