import http from "k6/http";

import { uuidv4 } from "../../../common-imports.js";

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
};

class EnduserApiClient {
    /**
   *
   * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
   * @param {*} tokenGenerator
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
   * @param  DialogSearchParamsBuilder - object containing query parameters for the request
   * @returns http.RefinedResponse
   */

    GetDialogs(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        for (const [key, value] of Object.entries(queryParams)) {
            if (value === undefined || value === null) continue;
            if (Array.isArray(value)) {
                for (const item of value) {
                    url.searchParams.append(key, item);
                }
            } else {
                url.searchParams.append(key, value);
            }
        }

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs",
            name: this.FULL_PATH + "/dialogs",
            action: TAGS.GetDialogs.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                Accept: "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        console.log("GetDialogs URL: " + url.toString());
        return http.get(url.toString(), params);
    }

    /**
     * Get dialog
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialog
     * @param {string} dialogId The ID of the dialog to retrieve
     * @labels {object} Optional labels to add to the request
     *
     */
    GetDialog(dialogId, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId",
            name: this.FULL_PATH + "/dialogs/dialogId",
            action: TAGS.GetDialog.action,
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                Accept: "application/json",
            },
        };

        if (__ENV.TRACE_CALL) {
            params.headers["traceparent"] = uuidv4();
        }

        return http.get(url.toString(), params);
    }

    /**
     * Get dialog activities
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogActivities
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
     * Get dialog activity
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogActivity
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
     * Get dialog seen logs
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogSeenLogs
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
     * Get dialog seen log
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogSeenLog
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
     * Get dialog transmissions
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogTransmissions
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
     * Get dialog transmission
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogTransmission
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
     * Get dialog context labellog
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogContextLabellog
     * @param { string } dialogId
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetDialogContextLabellog(
        dialogId,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + `/dialogs/${dialogId}/context/labellog`);

        let tags = {
            endpoint: this.FULL_PATH + "/dialogs/dialogId/context/labellog",
            name: this.FULL_PATH + "/dialogs/dialogId/context/labellog",
            action: TAGS.GetDialogContextLabellog.action
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
     * Get parties
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetParties
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetParties(
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/parties");

        let tags = {
            endpoint: this.FULL_PATH + "/parties",
            name: this.FULL_PATH + "/parties",
            action: "get-parties"
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
     * Get service resources
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetServiceResources
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetServiceResources(
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/serviceresources");

        let tags = {
            endpoint: this.FULL_PATH + "/serviceresources",
            name: this.FULL_PATH + "/serviceresources",
            action: TAGS.GetServiceResources.action
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
     * Get dialog lookup
     * https://platform.tt02.altinn.no/dialogporten/swagger/index.html?urls.primaryName=v1.enduser#/Enduser/GetDialogLookup
     * @param  instanceRef - instanceRef query parameter for the request
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @return http.RefinedResponse
     */
    GetDialogLookup(
        instanceRef,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialoglookup");

        url.searchParams.append("instanceRef", instanceRef);

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
export { EnduserApiClient };
