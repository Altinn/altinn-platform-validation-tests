import { check } from "k6";

import { MaskinportenConsumersClient } from "../../../../../clients/access-management/enduser/maskinporten-consumers/index.js";
import { MaskinportenConsumerResourcesQuery } from "../../../../../clients/access-management/enduser/maskinporten-consumers/maskinporten-consumers.types.js";
import { ResourcePermissionDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves resources delegated through Maskinporten consumers for a party.
 *
 * @param {MaskinportenConsumersClient} maskinportenConsumersClient Client for the Maskinporten Consumers API.
 * @param {MaskinportenConsumerResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenConsumerResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourcePermissionDto>} Resource permissions.
 */
export function GetMaskinportenConsumerResources(
    maskinportenConsumersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenConsumersClient.GetMaskinportenConsumerResources(
            queryParams,
            labels,
        ),
        "GetMaskinportenConsumerResources",
    );

    /** @type {Array<ResourcePermissionDto>} */
    let resources = [];

    const succeed = check(res, {
        "GetMaskinportenConsumerResources - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenConsumerResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetMaskinportenConsumerResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
