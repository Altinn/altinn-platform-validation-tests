import { check } from "k6";

import { ConsentRequestDetailsDto, ConsentRequestDto } from "../../../../clients/access-management/consent-enterprise/consent-enterprise.types.js";
import { EnterpriseClient } from "../../../../clients/access-management/consent-enterprise/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a consent request.
 *
 * @param {EnterpriseClient} enterpriseClient Client for the Enterprise API.
 * @param {ConsentRequestDto} request Consent request.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ConsentRequestDetailsDto|null} Created consent request details.
 */
export function EnterpriseCreateConsentRequest(
    enterpriseClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () =>
            enterpriseClient.EnterpriseCreateConsentRequest(
                request,
                labels,
            ),
        "EnterpriseCreateConsentRequest",
    );

    /** @type {ConsentRequestDetailsDto|null} */
    let consentRequest = null;

    // The swagger the client was generated from says 200, but the API answers 201
    // Created. The old consent tests asserted 201 and passed, so 201 is what this
    // waits for.
    const succeed = check(res, {
        "EnterpriseCreateConsentRequest - status code is 201": (r) =>
            r.status === 201,
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
