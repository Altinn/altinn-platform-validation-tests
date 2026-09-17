import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { SignRequest } from "./instances.types.js";

const TAGS = {
    SignInstance: {
        action: "sign-instance",
    },
};

class SignClient {
    /**
     * Creates a client for the Sign API.
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
     * Creates a signature for data elements of an instance.
     *
     * POST /instances/{instanceOwnerPartyId}/{instanceGuid}/sign
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {SignRequest} request Signature request.
     * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SignInstance(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/sign`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/sign`,
                action: TAGS.SignInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { SignClient };
