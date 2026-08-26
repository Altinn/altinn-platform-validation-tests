import { check } from "k6";

import { AgentClientAccessPackagesQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { DelegationBatchInputDto, DelegationDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Delegates access packages on a client to an agent.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {AgentClientAccessPackagesQuery} queryParams
 * Query parameters. Use {@link AgentClientAccessPackagesQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body]
 * Request body. Use {@link DelegationBatchInputBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DelegationDto>} The delegations that were created.
 */
export function CreateAgentAccessPackages(
    clientDelegationClient,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.CreateAgentAccessPackages(
            queryParams,
            body,
            labels,
        ),
        "CreateAgentAccessPackages",
    );

    /** @type {Array<DelegationDto>} */
    let delegations = [];

    const succeed = check(res, {
        "CreateAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "CreateAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "CreateAgentAccessPackages - body is valid": (r) => {
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
