import { check } from "k6";

import { SystemUserClient } from "../../../../clients/authentication/index.js";
import { SystemUserPagedQuery, SystemUserRegisterDTOItemStream } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves SystemUsers from the internal stream endpoint.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {SystemUserPagedQuery|null} [query] Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {SystemUserRegisterDTOItemStream|null} Stream result.
 */
export function SystemUserInternalStream(
    systemUserClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.SystemUserInternalStream(query, labels),
        "SystemUserInternalStream",
    );

    /** @type {SystemUserRegisterDTOItemStream|null} */
    let result = null;

    const succeed = check(res, {
        "SystemUserInternalStream - status code is 200": (r) =>
            r.status === 200,
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
