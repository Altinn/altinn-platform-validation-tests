import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
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
        return http.get(
            `${this.FULL_PATH}/meta/info/roles`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles`,
                action: TAGS.RolesGetRoles.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            `${this.FULL_PATH}/meta/info/roles/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
                action: TAGS.RolesGetRole.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/meta/info/roles/packages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
                action: TAGS.RolesGetRolePackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/meta/info/roles/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
                action: TAGS.RolesGetRoleResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/meta/info/roles/${id}/packages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
                action: TAGS.RolesGetRolePackagesById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
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
        return http.get(
            buildUrl(`${this.FULL_PATH}/meta/info/roles/${id}/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/meta/info/roles/{id}`,
                action: TAGS.RolesGetRoleResourcesById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { RolesClient };
