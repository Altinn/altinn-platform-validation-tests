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
     * @param {object | null} [query] Query parameters.
     * Optional query parameters.
     * @param {boolean} [query.includeServiceOwnerRights] Whether to include service owner rights.
     * @param {boolean} [query.includeAppRights] Whether to include app rights.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }
}

export { ResourceV2Client };
