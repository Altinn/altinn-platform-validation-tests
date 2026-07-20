import http from "k6/http";

const TAGS = {
    ResourceOwnerGetOrgs: {
        action: "resource-owner-get-orgs",
    },
};

class ResourceOwnerClient {
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
        this.BASE_PATH = "/resourceregistry/api/v1/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the organization list.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceOwnerGetOrgs(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/orgs`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceOwnerGetOrgs.action,
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

export { ResourceOwnerClient };
