import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {number} groupId See the client method.
 * @param {{[key: string]: string}} [labels] See the client method.
 * @returns {GroupResponse|null} Parsed response body, or null when the call failed.
 */
export function GetPartyGroup(
    partyGroupsClient,
    groupId,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.GetPartyGroup(groupId, labels),
        "GetPartyGroup",
    );

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
