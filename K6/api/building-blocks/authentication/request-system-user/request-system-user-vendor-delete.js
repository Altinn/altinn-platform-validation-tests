import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/authentication/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a system user request.
 *
 * The endpoint answers 202 with no body, so there is nothing to hand back but
 * whether it was accepted.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the request was deleted.
 */
export function RequestSystemUserVendorDelete(
    requestSystemUserClient,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            requestSystemUserClient.RequestSystemUserVendorDelete(
                requestId,
                labels,
            ),
        "RequestSystemUserVendorDelete",
    );

    const succeed = check(res, {
        "RequestSystemUserVendorDelete - status code is 202": (r) =>
            r.status === 202,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
