import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Removes a party from a group.
 *
 * @param {PartyGroupsClient} partyGroupsClient
 * @param {number} groupId
 * @param {string} partyUuid
 * @param {{[key: string]: string}} [labels]
 * @returns {GroupResponse|null}
 */
export function RemovePartyFromGroup(
    partyGroupsClient,
    groupId,
    partyUuid,
    labels = null,
) {
    const res = partyGroupsClient.RemovePartyFromGroup(
        groupId,
        partyUuid,
        labels,
    );

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "RemovePartyFromGroup - status code is 200": (r) => r.status === 200,
        "RemovePartyFromGroup - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "RemovePartyFromGroup - body is valid": (r) => {
            group = JSON.parse(r.body);
            return true;
        },
    });

    return group;
}
