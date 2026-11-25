import http from "k6/http";

import { requestParams } from "../common/request.js";

const TAGS = {
    LockDataElement: {
        action: "lock-data-element",
    },
    UnlockDataElement: {
        action: "unlock-data-element",
    },
};

class DataLockClient {
    /**
     * Creates a client for the DataLock API.
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
     * Locks a data element. Answers 200 when it was already locked, 201 when
     * this call locked it.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}/lock
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    LockDataElement(instanceOwnerPartyId, instanceGuid, dataGuid, labels = null) {
        return http.put(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}/lock`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}/lock`,
                action: TAGS.LockDataElement.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Unlocks a data element.
     *
     * DELETE /instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}/lock
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {string} dataGuid Data element UUID.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UnlockDataElement(instanceOwnerPartyId, instanceGuid, dataGuid, labels = null) {
        return http.del(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/data/${dataGuid}/lock`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/data/{dataGuid}/lock`,
                action: TAGS.UnlockDataElement.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { DataLockClient };
