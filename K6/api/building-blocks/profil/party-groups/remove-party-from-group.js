import { check } from "k6";

import { GroupResponse } from "../../../../clients/profil/favorites/favorites.types.js";
import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a party from a group.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {number} groupId See the client method.
 * @param {string} partyUuid See the client method.
 * @param {{[key: string]: string}|null} [labels] See the client method.
 * @returns {GroupResponse|null} Parsed response body, or null when the call failed.
 */
export function RemovePartyFromGroup(
    partyGroupsClient,
    groupId,
    partyUuid,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.RemovePartyFromGroup(
            groupId,
            partyUuid,
            labels,
        ),
        "RemovePartyFromGroup",
    );

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "RemovePartyFromGroup - status code is 200": (r) => r.status === 200,
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
