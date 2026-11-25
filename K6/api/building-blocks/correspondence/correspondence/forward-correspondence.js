import { check } from "k6";

import { ForwardCorrespondenceRequestExt } from "../../../../clients/correspondence/correspondence.types.js";
import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Forwards a correspondence to an email address.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence identifier.
 * @param {ForwardCorrespondenceRequestExt} request Forwarding payload.
 * Prefer using {@link ForwardCorrespondenceRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the forwarding request succeeded.
 */
export function ForwardCorrespondence(
    correspondenceClient,
    correspondenceId,
    request,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.ForwardCorrespondence(correspondenceId, request, labels),
        "ForwardCorrespondence",
    );

    // Swagger documents 200 without a response schema for this operation.
    const succeeded = check(res, {
        "ForwardCorrespondence - status code is 200": (r) => r.status === 200,
    });

    if (!succeeded) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeeded;
}
