import http from "k6/http";
import { URL } from "../../commonImports.js";

class ResourceRegistryApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     */
    constructor(
        baseUrl
    ) {
        /**
        *
        * @property {string} BASE_PATH The path to the api without host information
        */
        this.BASE_PATH = "/resourceregistry/api/v1/resource/updated";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
        /**
         * @property {string} baseUrl The base URL for validation
         */
        this.baseUrl = baseUrl;
    }

    /**
    * Get Updated Resources
    * @param {string} since ISO 8601 timestamp, e.g. 2000-01-01T01:00:00.000Z
    * @param {number} limit Number of resources to return per page
    * @param {string|null} label Label for the request
    * @returns http.RefinedResponse
    */
    GetUpdatedResources(since, limit, label = null) {
        const url = new URL(`${this.FULL_PATH}`);
        url.searchParams.append("since", since);
        url.searchParams.append("limit", limit);

        let nameTag = label ? label : url.pathname;
        const params = {
            tags: { name: nameTag },
            headers: {
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
}

export { ResourceRegistryApiClient };
