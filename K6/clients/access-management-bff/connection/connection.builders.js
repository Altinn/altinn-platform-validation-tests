import { ValidatePersonInput } from "../common/common.types.js";
import { CreateRightHolderQuery, DeleteReporteeConnectionQuery, GetRightHoldersQuery, GetSimplifiedConnectionsQuery } from "./connection.types.js";

/**
 * Builder for the query parameters of {@link DeleteReporteeConnection}.
 */
class DeleteReporteeConnectionQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteReporteeConnectionQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {DeleteReporteeConnectionQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {DeleteReporteeConnectionQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteReporteeConnectionQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateRightHolder}.
 */
class CreateRightHolderQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the person to add as right holder.
     *
     * @param {string} rightholderPartyUuid Party UUID of the person to add as
     * right holder.
     * @returns {CreateRightHolderQueryBuilder} This builder, for chaining.
     */
    withRightholderPartyUuid(rightholderPartyUuid) {
        this.query.rightholderPartyUuid = rightholderPartyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateRightHolderQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetRightHolders}.
 */
class GetRightHoldersQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetRightHoldersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Party UUID the access is given from.
     *
     * @param {string} from Party UUID the access is given from.
     * @returns {GetRightHoldersQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional. Party UUID the access is given to.
     *
     * @param {string} to Party UUID the access is given to.
     * @returns {GetRightHoldersQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional. Whether to include client delegations.
     *
     * @param {boolean} includeClientDelegations Whether to include client
     * delegations.
     * @returns {GetRightHoldersQueryBuilder} This builder, for chaining.
     */
    withIncludeClientDelegations(includeClientDelegations) {
        this.query.includeClientDelegations = includeClientDelegations;
        return this;
    }

    /**
     * Optional. Whether to include agent connections.
     *
     * @param {boolean} includeAgentConnections Whether to include agent
     * connections.
     * @returns {GetRightHoldersQueryBuilder} This builder, for chaining.
     */
    withIncludeAgentConnections(includeAgentConnections) {
        this.query.includeAgentConnections = includeAgentConnections;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRightHoldersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSimplifiedConnections}.
 */
class GetSimplifiedConnectionsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSimplifiedConnectionsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSimplifiedConnectionsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the {@link ValidatePersonInput} request body.
 */
class ValidatePersonInputBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Optional. Either an 11-digit national identity number or a username.
     *
     * @param {string} personIdentifier Either an 11-digit national identity number
     * or a username.
     * @returns {ValidatePersonInputBuilder} This builder, for chaining.
     */
    withPersonIdentifier(personIdentifier) {
        this.body.personIdentifier = personIdentifier;
        return this;
    }

    /**
     * Optional. Last name of the person.
     *
     * @param {string} lastName Last name of the person.
     * @returns {ValidatePersonInputBuilder} This builder, for chaining.
     */
    withLastName(lastName) {
        this.body.lastName = lastName;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {ValidatePersonInput} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    CreateRightHolderQueryBuilder,
    DeleteReporteeConnectionQueryBuilder,
    GetRightHoldersQueryBuilder,
    GetSimplifiedConnectionsQueryBuilder,
    ValidatePersonInputBuilder,
};
