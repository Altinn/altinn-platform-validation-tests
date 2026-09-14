import http from "k6/http";

import { buildUrl, requestParams } from "../common/request.js";

const TAGS = {
    GetAvailableClients: {
        action: "systemuser-client-delegation-get-available-clients",
    },
    GetClients: {
        action: "systemuser-client-delegation-get-clients",
    },
    DelegateClient: {
        action: "systemuser-client-delegation-delegate-client",
    },
    RemoveClient: {
        action: "systemuser-client-delegation-remove-client",
    },
    GetAgents: {
        action: "systemuser-client-delegation-get-agents",
    },
};

class SystemUserClientDelegationClient {
    /**
     * @param {string} baseUrl Base URL.
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
        this.BASE_PATH = "/authentication/api/v1/enduser/systemuser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Get clients who can delegate to the system user.
     *
     * @param {string|null} [agent] System user id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAvailableClients(agent = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients/available`, { agent }),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients/available`,
                action: TAGS.GetAvailableClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get clients delegated to the specified system user.
     *
     * @param {string|null} [agent] System user id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetClients(agent = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/clients`, { agent }),
            requestParams({
                endpoint: `${this.FULL_PATH}/clients`,
                action: TAGS.GetClients.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delegate a client to a system user.
     *
     * @param {string} agent System user id.
     * @param {string} client Client id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DelegateClient(agent, client, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/clients`, { agent, client }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/clients`,
                action: TAGS.DelegateClient.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Remove a client from a system user.
     *
     * @param {string} agent System user id.
     * @param {string} client Client id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RemoveClient(agent, client, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/clients`, { agent, client }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/clients`,
                action: TAGS.RemoveClient.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves agent system users associated with the authenticated party.
     *
     * @param {string|null} [party] Party identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgents(party = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agents`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/agents`,
                action: TAGS.GetAgents.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    SystemUserClientDelegationClient,
};
