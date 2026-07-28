class RolesGetRolePackagesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} role TODO: Description
     * @returns {RolesGetRolePackagesQueryBuilder} TODO: Description
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant TODO: Description
     * @returns {RolesGetRolePackagesQueryBuilder} TODO: Description
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources TODO: Description
     * @returns {RolesGetRolePackagesQueryBuilder} TODO: Description
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {object} TODO: Description
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
     * @param {string} role TODO: Description
     * @returns {RolesGetRoleResourcesQueryBuilder} TODO: Description
     */
    WithRole(role) {
        this.query.role = role;

        return this;
    }

    /**
     * @param {string} variant TODO: Description
     * @returns {RolesGetRoleResourcesQueryBuilder} TODO: Description
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources TODO: Description
     * @returns {RolesGetRoleResourcesQueryBuilder} TODO: Description
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {object} TODO: Description
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
     * @param {string} variant TODO: Description
     * @returns {RolesGetRolePackagesByIdQueryBuilder} TODO: Description
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includeResources TODO: Description
     * @returns {RolesGetRolePackagesByIdQueryBuilder} TODO: Description
     */
    WithIncludeResources(includeResources) {
        this.query.includeResources = includeResources;

        return this;
    }

    /**
     * @returns {object} TODO: Description
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
     * @param {string} variant TODO: Description
     * @returns {RolesGetRoleResourcesByIdQueryBuilder} TODO: Description
     */
    WithVariant(variant) {
        this.query.variant = variant;

        return this;
    }

    /**
     * @param {boolean} includePackageResources TODO: Description
     * @returns {RolesGetRoleResourcesByIdQueryBuilder} TODO: Description
     */
    WithIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;

        return this;
    }

    /**
     * @returns {object} TODO: Description
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
