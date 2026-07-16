import { check } from "k6";

import { MaskinportenConsumersClient } from "../../../../clients/maskinporten-consumers/index.js";

/**
 * Deletes a resource delegation for a Maskinporten consumer.
 *
 * @param {MaskinportenConsumersClient} maskinportenConsumersClient Client for the Maskinporten Consumers API.
 * @param {MaskinportenConsumersResourcesQuery} queryParams
 * Query parameters. Use {@link MaskinportenConsumersResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resource delegation was successfully deleted.
 */
export function DeleteMaskinportenConsumerResource(
    maskinportenConsumersClient,
    queryParams,
    labels = null,
) {
    const res = maskinportenConsumersClient.DeleteMaskinportenConsumerResource(
        queryParams,
        labels,
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
