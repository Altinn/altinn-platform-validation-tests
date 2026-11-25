import { check } from "k6";

import { DataLockClient } from "../../../clients/storage/index.js";
import { DataElement } from "../../../clients/storage/instances.types.js";
import { withRetries } from "../common/retry.js";

/**
 * Locks a data element. 200 means it was already locked, 201 that this call
 * locked it; both carry the data element.
 *
 * @param {DataLockClient} dataLockClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function LockDataElement(
    dataLockClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    labels = null,
) {
    const res = withRetries(
        () => dataLockClient.LockDataElement(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            labels,
        ),
        "LockDataElement",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "LockDataElement - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "LockDataElement - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}

/**
 * Unlocks a data element.
 *
 * @param {DataLockClient} dataLockClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {string} dataGuid Data element UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {DataElement|null} Parsed response body, or null when the call failed.
 */
export function UnlockDataElement(
    dataLockClient,
    instanceOwnerPartyId,
    instanceGuid,
    dataGuid,
    labels = null,
) {
    const res = withRetries(
        () => dataLockClient.UnlockDataElement(
            instanceOwnerPartyId,
            instanceGuid,
            dataGuid,
            labels,
        ),
        "UnlockDataElement",
    );

    /** @type {DataElement|null} */
    let dataElement = null;

    const success = check(res, {
        "UnlockDataElement - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dataElement;
    }

    check(res, {
        "UnlockDataElement - body is valid": (r) => {
            try {
                dataElement = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dataElement;
}
