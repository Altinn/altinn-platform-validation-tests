import { check } from "k6";

import { InstanceClient } from "../../../../../clients/access-management-bff/instance/index.js";

/**
 * Delegates rights on an instance to a person.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {CreateInstanceRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateInstanceRightsQueryBuilder}.
 * @param {InstanceRightsDelegationDto|null} [body] The person and the rights
 * to delegate. Use {@link InstanceRightsDelegationDtoBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were delegated.
 */
export function CreateInstanceRights(
    instanceClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = instanceClient.CreateInstanceRights(queryParams, body, labels);

    let delegated = false;

    const succeed = check(res, {
        "CreateInstanceRights - status code is 200": (r) =>
            r.status === 200,
        "CreateInstanceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegated;
    }

    delegated = true;

    return delegated;
}
