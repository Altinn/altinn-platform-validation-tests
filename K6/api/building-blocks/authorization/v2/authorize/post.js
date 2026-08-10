import { check } from "k6";

import { AuthorizeClient } from "../../../../../clients/authorization/v2/authorize.js";

/**
 * Authorizes an external XACML request.
 *
 * POST /authorize
 *
 * @param {AuthorizeClient} authorizeClient Client for the Authorize API.
 * @param {XacmlJsonRequestRootExternal} request Authorization request.
 * @param {string} [expectedDecision] Expected XACML decision, e.g. Permit, Deny
 * or NotApplicable. The decision is only checked when this is set.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {XacmlJsonResponseExternal|null} Authorization response.
 */
export function AuthorizePost(
    authorizeClient,
    request,
    expectedDecision = null,
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

    const parsed = check(res, {
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

    if (parsed && expectedDecision !== null) {
        check(response, {
            [`AuthorizePost - decision is ${expectedDecision}`]: (b) =>
                b?.response?.[0]?.decision === expectedDecision,
        });
    }

    return response;
}
