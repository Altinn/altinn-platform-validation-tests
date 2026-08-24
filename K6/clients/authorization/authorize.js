import http from "k6/http";

import { XacmlJsonRequestRootExternal } from "./types.js";

const TAGS = {
    AuthorizePost: {
        action: "authorize-post",
    },
};

class AuthorizeClient {
    /**
     * @param {string} baseUrl Base URL.
     * @param {*} tokenGenerator Generates bearer tokens.
     * @param {string|null} [subscriptionKey]
     * API management subscription key. The Swagger docs do not mention it
     * because it is a gateway requirement rather than part of the API contract:
     * everything under /authorization/api/v1 on platform.<env>.altinn.no and
     * platform.<env>.altinn.cloud answers 401 without it. The header is omitted
     * when this is not set, for hosts that do not go through API management.
     */
    constructor(baseUrl, tokenGenerator, subscriptionKey = null) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * API management subscription key, or null when not needed.
         */
        this.subscriptionKey = subscriptionKey;

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
     * Authorizes an external XACML request.
     *
     * POST /authorize
     *
     * @param {XacmlJsonRequestRootExternal} request Authorization request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                ...(this.subscriptionKey !== null && {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                }),
            },
        });
    }
}

export {
    AuthorizeClient,
};
