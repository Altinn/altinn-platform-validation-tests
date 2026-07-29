import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Replaces a transmission on a dialog.
 *
 * PUT /dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {uuidv7} transmissionId - id of the transmission
 * @param {V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest} request - the transmission to store
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse - the response, which has no body on success
 */
export function UpdateTransmission(
    serviceOwnerApiClient,
    dialogId,
    transmissionId,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PutTransmission(
        dialogId,
        transmissionId,
        request,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "UpdateTransmission - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}
