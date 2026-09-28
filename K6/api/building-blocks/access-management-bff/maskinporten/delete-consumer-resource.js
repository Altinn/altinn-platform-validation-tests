import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { DeleteConsumerResourceQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes a resource a Maskinporten consumer holds.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteConsumerResourceQuery} queryParams Query parameters. Use
 * {@link DeleteConsumerResourceQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resource was revoked.
 */
export function DeleteConsumerResource(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.DeleteConsumerResource(queryParams, labels),
        "DeleteConsumerResource",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteConsumerResource - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
