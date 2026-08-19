import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { withRetries } from "../../common/retry.js";

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
 * @returns {boolean} Whether the call succeeded.
 */
export function SetEndUserContextSystemLabels(
    serviceOwnerApiClient,
    dialogId,
    request,
    enduserId = null,
    ifMatch = null,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.PutEndUserContextSystemLabels(
            dialogId,
            request,
            enduserId,
            ifMatch,
            labels,
        ),
        "SetEndUserContextSystemLabels",
    );

    const success = check(res, {
        "SetEndUserContextSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
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
 * @returns {boolean} Whether the call succeeded.
 */
export function BulkSetEndUserContextSystemLabels(
    serviceOwnerApiClient,
    request,
    enduserId = null,
    labels = null,
) {
    const res = withRetries(
        () => serviceOwnerApiClient.PostBulkSetSystemLabels(
            request,
            enduserId,
            labels,
        ),
        "BulkSetEndUserContextSystemLabels",
    );

    const success = check(res, {
        "BulkSetEndUserContextSystemLabels - status code MUST be 204": (res) => res.status == 204,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);
    }

    return success;
}
