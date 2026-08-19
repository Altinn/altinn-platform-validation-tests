import http from "k6/http";

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
     * @param {{[key: string]: string|number}} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetMyClients(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clients`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/my/clients`,
            name: `${this.FULL_PATH}/my/clients`,
            action: TAGS.GetMyClients.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Revokes the authenticated party's access to a client.
     *
     * @param {DeleteMyClientsQuery} query
     * Query parameters. Prefer using {@link DeleteMyClientsQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body]
     * Roles and access packages to revoke. Prefer using
     * {@link DelegationBatchInputBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClients(query, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clients`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/my/clients`,
            name: `${this.FULL_PATH}/my/clients`,
            action: TAGS.DeleteMyClients.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the client providers the authenticated party is a client of.
     *
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetMyClientProviders(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clientproviders`);

        let tags = {
            endpoint: `${this.FULL_PATH}/my/clientproviders`,
            name: `${this.FULL_PATH}/my/clientproviders`,
            action: TAGS.GetMyClientProviders.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Removes a client provider from the authenticated party.
     *
     * @param {DeleteMyClientProviderQuery} query
     * Query parameters. Prefer using
     * {@link DeleteMyClientProviderQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClientProvider(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clientproviders`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/my/clientproviders`,
            name: `${this.FULL_PATH}/my/clientproviders`,
            action: TAGS.DeleteMyClientProvider.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClientAccessPackages(query, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clients/accesspackages`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/my/clients/accesspackages`,
            name: `${this.FULL_PATH}/my/clients/accesspackages`,
            action: TAGS.DeleteMyClientAccessPackages.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the clients of a party.
     *
     * @param {ClientsQuery} query
     * Query parameters. Prefer using {@link ClientsQueryBuilder}.
     * @param {{[key: string]: string|number}} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetClients(
        query,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/clients`,
            name: `${this.FULL_PATH}/clients`,
            action: TAGS.GetClients.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Gets the access packages held on a client.
     *
     * @param {ClientAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link ClientAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetClientAccessPackages(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients/accesspackages`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/clients/accesspackages`,
            name: `${this.FULL_PATH}/clients/accesspackages`,
            action: TAGS.GetClientAccessPackages.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the agents of a party.
     *
     * @param {AgentsQuery} query
     * Query parameters. Prefer using {@link AgentsQueryBuilder}.
     * @param {{[key: string]: string|number}} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgents(
        query,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents`,
            name: `${this.FULL_PATH}/agents`,
            action: TAGS.GetAgents.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Adds an agent to a party.
     *
     * @param {CreateAgentQuery} query
     * Query parameters. Prefer using {@link CreateAgentQueryBuilder}.
     * @param {PersonInput|null} [body]
     * The person to add as agent. Prefer using {@link PersonInputBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAgent(query, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents`,
            name: `${this.FULL_PATH}/agents`,
            action: TAGS.CreateAgent.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Removes an agent from a party.
     *
     * @param {DeleteAgentQuery} query
     * Query parameters. Prefer using {@link DeleteAgentQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgent(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents`,
            name: `${this.FULL_PATH}/agents`,
            action: TAGS.DeleteAgent.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Revokes an agent's access to a client.
     *
     * @param {DeleteAgentClientsQuery} query
     * Query parameters. Prefer using {@link DeleteAgentClientsQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgentClients(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/clients`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents/clients`,
            name: `${this.FULL_PATH}/agents/clients`,
            action: TAGS.DeleteAgentClients.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the access packages delegated to an agent.
     *
     * @param {AgentAccessPackagesQuery} query
     * Query parameters. Prefer using
     * {@link AgentAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgentAccessPackages(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents/accesspackages`,
            name: `${this.FULL_PATH}/agents/accesspackages`,
            action: TAGS.GetAgentAccessPackages.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAgentAccessPackages(query, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents/accesspackages`,
            name: `${this.FULL_PATH}/agents/accesspackages`,
            action: TAGS.CreateAgentAccessPackages.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgentAccessPackages(query, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agents/accesspackages`,
            name: `${this.FULL_PATH}/agents/accesspackages`,
            action: TAGS.DeleteAgentAccessPackages.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }
}

export { ClientDelegationClient };
