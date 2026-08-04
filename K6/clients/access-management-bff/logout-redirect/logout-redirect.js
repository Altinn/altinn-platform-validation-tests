import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetLogoutRedirect(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetLogoutRedirect.action,
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

export { LogoutRedirectClient };
