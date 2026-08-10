import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Replaces a dialog.
 *
 * PUT /dialogs/{dialogId}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {V1ServiceOwnerDialogsCommandsUpdate_Dialog} request - the dialog to store
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function UpdateDialog(
    serviceOwnerApiClient,
    dialogId,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PutDialog(
        dialogId,
        request,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "UpdateDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Applies a JSON Patch document to a dialog.
 *
 * PATCH /dialogs/{dialogId}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {JsonPatchOperations_Operation[]} operations - the patch operations to apply
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function PatchDialog(
    serviceOwnerApiClient,
    dialogId,
    operations,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PatchDialog(
        dialogId,
        operations,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "PatchDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Deletes a dialog.
 *
 * DELETE /dialogs/{dialogId}
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function DeleteDialog(
    serviceOwnerApiClient,
    dialogId,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.DeleteDialog(
        dialogId,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "DeleteDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
