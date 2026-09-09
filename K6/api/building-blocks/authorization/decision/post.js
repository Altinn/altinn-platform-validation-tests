import { check } from "k6";

import { DecisionClient } from "../../../../clients/authorization/decision.js";
import { XacmlJsonResponseExternal, XacmlRequestApiModel } from "../../../../clients/authorization/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Sends an internal XACML authorization request.
 *
 * POST /decision
 *
 * @param {DecisionClient} decisionClient Client for the Decision API.
 * @param {XacmlRequestApiModel|string} request Decision request.
 * @param {string|null} [expectedDecision] Expected XACML decision, e.g. Permit, Deny
 * or NotApplicable. The decision is only checked when this is set.
 * @param {string} [contentType] Content type of the request body.
 * @param {{[key: string]: string}|null} [labels]
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
    const res = withRetries(
        () => decisionClient.DecisionPost(
            request,
            contentType,
            labels,
        ),
        "DecisionPost",
    );

    /** @type {XacmlJsonResponseExternal|null} */
    let response = null;

    const succeed = check(res, {
        "DecisionPost - status code is 200": (r) =>
            r.status === 200,
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
        // response is filled in from inside the check callback above, which the
        // compiler cannot follow, so the type is restated here.
        const decided = /** @type {XacmlJsonResponseExternal|null} */ (response);

        check(decided, {
            [`DecisionPost - decision is ${expectedDecision}`]: (b) =>
                b?.response?.[0]?.decision === expectedDecision,
        });
    }

    return response;
}
