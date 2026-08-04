import { check } from "k6";

import { SystemUserClient } from "../../../../../clients/access-management-bff/system-user/index.js";

/**
 * Gets a single system user of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The system user. The API does not publish a schema
 * for this response.
 */
export function GetSystemUser(
    systemUserClient,
    partyId,
    systemUserGuid,
    labels = null,
) {
    const res = systemUserClient.GetSystemUser(
        partyId,
        systemUserGuid,
        labels,
    );

    /** @type {object|null} */
    let systemUser = null;

    const succeed = check(res, {
        "GetSystemUser - status code is 200": (r) =>
            r.status === 200,
        "GetSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUser;
    }

    check(res, {
        "GetSystemUser - body is valid": (r) => {
            try {
                systemUser = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return systemUser;
}
