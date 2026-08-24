import { check } from "k6";

import { RegisterClient } from "../../../clients/register/index.js";
import {
    Party,
    PartyFieldInclude,
    PartyUrn,
} from "../../../clients/register/types.js";
import { withRetries } from "../common/retry.js";

/**
 * Looks up parties by identifier through the access-management party query.
 *
 * An identifier Register does not know is left out of the response instead of
 * failing the request, so an empty list is a successful lookup that found
 * nothing. The caller decides whether that is a failure for its case.
 *
 * @param {RegisterClient} registerClient Client for the Register API.
 * @param {Array<PartyUrn>} urns The party identifiers to look up.
 * @param {Array<PartyFieldInclude>} [fields] The fields to include in the response.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<Party>|null} The parties found, or null on failure.
 */
export function AccessManagementPartiesQuery(
    registerClient,
    urns,
    fields = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            registerClient.AccessManagementPartiesQuery(urns, fields, labels),
        "AccessManagementPartiesQuery",
    );

    /** @type {Array<Party>|null} */
    let parties = null;

    // 206 is what Register answers when it served the parties but not every
    // requested field, and 204 when it has nothing to serve at all. Both are
    // answers to the query rather than failures of it.
    const succeed = check(res, {
        "AccessManagementPartiesQuery - status code is 200, 204 or 206": (r) =>
            r.status === 200 || r.status === 204 || r.status === 206,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return parties;
    }

    if (res.status === 204) {
        return [];
    }

    check(res, {
        "AccessManagementPartiesQuery - body is valid": (r) => {
            try {
                parties = JSON.parse(r.body).data ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return parties;
}
