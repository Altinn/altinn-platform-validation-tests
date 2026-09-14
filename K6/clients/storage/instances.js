import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { DataValues, Instance, PresentationTexts, Substatus } from "./instances.types.js";

const TAGS = {
    QueryInstances: {
        action: "query-instances",
    },
    CreateInstance: {
        action: "create-instance",
    },
    GetInstanceByGuid: {
        action: "get-instance-by-guid",
    },
    GetInstance: {
        action: "get-instance",
    },
    DeleteInstance: {
        action: "delete-instance",
    },
    CompleteInstance: {
        action: "complete-instance",
    },
    UpdateDataValues: {
        action: "update-data-values",
    },
    UpdatePresentationTexts: {
        action: "update-presentation-texts",
    },
    UpdateReadStatus: {
        action: "update-read-status",
    },
    UpdateSubStatus: {
        action: "update-sub-status",
    },
};

class InstancesClient {
    /**
     * Creates a client for the Instances API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/storage/api/v1";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Queries instances across applications.
     *
     * GET /instances
     *
     * @param {{[key: string]: *}|null} [query] Query parameters, e.g. org, appId, process.currentTask, instanceOwner.partyId, continuationToken, size, order and includeDataElements.
     * @param {string|null} [instanceOwnerIdentifier] Value for the X-Ai-InstanceOwnerIdentifier header.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    QueryInstances(query = null, instanceOwnerIdentifier = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/instances`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances`,
                action: TAGS.QueryInstances.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "X-Ai-InstanceOwnerIdentifier": instanceOwnerIdentifier },
            }),
        );
    }

    /**
     * Creates an instance of an application.
     *
     * POST /instances
     *
     * @param {Instance} request Instance to create.
     * @param {string|null} [appId] Application id, e.g. ttd/my-app.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstance(request, appId = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/instances`, { appId }),
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances`,
                action: TAGS.CreateInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets an instance by its guid alone.
     *
     * GET /instances/{instanceGuid}
     *
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceByGuid(instanceGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/instances/${instanceGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceGuid}`,
                action: TAGS.GetInstanceByGuid.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstance(instanceOwnerPartyId, instanceGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
                action: TAGS.GetInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes an instance. Responds with 200 and the instance, or 204 when hard deleted.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {boolean|null} [hard] Whether to hard delete the instance.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteInstance(instanceOwnerPartyId, instanceGuid, hard = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}`, { hard }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}`,
                action: TAGS.DeleteInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Marks an instance as completely confirmed by the application owner.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/complete
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CompleteInstance(instanceOwnerPartyId, instanceGuid, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/complete`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/complete`,
                action: TAGS.CompleteInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Replaces the data values of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/datavalues
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {DataValues} request Data values to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateDataValues(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/datavalues`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/datavalues`,
                action: TAGS.UpdateDataValues.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Replaces the presentation texts of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/presentationtexts
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {PresentationTexts} request Presentation texts to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdatePresentationTexts(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/presentationtexts`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/presentationtexts`,
                action: TAGS.UpdatePresentationTexts.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Sets the read status of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/readstatus
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string|null} [status] Read status to set, e.g. Read or Unread.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateReadStatus(instanceOwnerPartyId, instanceGuid, status = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/readstatus`, { status }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/readstatus`,
                action: TAGS.UpdateReadStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Sets the substatus of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/substatus
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {Substatus} request Substatus to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateSubStatus(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/substatus`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/substatus`,
                action: TAGS.UpdateSubStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { InstancesClient };
