import http from "k6/http";

import { RolesGetRolePackagesByIdQuery, RolesGetRolePackagesQuery, RolesGetRoleResourcesByIdQuery, RolesGetRoleResourcesQuery } from "./roles.types.js";

const TAGS = {
    RolesGetRoles: {
        action: "roles-get-roles",
    },
    RolesGetRole: {
        action: "roles-get-role",
    },
    RolesGetRolePackages: {
        action: "roles-get-role-packages",
    },
    RolesGetRoleResources: {
        action: "roles-get-role-resources",
    },
    RolesGetRolePackagesById: {
        action: "roles-get-role-packages-by-id",
    },
    RolesGetRoleResourcesById: {
        action: "roles-get-role-resources-by-id",
    },
};

class RolesClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets roles.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRoles(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/roles`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.RolesGetRoles.action,
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
     * Gets a role.
     *
     * @param {string} id Role identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRole(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/meta/info/roles/${id}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
            name: `${this.FULL_PATH}/meta/info/roles/{id}`,
            action: TAGS.RolesGetRole.action,
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
     * Gets role packages.
     *
     * @param {RolesGetRolePackagesQuery} query
     * Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRolePackages(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/meta/info/roles/packages`;

        if (query !== null) {
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

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
            name: `${this.FULL_PATH}/meta/info/roles/{id}`,
            action: TAGS.RolesGetRolePackages.action,
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
     * Gets role resources.
     *
     * @param {RolesGetRoleResourcesQuery} query
     * Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRoleResources(query, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/meta/info/roles/resources`;

        if (query !== null) {
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

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
            name: `${this.FULL_PATH}/meta/info/roles/{id}`,
            action: TAGS.RolesGetRoleResources.action,
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
     * Gets role packages by role id.
     *
     * @param {string} id Role identifier.
     * @param {RolesGetRolePackagesByIdQuery} query
     * Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRolePackagesById(id, query, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/meta/info/roles/${id}/packages`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
                    return;
                }

                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                );
            });

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
            name: `${this.FULL_PATH}/meta/info/roles/{id}`,
            action: TAGS.RolesGetRolePackagesById.action,
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
     * Gets role resources by role id.
     *
     * @param {string} id Role identifier.
     * @param {RolesGetRoleResourcesByIdQuery} query
     * Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RolesGetRoleResourcesById(id, query, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/meta/info/roles/${id}/resources`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
                    return;
                }

                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                );
            });

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
            name: `${this.FULL_PATH}/meta/info/roles/{id}`,
            action: TAGS.RolesGetRoleResourcesById.action,
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
}

export { RolesClient };
