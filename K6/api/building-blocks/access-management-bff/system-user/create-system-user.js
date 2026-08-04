import { check } from "k6";

import { SystemUserClient } from "../../../../../clients/access-management-bff/system-user/index.js";

/**
 * Creates a system user for an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {NewSystemUserRequest|null} [body] The system user to create. Use
 * {@link NewSystemUserRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The created system user. The API does not publish a
 * schema for this response.
 */
export function CreateSystemUser(
    systemUserClient,
    partyId,
    body = null,
    labels = null,
) {
    const res = systemUserClient.CreateSystemUser(partyId, body, labels);

    /** @type {object|null} */
    let systemUser = null;

    const succeed = check(res, {
        "CreateSystemUser - status code is 200": (r) =>
            r.status === 200,
        "CreateSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUser;
    }

    check(res, {
        "CreateSystemUser - body is valid": (r) => {
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
