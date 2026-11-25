import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { AgentAccessPackagesQuery, AgentClientAccessPackagesQuery, AgentsQuery, ClientAccessPackagesQuery, ClientsQuery, CreateAgentQuery, DelegationBatchInputDto, DeleteAgentClientsQuery, DeleteAgentQuery, DeleteMyClientAccessPackagesQuery, DeleteMyClientProviderQuery, DeleteMyClientsQuery, MyClientsQuery, PersonInput } from "./client-delegation.types.js";

const TAGS = {
    GetMyClients: {
        action: "get-my-clients",
    },
    DeleteMyClients: {
        action: "delete-my-clients",
    },
    GetMyClientProviders: {
        action: "get-my-client-providers",
    },
    DeleteMyClientProvider: {
        action: "delete-my-client-provider",
    },
    DeleteMyClientAccessPackages: {
        action: "delete-my-client-access-packages",
    },
    GetClients: {
        action: "get-clients",
    },
    GetClientAccessPackages: {
        action: "get-client-access-packages",
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
    DeleteAgentClients: {
        action: "delete-agent-clients",
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
};

class ClientDelegationClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/clientdelegations";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the clients the authenticated party has access to, grouped by client
     * provider.
     *
     * @param {MyClientsQuery|null} [query]
     * Optional query parameters. Prefer using {@link MyClientsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMyClients(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/my/clients`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clients`,
                action: TAGS.GetMyClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Revokes the authenticated party's access to a client.
     *
     * @param {DeleteMyClientsQuery} query
     * Query parameters. Prefer using {@link DeleteMyClientsQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body]
     * Roles and access packages to revoke. Prefer using
     * {@link DelegationBatchInputBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClients(query, body = null, labels = null) {
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
     * Gets the client providers the authenticated party is a client of.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMyClientProviders(labels = null) {
        return http.get(
            `${this.FULL_PATH}/my/clientproviders`,
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clientproviders`,
                action: TAGS.GetMyClientProviders.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes a client provider from the authenticated party.
     *
     * @param {DeleteMyClientProviderQuery} query
     * Query parameters. Prefer using
     * {@link DeleteMyClientProviderQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClientProvider(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/my/clientproviders`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clientproviders`,
                action: TAGS.DeleteMyClientProvider.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes access packages the authenticated party holds on a client.
     *
     * @param {DeleteMyClientAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link DeleteMyClientAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body]
     * Roles and access packages to revoke. Prefer using
     * {@link DelegationBatchInputBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteMyClientAccessPackages(query, body = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/my/clients/accesspackages`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/my/clients/accesspackages`,
                action: TAGS.DeleteMyClientAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the clients of a party.
     *
     * @param {ClientsQuery|null} query
     * Query parameters. Prefer using {@link ClientsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClients(
        query,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients`,
                action: TAGS.GetClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Gets the access packages held on a client.
     *
     * @param {ClientAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link ClientAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClientAccessPackages(query, labels = null) {
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
     * Gets the agents of a party.
     *
     * @param {AgentsQuery|null} query
     * Query parameters. Prefer using {@link AgentsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgents(
        query,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agents`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents`,
                action: TAGS.GetAgents.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Adds an agent to a party.
     *
     * @param {CreateAgentQuery} query
     * Query parameters. Prefer using {@link CreateAgentQueryBuilder}.
     * @param {PersonInput|null} [body]
     * The person to add as agent. Prefer using {@link PersonInputBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgent(query, body = null, labels = null) {
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
     * @param {DeleteAgentQuery} query
     * Query parameters. Prefer using {@link DeleteAgentQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgent(query, labels = null) {
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
     * Revokes an agent's access to a client.
     *
     * @param {DeleteAgentClientsQuery} query
     * Query parameters. Prefer using {@link DeleteAgentClientsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentClients(query, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/agents/clients`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/agents/clients`,
                action: TAGS.DeleteAgentClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access packages delegated to an agent.
     *
     * @param {AgentAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link AgentAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentAccessPackages(query, labels = null) {
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
     * @param {AgentClientAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link AgentClientAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body]
     * Roles and access packages to delegate. Prefer using
     * {@link DelegationBatchInputBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgentAccessPackages(query, body = null, labels = null) {
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
     * @param {AgentClientAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link AgentClientAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body]
     * Roles and access packages to revoke. Prefer using
     * {@link DelegationBatchInputBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentAccessPackages(query, body = null, labels = null) {
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
}

export { ClientDelegationClient };
