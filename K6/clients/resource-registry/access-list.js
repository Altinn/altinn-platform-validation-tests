import http from "k6/http";

const TAGS = {
    AccessListGetByMember: {
        action: "access-list-get-by-member",
    },
    AccessListGetByOwner: {
        action: "access-list-get-by-owner",
    },
    AccessListGet: {
        action: "access-list-get",
    },
    AccessListDelete: {
        action: "access-list-delete",
    },
    AccessListUpsert: {
        action: "access-list-upsert",
    },
    AccessListPatch: {
        action: "access-list-patch",
    },
    AccessListGetMembers: {
        action: "access-list-get-members",
    },
    AccessListReplaceMembers: {
        action: "access-list-replace-members",
    },
    AccessListAddMembers: {
        action: "access-list-add-members",
    },
    AccessListRemoveMembers: {
        action: "access-list-remove-members",
    },
    AccessListGetResourceConnections: {
        action: "access-list-get-resource-connections",
    },
    AccessListUpsertResourceConnection: {
        action: "access-list-upsert-resource-connection",
    },
    AccessListDeleteResourceConnection: {
        action: "access-list-delete-resource-connection",
    },
};

class AccessListClient {
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
        this.BASE_PATH = "/resourceregistry/api/v1/access-lists/";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates query string parameters.
     *
     * @param {object | null} query Query parameters.
     * @returns {string} The result.
     */
    buildQuery(query) {
        if (query === null || query === undefined) {
            return "";
        }

        const params = [];

        Object.keys(query).forEach((key) => {
            const value = query[key];

            if (value === undefined || value === null) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    params.push(
                        `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
                    );
                });

                return;
            }

            params.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
            );
        });

        if (params.length === 0) {
            return "";
        }

        return `?${params.join("&")}`;
    }

    /**
     * Gets access lists for a given member.
     *
     * @param {string} party Member party UUID URN.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListGetByMember(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}get-by-member?party=${encodeURIComponent(party)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}get-by-member`,
            name: `${this.FULL_PATH}get-by-member`,
            action: TAGS.AccessListGetByMember.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets access lists for a resource owner.
     *
     * @param {string} owner Resource owner.
     * @param {object | null} query Query parameters.
     * @param {string} [query.token] Continuation token for paging.
     * @param {Array<string>} [query.include] Related data to include.
     * @param {string} [query.resource] Resource identifier to filter by.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListGetByOwner(owner, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}${this.buildQuery(query)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}`,
            name: `${this.FULL_PATH}{owner}`,
            action: TAGS.AccessListGetByOwner.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets an access list by owner and identifier.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {object | null} query Query parameters.
     * @param {Array<string>} [query.include] Related data to include.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListGet(owner, identifier, query = null, headers = {}, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}${this.buildQuery(query)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}`,
            action: TAGS.AccessListGet.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Deletes an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListDelete(owner, identifier, headers = {}, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}`,
            action: TAGS.AccessListDelete.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Creates or updates an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {CreateAccessListModel} request Access list payload.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListUpsert(owner, identifier, request, headers = {}, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}`,
            action: TAGS.AccessListUpsert.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    /**
     * Updates an access list using JSON Patch.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {Array<JsonPatchOperation>} request Patch operations.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListPatch(owner, identifier, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}`,
            action: TAGS.AccessListPatch.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.patch(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets access list members.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {object | null} query Query parameters.
     * @param {string} [query.token] Continuation token for paging.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListGetMembers(
        owner,
        identifier,
        query = null,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/members${this.buildQuery(query)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
            name: `${this.FULL_PATH}{owner}/{identifier}/members`,
            action: TAGS.AccessListGetMembers.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Replaces access list members.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListReplaceMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/members`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
            name: `${this.FULL_PATH}{owner}/{identifier}/members`,
            action: TAGS.AccessListReplaceMembers.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    /**
     * Adds members to an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListAddMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/members`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
            name: `${this.FULL_PATH}{owner}/{identifier}/members`,
            action: TAGS.AccessListAddMembers.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    /**
     * Removes members from an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {{data:Array<string>}} request Members payload.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListRemoveMembers(
        owner,
        identifier,
        request,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/members`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/members`,
            name: `${this.FULL_PATH}{owner}/{identifier}/members`,
            action: TAGS.AccessListRemoveMembers.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    /**
     * Gets resource connections for an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {object | null} query Query parameters.
     * @param {string} [query.token] Continuation token for paging.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListGetResourceConnections(
        owner,
        identifier,
        query = null,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/resource-connections${this.buildQuery(query)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections`,
            name: `${this.FULL_PATH}{owner}/{identifier}/resource-connections`,
            action: TAGS.AccessListGetResourceConnections.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }

    /**
     * Creates or updates a resource connection.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {string} resourceIdentifier Resource identifier.
     * @param {UpsertAccessListResourceConnectionDto} request Resource connection payload.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListUpsertResourceConnection(
        owner,
        identifier,
        resourceIdentifier,
        request,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/resource-connections/${resourceIdentifier}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
            action: TAGS.AccessListUpsertResourceConnection.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...headers,
            },
        });
    }

    /**
     * Removes a resource connection from an access list.
     *
     * @param {string} owner Resource owner.
     * @param {string} identifier Access list identifier.
     * @param {string} resourceIdentifier Resource identifier.
     * @param {{[key: string]: string}} [headers] Optional request headers.
     * Optional request headers.
     * @param {{[key: string]: string}} [labels] See the API documentation.
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    AccessListDeleteResourceConnection(
        owner,
        identifier,
        resourceIdentifier,
        headers = {},
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}${owner}/${identifier}/resource-connections/${resourceIdentifier}`;

        let tags = {
            endpoint: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
            name: `${this.FULL_PATH}{owner}/{identifier}/resource-connections/{resourceIdentifier}`,
            action: TAGS.AccessListDeleteResourceConnection.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...headers,
            },
        });
    }
}

export { AccessListClient };
