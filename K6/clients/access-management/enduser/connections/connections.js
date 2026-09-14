import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { AccessPackageDelegationCheckQuery, CreateAccessPackageQuery, CreateConnectionQuery, CreateInstanceRightsQuery, CreateResourceRightsQuery, DeleteAccessPackageQuery, DeleteConnectionQuery, DeleteInstanceQuery, DeleteResourceQuery, DeleteRoleQuery, GetAccessPackagesQuery, GetConnectionsQuery, GetConnectionUsersQuery, GetInstanceDelegationCheckQuery, GetInstanceRightsQuery, GetInstancesQuery, GetInstanceUsersQuery, GetResourceDelegationCheckQuery, GetResourceRightsQuery, GetResourcesQuery, GetRolesQuery, InstanceRightsDelegationDto, PersonInput, RightKeyListDto, UpdateInstanceRightsQuery, UpdateResourceRightsQuery } from "./connections.types.js";

const TAGS = {
    GetConnections: {
        action: "get-connections",
    },
    CreateConnection: {
        action: "create-connection",
    },
    DeleteConnection: {
        action: "delete-connection",
    },
    GetConnectionUsers: {
        action: "get-connection-users",
    },
    GetAccessPackages: {
        action: "get-access-packages",
    },
    CreateAccessPackage: {
        action: "create-access-package",
    },
    DeleteAccessPackage: {
        action: "delete-access-package",
    },
    GetAccessPackageDelegationCheck: {
        action: "get-access-package-delegation-check",
    },
    GetRoles: {
        action: "get-roles",
    },
    DeleteRole: {
        action: "delete-role",
    },

    GetResources: {
        action: "get-resources",
    },
    DeleteResource: {
        action: "delete-resource",
    },
    GetResourceRights: {
        action: "get-resource-rights",
    },
    CreateResourceRights: {
        action: "create-resource-rights",
    },
    UpdateResourceRights: {
        action: "update-resource-rights",
    },

    GetResourceDelegationCheck: {
        action: "get-resource-delegation-check",
    },
    GetInstances: {
        action: "get-instances",
    },
    DeleteInstance: {
        action: "delete-instance",
    },
    GetInstanceRights: {
        action: "get-instance-rights",
    },
    CreateInstanceRights: {
        action: "create-instance-rights",
    },
    UpdateInstanceRights: {
        action: "update-instance-rights",
    },

    GetInstanceDelegationCheck: {
        action: "get-instance-delegation-check",
    },
    GetInstanceUsers: {
        action: "get-instance-users",
    },
};

class ConnectionsClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/connections";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets connections for a party.
     *
     * @param {GetConnectionsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetConnectionsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConnections(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetConnections.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates a connection.
     *
     * @param {CreateConnectionQuery|null} [query]
     * Query parameters. Prefer using
     * {@link CreateConnectionQueryBuilder}.
     * @param {PersonInput|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateConnection(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}`, query),
            jsonBody(body),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.CreateConnection.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes a connection.
     *
     * @param {DeleteConnectionQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteConnectionQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteConnection(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}`, query),
            null,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.DeleteConnection.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets users connected to a party.
     *
     * @param {GetConnectionUsersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetConnectionUsersQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConnectionUsers(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/users`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/users`,
                action: TAGS.GetConnectionUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Gets access package permissions for connections.
     *
     * @param {GetAccessPackagesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetAccessPackagesQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAccessPackages(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/accesspackages`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/accesspackages`,
                action: TAGS.GetAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates an access package assignment.
     *
     * @param {CreateAccessPackageQuery|null} [query]
     * Query parameters. Prefer using
     * {@link CreateAccessPackageQueryBuilder}.
     * @param {PersonInput|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateAccessPackage(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/accesspackages`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/accesspackages`,
                action: TAGS.CreateAccessPackage.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes an access package assignment.
     *
     * @param {DeleteAccessPackageQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteAccessPackageQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAccessPackage(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/accesspackages`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/accesspackages`,
                action: TAGS.DeleteAccessPackage.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks access package delegation.
     *
     * @param {AccessPackageDelegationCheckQuery|null} [query]
     * Query parameters. Prefer using
     * {@link AccessPackageDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAccessPackageDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/accesspackages/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/accesspackages/delegationcheck`,
                action: TAGS.GetAccessPackageDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets role permissions.
     *
     * @param {GetRolesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetRolesQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRoles(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/roles`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/roles`,
                action: TAGS.GetRoles.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }
    /**
     * Deletes a role permission.
     *
     * @param {DeleteRoleQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteRoleQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
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
     * Gets resource permissions.
     *
     * @param {GetResourcesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetResourcesQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResources(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.GetResources.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }
    /**
     * Deletes a resource permission.
     *
     * @param {DeleteResourceQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteResourceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteResource(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/resources`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resources`,
                action: TAGS.DeleteResource.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Gets resource rights.
     *
     * @param {GetResourceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetResourceRightsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceRights(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/rights`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/rights`,
                action: TAGS.GetResourceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates resource rights.
     *
     * @param {CreateResourceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link CreateResourceRightsQueryBuilder}.
     * @param {RightKeyListDto|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateResourceRights(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/resources/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/rights`,
                action: TAGS.CreateResourceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates resource rights.
     *
     * @param {UpdateResourceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link UpdateResourceRightsQueryBuilder}.
     * @param {RightKeyListDto|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateResourceRights(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/resources/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/rights`,
                action: TAGS.UpdateResourceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
    /**
     * Checks resource delegation.
     *
     * @param {GetResourceDelegationCheckQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetResourceDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetResourceDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/delegationcheck`,
                action: TAGS.GetResourceDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Gets instance permissions.
     *
     * @param {GetInstancesQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetInstancesQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstances(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/instances`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances`,
                action: TAGS.GetInstances.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Deletes instance permissions.
     *
     * @param {DeleteInstanceQuery|null} [query]
     * Query parameters. Prefer using
     * {@link DeleteInstanceQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteInstance(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/resources/instances`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances`,
                action: TAGS.DeleteInstance.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Gets instance rights.
     *
     * @param {GetInstanceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetInstanceRightsQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceRights(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/instances/rights`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances/rights`,
                action: TAGS.GetInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

    /**
     * Creates instance rights.
     *
     * @param {CreateInstanceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link CreateInstanceRightsQueryBuilder}.
     * @param {InstanceRightsDelegationDto|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateInstanceRights(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/resources/instances/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances/rights`,
                action: TAGS.CreateInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates instance rights.
     *
     * @param {UpdateInstanceRightsQuery|null} [query]
     * Query parameters. Prefer using
     * {@link UpdateInstanceRightsQueryBuilder}.
     * @param {RightKeyListDto|null} [body]
     * Request body.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateInstanceRights(
        query = null,
        body = null,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/resources/instances/rights`, query),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances/rights`,
                action: TAGS.UpdateInstanceRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
    /**
     * Checks instance delegation.
     *
     * @param {GetInstanceDelegationCheckQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetInstanceDelegationCheckQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceDelegationCheck(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/instances/delegationcheck`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances/delegationcheck`,
                action: TAGS.GetInstanceDelegationCheck.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
    /**
     * Gets users with access to an instance.
     *
     * @param {GetInstanceUsersQuery|null} [query]
     * Query parameters. Prefer using
     * {@link GetInstanceUsersQueryBuilder}.
     * @param {{[key: string]: string|number}|null} [headers]
     * Optional request headers.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetInstanceUsers(
        query = null,
        headers = {
            "X-Page-Size": 100,
            "X-Page-Number": 0,
        },
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/resources/instances/users`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/resources/instances/users`,
                action: TAGS.GetInstanceUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers,
            }),
        );
    }

}
export { ConnectionsClient };
