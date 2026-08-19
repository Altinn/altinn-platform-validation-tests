import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds service owner labels to a dialog.
 *
 * POST /dialogs/{dialogId}/context/labels
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label} request - the label to add
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function AddServiceOwnerLabels(
    serviceOwnerApiClient,
    dialogId,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.PostServiceOwnerLabels(
            dialogId,
            request,
            ifMatch,
            labels,
        ),
        "AddServiceOwnerLabels",
    );

    const success = check(res, {
        "AddServiceOwnerLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Removes a service owner label from a dialog.
 *
 * DELETE /dialogs/{dialogId}/context/labels/{label}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {string} label - the label to remove
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function RemoveServiceOwnerLabel(
    serviceOwnerApiClient,
    dialogId,
    label,
    ifMatch = null,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.DeleteServiceOwnerLabel(
            dialogId,
            label,
            ifMatch,
            labels,
        ),
        "RemoveServiceOwnerLabel",
    );

    const success = check(res, {
        "RemoveServiceOwnerLabel - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
