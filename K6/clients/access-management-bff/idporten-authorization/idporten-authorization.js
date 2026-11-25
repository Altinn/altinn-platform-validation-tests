import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetIdPortenAuthorizations: {
        action: "get-id-porten-authorizations",
    },
    DeleteIdPortenAuthorization: {
        action: "delete-id-porten-authorization",
    },
};

/**
 * Client for the ID-porten authorization endpoints of the Access Management
 * BFF API.
 */
class IdPortenAuthorizationClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/idportenauthorization";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the ID-porten authorizations of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIdPortenAuthorizations(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetIdPortenAuthorizations.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes an ID-porten authorization.
     *
     * @param {string} id Authorization identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteIdPortenAuthorization(id, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${id}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.DeleteIdPortenAuthorization.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { IdPortenAuthorizationClient };
