import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialog activities
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get activities for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogActivities(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogActivities(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogActivities - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get a dialog activity by id
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog the activity belongs to
 * param {string} activityId - id of the activity to get
 * @param activityId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogActivity(
    enduserApiClient,
    dialogId,
    activityId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogActivity(
        dialogId,
        activityId,
        labels,
    );

    const success = check(res, {
        "GetDialogActivity - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
