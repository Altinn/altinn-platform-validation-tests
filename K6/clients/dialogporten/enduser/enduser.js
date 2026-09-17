import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { DialogSearchParams } from "./dialogs-search-params-builder.js";
import { V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel, V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest } from "./types.js";

const TAGS = {
    GetDialogs: { action: "get-dialogs" },
    GetDialog: { action: "get-dialog" },
    GetDialogActivities: { action: "get-dialog-activities" },
    GetDialogActivity: { action: "get-dialog-activity" },
    GetDialogSeenLogs: { action: "get-dialog-seenlogs" },
    GetDialogSeenLog: { action: "get-dialog-seenlog" },
    GetDialogTransmissions: { action: "get-dialog-transmissions" },
    GetDialogTransmission: { action: "get-dialog-transmission" },
    GetDialogContextLabellog: { action: "get-dialog-context-labellog" },
    GetParties: { action: "get-parties" },
    GetServiceResources: { action: "get-service-resources" },
    GetDialogLookup: { action: "get-dialog-lookup" },
    PutDialogSystemLabels: { action: "put-dialog-system-labels" },
    PostBulkSetSystemLabels: { action: "post-bulk-set-system-labels" },
};

class EnduserApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/dialogporten/api/v1/enduser";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/SearchDialogs
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/End/V1ServiceOwnerDialogsQueriesSearch_Dialog
     *
     * @param {DialogSearchParams} queryParams - object containing query parameters for the request
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDialogs(queryParams, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH + "/dialogs", queryParams),
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs",
                action: TAGS.GetDialogs.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialog
     *
     * @param {string} dialogId The ID of the dialog to retrieve
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns TODO: description
     */
    GetDialog(dialogId, labels = null) {
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId",
                action: TAGS.GetDialog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog activities
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogActivities
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogActivities(
        dialogId,
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/activities`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/activities",
                action: TAGS.GetDialogActivities.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog activity
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogActivity
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
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/activities/${activityId}`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/activities/activityId",
                action: TAGS.GetDialogActivity.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog seen logs
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogSeenLogs
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogSeenLogs(
        dialogId,
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/seenlog`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/seenlog",
                action: TAGS.GetDialogSeenLogs.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog seen log
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogSeenLog
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
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/seenlog/${seenLogId}`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/seenlog/seenLogId",
                action: TAGS.GetDialogSeenLog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog transmissions
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogTransmissions
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogTransmissions(
        dialogId,
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/transmissions`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions",
                action: TAGS.GetDialogTransmissions.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog transmission
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogTransmission
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
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/transmissions/${transmissionId}`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions/transmissionId",
                action: TAGS.GetDialogTransmission.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog context labellog
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogContextLabellog
     *
     * @param { string } dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogContextLabellog(
        dialogId,
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + `/dialogs/${dialogId}/context/labellog`,
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/dialogId/context/labellog",
                action: TAGS.GetDialogContextLabellog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get parties
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetParties
     *
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetParties(
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + "/parties",
            requestParams({
                endpoint: this.FULL_PATH + "/parties",
                action: "get-parties",
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get service resources
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetServiceResources
     *
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetServiceResources(
        labels = null,
    ) {
        return http.get(
            this.FULL_PATH + "/serviceresources",
            requestParams({
                endpoint: this.FULL_PATH + "/serviceresources",
                action: TAGS.GetServiceResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get dialog lookup
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogLookup
     *
     * @param {string} dialogId TODO: description
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    GetDialogLookup(
        dialogId,
        labels = null,
    ) {
        const instanceRef = `urn:altinn:dialog-id:${dialogId}`;

        return http.get(
            buildUrl(this.FULL_PATH + "/dialoglookup", { instanceRef }),
            requestParams({
                endpoint: this.FULL_PATH + "/dialoglookup",
                action: TAGS.GetDialogLookup.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Sets the system labels of a dialog for the end user.
     *
     * PUT /dialogs/{dialogId}/context/systemlabels
     *
     * @param {string} dialogId - id of the dialog to set labels on
     * @param {V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest} request - labels to add and remove
     * @param {string|null} ifMatch - revision the caller last saw, sent as If-Match so a concurrent write is rejected
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PutDialogSystemLabels(dialogId, request, ifMatch = null, labels = null) {
        return http.put(
            this.FULL_PATH + `/dialogs/${dialogId}/context/systemlabels`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/{dialogId}/context/systemlabels",
                action: TAGS.PutDialogSystemLabels.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                headers: { "If-Match": ifMatch },
            }),
        );
    }

    /**
     * Sets the system labels of several dialogs for the end user in one request.
     *
     * POST /dialogs/context/systemlabels/actions/bulkset
     *
     * @param {V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel} request - dialogs and the labels to add and remove
     * @param {string|null} ifMatch - revision the caller last saw, sent as If-Match so a concurrent write is rejected
     * @param {{[x: string]: string}|null} [labels] - Object containing request labels as key/value pairs.
     * @returns http.RefinedResponse<"text">
     */
    PostBulkSetSystemLabels(request, ifMatch = null, labels = null) {
        return http.post(
            this.FULL_PATH + "/dialogs/context/systemlabels/actions/bulkset",
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH + "/dialogs/context/systemlabels/actions/bulkset",
                action: TAGS.PostBulkSetSystemLabels.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                headers: { "If-Match": ifMatch },
            }),
        );
    }
}
export { EnduserApiClient };
