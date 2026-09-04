import http from "k6/http";

import { URL } from "../../common-imports.js";

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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients/available`);

        if (agent !== null) {
            url.searchParams.set("agent", agent);
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/clients/available`,
                name: `${this.FULL_PATH}/clients/available`,
                action: TAGS.GetAvailableClients.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url.toString(), params);
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients`);

        if (agent !== null) {
            url.searchParams.set("agent", agent);
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/clients`,
                name: `${this.FULL_PATH}/clients`,
                action: TAGS.GetClients.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url.toString(), params);
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients`);

        url.searchParams.set("agent", agent);
        url.searchParams.set("client", client);

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/clients`,
                name: `${this.FULL_PATH}/clients`,
                action: TAGS.DelegateClient.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.post(url.toString(), null, params);
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients`);

        url.searchParams.set("agent", agent);
        url.searchParams.set("client", client);

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/clients`,
                name: `${this.FULL_PATH}/clients`,
                action: TAGS.RemoveClient.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.del(url.toString(), null, params);
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents`);

        if (party !== null) {
            url.searchParams.set("party", party);
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/agents`,
                name: `${this.FULL_PATH}/agents`,
                action: TAGS.GetAgents.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url.toString(), params);
    }
}

export {
    SystemUserClientDelegationClient,
};
