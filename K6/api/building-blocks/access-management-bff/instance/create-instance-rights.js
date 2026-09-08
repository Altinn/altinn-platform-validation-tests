import { check } from "k6";

import { InstanceRightsDelegationDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";
import { CreateInstanceRightsQuery } from "../../../../clients/access-management-bff/instance/instance.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Delegates rights on an instance to a person.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {CreateInstanceRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateInstanceRightsQueryBuilder}.
 * @param {InstanceRightsDelegationDto|null} [body] The person and the rights
 * to delegate. Use {@link InstanceRightsDelegationDtoBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were delegated.
 */
export function CreateInstanceRights(
    instanceClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceClient.CreateInstanceRights(queryParams, body, labels),
        "CreateInstanceRights",
    );

    let delegated = false;

    const succeed = check(res, {
        "CreateInstanceRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegated;
    }

    delegated = true;

    return delegated;
}
