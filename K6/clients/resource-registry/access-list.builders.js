import {
    CreateAccessListModel,
    UpsertAccessListResourceConnectionDto,
} from "./types.js";

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
        this.members.push(`urn:altinn:organization:identifier-no:${organizationNumber}`);

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
     * @returns {UpsertAccessListResourceConnectionDto} The payload.
     */
    build() {
        return { ...this.model };
    }
}

export {
    AccessListMembersBuilder,
    AccessListResourceConnectionBuilder,
    CreateAccessListBuilder,
};
