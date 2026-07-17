import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Retrieves a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient
 * @param {number} groupId
 * @param {{[key: string]: string}} [labels]
 * @returns {GroupResponse|null}
 */
export function GetPartyGroup(
    partyGroupsClient,
    groupId,
    labels = null,
) {
    const res = partyGroupsClient.GetPartyGroup(groupId, labels);

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "GetPartyGroup - status code is 200": (r) => r.status === 200,
        "GetPartyGroup - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "GetPartyGroup - body is valid": (r) => {
            group = JSON.parse(r.body);
            return true;
        },
    });

    return group;
}
