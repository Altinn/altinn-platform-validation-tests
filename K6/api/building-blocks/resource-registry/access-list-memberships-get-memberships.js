import { check } from "k6";

import { AccessListMembershipsClient } from "../../../../clients/access-list-memberships/index.js";

/**
 * Gets access list memberships for parties and resources.
 *
 * @param {AccessListMembershipsClient} accessListMembershipsClient Client for the Access List Memberships API.
 * @param {Object|null} [query] Optional query parameters.
 * @param {Array<string>} [query.party] Parties to include.
 * @param {Array<string>} [query.resource] Resources to include.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListResourceMembershipWithActionFilterDtoListObject|null} Access list memberships.
 */
export function AccessListMembershipsGetMemberships(
    accessListMembershipsClient,
    query = null,
    labels = null,
) {
    const res = accessListMembershipsClient.AccessListMembershipsGetMemberships(
        query,
        labels,
    );

    /** @type {AccessListResourceMembershipWithActionFilterDtoListObject|null} */
    let memberships = null;

    const succeed = check(res, {
        "AccessListMembershipsGetMemberships - status code is 200": (r) =>
            r.status === 200,
        "AccessListMembershipsGetMemberships - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return memberships;
    }

    check(res, {
        "AccessListMembershipsGetMemberships - body is valid": (r) => {
            try {
                memberships = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return memberships;
}
