import { CreateAccessListModel, UpsertAccessListResourceConnectionDto } from "./types.js";

/**
 * The party URN forms the access list endpoints take and report, from the
 * PartyUrn schema in the swagger. A value matching none of them is a 400, so
 * these spell out one function per form rather than leaving the caller to
 * assemble the string.
 */
export const PartyUrn = Object.freeze({
    /**
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {import("./types.js").PartyUrn} The urn.
     */
    organization: (organizationNumber) => `urn:altinn:organization:identifier-no:${organizationNumber}`,

    /**
     * @param {string} partyUuid Party UUID. Also the form the registry reports members by.
     * @returns {import("./types.js").PartyUrn} The urn.
     */
    partyUuid: (partyUuid) => `urn:altinn:party:uuid:${partyUuid}`,

    /**
     * @param {string|number} partyId Party id.
     * @returns {import("./types.js").PartyUrn} The urn.
     */
    partyId: (partyId) => `urn:altinn:party:id:${partyId}`,
});

/**
 * The resource URN the memberships query takes and reports.
 */
export const ResourceUrn = Object.freeze({
    /**
     * @param {string} resourceId Resource identifier.
     * @returns {import("./types.js").ResourceUrnResourceId} The urn.
     */
    resourceId: (resourceId) => `urn:altinn:resource:${resourceId}`,
});

/**
 * Builds the payload for creating or updating an access list.
 */
class CreateAccessListBuilder {
    constructor() {
        /** @type {CreateAccessListModel} */
        this.model = {
            name: null,
            description: null,
        };
    }

    /**
     * @param {string} name Access list name.
     * @returns {CreateAccessListBuilder} This builder, for chaining.
     */
    withName(name) {
        this.model.name = name;

        return this;
    }

    /**
     * @param {string|null} description Access list description.
     * @returns {CreateAccessListBuilder} This builder, for chaining.
     */
    withDescription(description) {
        this.model.description = description;

        return this;
    }

    /**
     * @returns {CreateAccessListModel} The payload.
     */
    build() {
        return { ...this.model };
    }
}

/**
 * Builds the members payload for adding, replacing or removing members.
 */
class AccessListMembersBuilder {
    constructor() {
        /** @type {Array<import("./types.js").PartyUrn>} */
        this.members = [];
    }

    /**
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {AccessListMembersBuilder} This builder, for chaining.
     */
    withOrganization(organizationNumber) {
        this.members.push(PartyUrn.organization(organizationNumber));

        return this;
    }

    /**
     * @param {Array<string|number>} organizationNumbers Organization numbers, 9 digits each.
     * @returns {AccessListMembersBuilder} This builder, for chaining.
     */
    withOrganizations(organizationNumbers) {
        for (const organizationNumber of organizationNumbers) {
            this.withOrganization(organizationNumber);
        }

        return this;
    }

    /**
     * @param {string} partyUuid Party UUID.
     * @returns {AccessListMembersBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.members.push(PartyUrn.partyUuid(partyUuid));

        return this;
    }

    /**
     * @returns {{data: Array<import("./types.js").PartyUrn>}} The payload.
     */
    build() {
        return { data: [...this.members] };
    }
}

/**
 * Builds the payload for creating or updating a resource connection on an
 * access list.
 */
class AccessListResourceConnectionBuilder {
    constructor() {
        /** @type {UpsertAccessListResourceConnectionDto} */
        this.model = {
            actionFilters: null,
        };
    }

    /**
     * @param {Array<string>|null} actionFilters Allowed actions. Null or empty means every action.
     * @returns {AccessListResourceConnectionBuilder} This builder, for chaining.
     */
    withActionFilters(actionFilters) {
        this.model.actionFilters = actionFilters === null ? null : [...actionFilters];

        return this;
    }

    /**
     * @returns {UpsertAccessListResourceConnectionDto} The payload.
     */
    build() {
        return { ...this.model };
    }
}

export { AccessListMembersBuilder, AccessListResourceConnectionBuilder, CreateAccessListBuilder };
