import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";

/**
 * Gets a system user request.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The request. The API does not publish a schema for
 * this response.
 */
export function GetSystemUserRequest(
    systemUserRequestClient,
    requestId,
    labels = null,
) {
    const res = systemUserRequestClient.GetRequestByRequestId(
        requestId,
        labels,
    );

    /** @type {object|null} */
    let systemUserRequest = null;

    const succeed = check(res, {
        "GetSystemUserRequest - status code is 200": (r) =>
            r.status === 200,
        "GetSystemUserRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
