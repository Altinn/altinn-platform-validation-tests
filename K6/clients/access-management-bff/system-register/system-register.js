import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetRegisteredSystems: {
        action: "get-registered-systems",
    },
    GetRegisteredSystemRights: {
        action: "get-registered-system-rights",
    },
};

/**
 * Client for the system register endpoints of the Access Management BFF API.
 */
class SystemRegisterClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemregister";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the systems in the system register.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRegisteredSystems(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetRegisteredSystems.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the rights a registered system asks for.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRegisteredSystemRights(systemId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/rights/${systemId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/rights/{systemId}`,
                action: TAGS.GetRegisteredSystemRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { SystemRegisterClient };
