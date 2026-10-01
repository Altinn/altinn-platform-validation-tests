import { check } from "k6";

import { InstanceLockClient } from "../../../clients/storage/index.js";
import { InstanceLockRequest, InstanceLockResponse } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Attempts to acquire a lock for an instance.
 *
 * Not retried: if the first attempt took the lock but its response was lost,
 * a retry would answer 409 and fail the check for a lock the caller holds.
 *
 * @param {InstanceLockClient} instanceLockClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {InstanceLockRequest} request How long the lock should live.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {InstanceLockResponse|null} The lock token, or null when the call failed.
 */
export function LockInstance(
    instanceLockClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = instanceLockClient.LockInstance(
        instanceOwnerPartyId,
        instanceGuid,
        request,
        labels,
    );

    /** @type {InstanceLockResponse|null} */
    let lock = null;

    const success = check(res, {
        "LockInstance - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return lock;
    }

    check(res, {
        "LockInstance - body is valid": (r) => {
            try {
                lock = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return lock;
}

/**
 * Updates the TTL of an instance lock.
 *
 * @param {InstanceLockClient} instanceLockClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} lockToken The lock token from LockInstance.
 * @param {InstanceLockRequest} request The new TTL.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the call succeeded.
 */
export function ExtendInstanceLock(
    instanceLockClient,
    instanceOwnerPartyId,
    instanceGuid,
    lockToken,
    request,
    labels = null,
) {
    const res = withRetries(
        () => instanceLockClient.ExtendInstanceLock(
            instanceOwnerPartyId,
            instanceGuid,
            lockToken,
            request,
            labels,
        ),
        "ExtendInstanceLock",
    );

    const success = check(res, {
        "ExtendInstanceLock - status code is 204": (r) => r.status === 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
