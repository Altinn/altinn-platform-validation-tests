import { check } from "k6";

import { MaskinportenConsumersClient } from "../../../../clients/maskinporten-consumers/index.js";

/**
 * Deletes a Maskinporten consumer connection for a party.
 *
 * @param {MaskinportenConsumersClient} maskinportenConsumersClient Client for the Maskinporten Consumers API.
 * @param {MaskinportenConsumersQuery} queryParams
 * Query parameters. Use {@link MaskinportenConsumersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the consumer was successfully deleted.
 */
export function DeleteMaskinportenConsumer(
    maskinportenConsumersClient,
    queryParams,
    labels = null,
) {
    const res = maskinportenConsumersClient.DeleteMaskinportenConsumer(
        queryParams,
        labels,
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteMaskinportenConsumer - status code is 204": (r) =>
            r.status === 204,
        "DeleteMaskinportenConsumer - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
