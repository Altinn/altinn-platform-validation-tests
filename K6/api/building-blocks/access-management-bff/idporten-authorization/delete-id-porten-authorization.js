import { check } from "k6";

import { IdPortenAuthorizationClient } from "../../../../clients/access-management-bff/idporten-authorization/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes an ID-porten authorization.
 *
 * @param {IdPortenAuthorizationClient} idPortenAuthorizationClient Client for
 * the ID-porten authorization endpoints.
 * @param {string} id Authorization identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the authorization was deleted.
 */
export function DeleteIdPortenAuthorization(
    idPortenAuthorizationClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => idPortenAuthorizationClient.DeleteIdPortenAuthorization(
            id,
            labels,
        ),
        "DeleteIdPortenAuthorization",
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteIdPortenAuthorization - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
