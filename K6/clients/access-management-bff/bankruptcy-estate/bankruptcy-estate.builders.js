import { PersonInput } from "../common/common.types.js";
import { CreateAdministratorQuery, DeleteAdministratorQuery, GetAdministratorsQuery, GetIsBankruptcyEstateAdminQuery } from "./bankruptcy-estate.types.js";

/**
 * Builder for the query parameters of {@link GetIsBankruptcyEstateAdmin}.
 */
class GetIsBankruptcyEstateAdminQueryBuilder {
    constructor() {
        this.query = /** @type {GetIsBankruptcyEstateAdminQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the bankruptcy estate.
     *
     * @param {string} party Party UUID of the bankruptcy estate.
     * @returns {GetIsBankruptcyEstateAdminQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetIsBankruptcyEstateAdminQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetAdministrators}.
 */
class GetAdministratorsQueryBuilder {
    constructor() {
        this.query = /** @type {GetAdministratorsQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the bankruptcy estate.
     *
     * @param {string} party Party UUID of the bankruptcy estate.
     * @returns {GetAdministratorsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAdministratorsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateAdministrator}.
 */
class CreateAdministratorQueryBuilder {
    constructor() {
        this.query = /** @type {CreateAdministratorQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the bankruptcy estate.
     *
     * @param {string} party Party UUID of the bankruptcy estate.
     * @returns {CreateAdministratorQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAdministratorQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteAdministrator}.
 */
class DeleteAdministratorQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteAdministratorQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the bankruptcy estate.
     *
     * @param {string} party Party UUID of the bankruptcy estate.
     * @returns {DeleteAdministratorQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. User UUID of the administrator to remove.
     *
     * @param {string} user User UUID of the administrator to remove.
     * @returns {DeleteAdministratorQueryBuilder} This builder, for chaining.
     */
    withUser(user) {
        this.query.user = user;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAdministratorQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the request body of {@link CreateAdministrator}.
 */
class PersonInputBuilder {
    constructor() {
        this.body = /** @type {PersonInput} */ ({});
    }

    /**
     * Required. Either an 11-digit national identity number or a username.
     *
     * @param {string} personIdentifier Either an 11-digit national identity number
     * or a username.
     * @returns {PersonInputBuilder} This builder, for chaining.
     */
    withPersonIdentifier(personIdentifier) {
        this.body.personIdentifier = personIdentifier;
        return this;
    }

    /**
     * Required. Last name of the person.
     *
     * @param {string} lastName Last name of the person.
     * @returns {PersonInputBuilder} This builder, for chaining.
     */
    withLastName(lastName) {
        this.body.lastName = lastName;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {PersonInput} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    CreateAdministratorQueryBuilder,
    DeleteAdministratorQueryBuilder,
    GetAdministratorsQueryBuilder,
    GetIsBankruptcyEstateAdminQueryBuilder,
    PersonInputBuilder,
};
