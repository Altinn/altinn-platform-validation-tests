import { check } from "k6";

import { DelegateAgentResourcesQuery, ResourceDelegationBatchInputDto, ResourceDelegationDto } from "../../../../../clients/access-management/enduser/client-delegation-v2/client-delegation-v2.types.js";
import { ClientDelegationV2Client } from "../../../../../clients/access-management/enduser/client-delegation-v2/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Delegates resources from a client to an agent.
 *
 * @param {ClientDelegationV2Client} clientDelegationV2Client Client for the v2 Client Delegation API.
 * @param {DelegateAgentResourcesQuery} queryParams Query parameters. Use DelegateAgentResourcesQueryBuilder.
 * @param {ResourceDelegationBatchInputDto|null} [body] The resources to delegate. Use ResourceDelegationBatchInputBuilder.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ResourceDelegationDto>|null} The delegations that were created, or null when the call failed. Null means nothing was written; an empty array means the call landed and changed nothing.
 */
export function DelegateAgentResources(
    clientDelegationV2Client,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationV2Client.DelegateAgentResources(
            queryParams,
            body,
            labels,
        ),
        "DelegateAgentResources",
    );

    /** @type {Array<ResourceDelegationDto>|null} */
    let delegations = null;

    const succeed = check(res, {
        "DelegateAgentResources - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "DelegateAgentResources - body is valid": (r) => {
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
