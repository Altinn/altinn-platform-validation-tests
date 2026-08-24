import { check } from "k6";

import { ConsentRequestDetailsDto } from "../../../../clients/access-management/consent-enterprise/consent-enterprise.types.js";
import { EnterpriseClient } from "../../../../clients/access-management/consent-enterprise/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a consent request.
 *
 * @param {EnterpriseClient} enterpriseClient Client for the Enterprise API.
 * @param {string} consentRequestId Consent request identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ConsentRequestDetailsDto|null} Consent request details.
 */
export function EnterpriseGetConsentRequest(
    enterpriseClient,
    consentRequestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            enterpriseClient.EnterpriseGetConsentRequest(
                consentRequestId,
                labels,
            ),
        "EnterpriseGetConsentRequest",
    );

    /** @type {ConsentRequestDetailsDto|null} */
    let consentRequest = null;

    const succeed = check(res, {
        "EnterpriseGetConsentRequest - status code is 200": (r) =>
            r.status === 200,
        "EnterpriseGetConsentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consentRequest;
    }

    check(res, {
        "EnterpriseGetConsentRequest - body is valid": (r) => {
            try {
                consentRequest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consentRequest;
}
