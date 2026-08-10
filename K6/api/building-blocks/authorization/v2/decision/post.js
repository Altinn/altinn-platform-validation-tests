import { check } from "k6";

import { DecisionClient } from "../../../../../clients/authorization/decision.js";

/**
 * Sends an internal XACML authorization request.
 *
 * POST /decision
 *
 * @param {DecisionClient} decisionClient Client for the Decision API.
 * @param {XacmlRequestApiModel|string} request Decision request.
 * @param {string} [expectedDecision] Expected XACML decision, e.g. Permit, Deny
 * or NotApplicable. The decision is only checked when this is set.
 * @param {string} [contentType] Content type of the request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {XacmlJsonResponseExternal|null} Decision response.
 */
export function DecisionPost(
    decisionClient,
    request,
    expectedDecision = null,
    contentType = "application/json",
    labels = null,
) {
    const res = decisionClient.DecisionPost(
        request,
        contentType,
        labels,
    );

    /** @type {XacmlJsonResponseExternal|null} */
    let response = null;

    const succeed = check(res, {
        "DecisionPost - status code is 200": (r) =>
            r.status === 200,
        "DecisionPost - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return response;
    }

    const parsed = check(res, {
        "DecisionPost - body is valid": (r) => {
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
            [`DecisionPost - decision is ${expectedDecision}`]: (b) =>
                b?.response?.[0]?.decision === expectedDecision,
        });
    }

    return response;
}
