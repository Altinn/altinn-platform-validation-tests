import { check } from "k6";

import { GetMyClientsQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { MyClientDelegation } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the clients of the authenticated party, grouped by client provider.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetMyClientsQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetMyClientsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<MyClientDelegation>|null} Clients grouped by client
 * provider.
 */
export function GetMyClients(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetMyClients(queryParams, labels),
        "GetMyClients",
    );

    /** @type {Array<MyClientDelegation>|null} */
    let myClients = null;

    const succeed = check(res, {
        "GetMyClients - status code is 200": (r) =>
            r.status === 200,
        "GetMyClients - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return myClients;
    }

    check(res, {
        "GetMyClients - body is valid": (r) => {
            try {
                myClients = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return myClients;
}
