import http from "k6/http";

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
        this.BASE_PATH = "/enduser/systemuser";

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
     * @param {string} [agent] System user id.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetAvailableClients(agent = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/clients/available`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.GetAvailableClients.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (agent !== null) {
            url = `${url}?agent=${encodeURIComponent(agent)}`;
        }

        params.tags.endpoint = url;
        params.tags.name = url;

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url, params);
    }

    /**
     * Get clients delegated to the specified system user.
     *
     * @param {string} [agent] System user id.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetClients(agent = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/clients`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.GetClients.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (agent !== null) {
            url = `${url}?agent=${encodeURIComponent(agent)}`;
        }

        params.tags.endpoint = url;
        params.tags.name = url;

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url, params);
    }

    /**
     * Delegate a client to a system user.
     *
     * @param {string} agent System user id.
     * @param {string} client Client id.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    DelegateClient(agent, client, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/clients`;

        const queryParams = [
            `agent=${encodeURIComponent(agent)}`,
            `client=${encodeURIComponent(client)}`,
        ];

        url = `${url}?${queryParams.join("&")}`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.DelegateClient.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.post(url, null, params);
    }

    /**
     * Remove a client from a system user.
     *
     * @param {string} agent System user id.
     * @param {string} client Client id.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    RemoveClient(agent, client, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/clients`;

        const queryParams = [
            `agent=${encodeURIComponent(agent)}`,
            `client=${encodeURIComponent(client)}`,
        ];

        url = `${url}?${queryParams.join("&")}`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.RemoveClient.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.del(url, null, params);
    }

    /**
     * Retrieves agent system users associated with the authenticated party.
     *
     * @param {string} [party] Party identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetAgents(party = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/agents`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.GetAgents.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (party !== null) {
            url = `${url}?party=${encodeURIComponent(party)}`;
        }

        params.tags.endpoint = url;
        params.tags.name = url;

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url, params);
    }
}

export {
    SystemUserClientDelegationClient,
};
