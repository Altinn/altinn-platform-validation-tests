import { check } from "k6";

import { IdPortenAuthorizationClient } from "../../../../clients/access-management-bff/idporten-authorization/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the ID-porten authorizations of the authenticated user.
 *
 * @param {IdPortenAuthorizationClient} idPortenAuthorizationClient Client for
 * the ID-porten authorization endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The authorizations. The API does not publish a schema
 * for this response.
 */
export function GetIdPortenAuthorizations(
    idPortenAuthorizationClient,
    labels = null,
) {
    const res = withRetries(
        () => idPortenAuthorizationClient.GetIdPortenAuthorizations(labels),
        "GetIdPortenAuthorizations",
    );

    /** @type {object|null} */
    let authorizations = null;

    const succeed = check(res, {
        "GetIdPortenAuthorizations - status code is 200": (r) =>
            r.status === 200,
        "GetIdPortenAuthorizations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return authorizations;
    }

    check(res, {
        "GetIdPortenAuthorizations - body is valid": (r) => {
            try {
                authorizations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return authorizations;
}
