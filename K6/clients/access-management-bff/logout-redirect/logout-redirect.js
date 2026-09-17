import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetLogoutRedirect: {
        action: "get-logout-redirect",
    },
};

/**
 * Client for the logout redirect endpoint of the Access Management BFF API.
 */
class LogoutRedirectClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/logoutredirect";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the logout redirect target.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetLogoutRedirect(labels = null) {
        return http.get(
            `${this.FULL_PATH}`,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetLogoutRedirect.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { LogoutRedirectClient };
