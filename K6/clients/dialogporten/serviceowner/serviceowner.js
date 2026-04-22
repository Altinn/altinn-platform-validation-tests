import http from "k6/http";
import { uuidv4 } from "../../../common-imports.js";
import { getDialogBody, getTransmissionBody, getActivityBody, getDialogBodyWithoutTransmissionsAndActivities } from "./request-body-templates.js";

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

        let tags = { endpoint: this.FULL_PATH + "/dialogs/dialogId/actions/should-send-notification" };
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
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs");

        let tags = { endpoint: url.toString() };
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

        let tags = { endpoint: this.FULL_PATH + "/dialogs/dialogId/transmissions" };
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
            endpoint: this.FULL_PATH + "/dialogs/dialogId/activities"
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
}

export { ServiceOwnerApiClient };
