import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the clients of a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetClientsQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetClientsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ClientDelegation>|null} The clients of the party.
 */
export function GetClients(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetClients(queryParams, labels),
        "GetClients",
    );

    /** @type {Array<ClientDelegation>|null} */
    let clients = null;

    const succeed = check(res, {
        "GetClients - status code is 200": (r) =>
            r.status === 200,
        "GetClients - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clients;
    }

    check(res, {
        "GetClients - body is valid": (r) => {
            try {
                clients = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return clients;
}
