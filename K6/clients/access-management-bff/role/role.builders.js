import { DeleteRoleQuery, GetRolePackagesQuery, GetRolePermissionsQuery, GetRoleResourcesQuery } from "./role.types.js";

/**
 * Builder for the query parameters of {@link GetRolePermissions}.
 */
class GetRolePermissionsQueryBuilder {
    constructor() {
        this.query = /** @type {GetRolePermissionsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetRolePermissionsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetRolePermissionsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetRolePermissionsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRolePermissionsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetRolePackages}.
 */
class GetRolePackagesQueryBuilder {
    constructor() {
        this.query = /** @type {GetRolePackagesQuery} */ ({});
    }

    /**
     * Optional. Role code.
     *
     * @param {string} roleCode Role code.
     * @returns {GetRolePackagesQueryBuilder} This builder, for chaining.
     */
    withRoleCode(roleCode) {
        this.query.roleCode = roleCode;
        return this;
    }

    /**
     * Optional. Entity variant the role is held for.
     *
     * @param {string} variant Entity variant the role is held for.
     * @returns {GetRolePackagesQueryBuilder} This builder, for chaining.
     */
    withVariant(variant) {
        this.query.variant = variant;
        return this;
    }

    /**
     * Optional. Whether to include the resources of each package.
     *
     * @param {boolean} includeResources Whether to include the resources of each
     * package.
     * @returns {GetRolePackagesQueryBuilder} This builder, for chaining.
     */
    withIncludeResources(includeResources) {
        this.query.includeResources = includeResources;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRolePackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteRole}.
 */
class DeleteRoleQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteRoleQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Role code.
     *
     * @param {string} rolecode Role code.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withRolecode(rolecode) {
        this.query.rolecode = rolecode;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteRoleQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetRoleResources}.
 */
class GetRoleResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {GetRoleResourcesQuery} */ ({});
    }

    /**
     * Optional. Role code.
     *
     * @param {string} roleCode Role code.
     * @returns {GetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    withRoleCode(roleCode) {
        this.query.roleCode = roleCode;
        return this;
    }

    /**
     * Optional. Entity variant the role is held for.
     *
     * @param {string} variant Entity variant the role is held for.
     * @returns {GetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    withVariant(variant) {
        this.query.variant = variant;
        return this;
    }

    /**
     * Optional. Whether to include resources granted through access packages.
     *
     * @param {boolean} includePackageResources Whether to include resources
     * granted through access packages.
     * @returns {GetRoleResourcesQueryBuilder} This builder, for chaining.
     */
    withIncludePackageResources(includePackageResources) {
        this.query.includePackageResources = includePackageResources;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRoleResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    DeleteRoleQueryBuilder,
    GetRolePackagesQueryBuilder,
    GetRolePermissionsQueryBuilder,
    GetRoleResourcesQueryBuilder,
};
