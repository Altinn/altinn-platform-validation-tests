import http from "k6/http";

import { uuidv4 } from "../../../common-imports.js";
import { getActivityBody, getDialogBody, getDialogBodyWithoutTransmissionsAndActivities, getTransmissionBody } from "./request-body-templates.js";

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
};

class ServiceOwnerApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
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
    * @param { string } dialogId
    * @param { string } conditionType
    * @param { string } activityType
    * @param { string } transmissionId
    * @returns http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsCommandsCreate_Dialog
     * * @param { Object } requestBody
     * * @param { string } label
     * * @returns http.RefinedResponse
     */

    PostDialog(
        partyId,
        serviceResource,
        serviceOwner,
        labels = null,
        noTransmissionsActivities = false,
        title = null,
        otherResource = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        let tags = {
            endpoint: url.toString(),
            action: TAGS.PostDialog.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
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
     * @param { string } dialogId
     * @param { string } label
     * @returns http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        const requestBody = getTransmissionBody();
        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(requestBody), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsCommandsCreate_Activity
     * @param { string } dialogId
     * @param { string } label
     * @returns http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        const requestBody = getActivityBody();
        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.post(url.toString(), JSON.stringify(requestBody), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearch_Dialog
     * @param  queryParams - object containing query parameters for the request
     * @returns http.RefinedResponse
     */

    GetDialogs(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, value);
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGet_Dialog
     * @param { string } dialogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchActivities_DialogActivity
     * @param { string } dialogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetActivity_DialogActivity
     * @param { string } dialogId
     * @param { string } activityId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabel_ServiceOwnerLabel
    * @param { string } dialogId
    * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
    * @return http.RefinedResponse
    */
    GetServiceOwnerLabels(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `dialogs/${dialogId}/context/labels`);

        let tags = {
            endpoint: this.FULL_PATH + "dialogs/dialogId/context/labels",
            name: this.FULL_PATH + "dialogs/dialogId/context/labels",
            action: TAGS.GetServiceOwnerLabels.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchSeenLogs_DialogSeenLog
     * @param { string } dialogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetSeenLog_DialogSeenLog
     * @param { string } dialogId
     * @param { string } seenLogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchTransmissions_DialogTransmission
     * @param { string } dialogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesGetTransmission_DialogTransmission
     * @param { string } dialogId
     * @param { string } transmissionId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }
        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContext
     * @param  queryParams - object containing query parameters for the request
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetEndUserContext(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs/endusercontext");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, value);
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * https://altinn-dev-api.azure-api.net/dialogporten/swagger/index.html#/Serviceowner/V1ServiceOwnerDialogLookupQueriesGet_DialogLookup
     * @param  queryParams - object containing query parameters for the request
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetDialogLookup(
        queryParams,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialoglookup");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value) url.searchParams.append(key, value);
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
            headers: {
                Authorization: "Bearer " + token,
                "Accept": "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }
}

export { ServiceOwnerApiClient };
