import { check } from "k6";

import { AgentDtoPaginatedResult, AgentsQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the agents of a party.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {AgentsQuery|null} [queryParams]
 * Query parameters. Use {@link AgentsQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers, for example paging headers.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AgentDtoPaginatedResult|null} Paginated agents result.
 */
export function GetAgents(
    clientDelegationClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.GetAgents(
            queryParams,
            headers,
            labels,
        ),
        "GetAgents",
    );

    /** @type {AgentDtoPaginatedResult|null} */
    let agents = null;

    const succeed = check(res, {
        "GetAgents - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return agents;
    }

    check(res, {
        "GetAgents - body is valid": (r) => {
            try {
                agents = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return agents;
}
