import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialog seen log
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get seen log for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogSeenLogs(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogSeenLogs(
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
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog the seen log entry belongs to
 * param {string} seenLogEntryId - id of the seen log entry to get
 * @param seenLogEntryId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns TODO: description
 */
export function GetDialogSeenLog(
    enduserApiClient,
    dialogId,
    seenLogEntryId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogSeenLog(
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
