import http from "k6/http";

import { SystemUserByExternalIdQuery, SystemUserPagedQuery, SystemUserUpdateDto, SystemUserVendorQuery } from "./types.js";

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
     * Requires the `altinn:maskinporten/systemuser.read` scope.
     *
     * @param {SystemUserByExternalIdQuery|null} query Query parameters, with the keys "system-id" and "external-ref".
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
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

        // The query stays out of the name tag, or metrics get one series per value.
        params.tags.endpoint = url;

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
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {SystemUserUpdateDto} request Updated SystemUser.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves a SystemUser by vendor query.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {SystemUserVendorQuery|null} query Query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
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

        // The query stays out of the name tag, or metrics get one series per value.
        params.tags.endpoint = url;

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
     * Requires the `altinn:authentication/systemregister.write` scope.
     *
     * @param {string} systemId System identifier.
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserVendorGetBySystem(systemId, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/vendor/bysystem/${encodeURIComponent(systemId)}`;

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
                name: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
                action: TAGS.SystemUserVendorGetBySystem.action,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
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

        // The query stays out of the name tag, or metrics get one series per value.
        params.tags.endpoint = url;

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
     * Requires the `altinn:authentication/systemuser.admin` scope.
     *
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
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
                Accept: "application/json",
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

        // The query stays out of the name tag, or metrics get one series per value.
        params.tags.endpoint = url;

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
