import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";
import { V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog } from "../../../../clients/dialogporten/enduser/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialog context label log
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get context label log for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog[]} Parsed response body, or an empty array when the call failed.
 */
export function GetDialogContextLabelLog(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = withRetries(
        () => enduserApiClient.GetDialogContextLabellog(
            dialogId,
            labels,
        ),
        "GetDialogContextLabelLog",
    );

    /** @type {V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog[]} */
    let labelAssignmentLog = [];

    const success = check(res, {
        "GetDialogContextLabelLog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return labelAssignmentLog;
    }

    check(res, {
        "GetDialogContextLabelLog - body is valid": (r) => {
            try {
                labelAssignmentLog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return labelAssignmentLog;
}
