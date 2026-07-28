import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Updates a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient TODO: Description
 * @param {number} groupId TODO: Description
 * @param {GroupRequest} request TODO: Description
 * @param {{[key: string]: string}} [labels] TODO: Description
 * @returns {GroupResponse|null} TODO: Description
 */
export function UpdatePartyGroup(
    partyGroupsClient,
    groupId,
    request,
    labels = null,
) {
    const res = partyGroupsClient.UpdatePartyGroup(groupId, request, labels);

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "UpdatePartyGroup - status code is 200": (r) => r.status === 200,
        "UpdatePartyGroup - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "UpdatePartyGroup - body is valid": (r) => {
            group = JSON.parse(r.body);
            return true;
        },
    });

    return group;
}
