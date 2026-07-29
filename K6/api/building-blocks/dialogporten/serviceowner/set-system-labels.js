import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";

/**
 * Sets the end user system labels of a dialog.
 *
 * PUT /dialogs/{dialogId}/endusercontext/systemlabels
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {uuidv7} dialogId - id of the dialog
 * @param {V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest} request - labels to add and remove
 * @param {string} enduserId - the end user to act on behalf of
 * @param {string} ifMatch - revision to send as the If-Match header
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse - the response, which has no body on success
 */
export function SetEndUserContextSystemLabels(
    serviceOwnerApiClient,
    dialogId,
    request,
    enduserId = null,
    ifMatch = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PutEndUserContextSystemLabels(
        dialogId,
        request,
        enduserId,
        ifMatch,
        labels,
    );

    const success = check(res, {
        "SetEndUserContextSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}

/**
 * Sets the end user system labels of several dialogs in one request.
 *
 * POST /dialogs/endusercontext/systemlabels/actions/bulkset
 *
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient - client to interact with the API
 * @param {V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel} request - dialogs and the labels to add and remove
 * @param {string} enduserId - the end user to act on behalf of
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns http.RefinedResponse - the response, which has no body on success
 */
export function BulkSetEndUserContextSystemLabels(
    serviceOwnerApiClient,
    request,
    enduserId = null,
    labels = null,
) {
    const res = serviceOwnerApiClient.PostBulkSetSystemLabels(
        request,
        enduserId,
        labels,
    );

    const success = check(res, {
        "BulkSetEndUserContextSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}
