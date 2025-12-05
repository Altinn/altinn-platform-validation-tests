import http from "k6/http";
import { uuidv4 } from "../../../common-imports.js";

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
        label = null
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH + "/dialogs" + `/${dialogId}` + "/actions/should-send-notification");

        url.searchParams.append("conditionType", conditionType);
        url.searchParams.append("activityType", activityType);
        url.searchParams.append("transmissionId", transmissionId);
        let nameTag = label ? label : this.FULL_PATH + "/dialogs/dialogId/actions/should-send-notification";
        const params = {
            tags: { name: nameTag },
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
