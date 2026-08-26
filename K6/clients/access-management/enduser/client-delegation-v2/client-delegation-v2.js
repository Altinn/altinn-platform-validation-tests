import http from "k6/http";

import { AgentResourcesQuery, ClientResourcesQuery, DelegateAgentResourcesQuery, ResourceDelegationBatchInputDto } from "./client-delegation-v2.types.js";

const TAGS = {
    GetAgentResources: {
        action: "get-agent-resources-v2",
    },
    GetClientResources: {
        action: "get-client-resources-v2",
    },
    DelegateAgentResources: {
        action: "delegate-agent-resources-v2",
    },
    DeleteAgentResources: {
        action: "delete-agent-resources-v2",
    },
};

/**
 * Client for the v2 client delegation resource endpoints.
 *
 * Only the four resource endpoints live here. The rest of v2 either mirrors v1,
 * which the v1 client already covers, or is not tested yet.
 */
class ClientDelegationV2Client {
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
        this.BASE_PATH = "/accessmanagement/api/v2/enduser/clientdelegations";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the resources delegated to an agent.
     *
     * @param {AgentResourcesQuery|null} [query] Query parameters. Prefer using AgentResourcesQueryBuilder.
     * @param {{[key: string]: string|number}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentResources(query = null, headers = null, labels = null) {
        return this.doGet("agents/resources", TAGS.GetAgentResources.action, query, headers, labels);
    }

    /**
     * Gets the resources a client has delegated.
     *
     * @param {ClientResourcesQuery|null} [query] Query parameters. Prefer using ClientResourcesQueryBuilder.
     * @param {{[key: string]: string|number}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClientResources(query = null, headers = null, labels = null) {
        return this.doGet("clients/resources", TAGS.GetClientResources.action, query, headers, labels);
    }

    /**
     * Delegates resources from a client to an agent.
     *
     * @param {DelegateAgentResourcesQuery} query Query parameters. Prefer using DelegateAgentResourcesQueryBuilder.
     * @param {ResourceDelegationBatchInputDto|null} [body] The resources to delegate. Prefer using ResourceDelegationBatchInputBuilder.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DelegateAgentResources(query, body = null, labels = null) {
        return this.doPost("agents/resources", TAGS.DelegateAgentResources.action, query, body, labels);
    }

    /**
     * Removes resources an agent was delegated.
     *
     * A POST rather than a DELETE, since the resources to remove go in the body.
     *
     * @param {DelegateAgentResourcesQuery} query Query parameters. Prefer using DelegateAgentResourcesQueryBuilder.
     * @param {ResourceDelegationBatchInputDto|null} [body] The resources to remove. Prefer using ResourceDelegationBatchInputBuilder.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentResources(query, body = null, labels = null) {
        return this.doPost("agents/resources/delete", TAGS.DeleteAgentResources.action, query, body, labels);
    }

    /**
     * Builds the url for a path, with the query appended.
     *
     * @param {string} path Path below the base path.
     * @param {object|null} query Query parameters, or null for none.
     * @returns {URL} The url to call.
     */
    buildUrl(path, query) {
        const url = new URL(`${this.FULL_PATH}/${path}`);

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

        return url;
    }

    /**
     * Builds the k6 tags for a request.
     *
     * The endpoint and name tags leave the query out, so every call to the same
     * endpoint aggregates into one row rather than one row per party.
     *
     * @param {string} path Path below the base path.
     * @param {string} action The action tag for the endpoint.
     * @param {{[key: string]: string}|null} labels Extra labels, or null for none.
     * @returns {{[key: string]: string}} The tags to send.
     */
    buildTags(path, action, labels) {
        const tags = {
            endpoint: `${this.FULL_PATH}/${path}`,
            name: `${this.FULL_PATH}/${path}`,
            action,
        };

        return labels !== null ? { ...labels, ...tags } : tags;
    }

    /**
     * Sends a GET to one of the read endpoints.
     *
     * @param {string} path Path below the base path.
     * @param {string} action The action tag for the endpoint.
     * @param {object|null} query Query parameters.
     * @param {{[key: string]: string|number}|null} headers Extra request headers.
     * @param {{[key: string]: string}|null} labels Extra k6 labels.
     * @returns {http.RefinedResponse<"text">} The response.
     */
    doGet(path, action, query, headers, labels) {
        const token = this.tokenGenerator.getToken();

        return http.get(this.buildUrl(path, query).toString(), {
            tags: this.buildTags(path, action, labels),
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...(headers ?? {}),
            },
        });
    }

    /**
     * Sends a POST to one of the write endpoints.
     *
     * @param {string} path Path below the base path.
     * @param {string} action The action tag for the endpoint.
     * @param {object|null} query Query parameters.
     * @param {object|null} body The request body, or null for none.
     * @param {{[key: string]: string}|null} labels Extra k6 labels.
     * @returns {http.RefinedResponse<"text">} The response.
     */
    doPost(path, action, query, body, labels) {
        const token = this.tokenGenerator.getToken();

        return http.post(
            this.buildUrl(path, query).toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags: this.buildTags(path, action, labels),
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }
}

export { ClientDelegationV2Client };
