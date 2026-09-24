import { AccessPackageUrn, GetResourceRightsQuery, RightKeyListDto, ServiceOwnerAccessPackageDelegation, ServiceOwnerConnectionPartyUrn, ServiceOwnerResourceDelegation } from "./connections.types.js";

/**
 * The three forms the API accepts for a party, from the
 * ServiceOwnerConnectionPartyUrn schema in the service owner swagger. A value
 * matching none of them is rejected by the API, so the builders below spell out
 * one method per form rather than leaving the caller to assemble the string.
 *
 * The uuid form covers four prefixes: `urn:altinn:party:uuid`,
 * `urn:altinn:person:uuid`, `urn:altinn:organization:uuid` and
 * `urn:altinn:systemuser:uuid`. WithFromPartyUuid and WithToPartyUuid build the
 * first of those; pass one of the other three through WithFrom or WithTo, which
 * take a complete urn as it stands.
 */
const PartyUrn = Object.freeze({
    /**
     * @param {string|number} personIdentifier National identity number, 11 digits.
     * @returns {ServiceOwnerConnectionPartyUrn} The urn.
     */
    person: (personIdentifier) =>
        `urn:altinn:person:identifier-no:${personIdentifier}`,

    /**
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {ServiceOwnerConnectionPartyUrn} The urn.
     */
    organization: (organizationNumber) =>
        `urn:altinn:organization:identifier-no:${organizationNumber}`,

    /**
     * @param {string} partyUuid Party UUID.
     * @returns {ServiceOwnerConnectionPartyUrn} The urn.
     */
    partyUuid: (partyUuid) => `urn:altinn:party:uuid:${partyUuid}`,
});

class ServiceOwnerAccessPackageDelegationBuilder {
    constructor() {
        this.request = /** @type {ServiceOwnerAccessPackageDelegation} */ (/** @type {unknown} */ ({
            from: null,
            to: null,
            packageUrn: null,
        }));
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} from Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} to Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * Sets the delegating party to a person.
     *
     * @param {string|number} personIdentifier National identity number, 11 digits.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithFromPerson(personIdentifier) {
        return this.WithFrom(PartyUrn.person(personIdentifier));
    }

    /**
     * Sets the delegating party to an organization.
     *
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithFromOrganization(organizationNumber) {
        return this.WithFrom(PartyUrn.organization(organizationNumber));
    }

    /**
     * Sets the delegating party by party UUID.
     *
     * @param {string} partyUuid Party UUID.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithFromPartyUuid(partyUuid) {
        return this.WithFrom(PartyUrn.partyUuid(partyUuid));
    }

    /**
     * Sets the receiving party to a person.
     *
     * @param {string|number} personIdentifier National identity number, 11 digits.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithToPerson(personIdentifier) {
        return this.WithTo(PartyUrn.person(personIdentifier));
    }

    /**
     * Sets the receiving party to an organization.
     *
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithToOrganization(organizationNumber) {
        return this.WithTo(PartyUrn.organization(organizationNumber));
    }

    /**
     * Sets the receiving party by party UUID.
     *
     * @param {string} partyUuid Party UUID.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithToPartyUuid(partyUuid) {
        return this.WithTo(PartyUrn.partyUuid(partyUuid));
    }

    /**
     * @param {AccessPackageUrn} packageUrn Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithPackageUrn(packageUrn) {
        this.request.packageUrn = packageUrn;

        return this;
    }

    /**
     * @returns {ServiceOwnerAccessPackageDelegation} The built payload.
     */
    Build() {
        if (this.request.from === null) {
            throw new Error("ServiceOwnerAccessPackageDelegation.from is required");
        }

        if (this.request.to === null) {
            throw new Error("ServiceOwnerAccessPackageDelegation.to is required");
        }

        if (this.request.packageUrn === null) {
            throw new Error(
                "ServiceOwnerAccessPackageDelegation.packageUrn is required",
            );
        }

        return this.request;
    }
}

class GetResourceRightsQueryBuilder {
    constructor() {
        this.query = /** @type {GetResourceRightsQuery} */ ({});
    }

    /**
     * @param {string} resource Value to set.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    WithResource(resource) {
        this.query.resource = resource;

        return this;
    }

    /**
     * @returns {GetResourceRightsQuery} The built query.
     */
    Build() {
        return this.query;
    }
}

class ServiceOwnerResourceDelegationBuilder {
    constructor() {
        this.request = /** @type {ServiceOwnerResourceDelegation} */ (/** @type {unknown} */ ({
            from: null,
            to: null,
            resource: null,
            rightKeys: null,
        }));
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} from Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} to Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * Sets the delegating party to a person.
     *
     * @param {string|number} personIdentifier National identity number, 11 digits.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithFromPerson(personIdentifier) {
        return this.WithFrom(PartyUrn.person(personIdentifier));
    }

    /**
     * Sets the delegating party to an organization.
     *
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithFromOrganization(organizationNumber) {
        return this.WithFrom(PartyUrn.organization(organizationNumber));
    }

    /**
     * Sets the delegating party by party UUID.
     *
     * @param {string} partyUuid Party UUID.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithFromPartyUuid(partyUuid) {
        return this.WithFrom(PartyUrn.partyUuid(partyUuid));
    }

    /**
     * Sets the receiving party to a person.
     *
     * @param {string|number} personIdentifier National identity number, 11 digits.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithToPerson(personIdentifier) {
        return this.WithTo(PartyUrn.person(personIdentifier));
    }

    /**
     * Sets the receiving party to an organization.
     *
     * @param {string|number} organizationNumber Organization number, 9 digits.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithToOrganization(organizationNumber) {
        return this.WithTo(PartyUrn.organization(organizationNumber));
    }

    /**
     * Sets the receiving party by party UUID.
     *
     * @param {string} partyUuid Party UUID.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithToPartyUuid(partyUuid) {
        return this.WithTo(PartyUrn.partyUuid(partyUuid));
    }

    /**
     * @param {string} resource Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithResource(resource) {
        this.request.resource = resource;

        return this;
    }

    /**
     * @param {RightKeyListDto|null} rightKeys Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithRightKeys(rightKeys) {
        this.request.rightKeys = rightKeys;

        return this;
    }

    /**
     * @returns {ServiceOwnerResourceDelegation} The built payload.
     */
    Build() {
        if (this.request.from === null) {
            throw new Error("ServiceOwnerResourceDelegation.from is required");
        }

        if (this.request.to === null) {
            throw new Error("ServiceOwnerResourceDelegation.to is required");
        }

        if (this.request.resource === null) {
            throw new Error(
                "ServiceOwnerResourceDelegation.resource is required",
            );
        }

        return this.request;
    }
}

export {
    GetResourceRightsQueryBuilder,
    ServiceOwnerAccessPackageDelegationBuilder,
    ServiceOwnerResourceDelegationBuilder,
};
