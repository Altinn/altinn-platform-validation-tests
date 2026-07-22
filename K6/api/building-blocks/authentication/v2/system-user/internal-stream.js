import { check } from "k6";

import { SystemUserClient } from "../../../../clients/system-user/index.js";







/**
 * Retrieves SystemUsers from the internal stream endpoint.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {Object} [query] Query parameters.
 * @param {Int64Opaque} [query.token] Continuation token.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {SystemUserRegisterDTOItemStream|null} Stream result.
 */
export function SystemUserInternalStream(
    systemUserClient,
    query = null,
    labels = null,
) {
    const res = systemUserClient.SystemUserInternalStream(
        query,
        labels,
    );

    /** @type {SystemUserRegisterDTOItemStream|null} */
    let result = null;

    const succeed = check(res, {
        "SystemUserInternalStream - status code is 200": (r) =>
            r.status === 200,
        "SystemUserInternalStream - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "SystemUserInternalStream - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return result;
}