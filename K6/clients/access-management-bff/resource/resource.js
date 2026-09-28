import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { GetResourceOwnersQuery, GetResourceQuery, SearchResourcesQuery } from "./resource.types.js";

const TAGS = {
    GetResourceOwners: {
        action: "get-resource-owners",
    },
    GetResource: {
        action: "get-resource",
    },
    SearchResources: {
        action: "search-resources",
    },
};

/**
 * Client for the resource endpoints of the Access Management BFF API.
 */
class ResourceClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
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
        this.BASE_PATH = "/accessmanagement/api/v1/resources";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the resource owners that have delegable resources.
     *
     * @param {GetResourceOwnersQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetResourceOwnersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceOwners(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resourceowners`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resourceowners`,
                action: TAGS.GetResourceOwners.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single resource.
     *
     * @param {GetResourceQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetResourceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResource(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Searches the resources a party can delegate.
     *
     * @param {SearchResourcesQuery|null} [query] Optional query parameters. Prefer
     * using {@link SearchResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SearchResources(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/search`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/search`,
                action: TAGS.SearchResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ResourceClient };
