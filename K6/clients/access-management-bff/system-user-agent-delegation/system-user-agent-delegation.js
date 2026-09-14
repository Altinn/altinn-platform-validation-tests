import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { AgentDelegationRequestFE } from "../common/common.types.js";
import { CreateAgentSystemUserDelegationQuery, CreateAgentSystemUserSelfDelegationQuery, DeleteAgentSystemUserDelegationQuery, DeleteAgentSystemUserSelfDelegationQuery, GetAgentSystemUserCustomersQuery, GetAgentSystemUserDelegationsQuery, GetAgentSystemUserSelfDelegationQuery } from "./system-user-agent-delegation.types.js";

const TAGS = {
    GetAgentSystemUserCustomers: {
        action: "get-agent-system-user-customers",
    },
    GetAgentSystemUserDelegations: {
        action: "get-agent-system-user-delegations",
    },
    CreateAgentSystemUserDelegation: {
        action: "create-agent-system-user-delegation",
    },
    DeleteAgentSystemUserDelegation: {
        action: "delete-agent-system-user-delegation",
    },
    CreateAgentSystemUserSelfDelegation: {
        action: "create-agent-system-user-self-delegation",
    },
    DeleteAgentSystemUserSelfDelegation: {
        action: "delete-agent-system-user-self-delegation",
    },
    GetAgentSystemUserSelfDelegation: {
        action: "get-agent-system-user-self-delegation",
    },
};

/**
 * Client for the agent system user delegation endpoints of the Access
 * Management BFF API.
 */
class SystemUserAgentDelegationClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/agentdelegation";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the customers an agent system user can be delegated.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {GetAgentSystemUserCustomersQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetAgentSystemUserCustomersQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUserCustomers(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/customers`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/customers`,
                action: TAGS.GetAgentSystemUserCustomers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the customers delegated to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {GetAgentSystemUserDelegationsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetAgentSystemUserDelegationsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUserDelegations(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/delegation`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/delegation`,
                action: TAGS.GetAgentSystemUserDelegations.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates a customer to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {CreateAgentSystemUserDelegationQuery|null} [query] Optional query
     * parameters. Prefer using
     * {@link CreateAgentSystemUserDelegationQueryBuilder}.
     * @param {AgentDelegationRequestFE|null} [body] The customer and access to
     * delegate. Prefer using {@link AgentDelegationRequestFEBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgentSystemUserDelegation(
        partyId,
        systemUserGuid,
        query = null,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/delegation`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/delegation`,
                action: TAGS.CreateAgentSystemUserDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Revokes a customer delegated to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {string} delegationId Delegation UUID.
     * @param {DeleteAgentSystemUserDelegationQuery|null} [query] Optional query
     * parameters. Prefer using
     * {@link DeleteAgentSystemUserDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentSystemUserDelegation(
        partyId,
        systemUserGuid,
        delegationId,
        query = null,
        labels = null,
    ) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/delegation/${delegationId}`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/delegation/{delegationId}`,
                action: TAGS.DeleteAgentSystemUserDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegates the organisation itself to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {CreateAgentSystemUserSelfDelegationQuery|null} [query] Optional
     * query parameters. Prefer using
     * {@link CreateAgentSystemUserSelfDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAgentSystemUserSelfDelegation(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/self`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/self`,
                action: TAGS.CreateAgentSystemUserSelfDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes the delegation of the organisation itself to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {DeleteAgentSystemUserSelfDelegationQuery|null} [query] Optional
     * query parameters. Prefer using
     * {@link DeleteAgentSystemUserSelfDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentSystemUserSelfDelegation(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/self`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/self`,
                action: TAGS.DeleteAgentSystemUserSelfDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the delegation of the organisation itself to an agent system user.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {GetAgentSystemUserSelfDelegationQuery|null} [query] Optional query
     * parameters. Prefer using
     * {@link GetAgentSystemUserSelfDelegationQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUserSelfDelegation(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${partyId}/${systemUserGuid}/self`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}/self`,
                action: TAGS.GetAgentSystemUserSelfDelegation.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { SystemUserAgentDelegationClient };
