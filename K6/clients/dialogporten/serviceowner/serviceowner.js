import http from "k6/http";

import { URL } from "../../../common-imports.js";
import { uuidv4 } from "../../../common-imports.js";
import { getActivityBody, getDialogBody, getDialogBodyWithoutTransmissionsAndActivities, getTransmissionBody } from "./request-body-templates.js";
import { JsonPatchOperations_Operation, V1ServiceOwnerDialogsCommandsUpdate_Dialog, V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest, V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel, V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest, V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label } from "./types.js";

const TAGS = {
    GetDialogsQueriesNotificationCondition: { action: "get-dialogs-queries-notification-condition" },
    PostDialog: { action: "post-dialog" },
    PostTransmission: { action: "post-transmission" },
    PostActivity: { action: "post-activity" },
    GetDialogs: { action: "get-dialogs" },
    GetDialog: { action: "get-dialog" },
    GetDialogActivities: { action: "get-dialog-activities" },
    GetDialogActivity: { action: "get-dialog-activity" },
    GetServiceOwnerLabels: { action: "get-service-owner-labels" },
    GetDialogSeenLogs: { action: "get-dialog-seen-logs" },
    GetDialogSeenLog: { action: "get-dialog-seen-log" },
    GetDialogTransmissions: { action: "get-dialog-transmissions" },
    GetDialogTransmission: { action: "get-dialog-transmission" },
    GetEndUserContext: { action: "get-end-user-context" },
    GetDialogLookup: { action: "get-dialog-lookup" },
    PutDialog: { action: "put-dialog" },
    PatchDialog: { action: "patch-dialog" },
    DeleteDialog: { action: "delete-dialog" },
    PutTransmission: { action: "put-transmission" },
    PurgeDialog: { action: "purge-dialog" },
    RestoreDialog: { action: "restore-dialog" },
    FreezeDialog: { action: "freeze-dialog" },
    PostServiceOwnerLabels: { action: "post-service-owner-labels" },
    DeleteServiceOwnerLabel: { action: "delete-service-owner-label" },
    PutEndUserContextSystemLabels: { action: "put-end-user-context-system-labels" },
    PostBulkSetSystemLabels: { action: "post-bulk-set-system-labels" },
};

class ServiceOwnerApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
     */
    constructor(
        baseUrl,
        tokenGenerator
    ) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/dialogporten/api/v1/serviceowner";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/dialogporten/api/v1/serviceowner";
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition
     *
     * @param { string } dialogId TODO: description
     * @param { string } conditionType TODO: description
     * @param { string } activityType TODO: description
     * @param { string } transmissionId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogsQueriesNotificationCondition(
        dialogId,
        conditionType,
        activityType,
        transmissionId,
        labels = null
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs" + `/${dialogId}` + "/actions/should-send-notification");

        url.searchParams.append("conditionType", conditionType);
        url.searchParams.append("activityType", activityType);
        url.searchParams.append("transmissionId", transmissionId);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/actions/should-send-notification",
            name: this.FULL_PATH + "/dialogs/dialogId/actions/should-send-notification",
            action: TAGS.GetDialogsQueriesNotificationCondition.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsCommandsCreate_Dialog
     *
     * @param {string} partyId - either a pid/ssn (11 digits) or an org number (9 digits)
     * @param {string} serviceResource - the service resource for the dialog
     * @param {string} serviceOwner - the org number of the service owner
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @param {boolean} [noTransmissionsActivities] - whether to leave transmissions and activities out of the body
     * @returns http.RefinedResponse<"text">
     */

    PostDialog(
        partyId,
        serviceResource,
        serviceOwner,
        labels = null,
        noTransmissionsActivities = false,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs",
            name: this.FULL_PATH + "/dialogs",
            action: TAGS.PostDialog.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        let requestBody = null;
        if (!noTransmissionsActivities) {
            requestBody = getDialogBody(partyId, serviceResource, serviceOwner);
        } else {
            requestBody = getDialogBodyWithoutTransmissionsAndActivities(partyId, serviceResource, serviceOwner);
        }
        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }
        return http.post(url.toString(), JSON.stringify(requestBody), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsCommandsCreate_Transmission
     *
     * @param {string} dialogId - id of the dialog the transmission belongs to
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */

    PostTransmission(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/transmissions`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions",
            name: this.FULL_PATH + "/dialogs/dialogId/transmissions",
            action: TAGS.PostTransmission.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        const requestBody = getTransmissionBody();
        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(requestBody), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsCommandsCreate_Activity
     *
     * @param {string} dialogId - id of the dialog the activity belongs to
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */

    PostActivity(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/activities`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/activities",
            name: this.FULL_PATH + "/dialogs/dialogId/activities",
            action: TAGS.PostActivity.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        const requestBody = getActivityBody();
        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(requestBody), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearch_Dialog
     *
     * @param {{[x: string]: string}} queryParams - object containing query parameters for the request
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDialogs(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, String(value));
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs",
            name: this.FULL_PATH + "/dialogs",
            action: TAGS.GetDialogs.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGet_Dialog
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialog(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId",
            name: this.FULL_PATH + "/dialogs/dialogId",
            action: TAGS.GetDialog.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchActivities_DialogActivity
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogActivities(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/activities`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/activities",
            name: this.FULL_PATH + "/dialogs/dialogId/activities",
            action: TAGS.GetDialogActivities.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetActivity_DialogActivity
     *
     * @param { string } dialogId TODO: description
     * @param { string } activityId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogActivity(
        dialogId,
        activityId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/activities/${activityId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/activities/activityId",
            name: this.FULL_PATH + "/dialogs/dialogId/activities/activityId",
            action: TAGS.GetDialogActivity.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabel_ServiceOwnerLabel
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetServiceOwnerLabels(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/context/labels`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/context/labels",
            name: this.FULL_PATH + "/dialogs/dialogId/context/labels",
            action: TAGS.GetServiceOwnerLabels.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchSeenLogs_DialogSeenLog
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogSeenLogs(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/seenlog`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/seenlog",
            name: this.FULL_PATH + "/dialogs/dialogId/seenlog",
            action: TAGS.GetDialogSeenLogs.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetSeenLog_DialogSeenLog
     *
     * @param { string } dialogId TODO: description
     * @param { string } seenLogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogSeenLog(
        dialogId,
        seenLogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/seenlog/${seenLogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/seenlog/seenLogId",
            name: this.FULL_PATH + "/dialogs/dialogId/seenlog/seenLogId",
            action: TAGS.GetDialogSeenLog.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchTransmissions_DialogTransmission
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogTransmissions(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/transmissions`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions",
            name: this.FULL_PATH + "/dialogs/dialogId/transmissions",
            action: TAGS.GetDialogTransmissions.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetTransmission_DialogTransmission
     *
     * @param { string } dialogId TODO: description
     * @param { string } transmissionId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogTransmission(
        dialogId,
        transmissionId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/transmissions/${transmissionId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions/transmissionId",
            name: this.FULL_PATH + "/dialogs/dialogId/transmissions/transmissionId",
            action: TAGS.GetDialogTransmission.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }
        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContext
     *
     * @param {{[x: string]: string}} queryParams - object containing query parameters for the request
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetEndUserContext(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs/endusercontext");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, String(value));
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/endusercontext",
            name: this.FULL_PATH + "/dialogs/endusercontext",
            action: TAGS.GetEndUserContext.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogLookupQueriesGet_DialogLookup
     *
     * @param {{[x: string]: string}} queryParams - object containing query parameters for the request
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDialogLookup(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialoglookup");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, String(value));
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialoglookup",
            name: this.FULL_PATH + "/dialoglookup",
            action: TAGS.GetDialogLookup.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * Replaces a dialog.
     *
     * PUT /dialogs/{dialogId}
     *
     * @param {string} dialogId - id of the dialog
     * @param {V1ServiceOwnerDialogsCommandsUpdate_Dialog} request - the dialog to store
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PutDialog(dialogId, request, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}",
            name: this.FULL_PATH + "/dialogs/{dialogId}",
            action: TAGS.PutDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.put(url.toString(), JSON.stringify(request), params);
    }

    /**
     * Applies a JSON Patch document to a dialog.
     *
     * PATCH /dialogs/{dialogId}
     *
     * @param {string} dialogId - id of the dialog
     * @param {JsonPatchOperations_Operation[]} operations - the patch operations to apply
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PatchDialog(dialogId, operations, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}",
            name: this.FULL_PATH + "/dialogs/{dialogId}",
            action: TAGS.PatchDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.patch(url.toString(), JSON.stringify(operations), params);
    }

    /**
     * Deletes a dialog.
     *
     * DELETE /dialogs/{dialogId}
     *
     * @param {string} dialogId - id of the dialog
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    DeleteDialog(dialogId, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}",
            name: this.FULL_PATH + "/dialogs/{dialogId}",
            action: TAGS.DeleteDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.del(url.toString(), null, params);
    }

    /**
     * Replaces a transmission on a dialog.
     *
     * PUT /dialogs/{dialogId}/transmissions/{transmissionId}
     *
     * @param {string} dialogId - id of the dialog
     * @param {string} transmissionId - id of the transmission
     * @param {V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest} request - the transmission to store
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PutTransmission(dialogId, transmissionId, request, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/transmissions/${transmissionId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/transmissions/{transmissionId}",
            name: this.FULL_PATH + "/dialogs/{dialogId}/transmissions/{transmissionId}",
            action: TAGS.PutTransmission.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.put(url.toString(), JSON.stringify(request), params);
    }

    /**
     * Purges a dialog, deleting it permanently.
     *
     * POST /dialogs/{dialogId}/actions/purge
     *
     * @param {string} dialogId - id of the dialog
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PurgeDialog(dialogId, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/actions/purge`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/actions/purge",
            name: this.FULL_PATH + "/dialogs/{dialogId}/actions/purge",
            action: TAGS.PurgeDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), null, params);
    }

    /**
     * Restores a soft deleted dialog.
     *
     * POST /dialogs/{dialogId}/actions/restore
     *
     * @param {string} dialogId - id of the dialog
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    RestoreDialog(dialogId, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/actions/restore`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/actions/restore",
            name: this.FULL_PATH + "/dialogs/{dialogId}/actions/restore",
            action: TAGS.RestoreDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), null, params);
    }

    /**
     * Freezes a dialog, making it read only.
     *
     * POST /dialogs/{dialogId}/actions/freeze
     *
     * @param {string} dialogId - id of the dialog
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    FreezeDialog(dialogId, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/actions/freeze`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/actions/freeze",
            name: this.FULL_PATH + "/dialogs/{dialogId}/actions/freeze",
            action: TAGS.FreezeDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), null, params);
    }

    /**
     * Adds service owner labels to a dialog.
     *
     * POST /dialogs/{dialogId}/context/labels
     *
     * @param {string} dialogId - id of the dialog
     * @param {V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label} request - the label to add
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PostServiceOwnerLabels(dialogId, request, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/context/labels`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/context/labels",
            name: this.FULL_PATH + "/dialogs/{dialogId}/context/labels",
            action: TAGS.PostServiceOwnerLabels.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(request), params);
    }

    /**
     * Removes a service owner label from a dialog.
     *
     * DELETE /dialogs/{dialogId}/context/labels/{label}
     *
     * @param {string} dialogId - id of the dialog
     * @param {string} label - the label to remove
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    DeleteServiceOwnerLabel(dialogId, label, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/context/labels/${label}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/context/labels/{label}",
            name: this.FULL_PATH + "/dialogs/{dialogId}/context/labels/{label}",
            action: TAGS.DeleteServiceOwnerLabel.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.del(url.toString(), null, params);
    }

    /**
     * Sets the end user system labels of a dialog.
     *
     * PUT /dialogs/{dialogId}/endusercontext/systemlabels
     *
     * @param {string} dialogId - id of the dialog
     * @param {V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest} request - labels to add and remove
     * @param {string|null} [enduserId] - the end user to act on behalf of
     * @param {string|null} [ifMatch] - revision to send as the If-Match header, for concurrency control
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PutEndUserContextSystemLabels(dialogId, request, enduserId = null, ifMatch = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/endusercontext/systemlabels`);

        if (enduserId != null) {
            url.searchParams.append("enduserId", enduserId);
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/{dialogId}/endusercontext/systemlabels",
            name: this.FULL_PATH + "/dialogs/{dialogId}/endusercontext/systemlabels",
            action: TAGS.PutEndUserContextSystemLabels.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (ifMatch != null) {
            params.headers["If-Match"] = ifMatch;
        }

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.put(url.toString(), JSON.stringify(request), params);
    }

    /**
     * Sets the end user system labels of several dialogs in one request.
     *
     * POST /dialogs/endusercontext/systemlabels/actions/bulkset
     *
     * @param {V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel} request - dialogs and the labels to add and remove
     * @param {string|null} [enduserId] - the end user to act on behalf of
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PostBulkSetSystemLabels(request, enduserId = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs/endusercontext/systemlabels/actions/bulkset");

        if (enduserId != null) {
            url.searchParams.append("enduserId", enduserId);
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/endusercontext/systemlabels/actions/bulkset",
            name: this.FULL_PATH + "/dialogs/endusercontext/systemlabels/actions/bulkset",
            action: TAGS.PostBulkSetSystemLabels.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: /** @type {{[key: string]: string}} */ ({
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            }),
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(request), params);
    }
}

export { ServiceOwnerApiClient };
