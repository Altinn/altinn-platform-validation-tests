import { check } from "k6";
import http from "k6/http";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Exports all resources as RDF.
 *
 * Hands back the response rather than a parsed entity, because this is a
 * download: the media type is part of what the test checks, and the body is RDF
 * and not JSON.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse<"text">|null} The response, or null when the call failed.
 */
export function ResourceExport(
    resourceClient,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceExport(labels),
        "ResourceExport",
    );

    const succeed = check(res, {
        "ResourceExport - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return null;
    }

    const hasBody = check(res, {
        "ResourceExport - body is present": (r) =>
            typeof r.body === "string" && r.body.length > 0,
    });

    if (!hasBody) {
        return null;
    }

    return res;
}
