import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes a resource a Maskinporten consumer holds.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteConsumerResourceQuery} queryParams Query parameters. Use
 * {@link DeleteConsumerResourceQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
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
        "DeleteConsumerResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
