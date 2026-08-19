import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/profil/party-groups/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves all party groups for the current user.
 *
 * @param {PartyGroupsClient} partyGroupsClient Client for the API.
 * @param {{[key: string]: string}} [labels] See the client method.
 * @returns {Array<GroupResponse>|null} Parsed response body, or null when the call failed.
 */
export function GetPartyGroups(
    partyGroupsClient,
    labels = null,
) {
    const res = withRetries(
        () => partyGroupsClient.GetPartyGroups(labels),
        "GetPartyGroups",
    );

    /** @type {Array<GroupResponse>|null} */
    let groups = null;

    const succeed = check(res, {
        "GetPartyGroups - status code is 200": (r) => r.status === 200,
        "GetPartyGroups - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return groups;
    }

    check(res, {
        "GetPartyGroups - body is valid": (r) => {
            try {
                groups = JSON.parse(r.body);
                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return groups;
}
