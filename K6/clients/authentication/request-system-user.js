import http from "k6/http";

const TAGS = {
    RequestSystemUserVendorCreate: {
        action: "request-system-user-vendor-create",
    },
    RequestSystemUserVendorAgentCreate: {
        action: "request-system-user-vendor-agent-create",
    },
    RequestSystemUserVendorGet: {
        action: "request-system-user-vendor-get",
    },
    RequestSystemUserVendorDelete: {
        action: "request-system-user-vendor-delete",
    },
    RequestSystemUserVendorAgentGet: {
        action: "request-system-user-vendor-agent-get",
    },
    RequestSystemUserVendorGetByExternalRef: {
        action: "request-system-user-vendor-get-by-external-ref",
    },
    RequestSystemUserVendorAgentGetByExternalRef: {
        action: "request-system-user-vendor-agent-get-by-external-ref",
    },
    RequestSystemUserVendorGetBySystem: {
        action: "request-system-user-vendor-get-by-system",
    },
    RequestSystemUserVendorAgentGetBySystem: {
        action: "request-system-user-vendor-agent-get-by-system",
    },
};

class RequestSystemUserClient {
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
        this.BASE_PATH = "/authentication/api/v1/systemuser/request/vendor";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a new system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {CreateRequestSystemUser} request Request model.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestSystemUserVendorCreate.action,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Creates a new agent system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {CreateAgentRequestSystemUser} request Agent request model.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentCreate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/agent`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RequestSystemUserVendorAgentCreate.action,
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves a request system user status by id.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorGet(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(requestId)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{requestId}`,
            name: `${this.FULL_PATH}/{requestId}`,
            action: TAGS.RequestSystemUserVendorGet.action,
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
     * Deletes a system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorDelete(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(requestId)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{requestId}`,
            name: `${this.FULL_PATH}/{requestId}`,
            action: TAGS.RequestSystemUserVendorDelete.action,
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
            },
        });
    }

    /**
     * Retrieves an agent system user request status by id.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGet(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/agent/${encodeURIComponent(requestId)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/{requestId}`,
            name: `${this.FULL_PATH}/agent/{requestId}`,
            action: TAGS.RequestSystemUserVendorAgentGet.action,
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
     * Retrieves a request system user by system id, organization number and external reference.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {string} orgNo Organization number.
     * @param {string} externalRef External reference.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorGetByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/byexternalref/${encodeURIComponent(systemId)}/${encodeURIComponent(orgNo)}/${encodeURIComponent(externalRef)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            name: `${this.FULL_PATH}/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            action: TAGS.RequestSystemUserVendorGetByExternalRef.action,
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
     * Retrieves an agent system user request by system id, organization number and external reference.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {string} orgNo Organization number.
     * @param {string} externalRef External reference.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGetByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/agent/byexternalref/${encodeURIComponent(systemId)}/${encodeURIComponent(orgNo)}/${encodeURIComponent(externalRef)}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            name: `${this.FULL_PATH}/agent/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            action: TAGS.RequestSystemUserVendorAgentGetByExternalRef.action,
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
     * Retrieves all system user requests for a system.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorGetBySystem(systemId, token = null, labels = null) {
        const authToken = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/bysystem/${encodeURIComponent(systemId)}`;

        if (token !== null) {
            url += `?token=${encodeURIComponent(JSON.stringify(token))}`;
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/bysystem/{systemId}`,
            name: `${this.FULL_PATH}/bysystem/{systemId}`,
            action: TAGS.RequestSystemUserVendorGetBySystem.action,
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
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves all agent system user requests for a system.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGetBySystem(
        systemId,
        token = null,
        labels = null,
    ) {
        const authToken = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/agent/bysystem/${encodeURIComponent(systemId)}`;

        if (token !== null) {
            url += `?token=${encodeURIComponent(JSON.stringify(token))}`;
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/agent/bysystem/{systemId}`,
            name: `${this.FULL_PATH}/agent/bysystem/{systemId}`,
            action: TAGS.RequestSystemUserVendorAgentGetBySystem.action,
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
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
        });
    }
}

export {
    RequestSystemUserClient,
};
