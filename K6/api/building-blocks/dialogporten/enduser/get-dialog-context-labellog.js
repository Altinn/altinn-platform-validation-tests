import { check } from "k6";
import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialog context label log
 * @param {EnduserApiClient} enduserApiClient
 * @param {string} dialogId - id of the dialog to get context label log for
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogContextLabelLog(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogContextLabellog(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogContextLabelLog - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
