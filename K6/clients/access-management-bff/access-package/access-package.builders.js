import { CreateAccessPackageDelegationQuery, DeleteAccessPackageDelegationQuery, GetAccessPackageDelegationCheckQuery, GetAccessPackageDelegationsQuery, GetAccessPackagePermissionQuery, SearchAccessPackagesQuery } from "./access-package.types.js";

/**
 * Builder for the query parameters of {@link SearchAccessPackages}.
 */
class SearchAccessPackagesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Free text search string.
     *
     * @param {string} searchString Free text search string.
     * @returns {SearchAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withSearchString(searchString) {
        this.query.searchString = searchString;
        return this;
    }

    /**
     * Optional. Entity type name to search packages for.
     *
     * @param {string} typeName Entity type name to search packages for.
     * @returns {SearchAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTypeName(typeName) {
        this.query.typeName = typeName;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {SearchAccessPackagesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAccessPackageDelegations}.
 */
class GetAccessPackageDelegationsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAccessPackageDelegationsQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetAccessPackageDelegationsQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetAccessPackageDelegationsQueryBuilder} This builder, for
     * chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackageDelegationsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAccessPackageDelegation}.
 */
class CreateAccessPackageDelegationQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {CreateAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {CreateAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Access package identifier or URN.
     *
     * @param {string} packageId Access package identifier or URN.
     * @returns {CreateAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAccessPackageDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteAccessPackageDelegation}.
 */
class DeleteAccessPackageDelegationQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {DeleteAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {DeleteAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Access package identifier or URN.
     *
     * @param {string} packageId Access package identifier or URN.
     * @returns {DeleteAccessPackageDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAccessPackageDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAccessPackagePermission}.
 */
class GetAccessPackagePermissionQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAccessPackagePermissionQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetAccessPackagePermissionQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetAccessPackagePermissionQueryBuilder} This builder, for
     * chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackagePermissionQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAccessPackageDelegationCheck}.
 */
class GetAccessPackageDelegationCheckQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetAccessPackageDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackageDelegationCheckQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    CreateAccessPackageDelegationQueryBuilder,
    DeleteAccessPackageDelegationQueryBuilder,
    GetAccessPackageDelegationCheckQueryBuilder,
    GetAccessPackageDelegationsQueryBuilder,
    GetAccessPackagePermissionQueryBuilder,
    SearchAccessPackagesQueryBuilder,
};
