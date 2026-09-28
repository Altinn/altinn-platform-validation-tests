import { check } from "k6";

import { NewSystemUserRequest } from "../../../../clients/access-management-bff/common/common.types.js";
import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a system user for an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {NewSystemUserRequest|null} [body] The system user to create. Use
 * {@link NewSystemUserRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The created system user. The API does not publish a
 * schema for this response.
 */
export function CreateSystemUser(
    systemUserClient,
    partyId,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.CreateSystemUser(partyId, body, labels),
        "CreateSystemUser",
    );

    /** @type {any} */
    let systemUser = null;

    const succeed = check(res, {
        "CreateSystemUser - status code is 200": (r) =>
            r.status === 200,
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
