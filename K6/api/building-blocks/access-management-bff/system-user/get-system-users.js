import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";

/**
 * Gets the system users of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The system users. The API does not publish a schema
 * for this response.
 */
export function GetSystemUsers(systemUserClient, partyId, labels = null) {
    const res = systemUserClient.GetSystemUsers(partyId, labels);

    /** @type {object|null} */
    let systemUsers = null;

    const succeed = check(res, {
        "GetSystemUsers - status code is 200": (r) =>
            r.status === 200,
        "GetSystemUsers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUsers;
    }

    check(res, {
        "GetSystemUsers - body is valid": (r) => {
            try {
                systemUsers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemUsers;
}
