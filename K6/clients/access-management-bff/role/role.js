import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { DeleteRoleQuery, GetRolePackagesQuery, GetRolePermissionsQuery, GetRoleResourcesQuery } from "./role.types.js";

const TAGS = {
    GetRolePermissions: {
        action: "get-role-permissions",
    },
    GetRoles: {
        action: "get-roles",
    },
    GetRolePackages: {
        action: "get-role-packages",
    },
    DeleteRole: {
        action: "delete-role",
    },
    GetRoleResources: {
        action: "get-role-resources",
    },
};

/**
 * Client for the role endpoints of the Access Management BFF API.
 */
class RoleClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/role";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the roles one party holds for another, with the permissions behind
     * them.
     *
     * @param {GetRolePermissionsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetRolePermissionsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRolePermissions(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/permissions`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/permissions`,
                action: TAGS.GetRolePermissions.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the roles the API knows about.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRoles(labels = null) {
        return http.get(
            `${this.FULL_PATH}/meta`,
            requestParams({
                endpoint: `${this.FULL_PATH}/meta`,
                action: TAGS.GetRoles.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access packages a role grants.
     *
     * @param {GetRolePackagesQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRolePackagesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRolePackages(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/packages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/packages`,
                action: TAGS.GetRolePackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a role one party holds for another.
     *
     * @param {DeleteRoleQuery|null} [query] Optional query parameters. Prefer
     * using {@link DeleteRoleQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteRole(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/roles`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/roles`,
                action: TAGS.DeleteRole.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resources a role grants access to.
     *
     * @param {GetRoleResourcesQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetRoleResourcesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRoleResources(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.GetRoleResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { RoleClient };
