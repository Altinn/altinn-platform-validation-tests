import http from "k6/http";

const TAGS = {
    SystemUserGetByExternalId: {
        action: "system-user-get-by-external-id",
    },
    SystemUserUpdate: {
        action: "system-user-update",
    },
    SystemUserVendorGetByQuery: {
        action: "system-user-vendor-get-by-query",
    },
    SystemUserVendorGetBySystem: {
        action: "system-user-vendor-get-by-system",
    },
    SystemUserInternalStream: {
        action: "system-user-internal-stream",
    },
};

class SystemUserClient {
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
        this.BASE_PATH = "/authentication/api/v1/systemuser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Finds a SystemUser by external id.
     *
     * @param {Object} query Query parameters.
     * @param {string} [query.clientId]
     * @param {string} [query.systemProviderOrgNo]
     * @param {string} [query.systemUserOwnerOrgNo]
     * @param {string} [query.externalRef]
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SystemUserGetByExternalId(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/byExternalId`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.SystemUserGetByExternalId.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (query !== null) {
            const queryParams = [];

            Object.entries(query).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return;
                }

                queryParams.push(
                    `${key}=${encodeURIComponent(value)}`,
                );
            });

            if (queryParams.length > 0) {
                url = `${url}?${queryParams.join("&")}`;
            }
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
     * Updates an existing SystemUser.
     *
     * @param {SystemUserUpdateDto} request Updated SystemUser.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SystemUserUpdate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.SystemUserUpdate.action,
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
            },
        });
    }

    /**
     * Retrieves a SystemUser by vendor query.
     *
     * @param {Object} query Query parameters.
     * @param {string} [query["system-id"]]
     * @param {string} [query["external-ref"]]
     * @param {string} [query.orgno]
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SystemUserVendorGetByQuery(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/vendor/byquery`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.SystemUserVendorGetByQuery.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (query !== null) {
            const queryParams = [];

            Object.entries(query).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return;
                }

                queryParams.push(
                    `${key}=${encodeURIComponent(value)}`,
                );
            });

            if (queryParams.length > 0) {
                url = `${url}?${queryParams.join("&")}`;
            }
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
     * Retrieves SystemUsers for a vendor system.
     *
     * @param {string} systemId System identifier.
     * @param {Object} [query] Query parameters.
     * @param {Int64Opaque} [query.token] Continuation token.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SystemUserVendorGetBySystem(systemId, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/vendor/bysystem/${systemId}`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.SystemUserVendorGetBySystem.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (query !== null) {
            const queryParams = [];

            Object.entries(query).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return;
                }

                if (typeof value === "object") {
                    value = value.value;
                }

                queryParams.push(
                    `${key}=${encodeURIComponent(value)}`,
                );
            });

            if (queryParams.length > 0) {
                url = `${url}?${queryParams.join("&")}`;
            }
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
     * Retrieves SystemUsers for internal streaming.
     *
     * @param {Object} [query] Query parameters.
     * @param {Int64Opaque} [query.token] Continuation token.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    SystemUserInternalStream(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/internal/systemusers/stream`;

        const params = {
            tags: {
                endpoint: url,
                name: url,
                action: TAGS.SystemUserInternalStream.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        if (query !== null) {
            const queryParams = [];

            Object.entries(query).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return;
                }

                if (typeof value === "object") {
                    value = value.value;
                }

                queryParams.push(
                    `${key}=${encodeURIComponent(value)}`,
                );
            });

            if (queryParams.length > 0) {
                url = `${url}?${queryParams.join("&")}`;
            }
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
    SystemUserClient,
};
