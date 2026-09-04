import { check } from "k6";

import { MyClientDtoPaginatedResult, MyClientsQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the clients the authenticated party has access to, grouped by
 * client provider.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {MyClientsQuery|null} [queryParams]
 * Query parameters. Use {@link MyClientsQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers, for example paging headers.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {MyClientDtoPaginatedResult|null} Paginated clients result.
 */
export function GetMyClients(
    clientDelegationClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetMyClients(
            queryParams,
            headers,
            labels,
        ),
        "GetMyClients",
    );

    /** @type {MyClientDtoPaginatedResult|null} */
    let clients = null;

    const succeed = check(res, {
        "GetMyClients - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clients;
    }

    check(res, {
        "GetMyClients - body is valid": (r) => {
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
