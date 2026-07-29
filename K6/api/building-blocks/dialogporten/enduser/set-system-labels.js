import { check } from "k6";

import { EnduserApiClient } from "../../../../clients/dialogporten/enduser/index.js";

/**
 * Sets the system labels of a dialog for the end user.
 *
 * PUT /dialogs/{dialogId}/context/systemlabels
 *
 * @param {EnduserApiClient} enduserApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest} request - labels to add and remove
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function SetDialogSystemLabels(
    enduserApiClient,
    dialogId,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = enduserApiClient.PutDialogSystemLabels(
        dialogId,
        request,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "SetDialogSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}

/**
 * Sets the system labels of several dialogs for the end user.
 *
 * POST /dialogs/context/systemlabels/actions/bulkset
 *
 * @param {EnduserApiClient} enduserApiClient - client to interact with the API
 * @param {V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel} request - dialogs and the labels to add and remove
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {boolean} Whether the call succeeded.
 */
export function BulkSetDialogSystemLabels(
    enduserApiClient,
    request,
    ifMatch = null,
    labels = null,
) {
    const res = enduserApiClient.PostBulkSetSystemLabels(
        request,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "BulkSetDialogSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
