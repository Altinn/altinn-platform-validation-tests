import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { DataElement, FileScanStatus } from "./instances.types.js";

const TAGS = {
    CreateData: {
        action: "create-data",
    },
    GetData: {
        action: "get-data",
    },
    UpdateData: {
        action: "update-data",
    },
    DeleteData: {
        action: "delete-data",
    },
    GetDataElements: {
        action: "get-data-elements",
    },
    UpdateDataElement: {
        action: "update-data-element",
    },
    UpdateFileScanStatus: {
        action: "update-file-scan-status",
    },
};

class DataClient {
    /**
     * Creates a client for the Data API.
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
     * Uploads a new data element to an instance.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/data
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {*} body Binary file content.
     * @param {string|null} [dataType] Data type id the element belongs to.
     * @param {Array<string>|null} [refs] Ids of related data elements.
     * @param {string|null} [generatedFromTask] Task the element was generated from.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateData(instanceOwnerPartyId, instanceGuid, body, dataType = null, refs = null, generatedFromTask = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data`, {
                dataType,
                refs: refs !== null ? refs.join(",") : null,
                generatedFromTask,
            }),
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data`,
                action: TAGS.CreateData.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Content-Type": "application/octet-stream" },
            }),
        );
    }

    /**
     * Downloads the content of a data element.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetData(instanceOwnerPartyId, instanceGuid, dataGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
                action: TAGS.GetData.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Replaces the content of a data element.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {*} body Binary file content.
     * @param {Array<string>|null} [refs] Ids of related data elements.
     * @param {string|null} [generatedFromTask] Task the element was generated from.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateData(instanceOwnerPartyId, instanceGuid, dataGuid, body, refs = null, generatedFromTask = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`, {
                refs: refs !== null ? refs.join(",") : null,
                generatedFromTask,
            }),
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
                action: TAGS.UpdateData.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Content-Type": "application/octet-stream" },
            }),
        );
    }

    /**
     * Deletes a data element.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {boolean|null} [delay] Whether to delay the delete until the instance is deleted.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteData(instanceOwnerPartyId, instanceGuid, dataGuid, delay = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`, { delay }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
                action: TAGS.DeleteData.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the data elements of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDataElements(instanceOwnerPartyId, instanceGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements`,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements`,
                action: TAGS.GetDataElements.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Replaces the metadata of a data element.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {DataElement} request Data element metadata to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateDataElement(instanceOwnerPartyId, instanceGuid, dataGuid, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements/${dataGuid}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}`,
                action: TAGS.UpdateDataElement.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Sets the file scan status of a data element.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}/filescanstatus
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {FileScanStatus} request File scan status to store.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateFileScanStatus(instanceOwnerPartyId, instanceGuid, dataGuid, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements/${dataGuid}/filescanstatus`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}/filescanstatus`,
                action: TAGS.UpdateFileScanStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { DataClient };
