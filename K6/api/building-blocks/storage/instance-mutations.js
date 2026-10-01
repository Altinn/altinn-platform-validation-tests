import { check } from "k6";

import { InstanceMutationsClient } from "../../../clients/storage/index.js";
import { InstanceMutationResponse } from "../../../clients/storage/instances.types.js";
import { VersionMatch } from "../../../clients/storage/version-match.js";
import { withRetries } from "../common/retry.js";

/**
 * Commits a batch of mutations for a single instance. See the client method
 * for the shape of the body, which the swagger leaves undeclared.
 *
 * @param {InstanceMutationsClient} instanceMutationsClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {*} body The mutation batch, as k6 multipart form data or a string.
 * @param {string|null} [contentType] Content type of the body; null lets k6 set it for form data.
 * @param {VersionMatch|null} [versionMatch] Instance and process-state versions the batch is conditioned on.
 * @param {string|null} [idempotencyKey] Idempotency key; requires an expected instance version.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {InstanceMutationResponse|null} Parsed response body, or null when the call failed.
 */
export function MutateInstance(
    instanceMutationsClient,
    instanceOwnerPartyId,
    instanceGuid,
    body,
    contentType = null,
    versionMatch = null,
    idempotencyKey = null,
    labels = null,
) {
    const res = withRetries(
        () => instanceMutationsClient.MutateInstance(
            instanceOwnerPartyId,
            instanceGuid,
            body,
            contentType,
            versionMatch,
            idempotencyKey,
            labels,
        ),
        "MutateInstance",
    );

    /** @type {InstanceMutationResponse|null} */
    let mutation = null;

    const success = check(res, {
        "MutateInstance - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return mutation;
    }

    check(res, {
        "MutateInstance - body is valid": (r) => {
            try {
                mutation = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return mutation;
}
