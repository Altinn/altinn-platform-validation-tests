import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { ServiceOwnerInitializeExt } from "./service-owner.types.js";

const TAGS = {
    InitializeServiceOwner: {
        action: "initialize-service-owner",
    },
    GetServiceOwner: {
        action: "get-service-owner",
    },
};

class ServiceOwnerClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/broker/api/v1/serviceowner";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Initializes the service owner for the calling organization within the broker service.
     *
     * @param {ServiceOwnerInitializeExt} request
     * Service owner initialization request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeServiceOwner(request, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.InitializeServiceOwner.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the service owner for the calling organization within the broker service.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">}
     * Service owner overview information.
     */
    GetServiceOwner(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetServiceOwner.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }
}

export { ServiceOwnerClient };
