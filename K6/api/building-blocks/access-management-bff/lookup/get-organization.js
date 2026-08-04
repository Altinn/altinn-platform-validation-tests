import { check } from "k6";

import { LookupClient } from "../../../../clients/access-management-bff/lookup/index.js";

/**
 * Looks up a party by organisation number.
 *
 * @param {LookupClient} lookupClient Client for the lookup endpoints.
 * @param {string} orgNummer Organisation number.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PartyFE|null} The party of the organisation.
 */
export function GetOrganization(lookupClient, orgNummer, labels = null) {
    const res = lookupClient.GetOrganization(orgNummer, labels);

    /** @type {PartyFE|null} */
    let party = null;

    const succeed = check(res, {
        "GetOrganization - status code is 200": (r) =>
            r.status === 200,
        "GetOrganization - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return party;
    }

    check(res, {
        "GetOrganization - body is valid": (r) => {
            try {
                party = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return party;
}
