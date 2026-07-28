class RolesGetRolePackagesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} role See the client method.
     * @returns {RolesGetRolePackagesQueryBuilder} This builder, for chaining.
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant See the client method.
     * @returns {RolesGetRolePackagesQueryBuilder} This builder, for chaining.
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources See the client method.
     * @returns {RolesGetRolePackagesQueryBuilder} This builder, for chaining.
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {object} The built payload.
     */
    Build() {
        return this.query;
    }
}

class RolesGetRoleResourcesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} role See the client method.
     * @returns {RolesGetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant See the client method.
     * @returns {RolesGetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources See the client method.
     * @returns {RolesGetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {object} The built payload.
     */
    Build() {
        return this.query;
    }
}

class RolesGetRolePackagesByIdQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} variant See the client method.
     * @returns {RolesGetRolePackagesByIdQueryBuilder} This builder, for chaining.
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources See the client method.
     * @returns {RolesGetRolePackagesByIdQueryBuilder} This builder, for chaining.
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {object} The built payload.
     */
    Build() {
        return this.query;
    }
}

class RolesGetRoleResourcesByIdQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} variant See the client method.
     * @returns {RolesGetRoleResourcesByIdQueryBuilder} This builder, for chaining.
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources See the client method.
     * @returns {RolesGetRoleResourcesByIdQueryBuilder} This builder, for chaining.
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {object} The built payload.
     */
    Build() {
        return this.query;
    }
}

export {
    RolesGetRolePackagesByIdQueryBuilder,
    RolesGetRolePackagesQueryBuilder,
    RolesGetRoleResourcesByIdQueryBuilder,
    RolesGetRoleResourcesQueryBuilder,
};
