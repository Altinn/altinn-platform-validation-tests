import http from "k6/http";
import { URL } from "../../common-imports.js";

const TAGS = {
    GetUpdatedResources: { action: "get-updated-resources" },
    PostResource: { action: "post-resource" },
    PostPolicy: { action: "post-policy" },
};

class ResourceRegistryApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {object|null} tokenGenerator Optional. An object with a getToken()
     *   method returning a valid token. Required for the write operations
     *   (PostResource/PostPolicy); not needed for GetUpdatedResources.
     */
    constructor(
        baseUrl,
        tokenGenerator = null
    ) {
        this.tokenGenerator = tokenGenerator;
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
         * @property {string} RESOURCE_PATH Base path for a single resource, e.g.
         *   .../resourceregistry/api/v1/resource/
         */
        this.RESOURCE_PATH = baseUrl + "/resourceregistry/api/v1/resource/";
        /**
         * @property {string} baseUrl The base URL for validation
         */
        this.baseUrl = baseUrl;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
    * Get Updated Resources
    * @param {string} since ISO 8601 timestamp, e.g. 2000-01-01T01:00:00.000Z
    * @param {number} limit Number of resources to return per page
    * @param {string|null} label Label for the request
    * @returns http.RefinedResponse
    */
    GetUpdatedResources(since, limit, labels = null) {
        const url = new URL(`${this.FULL_PATH}`);
        url.searchParams.append("since", since);
        url.searchParams.append("limit", limit);

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetUpdatedResources.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Create a service resource in the Resource Registry.
     * Requires an enterprise token with scope
     * `altinn:resourceregistry/resource.admin` for the owning organization.
     * @param {object} resourceBody The full resource definition.
     * @param {string|null} label Optional tag label.
     * @returns http.RefinedResponse
     */
    PostResource(resourceBody, label = null) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token";
        const url = new URL(`${this.RESOURCE_PATH}`);
        let tags = { action: TAGS.PostResource.action, name: label ? label : url.pathname };
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url.toString(), JSON.stringify(resourceBody), params);
    }

    /**
     * Upload (PUT) the XACML policy for a resource. The policy is sent as a
     * multipart file upload (field `policyFile`).
     * Requires an enterprise token with scope
     * `altinn:resourceregistry/resource.admin` for the owning organization.
     * @param {string} resourceId The resource identifier.
     * @param {string} xml The XACML policy as an XML string.
     * @param {string|null} label Optional tag label.
     * @returns http.RefinedResponse
     */
    PostPolicy(resourceId, xml, label = null) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token";
        const url = new URL(`${this.RESOURCE_PATH}${resourceId}/policy`);
        const payload = {
            policyFile: http.file(xml, "policy.xml", "application/xml"),
        };
        let tags = { action: TAGS.PostPolicy.action, name: label ? label : url.pathname };
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.put(url.toString(), payload, params);
    }
}

export { ResourceRegistryApiClient };
