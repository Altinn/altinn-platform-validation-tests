import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetOrganization: {
        action: "get-organization",
    },
    GetPartyForAuthenticatedUser: {
        action: "get-party-for-authenticated-user",
    },
};

/**
 * Client for the lookup endpoints of the Access Management BFF API.
 */
class LookupClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/lookup";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Looks up a party by organisation number.
     *
     * @param {string} orgNummer Organisation number.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetOrganization(orgNummer, labels = null) {
        return http.get(
            `${this.FULL_PATH}/org/${orgNummer}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/org/{orgNummer}`,
                action: TAGS.GetOrganization.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the party of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPartyForAuthenticatedUser(labels = null) {
        return http.get(
            `${this.FULL_PATH}/party/user`,
            requestParams({
                endpoint: `${this.FULL_PATH}/party/user`,
                action: TAGS.GetPartyForAuthenticatedUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { LookupClient };
