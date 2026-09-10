import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a system user request.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The request. The API does not publish a schema for
 * this response.
 */
export function GetSystemUserRequest(
    systemUserRequestClient,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserRequestClient.GetSystemUserRequest(
            requestId,
            labels,
        ),
        "GetSystemUserRequest",
    );

    /** @type {any} */
    let systemUserRequest = null;

    const succeed = check(res, {
        "GetSystemUserRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUserRequest;
    }

    check(res, {
        "GetSystemUserRequest - body is valid": (r) => {
            try {
                systemUserRequest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemUserRequest;
}
