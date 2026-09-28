import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the agent system users of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The agent system users. The API does not publish a
 * schema for this response.
 */
export function GetAgentSystemUsers(systemUserClient, partyId, labels = null) {
    const res = withRetries(
        () => systemUserClient.GetAgentSystemUsers(partyId, labels),
        "GetAgentSystemUsers",
    );

    /** @type {any} */
    let systemUsers = null;

    const succeed = check(res, {
        "GetAgentSystemUsers - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return systemUsers;
    }

    check(res, {
        "GetAgentSystemUsers - body is valid": (r) => {
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
