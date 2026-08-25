import { check } from "k6";

import { ResourceDelegation } from "../../../../clients/access-management-bff/common/common.types.js";
import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { GetConsumerResourcesQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resources the Maskinporten consumers of a party hold.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {GetConsumerResourcesQuery} queryParams Query parameters. Use
 * {@link GetConsumerResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourceDelegation>|null} The resources the consumers hold.
 */
export function GetConsumerResources(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.GetConsumerResources(queryParams, labels),
        "GetConsumerResources",
    );

    /** @type {Array<ResourceDelegation>|null} */
    let resourceDelegations = null;

    const succeed = check(res, {
        "GetConsumerResources - status code is 200": (r) =>
            r.status === 200,
        "GetConsumerResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceDelegations;
    }

    check(res, {
        "GetConsumerResources - body is valid": (r) => {
            try {
                resourceDelegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceDelegations;
}
