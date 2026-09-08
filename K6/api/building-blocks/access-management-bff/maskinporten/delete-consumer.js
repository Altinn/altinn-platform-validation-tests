import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { DeleteConsumerQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a Maskinporten consumer from a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteConsumerQuery} queryParams Query parameters. Use
 * {@link DeleteConsumerQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the consumer was removed.
 */
export function DeleteConsumer(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.DeleteConsumer(queryParams, labels),
        "DeleteConsumer",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteConsumer - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
