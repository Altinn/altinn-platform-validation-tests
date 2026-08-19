import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {number} groupId See the client method.
 * @param {{[key: string]: string}} [labels] See the client method.
 * @returns {boolean} Parsed response body, or null when the call failed.
 */
export function DeletePartyGroup(
    partyGroupsClient,
    groupId,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.DeletePartyGroup(groupId, labels),
        "DeletePartyGroup",
    );

    let deleted = false;

    const succeed = check(res, {
        "DeletePartyGroup - status code is 204": (r) => r.status === 204,
        "DeletePartyGroup - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
