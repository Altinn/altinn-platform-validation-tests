import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";

/**
 * Gets the Maskinporten consumers of a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {GetConsumersQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetConsumersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<MaskinportenConnection>|null} The Maskinporten consumers.
 */
export function GetConsumers(
    maskinportenClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenClient.GetConsumers(queryParams, labels);

    /** @type {Array<MaskinportenConnection>|null} */
    let consumers = null;

    const succeed = check(res, {
        "GetConsumers - status code is 200": (r) =>
            r.status === 200,
        "GetConsumers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
