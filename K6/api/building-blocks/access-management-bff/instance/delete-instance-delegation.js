import { check } from "k6";

import { InstanceClient } from "../../../../../clients/access-management-bff/instance/index.js";

/**
 * Revokes a delegated instance.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {DeleteInstanceDelegationQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteInstanceDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the instance delegation was revoked.
 */
export function DeleteInstanceDelegation(
    instanceClient,
    queryParams = null,
    labels = null,
) {
    const res = instanceClient.DeleteInstanceDelegation(queryParams, labels);

    let revoked = false;

    const succeed = check(res, {
        "DeleteInstanceDelegation - status code is 200": (r) =>
            r.status === 200,
        "DeleteInstanceDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
