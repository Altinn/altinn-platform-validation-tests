import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { AgentResourcesQuery, AgentsQuery, ClientResourcesQuery, ClientsQuery, DelegateAgentResourcesQuery, ResourceDelegationBatchInputDto } from "./client-delegation-v2.types.js";

const TAGS = {
    GetClients: {
        action: "get-clients-v2",
    },
    GetAgents: {
        action: "get-agents-v2",
    },
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
 * Covers the client and agent listings plus the four resource endpoints. The
 * rest of v2 is not tested yet.
 *
 * The listings are v2 endpoints in their own right, not v1 ones reused: v2
 * reports a client held through a rettighetshaver relation, and v1 does not.
 * Measured against at22, where the same party returns one client from v2 and
 * none from v1.
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
     * Gets the clients of a party.
     *
     * @param {ClientsQuery|null} [query] Query parameters. Prefer using ClientsQueryBuilder.
     * @param {{[key: string]: string|number}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClients(query = null, headers = null, labels = null) {
        return this.doGet("clients", TAGS.GetClients.action, query, headers, labels);
    }

    /**
     * Gets the agents of a party.
     *
     * @param {AgentsQuery|null} [query] Query parameters. Prefer using AgentsQueryBuilder.
     * @param {{[key: string]: string|number}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgents(query = null, headers = null, labels = null) {
        return this.doGet("agents", TAGS.GetAgents.action, query, headers, labels);
    }

    /**
     * Gets the resources delegated to an agent.
     *
     * @param {AgentResourcesQuery|null} [query] Query parameters. Prefer using AgentResourcesQueryBuilder.
     * @param {{[key: string]: string|number}|null} [headers] Optional request headers.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentResources(query, body = null, labels = null) {
        return this.doPost("agents/resources/delete", TAGS.DeleteAgentResources.action, query, body, labels);
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/${path}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/${path}`,
                action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
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
        return http.post(
            buildUrl(`${this.FULL_PATH}/${path}`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/${path}`,
                action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { ClientDelegationV2Client };
