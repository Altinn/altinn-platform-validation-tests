import { check } from "k6";

import { ProcessClient } from "../../../clients/storage/index.js";

/**
 * Replaces the process state of an instance.
 *
 * @param {ProcessClient} processClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {ProcessState} request Process state to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdateProcessState(
    processClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = processClient.UpdateProcessState(
        instanceOwnerPartyId,
        instanceGuid,
        request,
        labels,
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdateProcessState - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdateProcessState - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}

/**
 * Gets the process history of an instance.
 *
 * @param {ProcessClient} processClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {ProcessHistoryList|null} Parsed response body, or null when the call failed.
 */
export function GetProcessHistory(
    processClient,
    instanceOwnerPartyId,
    instanceGuid,
    labels = null,
) {
    const res = processClient.GetProcessHistory(
        instanceOwnerPartyId,
        instanceGuid,
        labels,
    );

    /** @type {ProcessHistoryList|null} */
    let processHistory = null;

    const success = check(res, {
        "GetProcessHistory - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return processHistory;
    }

    check(res, {
        "GetProcessHistory - body is valid": (r) => {
            try {
                processHistory = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return processHistory;
}

/**
 * Replaces the process state of an instance and adds the given events.
 *
 * @param {ProcessClient} processClient Client for the API.
 * @param {number} instanceOwnerPartyId Instance owner party id.
 * @param {string} instanceGuid Instance UUID.
 * @param {ProcessStateUpdate} request Process state and events to store.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Instance|null} Parsed response body, or null when the call failed.
 */
export function UpdateProcessStateAndEvents(
    processClient,
    instanceOwnerPartyId,
    instanceGuid,
    request,
    labels = null,
) {
    const res = processClient.UpdateProcessStateAndEvents(
        instanceOwnerPartyId,
        instanceGuid,
        request,
        labels,
    );

    /** @type {Instance|null} */
    let instance = null;

    const success = check(res, {
        "UpdateProcessStateAndEvents - status code is 200": (r) => r.status === 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return instance;
    }

    check(res, {
        "UpdateProcessStateAndEvents - body is valid": (r) => {
            try {
                instance = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return instance;
}
