import { check } from "k6";

import { InstanceMutationsClient } from "../../../clients/storage/index.js";
import { InstanceMutationResponse } from "../../../clients/storage/instances.types.js";
import { VersionMatch } from "../../../clients/storage/version-match.js";
import { withRetries } from "../common/retry.js";

/**
 * Commits a batch of mutations for a single instance. See the client method
 * for the shape of the body, which the swagger leaves undeclared.
 *
 * The call is only retried when an idempotency key is given. A retry after a
 * lost response would otherwise apply the batch a second time, since the
 * server may have committed it before the connection failed; with the key the
 * server replays the first result instead.
 *
 * @param {InstanceMutationsClient} instanceMutationsClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {*} body The mutation batch, as k6 multipart form data or a string.
 * @param {string|null} [contentType] Content type of the body; null lets k6 set it for form data.
 * @param {VersionMatch|null} [versionMatch] Instance and process-state versions the batch is conditioned on.
 * @param {string|null} [idempotencyKey] Idempotency key; requires an expected instance version. Without it the call is made once.
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
    const call = () => instanceMutationsClient.MutateInstance(
        instanceOwnerPartyId,
        instanceGuid,
        body,
        contentType,
        versionMatch,
        idempotencyKey,
        labels,
    );
    const res = idempotencyKey !== null ? withRetries(call, "MutateInstance") : call();

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
