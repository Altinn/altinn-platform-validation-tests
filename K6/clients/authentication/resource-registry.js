import http from "k6/http";
import { URL } from "../../common-imports.js";

class ResourceRegistryApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {object|null} tokenGenerator An object with a getToken() method that returns a valid token string
     */
    constructor(
        baseUrl,
        tokenGenerator = null,
    ) {

        this.tokenGenerator = tokenGenerator;
        /**
        *
        * @property {string} BASE_PATH The path to the api without host information
        */
        this.BASE_PATH = "/resourceregistry/api/v1/resource/";
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
        const url = new URL(`${this.FULL_PATH}/updated`);
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

    /**
     * Get Resource
     * @param {string} id The id of the resource, e.g. "super-simple-service"
     * @returns http.RefinedResponse
     */
    GetResource(id, label = null) {
        const url = new URL(`${this.FULL_PATH}${id}`);
        let nameTag = label ? label : url.pathname;
        const params = {
            tags: { name: nameTag },
            headers: {
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Put Resource
     * @param {string} id The id of the resource, e.g. "super-simple-service"
     * @param {*} resourceBody The body of the resource to be updated
     * @returns http.RefinedResponse
     */
    PutResource(id, resourceBody, label = null) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token"; 
        const url = new URL(`${this.FULL_PATH}${id}`);
        let nameTag = label ? label : url.pathname;
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.put(url.toString(), JSON.stringify(resourceBody), params);
    }

    /**
     * Post Resource
     * @param {string} id The id of the resource, e.g. "super-simple-service" 
     * @param {string} resourceBody The body of the resource to be created
     * @returns http.RefinedResponse
     */
    PostResource(resourceBody) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token"; 
        const url = new URL(`${this.FULL_PATH}`);

        const params = {
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        return http.post(url.toString(), JSON.stringify(resourceBody), params);
    }

    /**
     * Post Policy
     * @param {string} resourceId The id of the resource, e.g. "super-simple-service"
     * @param {xml} xml The policy xml to be uploaded
     * @returns http.RefinedResponse
     */
    PostPolicy(resourceId, xml) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token"; 
        const url = new URL(`${this.FULL_PATH}${resourceId}/policy`);

        const payload = {
          policyFile: http.file(xml, "request.xml", "application/xml"),
        };

        const params = {
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.post(url.toString(), payload, params);
    }
}

export { ResourceRegistryApiClient };
