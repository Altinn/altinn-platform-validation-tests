import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { XacmlJsonRequestRootExternal, XacmlRequestApiModel } from "./types.js";

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
     * @param {{[key:string]:string}|null} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DecisionPost(request, contentType = "application/json", labels = null) {
        const body = typeof request === "string"
            ? request
            : jsonBody(request);

        return http.post(
            `${this.FULL_PATH}/decision`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/decision`,
                action: TAGS.DecisionPost.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Content-Type": contentType },
            }),
        );
    }

    /**
     * External authorization endpoint.
     *
     * POST /authorize
     *
     * @param {XacmlJsonRequestRootExternal} request Authorization request.
     * @param {{[key:string]:string}|null} [labels]
     * Optional k6 tags that will be merged with the default request tags.
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
            }),
        );
    }
}

export {
    DecisionClient,
};
