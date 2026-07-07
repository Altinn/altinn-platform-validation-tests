import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialog seen log
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get seen log for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogSeenLogs(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogSeenLogs(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogSeenLog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get dialog seen log entry
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog the seen log entry belongs to
 * @param {string} seenLogEntryId - id of the seen log entry to get
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetDialogSeenLog(
    serviceOwnerApiClient,
    dialogId,
    seenLogEntryId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogSeenLog(
        dialogId,
        seenLogEntryId,
        labels,
    );

    const success = check(res, {
        "GetDialogSeenLogEntry - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
