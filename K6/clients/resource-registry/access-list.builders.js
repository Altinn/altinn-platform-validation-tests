import {
    AccessListGetByOwnerQuery,
    AccessListMembershipsQuery,
    CreateAccessListModel,
    UpsertAccessListResourceConnectionDto,
} from "./types.js";

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

/**
 * Builds the query for listing the access lists of an owner.
 */
class AccessListGetByOwnerQueryBuilder {
    constructor() {
        this.query = /** @type {AccessListGetByOwnerQuery} */ ({});
    }

    /**
     * Includes related data on each list. Can be called more than once.
     * `resource-actions` needs `withResource` too; the swagger requires the
     * resource when the connections are included.
     *
     * @param {import("./types.js").AccessListInclude} include What to include: resources, resource-actions or members.
     * @returns {AccessListGetByOwnerQueryBuilder} This builder, for chaining.
     */
    addInclude(include) {
        this.query.include ??= [];
        this.query.include.push(include);

        return this;
    }

    /**
     * Narrows the included connections to one resource. It does not filter
     * the lists.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {AccessListGetByOwnerQueryBuilder} This builder, for chaining.
     */
    withResource(resourceId) {
        this.query.resource = resourceId;

        return this;
    }

    /**
     * Sets the continuation token for the next page.
     *
     * @param {string} token Continuation token.
     * @returns {AccessListGetByOwnerQueryBuilder} This builder, for chaining.
     */
    withToken(token) {
        this.query.token = token;

        return this;
    }

    /**
     * @returns {AccessListGetByOwnerQuery} The query.
     */
    build() {
        return { ...this.query };
    }
}

/**
 * Builds the query for the memberships lookup. Both filters take URNs, see
 * PartyUrn and ResourceUrn.
 */
class AccessListMembershipsQueryBuilder {
    constructor() {
        this.query = /** @type {AccessListMembershipsQuery} */ ({});
    }

    /**
     * Adds a party to look up. Can be called more than once.
     *
     * @param {import("./types.js").PartyUrn} party Party URN.
     * @returns {AccessListMembershipsQueryBuilder} This builder, for chaining.
     */
    addParty(party) {
        this.query.party ??= [];
        this.query.party.push(party);

        return this;
    }

    /**
     * Adds a resource to look up. Can be called more than once.
     *
     * @param {import("./types.js").ResourceUrnResourceId} resource Resource URN.
     * @returns {AccessListMembershipsQueryBuilder} This builder, for chaining.
     */
    addResource(resource) {
        this.query.resource ??= [];
        this.query.resource.push(resource);

        return this;
    }

    /**
     * @returns {AccessListMembershipsQuery} The query.
     */
    build() {
        return { ...this.query };
    }
}

export {
    AccessListGetByOwnerQueryBuilder,
    AccessListMembersBuilder,
    AccessListMembershipsQueryBuilder,
    AccessListResourceConnectionBuilder,
    CreateAccessListBuilder,
};
