import { check } from "k6";

import { AgentDtoPaginatedResult, AgentsQuery } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the agents of a party.
 *
 * This is the v2 listing, not the v1 one. v2 reports a client held through a
 * rettighetshaver relation and v1 does not, so the two are not interchangeable.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {AgentsQuery|null} [queryParams] Query parameters. Use AgentsQueryBuilder.
 * @param {{[key: string]: string|number}|null} [headers] Optional request headers, for example paging headers.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AgentDtoPaginatedResult|null} The agents, or null when the call failed.
 */
export function GetAgents(
    clientDelegationV2Client,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.GetAgents(
            queryParams,
            headers,
            labels,
        ),
        "GetAgents",
    );

    /** @type {AgentDtoPaginatedResult|null} */
    let result = null;

    const succeed = check(res, {
        "GetAgents - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "GetAgents - body is valid": (r) => {
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
