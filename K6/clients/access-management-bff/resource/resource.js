import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceOwners(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/resourceowners`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/resourceowners`,
            name: `${this.FULL_PATH}/resourceowners`,
            action: TAGS.GetResourceOwners.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets a single resource.
     *
     * @param {GetResourceQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetResourceQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResource(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetResource.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Searches the resources a party can delegate.
     *
     * @param {SearchResourcesQuery|null} [query] Optional query parameters. Prefer
     * using {@link SearchResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SearchResources(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/search`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/search`,
            name: `${this.FULL_PATH}/search`,
            action: TAGS.SearchResources.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { ResourceClient };
