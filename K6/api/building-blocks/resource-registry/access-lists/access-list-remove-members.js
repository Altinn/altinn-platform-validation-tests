import { check } from "k6";

import { AccessListClient } from "../../../../clients/access-list/index.js";

/**
 * Removes members from an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {{data:Array<PartyUrn>}} request Members payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} Access list members.
 */
export function AccessListRemoveMembers(
    accessListClient,
    owner,
    identifier,
    request,
    labels = null,
) {
    const res = accessListClient.AccessListRemoveMembers(
        owner,
        identifier,
        request,
        labels,
    );

    /** @type {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} */
    let members = null;

    const succeed = check(res, {
        "AccessListRemoveMembers - status code is 200": (r) =>
            r.status === 200,
        "AccessListRemoveMembers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return members;
    }

    check(res, {
        "AccessListRemoveMembers - body is valid": (r) => {
            try {
                members = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return members;
}
