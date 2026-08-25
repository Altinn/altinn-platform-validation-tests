import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { V1EndUserDialogsQueriesGetSeenLog_SeenLog, V1EndUserDialogsQueriesSearchSeenLogs_SeenLog } from "../../../../clients/dialogporten/enduser/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialog seen log
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get seen log for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1EndUserDialogsQueriesSearchSeenLogs_SeenLog[]} Parsed response body, or an empty array when the call failed.
 */
export function GetDialogSeenLogs(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetDialogSeenLogs(
            dialogId,
            labels,
        ),
        "GetDialogSeenLogs",
    );

    /** @type {V1EndUserDialogsQueriesSearchSeenLogs_SeenLog[]} */
    let seenLogs = [];

    const success = check(res, {
        "GetDialogSeenLog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return seenLogs;
    }

    check(res, {
        "GetDialogSeenLogs - body is valid": (r) => {
            try {
                seenLogs = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return seenLogs;
}

/**
 * Function to get dialog seen log entry
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog the seen log entry belongs to
 * param {string} seenLogEntryId - id of the seen log entry to get
 * @param seenLogEntryId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1EndUserDialogsQueriesGetSeenLog_SeenLog|null} Parsed response body, or null when the call failed.
 */
export function GetDialogSeenLog(
    enduserApiClient,
    dialogId,
    seenLogEntryId,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetDialogSeenLog(
            dialogId,
            seenLogEntryId,
            labels,
        ),
        "GetDialogSeenLog",
    );

    /** @type {V1EndUserDialogsQueriesGetSeenLog_SeenLog|null} */
    let seenLog = null;

    const success = check(res, {
        "GetDialogSeenLogEntry - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return seenLog;
    }

    check(res, {
        "GetDialogSeenLog - body is valid": (r) => {
            try {
                seenLog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return seenLog;
}
