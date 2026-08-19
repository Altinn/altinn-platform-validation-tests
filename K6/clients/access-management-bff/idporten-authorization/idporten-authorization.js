import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetIdPortenAuthorizations(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetIdPortenAuthorizations.action,
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

    /**
     * Deletes an ID-porten authorization.
     *
     * @param {string} id Authorization identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteIdPortenAuthorization(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${id}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
            action: TAGS.DeleteIdPortenAuthorization.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }
}

export { IdPortenAuthorizationClient };
