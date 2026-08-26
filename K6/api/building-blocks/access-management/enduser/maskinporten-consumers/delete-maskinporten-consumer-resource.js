import { check } from "k6";

import { MaskinportenConsumersClient } from "../../../../../clients/access-management/enduser/maskinporten-consumers/index.js";
import { MaskinportenConsumerResourcesQuery } from "../../../../../clients/access-management/enduser/maskinporten-consumers/maskinporten-consumers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a resource delegation for a Maskinporten consumer.
 *
 * @param {MaskinportenConsumersClient} maskinportenConsumersClient Client for the Maskinporten Consumers API.
 * @param {MaskinportenConsumerResourcesQuery} queryParams
 * Query parameters. Use {@link MaskinportenConsumerResourcesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resource delegation was successfully deleted.
 */
export function DeleteMaskinportenConsumerResource(
    maskinportenConsumersClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenConsumersClient.DeleteMaskinportenConsumerResource(
            queryParams,
            labels,
        ),
        "DeleteMaskinportenConsumerResource",
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteMaskinportenConsumerResource - status code is 204": (r) =>
            r.status === 204,
        "DeleteMaskinportenConsumerResource - status text is 204 No Content": (
            r,
        ) => r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
