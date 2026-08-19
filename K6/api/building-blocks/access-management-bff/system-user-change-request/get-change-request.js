import { check } from "k6";

import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a system user change request.
 *
 * @param {SystemUserChangeRequestClient} systemUserChangeRequestClient Client
 * for the system user change request endpoints.
 * @param {string} changeRequestId Change request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The change request. The API does not publish a schema
 * for this response.
 */
export function GetChangeRequest(
    systemUserChangeRequestClient,
    changeRequestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserChangeRequestClient.GetChangeRequest(
            changeRequestId,
            labels,
        ),
        "GetChangeRequest",
    );

    /** @type {object|null} */
    let changeRequest = null;

    const succeed = check(res, {
        "GetChangeRequest - status code is 200": (r) =>
            r.status === 200,
        "GetChangeRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changeRequest;
    }

    check(res, {
        "GetChangeRequest - body is valid": (r) => {
            try {
                changeRequest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changeRequest;
}
