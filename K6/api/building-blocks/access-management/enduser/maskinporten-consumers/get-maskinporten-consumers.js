import { check } from "k6";

import { MaskinportenConsumersClient } from "../../../../../clients/access-management/enduser/maskinporten-consumers/index.js";
import { MaskinportenConsumersQuery } from "../../../../../clients/access-management/enduser/maskinporten-consumers/maskinporten-consumers.types.js";
import { ConnectionDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves Maskinporten consumers for a party.
 *
 * @param {MaskinportenConsumersClient} maskinportenConsumersClient Client for the Maskinporten Consumers API.
 * @param {MaskinportenConsumersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenConsumersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ConnectionDto>} Maskinporten consumer connections.
 */
export function GetMaskinportenConsumers(
    maskinportenConsumersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenConsumersClient.GetMaskinportenConsumers(
            queryParams,
            labels,
        ),
        "GetMaskinportenConsumers",
    );

    /** @type {Array<ConnectionDto>} */
    let consumers = [];

    const succeed = check(res, {
        "GetMaskinportenConsumers - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenConsumers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consumers;
    }

    check(res, {
        "GetMaskinportenConsumers - body is valid": (r) => {
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
