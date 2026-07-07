import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Function to get dialog tranmissions
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog to get transmissions for
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogTransmissions(
    enduserApiClient,
    dialogId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogTransmissions(
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
 *
 * @param {EnduserApiClient} enduserApiClient TODO: description
 * @param {string} dialogId - id of the dialog the transmission belongs to
 * param {string} transmissionId - id of the transmission to get
 * @param transmissionId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns response body of the request
 */
export function GetDialogTransmission(
    enduserApiClient,
    dialogId,
    transmissionId,
    labels = null,
) {
    const res = enduserApiClient.GetDialogTransmission(
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
