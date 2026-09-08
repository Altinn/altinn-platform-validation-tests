import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest } from "../../../../clients/dialogporten/serviceowner/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Replaces a transmission on a dialog.
 *
 * PUT /dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {string} dialogId - id of the dialog
 * @param {string} transmissionId - id of the transmission
 * @param {V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest} request - the transmission to store
 * @param {string|null} [ifMatch] - revision to send as the If-Match header
 * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function UpdateTransmission(
    serviceOwnerApiClient,
    dialogId,
    transmissionId,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.PutTransmission(
            dialogId,
            transmissionId,
            request,
            ifMatch,
            labels,
        ),
        "UpdateTransmission",
    );

    const success = check(res, {
        "UpdateTransmission - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
