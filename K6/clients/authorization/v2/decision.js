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
        this.BASE_PATH = "";

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
     * @param {XacmlRequestApiModel} request
     * @param {{[key:string]:string}} [labels]
     * @returns {http.RefinedResponse}
     */
    DecisionPost(request, labels = null) {
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

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * External authorization endpoint.
     *
     * @param {XacmlJsonRequestRootExternal} request
     * @param {{[key:string]:string}} [labels]
     * @returns {http.RefinedResponse}
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
            },
        });
    }
}

export {
    DecisionClient,
};
