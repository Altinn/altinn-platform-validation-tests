import http from "k6/http";

const TAGS = {
    ResourceV2GetPolicyRights: {
        action: "resource-v2-get-policy-rights",
    },
};

class ResourceV2Client {
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
        this.BASE_PATH = "/resourceregistry/api/v2/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the policy rights for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {Object|null} [query]
     * Optional query parameters.
     * @param {boolean} [query.includeServiceOwnerRights]
     * @param {boolean} [query.includeAppRights]
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ResourceV2GetPolicyRights(
        id,
        query = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/${encodeURIComponent(id)}/policy/rights`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
                    return;
                }

                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                );
            });

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ResourceV2GetPolicyRights.action,
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

export { ResourceV2Client };
