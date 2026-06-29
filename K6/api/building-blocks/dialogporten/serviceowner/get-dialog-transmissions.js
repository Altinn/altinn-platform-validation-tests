import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Function to get dialog tranmissions
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog to get transmissions for
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogTransmissions(
    serviceOwnerApiClient,
    dialogId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogTransmissions(
        dialogId,
        labels,
    );

    const success = check(res, {
        "GetDialogTransmissions - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}

/**
 * Function to get a dialog transmission by id
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient
 * @param {string} dialogId - id of the dialog the transmission belongs to
 * param {string} transmissionId - id of the transmission to get
 * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
 * @return response body of the request
 */
export function GetDialogTransmission(
    serviceOwnerApiClient,
    dialogId,
    transmissionId,
    labels = null,
) {
    const res = serviceOwnerApiClient.GetDialogTransmission(
        dialogId,
        transmissionId,
        labels,
    );

    const success = check(res, {
        "GetDialogTransmission - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res.body;
}
