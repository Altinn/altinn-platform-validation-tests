import http from "k6/http";

import { requestParams } from "../../common/request.js";

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
        return http.get(
            `${this.FULL_PATH}/orgdata`,
            requestParams({
                endpoint: `${this.FULL_PATH}/orgdata`,
                action: TAGS.GetOrgData.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { AltinnCdnClient };
