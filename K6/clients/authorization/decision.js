import http from "k6/http";

const TAGS = {
    DecisionPost: {
        action: "decision-post",
    },
    AuthorizePost: {
        action: "authorize-post",
    },
};

class DecisionClient {
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
        this.BASE_PATH = "/authorization/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Internal authorization endpoint.
     *
     * POST /decision
     *
     * @param {XacmlRequestApiModel|string} request Decision request. Objects are
     * serialized as JSON, strings are sent verbatim so that the XML variants of
     * the endpoint can be used.
     * @param {string} [contentType] Content type of the request body. The endpoint
     * accepts application/json, application/xml and text/xml.
     * @param {{[key:string]:string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DecisionPost(request, contentType = "application/json", labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/decision`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.DecisionPost.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const body = typeof request === "string"
            ? request
            : JSON.stringify(request);

        return http.post(url, body, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": contentType,
                Accept: "application/json",
            },
        });
    }

    /**
     * External authorization endpoint.
     *
     * POST /authorize
     *
     * @param {XacmlJsonRequestRootExternal} request Authorization request.
     * @param {{[key:string]:string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AuthorizePost(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/authorize`;

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
                Accept: "application/json",
            },
        });
    }
}

export {
    DecisionClient,
};
