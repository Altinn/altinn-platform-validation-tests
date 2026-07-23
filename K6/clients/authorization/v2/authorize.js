import http from "k6/http";

const TAGS = {
    AuthorizePost: {
        action: "authorize-post",
    },
};

class AuthorizeClient {
    /**
     * @param {string} baseUrl Base URL.
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
        this.BASE_PATH = "/authorize";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Authorizes an external XACML request.
     *
     * @param {XacmlJsonRequestRootExternal} request Authorization request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request labels.
     * @returns {http.RefinedResponse}
     */
    AuthorizePost(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.AuthorizePost.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }
}

export {
    AuthorizeClient,
};
