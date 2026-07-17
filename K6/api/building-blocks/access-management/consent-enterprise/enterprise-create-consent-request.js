import { check } from "k6";

import { EnterpriseClient } from "../../../../clients/enterprise/index.js";

/**
 * Creates a consent request.
 *
 * @param {EnterpriseClient} enterpriseClient Client for the Enterprise API.
 * @param {ConsentRequestDto} request Consent request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ConsentRequestDetailsDto|null} Created consent request details.
 */
export function EnterpriseCreateConsentRequest(
    enterpriseClient,
    request,
    labels = null,
) {
    const res = enterpriseClient.EnterpriseCreateConsentRequest(
        request,
        labels,
    );

    /** @type {ConsentRequestDetailsDto|null} */
    let consentRequest = null;

    const succeed = check(res, {
        "EnterpriseCreateConsentRequest - status code is 200": (r) =>
            r.status === 200,
        "EnterpriseCreateConsentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consentRequest;
    }

    check(res, {
        "EnterpriseCreateConsentRequest - body is valid": (r) => {
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
