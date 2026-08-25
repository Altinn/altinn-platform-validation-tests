import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListMembershipDtoAggregateVersionVersionedPaginated, AccessListPagedQuery } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets access list members.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {AccessListPagedQuery|null} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} Access list members.
 */
export function AccessListGetMembers(
    accessListClient,
    owner,
    identifier,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListGetMembers(
            owner,
            identifier,
            query,
            labels,
        ),
        "AccessListGetMembers",
    );

    /** @type {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} */
    let members = null;

    const succeed = check(res, {
        "AccessListGetMembers - status code is 200": (r) =>
            r.status === 200,
        "AccessListGetMembers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return members;
    }

    check(res, {
        "AccessListGetMembers - body is valid": (r) => {
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
