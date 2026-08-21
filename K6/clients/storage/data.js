import http from "k6/http";

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
     * @param {string} dataType Data type id the element belongs to.
     * @param {Array<string>} refs Ids of related data elements.
     * @param {string} generatedFromTask Task the element was generated from.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateData(instanceOwnerPartyId, instanceGuid, body, dataType = null, refs = null, generatedFromTask = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data`);

        if (dataType !== null) {
            url.searchParams.append("dataType", dataType);
        }

        if (refs !== null) {
            url.searchParams.append("refs", refs);
        }

        if (generatedFromTask !== null) {
            url.searchParams.append("generatedFromTask", generatedFromTask);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data`,
            action: TAGS.CreateData.action,
        };

        return http.post(url.toString(), body, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/octet-stream",
            },
        });
    }

    /**
     * Downloads the content of a data element.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetData(instanceOwnerPartyId, instanceGuid, dataGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            action: TAGS.GetData.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
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
     * @param {Array<string>} refs Ids of related data elements.
     * @param {string} generatedFromTask Task the element was generated from.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateData(instanceOwnerPartyId, instanceGuid, dataGuid, body, refs = null, generatedFromTask = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`);

        if (refs !== null) {
            url.searchParams.append("refs", refs);
        }

        if (generatedFromTask !== null) {
            url.searchParams.append("generatedFromTask", generatedFromTask);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            action: TAGS.UpdateData.action,
        };

        return http.put(url.toString(), body, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/octet-stream",
            },
        });
    }

    /**
     * Deletes a data element.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {boolean} delay Whether to delay the delete until the instance is deleted.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteData(instanceOwnerPartyId, instanceGuid, dataGuid, delay = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}`);

        if (delay !== null) {
            url.searchParams.append("delay", delay);
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}`,
            action: TAGS.DeleteData.action,
        };

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the data elements of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDataElements(instanceOwnerPartyId, instanceGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements`,
            action: TAGS.GetDataElements.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateDataElement(instanceOwnerPartyId, instanceGuid, dataGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements/${dataGuid}`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}`,
            action: TAGS.UpdateDataElement.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
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
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateFileScanStatus(instanceOwnerPartyId, instanceGuid, dataGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/dataelements/${dataGuid}/filescanstatus`;

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}/filescanstatus`,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/dataelements/{dataGuid}/filescanstatus`,
            action: TAGS.UpdateFileScanStatus.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }
}

export { DataClient };
