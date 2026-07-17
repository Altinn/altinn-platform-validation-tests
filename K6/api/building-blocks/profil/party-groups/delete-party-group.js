import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Deletes a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient
 * @param {number} groupId
 * @param {{[key: string]: string}} [labels]
 * @returns {boolean}
 */
export function DeletePartyGroup(
    partyGroupsClient,
    groupId,
    labels = null,
) {
    const res = partyGroupsClient.DeletePartyGroup(groupId, labels);

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
