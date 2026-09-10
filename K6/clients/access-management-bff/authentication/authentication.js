import http from "k6/http";

import { URL } from "../../../common-imports.js";

const TAGS = {
    RefreshToken: {
        action: "refresh-token",
    },
};

/**
 * Client for the authentication endpoints of the Access Management BFF API.
 */
class AuthenticationClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/authentication";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Refreshes the authentication cookie of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RefreshToken(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/refresh`);

        let tags = {
            endpoint: `${this.FULL_PATH}/refresh`,
            name: `${this.FULL_PATH}/refresh`,
            action: TAGS.RefreshToken.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { AuthenticationClient };
