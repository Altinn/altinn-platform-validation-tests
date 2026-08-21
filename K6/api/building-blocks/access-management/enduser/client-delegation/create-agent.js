import { check } from "k6";

import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { CreateAgentQuery } from "../../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { AssignmentDto, PersonInput } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Adds an agent to a party.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {CreateAgentQuery} queryParams
 * Query parameters. Use {@link CreateAgentQueryBuilder}.
 * @param {PersonInput|null} [body]
 * Request body. Use {@link PersonInputBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AssignmentDto|null} The created assignment.
 */
export function CreateAgent(
    clientDelegationClient,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.CreateAgent(
            queryParams,
            body,
            labels,
        ),
        "CreateAgent",
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateAgent - status code is 200": (r) =>
            r.status === 200,
        "CreateAgent - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateAgent - body is valid": (r) => {
            try {
                assignment = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignment;
}
