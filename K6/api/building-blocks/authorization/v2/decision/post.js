import { check } from "k6";

import { DecisionClient } from "../../../../clients/decision/index.js";

/**
 * Sends an internal XACML authorization request.
 *
 * @param {DecisionClient} decisionClient Client for the Decision API.
 * @param {XacmlRequestApiModel} request Decision request.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse} HTTP response.
 */
export function DecisionPost(
    decisionClient,
    request,
    labels = null,
) {
    const res = decisionClient.DecisionPost(
        request,
        labels,
    );

    check(res, {
        "DecisionPost - status code is 200": (r) =>
            r.status === 200,
        "DecisionPost - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    return res;
}
