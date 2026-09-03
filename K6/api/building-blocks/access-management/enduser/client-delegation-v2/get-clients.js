import { check } from "k6";

import { ClientDtoPaginatedResult, ClientsQuery } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the clients of a party.
 *
 * This is the v2 listing, not the v1 one. v2 reports a client held through a
 * rettighetshaver relation and v1 does not, so the two are not interchangeable.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {ClientsQuery|null} [queryParams] Query parameters. Use ClientsQueryBuilder.
 * @param {{[key: string]: string|number}|null} [headers] Optional request headers, for example paging headers.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ClientDtoPaginatedResult|null} The clients, or null when the call failed.
 */
export function GetClients(
    clientDelegationV2Client,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.GetClients(
            queryParams,
            headers,
            labels,
        ),
        "GetClients",
    );

    /** @type {ClientDtoPaginatedResult|null} */
    let result = null;

    const succeed = check(res, {
        "GetClients - status code is 200": (r) =>
            r.status === 200,
        "GetClients - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "GetClients - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return result;
}
