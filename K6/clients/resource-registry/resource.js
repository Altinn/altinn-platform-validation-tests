import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { ResourceListQuery, ResourceSearchQuery, ServiceResource, UpdatedResourceSubjectsQuery } from "./types.js";

const TAGS = {
    ResourceGetResourceList: {
        action: "resource-get-resource-list",
    },
    ResourceExport: {
        action: "resource-export",
    },
    ResourceGetResource: {
        action: "resource-get-resource",
    },
    ResourceCreateResource: {
        action: "resource-create-resource",
    },
    ResourceUpdateResource: {
        action: "resource-update-resource",
    },
    ResourceDeleteResource: {
        action: "resource-delete-resource",
    },

    ResourceGetPolicy: {
        action: "resource-get-policy",
    },
    ResourceCreatePolicy: {
        action: "resource-create-policy",
    },
    ResourceUpdatePolicy: {
        action: "resource-update-policy",
    },
    ResourceGetPolicySubjects: {
        action: "resource-get-policy-subjects",
    },
    ResourceGetPolicyRules: {
        action: "resource-get-policy-rules",
    },
    ResourceGetPolicyRights: {
        action: "resource-get-policy-rights",
    },
    ResourceGetResourcesBySubjects: {
        action: "resource-get-resources-by-subjects",
    },
    ResourceSearch: {
        action: "resource-search",
    },

    ResourceUpdated: {
        action: "resource-updated",
    },

};

class ResourceClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} [tokenGenerator] Generates bearer tokens. The public endpoints
     * are readable without one.
     */
    constructor(baseUrl, tokenGenerator = null) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/resourceregistry/api/v1/resource";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets all resources.
     *
     * @param {ResourceListQuery|null} [query] Optional query parameters.
     * @param {{[key:string]:string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetResourceList(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resourcelist`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resourcelist`,
                action: TAGS.ResourceGetResourceList.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Exports all resources as RDF/XML.
     *
     * @param {{[key:string]:string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceExport(labels = null) {
        return http.get(
            `${this.FULL_PATH}/export`,
            requestParams({
                endpoint: `${this.FULL_PATH}/export`,
                action: TAGS.ResourceExport.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: "application/xml+rdf",
            }),
        );
    }

    /**
     * Gets a single resource.
     *
     * @param {string} id Resource identifier.
     * @param {{versionId?: number} | object|null} [query] Optional query parameters.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetResource(id, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${encodeURIComponent(id)}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.ResourceGetResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a resource.
     *
     * @param {ServiceResource} resource Resource payload.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceCreateResource(resource, labels = null) {
        return http.post(
            `${this.FULL_PATH}`,
            jsonBody(resource),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.ResourceCreateResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates a resource.
     *
     * @param {string} id Resource identifier.
     * @param {ServiceResource} resource Updated resource.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdateResource(id, resource, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${encodeURIComponent(id)}`,
            jsonBody(resource),
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.ResourceUpdateResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceDeleteResource(id, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${encodeURIComponent(id)}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.ResourceDeleteResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the XACML policy for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicy(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy`,
                action: TAGS.ResourceGetPolicy.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates or overwrites a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {*} policyFile XACML policy file created with http.file().
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceCreatePolicy(id, policyFile, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`,
            {
                policyFile,
            },
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy`,
                action: TAGS.ResourceCreatePolicy.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates or overwrites a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {*} policyFile XACML policy file created with http.file().
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdatePolicy(id, policyFile, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${encodeURIComponent(id)}/policy`,
            {
                policyFile,
            },
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy`,
                action: TAGS.ResourceUpdatePolicy.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets policy subjects.
     *
     * @param {string} id Resource identifier.
     * @param {{reloadFromXacml?: boolean}|null} [query] Optional query parameters.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicySubjects(id, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${encodeURIComponent(id)}/policy/subjects`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy/subjects`,
                action: TAGS.ResourceGetPolicySubjects.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets flattened policy rules for a resource.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicyRules(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${id}/policy/rules`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy/rules`,
                action: ResourceClient.TAGS.ResourceGetPolicyRules.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets rights from a resource policy.
     *
     * @param {string} id Resource identifier.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetPolicyRights(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${id}/policy/rights`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/policy/rights`,
                action: ResourceClient.TAGS.ResourceGetPolicyRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets resources connected to subjects.
     *
     * @param {Array<string>} subjects List of subjects for resource information.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceGetResourcesBySubjects(subjects, labels = null) {
        return http.post(
            `${this.FULL_PATH}/bysubjects`,
            jsonBody(subjects),
            requestParams({
                endpoint: `${this.FULL_PATH}/bysubjects`,
                action: ResourceClient.TAGS.ResourceGetResourcesBySubjects.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Searches for resources in the resource registry.
     *
     * @param {ResourceSearchQuery|null} [query] Query parameters.
     * Optional search query parameters.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceSearch(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/Search`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/Search`,
                action: ResourceClient.TAGS.ResourceSearch.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Gets the updated resources since the provided last updated time.
     *
     * @param {UpdatedResourceSubjectsQuery|null} [query] Query parameters.
     * Optional query parameters.
     * @param {{[key: string]: string}|null} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ResourceUpdated(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/updated`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/updated`,
                action: TAGS.ResourceUpdated.action,
                labels,
                // The endpoint is public, so the client may be built without a
                // token generator. That is what lets this run as a healthcheck
                // in prod.
                token: this.tokenGenerator?.getToken() || null,
            }),
        );
    }

}

export { ResourceClient };
