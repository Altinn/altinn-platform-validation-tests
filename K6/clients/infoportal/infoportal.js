import http from "k6/http";

import { requestParams } from "../common/request.js";

const TAGS = {
    GetAuthorizedParties: { action: "get-authorized-parties" },
    GetFavorites: { action: "get-favorites" },
    GetCurrent: { action: "get-current" },
};

class InfoPortalApiClient {
    /**
     * ApiClient for the infoportal api endpoints
     *
     * @param {string} baseUrl e.g. https://info.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
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
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/api/users";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Get authorized parties for the user
     *
     * @param {{[key: string]: string}|null} [labels] - k6 check tags
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAuthorizedParties(labels = null) {
        return http.get(
            `${this.FULL_PATH}/authorized-parties`,
            requestParams({
                endpoint: `${this.FULL_PATH}/authorized-parties`,
                action: TAGS.GetAuthorizedParties.action,
                labels,
                token: null,
                accept: null,
                json: true,
                headers: { Cookie: `AltinnStudioRuntime=${this.tokenGenerator.getToken()}` },
            }),
        );
    }

    /**
     * Get favorites for the user
     *
     * @param {{[key: string]: string}|null} [labels] - k6 check tags
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFavorites(labels = null) {
        return http.get(
            `${this.FULL_PATH}/favorites`,
            requestParams({
                endpoint: `${this.FULL_PATH}/favorites`,
                action: TAGS.GetFavorites.action,
                labels,
                token: null,
                accept: null,
                json: true,
                headers: { Cookie: `AltinnStudioRuntime=${this.tokenGenerator.getToken()}` },
            }),
        );
    }

    /**
     * Get current user info
     *
     * @param {{[key: string]: string}|null} [labels] - k6 check tags
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCurrent(labels = null) {
        return http.get(
            `${this.FULL_PATH}/current`,
            requestParams({
                endpoint: `${this.FULL_PATH}/current`,
                action: TAGS.GetCurrent.action,
                labels,
                token: null,
                accept: null,
                json: true,
                headers: { Cookie: `AltinnStudioRuntime=${this.tokenGenerator.getToken()}` },
            }),
        );
    }
}

export { InfoPortalApiClient };
