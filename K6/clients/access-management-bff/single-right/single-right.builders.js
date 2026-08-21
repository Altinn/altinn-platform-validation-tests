import { DelegateSingleRightsQuery, GetResourceDelegationsQuery, GetResourceRightsQuery, GetRightsMetaQuery, GetSingleRightDelegationCheckQuery, RevokeSingleRightsQuery, UpdateSingleRightsQuery } from "./single-right.types.js";

/**
 * Builder for the query parameters of {@link GetSingleRightDelegationCheck}.
 */
class GetSingleRightDelegationCheckQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetSingleRightDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetSingleRightDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSingleRightDelegationCheckQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetRightsMeta}.
 */
class GetRightsMetaQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetRightsMetaQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRightsMetaQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DelegateSingleRights}.
 */
class DelegateSingleRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {DelegateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {DelegateSingleRightsQueryBuilder} This builder, for chaining.
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
     * @returns {DelegateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {DelegateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DelegateSingleRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetResourceDelegations}.
 */
class GetResourceDelegationsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetResourceDelegationsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetResourceDelegationsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetResourceDelegationsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceDelegationsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetResourceRights}.
 */
class GetResourceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link RevokeSingleRights}.
 */
class RevokeSingleRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {RevokeSingleRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {RevokeSingleRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {RevokeSingleRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {RevokeSingleRightsQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {RevokeSingleRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link UpdateSingleRights}.
 */
class UpdateSingleRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {UpdateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {UpdateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {UpdateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {UpdateSingleRightsQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateSingleRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    DelegateSingleRightsQueryBuilder,
    GetResourceDelegationsQueryBuilder,
    GetResourceRightsQueryBuilder,
    GetRightsMetaQueryBuilder,
    GetSingleRightDelegationCheckQueryBuilder,
    RevokeSingleRightsQueryBuilder,
    UpdateSingleRightsQueryBuilder,
};
