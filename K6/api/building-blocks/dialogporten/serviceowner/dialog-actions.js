import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Purges a dialog, deleting it permanently.
 *
 * POST /dialogs/{dialogId}/actions/purge
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function PurgeDialog(
    serviceOwnerApiClient,
    dialogId,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PurgeDialog(
        dialogId,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "PurgeDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Restores a soft deleted dialog.
 *
 * POST /dialogs/{dialogId}/actions/restore
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function RestoreDialog(
    serviceOwnerApiClient,
    dialogId,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.RestoreDialog(
        dialogId,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "RestoreDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Freezes a dialog, making it read only.
 *
 * POST /dialogs/{dialogId}/actions/freeze
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function FreezeDialog(
    serviceOwnerApiClient,
    dialogId,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.FreezeDialog(
        dialogId,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "FreezeDialog - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
