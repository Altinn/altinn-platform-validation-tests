class RolesGetRolePackagesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} role
     * @returns {RolesGetRolePackagesQueryBuilder}
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant
     * @returns {RolesGetRolePackagesQueryBuilder}
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources
     * @returns {RolesGetRolePackagesQueryBuilder}
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {Object}
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
     * @param {string} role
     * @returns {RolesGetRoleResourcesQueryBuilder}
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant
     * @returns {RolesGetRoleResourcesQueryBuilder}
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources
     * @returns {RolesGetRoleResourcesQueryBuilder}
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {Object}
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
     * @param {string} variant
     * @returns {RolesGetRolePackagesByIdQueryBuilder}
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources
     * @returns {RolesGetRolePackagesByIdQueryBuilder}
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {Object}
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
     * @param {string} variant
     * @returns {RolesGetRoleResourcesByIdQueryBuilder}
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources
     * @returns {RolesGetRoleResourcesByIdQueryBuilder}
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {Object}
     */
    Build() {
        return this.query;
    }
}

export {
    RolesGetRolePackagesQueryBuilder,
    RolesGetRoleResourcesQueryBuilder,
    RolesGetRolePackagesByIdQueryBuilder,
    RolesGetRoleResourcesByIdQueryBuilder,
};
