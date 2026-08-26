import http from "k6/http";

const TAGS = {
    GetOrgData: {
        action: "get-org-data",
    },
};

/**
 * Client for the Altinn CDN endpoints of the Access Management BFF API.
 */
class AltinnCdnClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/cdn";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the organisation data the Altinn CDN publishes, keyed by org code.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetOrgData(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/orgdata`);

        let tags = {
            endpoint: `${this.FULL_PATH}/orgdata`,
            name: `${this.FULL_PATH}/orgdata`,
            action: TAGS.GetOrgData.action,
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

export { AltinnCdnClient };
