import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Retrieves all party groups for the current user.
 *
 * @param {PartyGroupsClient} partyGroupsClient
 * @param {{[key: string]: string}} [labels]
 * @returns {Array<GroupResponse>|null}
 */
export function GetPartyGroups(
    partyGroupsClient,
    labels = null,
) {
    const res = partyGroupsClient.GetPartyGroups(labels);

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
