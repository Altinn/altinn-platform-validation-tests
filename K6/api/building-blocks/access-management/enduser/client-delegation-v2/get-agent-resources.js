import { check } from "k6";

import { AgentResourcesQuery, ClientResourcesDtoPaginatedResult } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the resources delegated to an agent.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {AgentResourcesQuery|null} [queryParams] Query parameters. Use AgentResourcesQueryBuilder.
 * @param {{[key: string]: string|number}|null} [headers] Optional request headers, for example paging headers.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ClientResourcesDtoPaginatedResult|null} Paginated resources, grouped by client.
 */
export function GetAgentResources(
    clientDelegationV2Client,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.GetAgentResources(
            queryParams,
            headers,
            labels,
        ),
        "GetAgentResources",
    );

    /** @type {ClientResourcesDtoPaginatedResult|null} */
    let resources = null;

    const succeed = check(res, {
        "GetAgentResources - status code is 200": (r) =>
            r.status === 200,
        "GetAgentResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetAgentResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
