import { check } from "k6";

import { PartyUrn } from "../../../../clients/register/types.js";
import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListMembershipDtoAggregateVersionVersionedPaginated } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds members to an access list.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} owner Resource owner.
 * @param {string} identifier Access list identifier.
 * @param {{data:Array<PartyUrn>}} request Members payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} Access list members.
 */
export function AccessListAddMembers(
    accessListClient,
    owner,
    identifier,
    request,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListAddMembers(
            owner,
            identifier,
            request,
            labels,
        ),
        "AccessListAddMembers",
    );

    /** @type {AccessListMembershipDtoAggregateVersionVersionedPaginated|null} */
    let members = null;

    const succeed = check(res, {
        "AccessListAddMembers - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return members;
    }

    check(res, {
        "AccessListAddMembers - body is valid": (r) => {
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
