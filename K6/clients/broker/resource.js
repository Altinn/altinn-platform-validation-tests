import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import { ResourceExt } from "./resource.types.js";

const TAGS = {
    GetResource: {
        action: "get-resource",
    },
    PutResource: {
        action: "put-resource",
    },
};

class ResourceClient {
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
        this.BASE_PATH = "/broker/api/v1/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets information about a broker resource configuration.
     *
     * @param {string} resourceId Resource identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResource(resourceId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${resourceId}`,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Configures a broker resource.
     *
     * @param {string} resourceId Resource identifier.
     * @param {ResourceExt} request
     * Resource configuration. Prefer using
     * {@link ResourceRequestBuilder} to construct this object.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PutResource(resourceId, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${resourceId}`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.PutResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { ResourceClient };
