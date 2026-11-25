import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request labels.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    AuthorizePost(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/authorize`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/authorize`,
                action: TAGS.AuthorizePost.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                headers: { "Ocp-Apim-Subscription-Key": this.subscriptionKey },
            }),
        );
    }
}

export {
    AuthorizeClient,
};
