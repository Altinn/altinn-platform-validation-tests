import { check } from "k6";

import { MaskinportenConnection } from "../../../../clients/access-management-bff/common/common.types.js";
import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { GetConsumersQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the Maskinporten consumers of a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {GetConsumersQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetConsumersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<MaskinportenConnection>|null} The Maskinporten consumers.
 */
export function GetConsumers(
    maskinportenClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.GetConsumers(queryParams, labels),
        "GetConsumers",
    );

    /** @type {Array<MaskinportenConnection>|null} */
    let consumers = null;

    const succeed = check(res, {
        "GetConsumers - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consumers;
    }

    check(res, {
        "GetConsumers - body is valid": (r) => {
            try {
                consumers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consumers;
}
