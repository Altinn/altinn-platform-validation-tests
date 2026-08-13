import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetMyClients(query = null, labels = null) {
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
            },
        });
    }

    /**
     * Revokes access packages the authenticated party holds on one of its clients.
     *
     * @param {DeleteMyClientsQuery|null} [query] Optional query parameters. Prefer
     * using {@link DeleteMyClientsQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * revoke. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClients(query = null, body = null, labels = null) {
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
     * Removes a client provider from the authenticated party.
     *
     * @param {DeleteMyClientProvidersQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteMyClientProvidersQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClientProviders(query = null, labels = null) {
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
            action: TAGS.DeleteMyClientProviders.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the clients of a party.
     *
     * @param {GetClientsQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetClientsQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetClients(query = null, labels = null) {
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
            },
        });
    }

    /**
     * Gets the agents of a party.
     *
     * @param {GetAgentsQuery|null} [query] Optional query parameters. Prefer using
     * {@link GetAgentsQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgents(query = null, labels = null) {
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
            },
        });
    }

    /**
     * Adds an agent to a party.
     *
     * @param {ValidatePersonInput|null} [body] The person to add as agent, when
     * they are identified by national identity number instead of party UUID.
     * Prefer using {@link ValidatePersonInputBuilder}.
     * @param {CreateAgentQuery|null} [query] Optional query parameters. Prefer
     * using {@link CreateAgentQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAgent(body = null, query = null, labels = null) {
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
     * @param {DeleteAgentQuery|null} [query] Optional query parameters. Prefer
     * using {@link DeleteAgentQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgent(query = null, labels = null) {
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

        return http.del(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the access packages delegated to an agent, per client.
     *
     * @param {GetAgentAccessPackagesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetAgentAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgentAccessPackages(query = null, labels = null) {
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
     * @param {CreateAgentAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link CreateAgentAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * delegate. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAgentAccessPackages(query = null, body = null, labels = null) {
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
     * @param {DeleteAgentAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteAgentAccessPackagesQueryBuilder}.
     * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
     * revoke. Prefer using {@link DelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgentAccessPackages(query = null, body = null, labels = null) {
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

    /**
     * Gets the agents holding access packages on a client.
     *
     * @param {GetClientAccessPackagesQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetClientAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetClientAccessPackages(query = null, labels = null) {
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
     * Gets the resources delegated to an agent, per client.
     *
     * @param {GetAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetAgentResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgentResources(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/resources`);

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
            endpoint: `${this.FULL_PATH}/agents/resources`,
            name: `${this.FULL_PATH}/agents/resources`,
            action: TAGS.GetAgentResources.action,
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
     * Delegates resources on a client to an agent.
     *
     * @param {CreateAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateAgentResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * delegate. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreateAgentResources(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/resources`);

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
            endpoint: `${this.FULL_PATH}/agents/resources`,
            name: `${this.FULL_PATH}/agents/resources`,
            action: TAGS.CreateAgentResources.action,
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
     * Revokes resources on a client from an agent.
     *
     * @param {DeleteAgentResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link DeleteAgentResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * revoke. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteAgentResources(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/agents/resources`);

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
            endpoint: `${this.FULL_PATH}/agents/resources`,
            name: `${this.FULL_PATH}/agents/resources`,
            action: TAGS.DeleteAgentResources.action,
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
     * Gets the agents holding resources on a client.
     *
     * @param {GetClientResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetClientResourcesQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetClientResources(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/clients/resources`);

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
            endpoint: `${this.FULL_PATH}/clients/resources`,
            name: `${this.FULL_PATH}/clients/resources`,
            action: TAGS.GetClientResources.action,
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
     * Revokes resources the authenticated party holds on one of its clients.
     *
     * @param {DeleteMyClientResourcesQuery|null} [query] Optional query
     * parameters. Prefer using {@link DeleteMyClientResourcesQueryBuilder}.
     * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
     * revoke. Prefer using {@link ResourceDelegationBatchInputDtoBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteMyClientResources(query = null, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/my/clients/resources`);

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
            endpoint: `${this.FULL_PATH}/my/clients/resources`,
            name: `${this.FULL_PATH}/my/clients/resources`,
            action: TAGS.DeleteMyClientResources.action,
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

export { ClientDelegationsClient };
