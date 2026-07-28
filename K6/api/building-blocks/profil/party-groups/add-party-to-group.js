import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Adds a party to a group.
 *
 * @param {PartyGroupsClient} partyGroupsClient TODO: Description
 * @param {number} groupId TODO: Description
 * @param {string} partyUuid TODO: Description
 * @param {{[key: string]: string}} [labels] TODO: Description
 * @returns {GroupResponse|null} TODO: Description
 */
export function AddPartyToGroup(
    partyGroupsClient,
    groupId,
    partyUuid,
    labels = null,
) {
    const res = partyGroupsClient.AddPartyToGroup(groupId, partyUuid, labels);

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "AddPartyToGroup - status code is 200": (r) => r.status === 200,
        "AddPartyToGroup - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "AddPartyToGroup - body is valid": (r) => {
            group = JSON.parse(r.body);
            return true;
        },
    });

    return group;
}
