import http from "k6/http";

const TAGS = {
    GetRoles: { action: "get-roles" },
    GetRole: { action: "get-role" },
    GetRolePackages: { action: "get-role-packages" },
    GetRoleResources: { action: "get-role-resources" },
    GetRolePackagesById: { action: "get-role-packages-by-id" },
    GetRoleResourcesById: { action: "get-role-resources-by-id" },
};

class RolesApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     */
    constructor(baseUrl) {
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/meta/info/roles";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves all available role definitions.
     *
     * GET /meta/info/roles
     *
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRoles(labels = null) {
        const url = new URL(`${this.FULL_PATH}`);

        let tags = {
            endpoint: url.toString(),
            action: TAGS.GetRoles.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves a role by id.
     *
     * GET /meta/info/roles/{id}
     *
     * @param {string} id Role UUID.
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRole(id, labels = null) {
        const url = new URL(`${this.FULL_PATH}/${id}`);

        let tags = {
            name: `${this.FULL_PATH}/id`,
            endpoint: `${this.FULL_PATH}/id`,
            action: TAGS.GetRole.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves packages for a role.
     *
     * GET /meta/info/roles/packages
     *
     * @param {string} role Role identifier.
     * @param {string} variant Role variant.
     * @param {boolean} [includeResources=false]
     * Whether resources should be included.
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRolePackages(
        role,
        variant,
        includeResources = false,
        labels = null
    ) {
        const url = new URL(`${this.FULL_PATH}/packages`);

        url.searchParams.append("role", role);
        url.searchParams.append("variant", variant);
        url.searchParams.append(
            "includeResources",
            includeResources.toString()
        );

        let tags = {
            name: `${this.FULL_PATH}/packages`,
            endpoint: `${this.FULL_PATH}/packages`,
            action: TAGS.GetRolePackages.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves resources for a role.
     *
     * GET /meta/info/roles/resources
     *
     * @param {string} role Role identifier.
     * @param {string} variant Role variant.
     * @param {boolean} [includePackageResources=false]
     * Whether package resources should be included.
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRoleResources(
        role,
        variant,
        includePackageResources = false,
        labels = null
    ) {
        const url = new URL(`${this.FULL_PATH}/resources`);

        url.searchParams.append("role", role);
        url.searchParams.append("variant", variant);
        url.searchParams.append(
            "includePackageResources",
            includePackageResources.toString()
        );

        let tags = {
            name: `${this.FULL_PATH}/resources`,
            endpoint: `${this.FULL_PATH}/resources`,
            action: TAGS.GetRoleResources.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves packages for a role by role id.
     *
     * GET /meta/info/roles/{id}/packages
     *
     * @param {string} id Role UUID.
     * @param {string} variant Role variant.
     * @param {boolean} [includeResources=false]
     * Whether resources should be included.
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRolePackagesById(
        id,
        variant,
        includeResources = false,
        labels = null
    ) {
        const url = new URL(`${this.FULL_PATH}/${id}/packages`);

        url.searchParams.append("variant", variant);
        url.searchParams.append(
            "includeResources",
            includeResources.toString()
        );

        let tags = {
            name: `${this.FULL_PATH}/id/packages`,
            endpoint: `${this.FULL_PATH}/id/packages`,
            action: TAGS.GetRolePackagesById.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }

    /**
     * Retrieves resources for a role by role id.
     *
     * GET /meta/info/roles/{id}/resources
     *
     * @param {string} id Role UUID.
     * @param {string} variant Role variant.
     * @param {boolean} [includePackageResources=false]
     * Whether package resources should be included.
     * @param {{[x: string]: string}} [labels]
     * Optional k6 tags that will be merged with the default request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetRoleResourcesById(
        id,
        variant,
        includePackageResources = false,
        labels = null
    ) {
        const url = new URL(`${this.FULL_PATH}/${id}/resources`);

        url.searchParams.append("variant", variant);
        url.searchParams.append(
            "includePackageResources",
            includePackageResources.toString()
        );

        let tags = {
            name: `${this.FULL_PATH}/id/resources`,
            endpoint: `${this.FULL_PATH}/id/resources`,
            action: TAGS.GetRoleResourcesById.action
        };

        if (labels != null) {
            tags = { ...labels, ...tags };
        }

        const params = {
            tags,
            headers: {
                "Content-type": "application/json",
            },
        };

        return http.get(url.toString(), params);
    }
}

export { RolesApiClient };
