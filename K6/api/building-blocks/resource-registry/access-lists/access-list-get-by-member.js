import { check } from "k6";

import { AccessListClient } from "../../../../clients/resource-registry/index.js";
import { AccessListInfoDto } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets access lists for a given member.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} party Member party UUID URN.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<AccessListInfoDto>|null} Access lists.
 */
export function AccessListGetByMember(
    accessListClient,
    party,
    labels = null,
) {
    const res = withRetries(
        () => accessListClient.AccessListGetByMember(party, labels),
        "AccessListGetByMember",
    );

    /** @type {Array<AccessListInfoDto>|null} */
    let accessLists = null;

    const succeed = check(res, {
        "AccessListGetByMember - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessLists;
    }

    check(res, {
        "AccessListGetByMember - body is valid": (r) => {
            try {
                accessLists = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessLists;
}
