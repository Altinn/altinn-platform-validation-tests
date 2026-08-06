import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to create a dialog for a party
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {string} partyId - either a pid/ssn (11 digits) or a organization number (9 digits)
 * @param {string} serviceResource - the service resource for the dialog
 * @param {string} serviceOwner - the service owner for the dialog. an organization nunber (9 digits)
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @param noTransmissionsActivities TODO: description
 * @returns {string|null} Parsed response body, or null when the call failed.
 */
export function CreateDialog(
    serviceOwnerApiClient,
    partyId,
    serviceResource,
    serviceOwner,
    labels = null,
    noTransmissionsActivities = false,
) {
    const res = serviceOwnerApiClient.PostDialog(
        partyId,
        serviceResource,
        serviceOwner,
        labels,
        noTransmissionsActivities,
    );

    /** @type {string|null} */
    let dialogId = null;

    const success = check(res, {
        "CreateDialog - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return dialogId;
    }

    check(res, {
        "CreateDialog - body is valid": (r) => {
            try {
                dialogId = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return dialogId;
}

/**
 * Create a transmission for a dialog
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {uuidv7} dialogId - the id of the dialog to create the transmission for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {string|null} Parsed response body, or null when the call failed.
 */
export function CreateTransmission(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.PostTransmission(
        dialogId,
        labels,
    );

    /** @type {string|null} */
    let transmissionId = null;

    const success = check(res, {
        "CreateTransmission - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return transmissionId;
    }

    check(res, {
        "CreateTransmission - body is valid": (r) => {
            try {
                transmissionId = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return transmissionId;
}

/**
 * Create an activity for a dialog
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param {uuidv7} dialogId - the id of the dialog to create the activity for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {string|null} Parsed response body, or null when the call failed.
 */
export function CreateActivity(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.PostActivity(
        dialogId,
        labels,
    );

    /** @type {string|null} */
    let activityId = null;

    const success = check(res, {
        "CreateActivity - status code MUST be 201": (res) => res.status == 201,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return activityId;
    }

    check(res, {
        "CreateActivity - body is valid": (r) => {
            try {
                activityId = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return activityId;
}
