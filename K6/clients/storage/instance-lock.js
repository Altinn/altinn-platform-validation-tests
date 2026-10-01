import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { InstanceLockRequest } from "./instances.types.js";

const TAGS = {
    LockInstance: {
        action: "lock-instance",
    },
    ExtendInstanceLock: {
        action: "extend-instance-lock",
    },
};

class InstanceLockClient {
    /**
     * Creates a client for the InstanceLock API.
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
     * Attempts to acquire a lock for an instance. The response carries the
     * lock token the other lock calls take.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/lock
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {InstanceLockRequest} request How long the lock should live.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    LockInstance(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/lock`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/lock`,
                action: TAGS.LockInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates the TTL of an instance lock. Answers 204.
     *
     * PATCH /instances/{instanceOwnerPartyId}/{instanceGuid}/lock
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {InstanceLockRequest} request The new TTL.
     * @param {string|null} [lockToken] The lock token from LockInstance, sent as `Altinn-Storage-Lock-Token`.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ExtendInstanceLock(instanceOwnerPartyId, instanceGuid, request, lockToken = null, labels = null) {
        return http.patch(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/lock`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/lock`,
                action: TAGS.ExtendInstanceLock.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                headers: { "Altinn-Storage-Lock-Token": lockToken },
            }),
        );
    }
}

export { InstanceLockClient };
