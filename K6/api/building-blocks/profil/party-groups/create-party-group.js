import { check } from "k6";

import { PartyGroupsClient } from "../../../../clients/party-groups/index.js";

/**
 * Creates a party group.
 *
 * @param {PartyGroupsClient} partyGroupsClient
 * @param {GroupRequest} request
 * @param {{[key: string]: string}} [labels]
 * @returns {GroupResponse|null}
 */
export function CreatePartyGroup(
    partyGroupsClient,
    request,
    labels = null,
) {
    const res = partyGroupsClient.CreatePartyGroup(request, labels);

    /** @type {GroupResponse|null} */
    let group = null;

    const succeed = check(res, {
        "CreatePartyGroup - status code is 201": (r) => r.status === 201,
        "CreatePartyGroup - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
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
