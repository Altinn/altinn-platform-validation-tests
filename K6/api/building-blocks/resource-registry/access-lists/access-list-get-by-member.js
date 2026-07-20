import { check } from "k6";

import { AccessListClient } from "../../../../clients/access-list/index.js";

/**
 * Gets access lists for a given member.
 *
 * @param {AccessListClient} accessListClient Client for the Access List API.
 * @param {string} party Member party UUID URN.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AccessListInfoDto>|null} Access lists.
 */
export function AccessListGetByMember(
    accessListClient,
    party,
    labels = null,
) {
    const res = accessListClient.AccessListGetByMember(party, labels);

    /** @type {Array<AccessListInfoDto>|null} */
    let accessLists = null;

    const succeed = check(res, {
        "AccessListGetByMember - status code is 200": (r) =>
            r.status === 200,
        "AccessListGetByMember - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
