import { check } from "k6";

import { AgentResourcesDtoPaginatedResult, ClientResourcesQuery } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the resources a client has delegated.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {ClientResourcesQuery|null} [queryParams] Query parameters. Use ClientResourcesQueryBuilder.
 * @param {{[key: string]: string|number}|null} [headers] Optional request headers, for example paging headers.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AgentResourcesDtoPaginatedResult|null} Paginated resources, grouped by agent.
 */
export function GetClientResources(
    clientDelegationV2Client,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.GetClientResources(
            queryParams,
            headers,
            labels,
        ),
        "GetClientResources",
    );

    /** @type {AgentResourcesDtoPaginatedResult|null} */
    let resources = null;

    const succeed = check(res, {
        "GetClientResources - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetClientResources - body is valid": (r) => {
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
