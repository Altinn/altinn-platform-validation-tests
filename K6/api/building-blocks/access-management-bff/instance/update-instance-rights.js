import { check } from "k6";

import { InstanceClient } from "../../../../clients/access-management-bff/instance/index.js";
import { UpdateInstanceRightsQuery } from "../../../../clients/access-management-bff/instance/instance.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Replaces the rights a party holds on an instance.
 *
 * @param {InstanceClient} instanceClient Client for the instance delegation
 * endpoints.
 * @param {UpdateInstanceRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link UpdateInstanceRightsQueryBuilder}.
 * @param {Array<string>|null} [body] Keys of the rights to keep.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were updated.
 */
export function UpdateInstanceRights(
    instanceClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceClient.UpdateInstanceRights(queryParams, body, labels),
        "UpdateInstanceRights",
    );

    let updated = false;

    const succeed = check(res, {
        "UpdateInstanceRights - status code is 200": (r) =>
            r.status === 200,
        "UpdateInstanceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return updated;
    }

    updated = true;

    return updated;
}
