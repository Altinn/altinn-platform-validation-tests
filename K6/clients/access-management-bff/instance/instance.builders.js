import { InstanceRightsDelegationDto, PersonInput } from "../common/common.types.js";
import { CreateInstanceRightsQuery, DeleteInstanceDelegationQuery, GetInstanceDelegationCheckQuery, GetInstanceDelegationsQuery, GetInstanceRightsQuery, GetInstanceSimplifiedUsersQuery, UpdateInstanceRightsQuery } from "./instance.types.js";

/**
 * Builder for the query parameters of {@link GetInstanceDelegations}.
 */
class GetInstanceDelegationsQueryBuilder {
    constructor() {
        this.query = /** @type {GetInstanceDelegationsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetInstanceDelegationsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetInstanceDelegationsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetInstanceDelegationsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceDelegationsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceDelegationsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceDelegationsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteInstanceDelegation}.
 */
class DeleteInstanceDelegationQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteInstanceDelegationQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteInstanceDelegationQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {DeleteInstanceDelegationQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {DeleteInstanceDelegationQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteInstanceDelegationQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {DeleteInstanceDelegationQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteInstanceDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetInstanceDelegationCheck}.
 */
class GetInstanceDelegationCheckQueryBuilder {
    constructor() {
        this.query = /** @type {GetInstanceDelegationCheckQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceDelegationCheckQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateInstanceRights}.
 */
class CreateInstanceRightsQueryBuilder {
    constructor() {
        this.query = /** @type {CreateInstanceRightsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateInstanceRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetInstanceRights}.
 */
class GetInstanceRightsQueryBuilder {
    constructor() {
        this.query = /** @type {GetInstanceRightsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link UpdateInstanceRights}.
 */
class UpdateInstanceRightsQueryBuilder {
    constructor() {
        this.query = /** @type {UpdateInstanceRightsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateInstanceRightsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetInstanceSimplifiedUsers}.
 */
class GetInstanceSimplifiedUsersQueryBuilder {
    constructor() {
        this.query = /** @type {GetInstanceSimplifiedUsersQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetInstanceSimplifiedUsersQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceSimplifiedUsersQueryBuilder} This builder, for
     * chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional. Instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceSimplifiedUsersQueryBuilder} This builder, for
     * chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceSimplifiedUsersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the {@link InstanceRightsDelegationDto} request body.
 */
class InstanceRightsDelegationDtoBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Optional. The person the rights are delegated to.
     *
     * @param {PersonInput} to The person the rights are delegated to.
     * @returns {InstanceRightsDelegationDtoBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.body.to = to;
        return this;
    }

    /**
     * Required. Keys of the rights to delegate. Can be called more than once.
     *
     * @param {string} directRightKey Keys of the rights to delegate.
     * @returns {InstanceRightsDelegationDtoBuilder} This builder, for chaining.
     */
    addDirectRightKey(directRightKey) {
        this.body.directRightKeys ??= [];
        this.body.directRightKeys.push(directRightKey);
        return this;
    }

    /**
     * Required. Keys of the rights to delegate. Replaces any previous values.
     *
     * @param {Array<string>} directRightKeys Keys of the rights to delegate.
     * @returns {InstanceRightsDelegationDtoBuilder} This builder, for chaining.
     */
    withDirectRightKeys(directRightKeys) {
        this.body.directRightKeys = directRightKeys;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {InstanceRightsDelegationDto} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    CreateInstanceRightsQueryBuilder,
    DeleteInstanceDelegationQueryBuilder,
    GetInstanceDelegationCheckQueryBuilder,
    GetInstanceDelegationsQueryBuilder,
    GetInstanceRightsQueryBuilder,
    GetInstanceSimplifiedUsersQueryBuilder,
    InstanceRightsDelegationDtoBuilder,
    UpdateInstanceRightsQueryBuilder,
};
