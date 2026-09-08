import { check } from "k6";

import { CreateAgentQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { AssignmentDto, ValidatePersonInput } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds an agent to a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {ValidatePersonInput|null} [body] The person to add as agent, when
 * they are identified by national identity number. Use
 * {@link ValidatePersonInputBuilder}.
 * @param {CreateAgentQuery|null} [queryParams] Optional query parameters. Use
 * {@link CreateAgentQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentDto|null} The created assignment.
 */
export function CreateAgent(
    clientDelegationsClient,
    body = null,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.CreateAgent(body, queryParams, labels),
        "CreateAgent",
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateAgent - status code is 200": (r) =>
            r.status === 200,
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
