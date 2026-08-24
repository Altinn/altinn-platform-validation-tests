import { check } from "k6";

import { GroupResponse } from "../../../../clients/profil/favorites/favorites.types.js";
import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { GroupRequest } from "../../../../clients/profil/party-groups/party-groups.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {number} groupId See the client method.
 * @param {GroupRequest} request See the client method.
 * @param {{[key: string]: string}} [labels] See the client method.
 * @returns {GroupResponse|null} Parsed response body, or null when the call failed.
 */
export function UpdatePartyGroup(
    partyGroupsClient,
    groupId,
    request,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.UpdatePartyGroup(groupId, request, labels),
        "UpdatePartyGroup",
    );

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
