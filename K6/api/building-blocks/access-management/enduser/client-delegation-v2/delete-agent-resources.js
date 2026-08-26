import { check } from "k6";

import { DelegateAgentResourcesQuery, ResourceDelegationBatchInputDto, ResourceDelegationDto } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Removes resources an agent was delegated.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {DelegateAgentResourcesQuery} queryParams Query parameters. Use DelegateAgentResourcesQueryBuilder.
 * @param {ResourceDelegationBatchInputDto|null} [body] The resources to remove. Use ResourceDelegationBatchInputBuilder.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ResourceDelegationDto>} The delegations that were removed.
 */
export function DeleteAgentResources(
    clientDelegationV2Client,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.DeleteAgentResources(
            queryParams,
            body,
            labels,
        ),
        "DeleteAgentResources",
    );

    /** @type {Array<ResourceDelegationDto>} */
    let delegations = [];

    const succeed = check(res, {
        "DeleteAgentResources - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "DeleteAgentResources - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
