import { AgentDelegationRequestFE, ClientRoleAccessPackages } from "../common/common.types.js";
import { CreateAgentSystemUserDelegationQuery, CreateAgentSystemUserSelfDelegationQuery, DeleteAgentSystemUserDelegationQuery, DeleteAgentSystemUserSelfDelegationQuery, GetAgentSystemUserCustomersQuery, GetAgentSystemUserDelegationsQuery, GetAgentSystemUserSelfDelegationQuery } from "./system-user-agent-delegation.types.js";

/**
 * Builder for the query parameters of {@link GetAgentSystemUserCustomers}.
 */
class GetAgentSystemUserCustomersQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentSystemUserCustomersQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {GetAgentSystemUserCustomersQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentSystemUserCustomersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAgentSystemUserDelegations}.
 */
class GetAgentSystemUserDelegationsQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentSystemUserDelegationsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {GetAgentSystemUserDelegationsQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentSystemUserDelegationsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAgentSystemUserDelegation}.
 */
class CreateAgentSystemUserDelegationQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAgentSystemUserDelegationQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {CreateAgentSystemUserDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAgentSystemUserDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteAgentSystemUserDelegation}.
 */
class DeleteAgentSystemUserDelegationQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAgentSystemUserDelegationQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {DeleteAgentSystemUserDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentSystemUserDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of
 * {@link CreateAgentSystemUserSelfDelegation}.
 */
class CreateAgentSystemUserSelfDelegationQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {CreateAgentSystemUserSelfDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAgentSystemUserSelfDelegationQuery} The built query
     * parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of
 * {@link DeleteAgentSystemUserSelfDelegation}.
 */
class DeleteAgentSystemUserSelfDelegationQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {DeleteAgentSystemUserSelfDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentSystemUserSelfDelegationQuery} The built query
     * parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of
 * {@link GetAgentSystemUserSelfDelegation}.
 */
class GetAgentSystemUserSelfDelegationQueryBuilder {
    constructor() {
        this.query = /** @type {GetAgentSystemUserSelfDelegationQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {GetAgentSystemUserSelfDelegationQueryBuilder} This builder, for
     * chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAgentSystemUserSelfDelegationQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the {@link AgentDelegationRequestFE} request body.
 */
class AgentDelegationRequestFEBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Optional. UUID of the customer to delegate.
     *
     * @param {string} customerId UUID of the customer to delegate.
     * @returns {AgentDelegationRequestFEBuilder} This builder, for chaining.
     */
    withCustomerId(customerId) {
        this.body.customerId = customerId;
        return this;
    }

    /**
     * Optional. Roles with the access packages to delegate. Can be called more
     * than once.
     *
     * @param {ClientRoleAccessPackages} acces Roles with the access packages to
     * delegate.
     * @returns {AgentDelegationRequestFEBuilder} This builder, for chaining.
     */
    addAcces(acces) {
        this.body.access ??= [];
        this.body.access.push(acces);
        return this;
    }

    /**
     * Optional. Roles with the access packages to delegate. Replaces any previous
     * values.
     *
     * @param {Array<ClientRoleAccessPackages>} access Roles with the access
     * packages to delegate.
     * @returns {AgentDelegationRequestFEBuilder} This builder, for chaining.
     */
    withAccess(access) {
        this.body.access = access;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {AgentDelegationRequestFE} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    AgentDelegationRequestFEBuilder,
    CreateAgentSystemUserDelegationQueryBuilder,
    CreateAgentSystemUserSelfDelegationQueryBuilder,
    DeleteAgentSystemUserDelegationQueryBuilder,
    DeleteAgentSystemUserSelfDelegationQueryBuilder,
    GetAgentSystemUserCustomersQueryBuilder,
    GetAgentSystemUserDelegationsQueryBuilder,
    GetAgentSystemUserSelfDelegationQueryBuilder,
};
