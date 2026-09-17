import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { DelegationBatchInputDto, ResourceDelegationBatchInputDto, ValidatePersonInput } from "../common/common.types.js";
import { CreateAgentAccessPackagesQuery, CreateAgentQuery, CreateAgentResourcesQuery, DeleteAgentAccessPackagesQuery, DeleteAgentQuery, DeleteAgentResourcesQuery, DeleteMyClientProvidersQuery, DeleteMyClientResourcesQuery, DeleteMyClientsQuery, GetAgentAccessPackagesQuery, GetAgentResourcesQuery, GetAgentsQuery, GetClientAccessPackagesQuery, GetClientResourcesQuery, GetClientsQuery, GetMyClientsQuery } from "./client-delegations.types.js";

const TAGS = {
    GetMyClients: {
        action: "get-my-clients",
    },
    DeleteMyClients: {
        action: "delete-my-clients",
    },
    DeleteMyClientProviders: {
        action: "delete-my-client-providers",
    },
    GetClients: {
        action: "get-clients",
    },
    GetAgents: {
        action: "get-agents",
    },
    CreateAgent: {
        action: "create-agent",
    },
    DeleteAgent: {
        action: "delete-agent",
    },
    GetAgentAccessPackages: {
        action: "get-agent-access-packages",
    },
    CreateAgentAccessPackages: {
        action: "create-agent-access-packages",
    },
    DeleteAgentAccessPackages: {
        action: "delete-agent-access-packages",
    },
    GetClientAccessPackages: {
        action: "get-client-access-packages",
    },
    GetAgentResources: {
        action: "get-agent-resources",
    },
    CreateAgentResources: {
        action: "create-agent-resources",
    },
    DeleteAgentResources: {
        action: "delete-agent-resources",
    },
    GetClientResources: {
        action: "get-client-resources",
    },
    DeleteMyClientResources: {
        action: "delete-my-client-resources",
    },
};

/**
 * Client for the client delegation endpoints of the Access Management BFF API.
 */
class ClientDelegationsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/clientdelegations";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the clients of the authenticated party, grouped by client provider.
     *
     * @param {GetMyClientsQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetMyClientsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMyClients(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/my/clients`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clients`,
                action: TAGS.GetMyClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes access packages the authenticated party holds on one of its clients.
     *
     * @param {DeleteMyClientsQuery|null} [query] Optional query parameters. Prefer
     * using {@link DeleteMyClientsQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * revoke. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClients(query = null, body = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/my/clients`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clients`,
                action: TAGS.DeleteMyClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Removes a client provider from the authenticated party.
     *
     * @param {DeleteMyClientProvidersQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteMyClientProvidersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClientProviders(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/my/clientproviders`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clientproviders`,
                action: TAGS.DeleteMyClientProviders.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the clients of a party.
     *
     * @param {GetClientsQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetClientsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClients(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients`,
                action: TAGS.GetClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the agents of a party.
     *
     * @param {GetAgentsQuery|null} [query] Optional query parameters. Prefer using
     * {@link GetAgentsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgents(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agents`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents`,
                action: TAGS.GetAgents.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds an agent to a party.
     *
     * @param {ValidatePersonInput|null} [body] The person to add as agent, when
     * they are identified by national identity number instead of party UUID.
     * Prefer using {@link ValidatePersonInputBuilder}.
     * @param {CreateAgentQuery|null} [query] Optional query parameters. Prefer
     * using {@link CreateAgentQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgent(body = null, query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/agents`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents`,
                action: TAGS.CreateAgent.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Removes an agent from a party.
     *
     * @param {DeleteAgentQuery|null} [query] Optional query parameters. Prefer
     * using {@link DeleteAgentQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgent(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/agents`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/agents`,
                action: TAGS.DeleteAgent.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access packages delegated to an agent, per client.
     *
     * @param {GetAgentAccessPackagesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetAgentAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentAccessPackages(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agents/accesspackages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/accesspackages`,
                action: TAGS.GetAgentAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates access packages on a client to an agent.
     *
     * @param {CreateAgentAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link CreateAgentAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * delegate. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgentAccessPackages(query = null, body = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/agents/accesspackages`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/accesspackages`,
                action: TAGS.CreateAgentAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Revokes access packages on a client from an agent.
     *
     * @param {DeleteAgentAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteAgentAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * revoke. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentAccessPackages(query = null, body = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/agents/accesspackages`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/accesspackages`,
                action: TAGS.DeleteAgentAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the agents holding access packages on a client.
     *
     * @param {GetClientAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetClientAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClientAccessPackages(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients/accesspackages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients/accesspackages`,
                action: TAGS.GetClientAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resources delegated to an agent, per client.
     *
     * @param {GetAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetAgentResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentResources(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agents/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/resources`,
                action: TAGS.GetAgentResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates resources on a client to an agent.
     *
     * @param {CreateAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateAgentResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * delegate. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgentResources(query = null, body = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/agents/resources`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/resources`,
                action: TAGS.CreateAgentResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Revokes resources on a client from an agent.
     *
     * @param {DeleteAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link DeleteAgentResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * revoke. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentResources(query = null, body = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/agents/resources`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/resources`,
                action: TAGS.DeleteAgentResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the agents holding resources on a client.
     *
     * @param {GetClientResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetClientResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClientResources(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients/resources`,
                action: TAGS.GetClientResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes resources the authenticated party holds on one of its clients.
     *
     * @param {DeleteMyClientResourcesQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteMyClientResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * revoke. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClientResources(query = null, body = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/my/clients/resources`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clients/resources`,
                action: TAGS.DeleteMyClientResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { ClientDelegationsClient };
