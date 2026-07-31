/**
 * Builder for creating query parameters for the End User Authorized Parties API.
 *
 * @example
 * const query = new EndUserAuthorizedPartiesQueryBuilder()
 *     .includeRoles(true)
 *     .includeResources(true)
 *     .withPartyFilter([
 *         "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *     ])
 *     .build();
 */
class EndUserAuthorizedPartiesQueryBuilder {
    constructor() {
        /** @type {EndUserAuthorizedPartiesQuery} */
        this.query = {};
    }

    /**
     * Include authorized roles in the response.
     *
     * @param {boolean} value Whether roles should be included.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeRoles(value = true) {
        this.query.includeRoles = value;
        return this;
    }

    /**
     * Include authorized access packages in the response.
     *
     * @param {boolean} value Whether access packages should be included.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeAccessPackages(value = true) {
        this.query.includeAccessPackages = value;
        return this;
    }

    /**
     * Include authorized resources in the response.
     *
     * @param {boolean} value Whether resources should be included.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeResources(value = true) {
        this.query.includeResources = value;
        return this;
    }

    /**
     * Include authorized resource instances in the response.
     *
     * @param {boolean} value Whether instances should be included.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeInstances(value = true) {
        this.query.includeInstances = value;
        return this;
    }

    /**
     * Include parties inherited through key roles.
     *
     * @param {"false"|"true"|"auto"} value Key role inclusion mode.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includePartiesViaKeyRoles(value) {
        this.query.includePartiesViaKeyRoles = value;
        return this;
    }

    /**
     * Include sub parties in the hierarchy.
     *
     * @param {"false"|"true"|"auto"} value Sub party inclusion mode.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeSubParties(value) {
        this.query.includeSubParties = value;
        return this;
    }

    /**
     * Include inactive parties.
     *
     * @param {"false"|"true"|"auto"} value Inactive party inclusion mode.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    includeInactiveParties(value) {
        this.query.includeInactiveParties = value;
        return this;
    }

    /**
     * Filter the response to specific party UUIDs.
     *
     * @param {Array<string>} partyUuids Party UUIDs to include.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    withPartyFilter(partyUuids) {
        this.query.partyFilter = partyUuids;
        return this;
    }

    /**
     * Filter the response to parties with access to any of the provided resources.
     *
     * @param {Array<string>} resourceIds Resource identifiers.
     * @returns {EndUserAuthorizedPartiesQueryBuilder} This builder instance.
     */
    withAnyOfResourceIds(resourceIds) {
        this.query.anyOfResourceIds = resourceIds;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {EndUserAuthorizedPartiesQuery} Query parameters for the API request.
     */
    build() {
        return { ...this.query };
    }
}

export { EndUserAuthorizedPartiesQueryBuilder };
