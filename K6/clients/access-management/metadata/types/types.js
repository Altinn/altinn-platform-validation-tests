import http from "k6/http";

const TAGS = {
    TypesGetOrganizationSubTypes: {
        action: "types-get-organization-sub-types",
    },
};

class TypesClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
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
        this.BASE_PATH = "/accessmanagement/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets organization sub types.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    TypesGetOrganizationSubTypes(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/types/organization/subtypes`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.TypesGetOrganizationSubTypes.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export { TypesClient };
