import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { V1ServiceOwnerDialogsQueriesGetActivity_Activity, V1ServiceOwnerDialogsQueriesSearchActivities_Activity } from "../../../../clients/dialogporten/serviceowner/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Function to get dialog activities
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get activities for
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {V1ServiceOwnerDialogsQueriesSearchActivities_Activity[]} Parsed response body, or an empty array when the call failed.
 */
export function GetDialogActivities(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.GetDialogActivities(
            dialogId,
            labels,
        ),
        "GetDialogActivities",
    );

    /** @type {V1ServiceOwnerDialogsQueriesSearchActivities_Activity[]} */
    let activities = [];

    const success = check(res, {
        "GetDialogActivities - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return activities;
    }

    check(res, {
        "GetDialogActivities - body is valid": (r) => {
            try {
                activities = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return activities;
}

/**
 * Function to get a dialog activity by id
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} dialogId - id of the dialog the activity belongs to
 * param {string} activityId - id of the activity to get
 * @param activityId TODO: description
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {V1ServiceOwnerDialogsQueriesGetActivity_Activity|null} Parsed response body, or null when the call failed.
 */
export function GetDialogActivity(
    serviceOwnerApiClient,
    dialogId,
    activityId,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.GetDialogActivity(
            dialogId,
            activityId,
            labels,
        ),
        "GetDialogActivity",
    );

    /** @type {V1ServiceOwnerDialogsQueriesGetActivity_Activity|null} */
    let activity = null;

    const success = check(res, {
        "GetDialogActivity - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return activity;
    }

    check(res, {
        "GetDialogActivity - body is valid": (r) => {
            try {
                activity = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return activity;
}
