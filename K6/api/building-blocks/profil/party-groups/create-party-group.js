import { check } from "k6";

import { GroupResponse } from "../../../../clients/profil/favorites/favorites.types.js";
import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { GroupRequest } from "../../../../clients/profil/party-groups/party-groups.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Creates a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {GroupRequest} request See the client method.
 * @param {{[key: string]: string}|null} [labels] See the client method.
 * @returns {GroupResponse|null} Parsed response body, or null when the call failed.
 */
export function CreatePartyGroup(
    partyGroupsClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.CreatePartyGroup(request, labels),
        "CreatePartyGroup",
    );

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "CreatePartyGroup - status code is 201": (r) => r.status === 201,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return group;
    }

    check(res, {
        "CreatePartyGroup - body is valid": (r) => {
            group = JSON.parse(r.body);
            return true;
        },
    });

    return group;
}
