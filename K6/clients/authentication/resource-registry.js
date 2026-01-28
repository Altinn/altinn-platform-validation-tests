import http from "k6/http";
import { URL } from "../../common-imports.js";
import { getDefaultResourceBody, getDefaultPolicyXml, buildPolicy } from "./resource-templates.js";

class ResourceRegistryApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
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

    PostResource(id, org, orgCode) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token"; 
        const url = new URL(`${this.FULL_PATH}`);
        const body = getDefaultResourceBody(id, org, orgCode);

        const params = {
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        return http.post(url.toString(), JSON.stringify(body), params);
    }

    PostPolicy(resourceId, rules = null) {
        const token = this.tokenGenerator ? this.tokenGenerator.getToken() : "no token"; 
        const url = new URL(`${this.FULL_PATH}${resourceId}/policy`);
        let xml = "";
        if (rules) {
            xml = buildPolicy(rules, resourceId);
        } else {
            xml = getDefaultPolicyXml(resourceId);
        }

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
