import { check } from "k6";

import { LookupClient } from "../../../../../clients/access-management-bff/lookup/index.js";

/**
 * Looks up a party by party UUID.
 *
 * @param {LookupClient} lookupClient Client for the lookup endpoints.
 * @param {string} uuid Party UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PartyFE|null} The party.
 */
export function GetParty(lookupClient, uuid, labels = null) {
    const res = lookupClient.GetParty(uuid, labels);

    /** @type {PartyFE|null} */
    let party = null;

    const succeed = check(res, {
        "GetParty - status code is 200": (r) =>
            r.status === 200,
        "GetParty - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return party;
    }

    check(res, {
        "GetParty - body is valid": (r) => {
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
