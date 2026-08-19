import { check } from "k6";

import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the clients of a party.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {ClientsQuery|null} [queryParams]
 * Query parameters. Use {@link ClientsQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers, for example paging headers.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ClientDtoPaginatedResult|null} Paginated clients result.
 */
export function GetClients(
    clientDelegationClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetClients(
            queryParams,
            headers,
            labels,
        ),
        "GetClients",
    );

    /** @type {ClientDtoPaginatedResult|null} */
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
