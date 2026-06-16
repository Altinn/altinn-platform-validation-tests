import { check } from "k6";
import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialog activities
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get activities for
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogActivities(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogActivities(
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
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog the activity belongs to
 * param {string} activityId - id of the activity to get
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogActivity(
    serviceOwnerApiClient,
    dialogId,
    activityId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogActivity(
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
