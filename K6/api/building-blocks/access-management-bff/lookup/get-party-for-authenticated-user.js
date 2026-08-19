import { check } from "k6";

import { LookupClient } from "../../../../clients/access-management-bff/lookup/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the party of the authenticated user.
 *
 * @param {LookupClient} lookupClient Client for the lookup endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PartyFE|null} The party of the authenticated user.
 */
export function GetPartyForAuthenticatedUser(lookupClient, labels = null) {
    const res = withRetries(
        () => lookupClient.GetPartyForAuthenticatedUser(labels),
        "GetPartyForAuthenticatedUser",
    );

    /** @type {PartyFE|null} */
    let party = null;

    const succeed = check(res, {
        "GetPartyForAuthenticatedUser - status code is 200": (r) =>
            r.status === 200,
        "GetPartyForAuthenticatedUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return party;
    }

    check(res, {
        "GetPartyForAuthenticatedUser - body is valid": (r) => {
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
