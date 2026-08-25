import { check } from "k6";

import { MaskinportenDelegation } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";
import { MaskinportenClient } from "../../../../../clients/access-management/resource-owner/maskinporten/index.js";
import { MaskinportenDelegationsQuery } from "../../../../../clients/access-management/resource-owner/maskinporten/maskinporten.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves Maskinporten delegations.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten API.
 * @param {MaskinportenDelegationsQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenDelegationsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<MaskinportenDelegation>} Maskinporten delegations.
 */
export function GetMaskinportenDelegations(
    maskinportenClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.GetMaskinportenDelegations(
            queryParams,
            labels,
        ),
        "GetMaskinportenDelegations",
    );

    /** @type {Array<MaskinportenDelegation>} */
    let delegations = [];

    const succeed = check(res, {
        "GetMaskinportenDelegations - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenDelegations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "GetMaskinportenDelegations - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
