import { check } from "k6";

import { ChangeRequestSystemUserClient } from "../../../../clients/authentication/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a change request by id.
 *
 * The endpoint answers 202 with no body, so there is nothing to hand back but
 * whether it was accepted.
 *
 * @param {ChangeRequestSystemUserClient} changeRequestSystemUserClient Client for the Change Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the change request was deleted.
 */
export function ChangeRequestSystemUserVendorDelete(
    changeRequestSystemUserClient,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            changeRequestSystemUserClient.ChangeRequestSystemUserVendorDelete(
                requestId,
                labels,
            ),
        "ChangeRequestSystemUserVendorDelete",
    );

    const succeed = check(res, {
        "ChangeRequestSystemUserVendorDelete - status code is 202": (r) =>
            r.status === 202,
        "ChangeRequestSystemUserVendorDelete - status text is 202 Accepted": (r) =>
            r.status_text === "202 Accepted",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
