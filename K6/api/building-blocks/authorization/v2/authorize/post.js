import { check } from "k6";

import { AuthorizeClient } from "../../../../clients/authorize/index.js";

/**
 * Authorizes an external XACML request.
 *
 * @param {AuthorizeClient} authorizeClient Client for the Authorize API.
 * @param {XacmlJsonRequestRootExternal} request Authorization request.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {XacmlJsonResponseExternal|null} Authorization response.
 */
export function AuthorizePost(
    authorizeClient,
    request,
    labels = null,
) {
    const res = authorizeClient.AuthorizePost(
        request,
        labels,
    );

    /** @type {XacmlJsonResponseExternal|null} */
    let response = null;

    const succeed = check(res, {
        "AuthorizePost - status code is 200": (r) =>
            r.status === 200,
        "AuthorizePost - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return response;
    }

    check(res, {
        "AuthorizePost - body is valid": (r) => {
            try {
                response = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return response;
}
