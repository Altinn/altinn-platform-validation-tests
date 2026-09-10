import http from "k6/http";

import { URL } from "../../common-imports.js";
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserGetByExternalId(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/byExternalId`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                url.searchParams.append(key, String(value));
            }
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/byExternalId`,
                name: `${this.FULL_PATH}/byExternalId`,
                action: TAGS.SystemUserGetByExternalId.action,
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
     * Updates an existing SystemUser.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {SystemUserUpdateDto} request Updated SystemUser.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserUpdate(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserVendorGetByQuery(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/vendor/byquery`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                url.searchParams.append(key, String(value));
            }
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/vendor/byquery`,
                name: `${this.FULL_PATH}/vendor/byquery`,
                action: TAGS.SystemUserVendorGetByQuery.action,
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
     * Retrieves SystemUsers for a vendor system.
     *
     * Requires the `altinn:authentication/systemregister.write` scope.
     *
     * @param {string} systemId System identifier.
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserVendorGetBySystem(systemId, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/vendor/bysystem/${encodeURIComponent(systemId)}`,
        );

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                url.searchParams.append(
                    key,
                    String(typeof value === "object" ? value.value : value),
                );
            }
        }

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

        if (labels !== null) {
            params.tags = {
                ...labels,
                ...params.tags,
            };
        }

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves SystemUsers for internal streaming.
     *
     * Requires the `altinn:authentication/systemuser.admin` scope.
     *
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserInternalStream(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/internal/systemusers/stream`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                url.searchParams.append(
                    key,
                    String(typeof value === "object" ? value.value : value),
                );
            }
        }

        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/internal/systemusers/stream`,
                name: `${this.FULL_PATH}/internal/systemusers/stream`,
                action: TAGS.SystemUserInternalStream.action,
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
    SystemUserClient,
};
