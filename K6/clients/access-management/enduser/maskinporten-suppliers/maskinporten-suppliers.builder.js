class MaskinportenSuppliersQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenSuppliersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional supplier filter.
     *
     * @param {string} supplier Supplier identifier.
     * @returns {MaskinportenSuppliersQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional cascade delete flag.
     *
     * @param {boolean} cascade Whether associated delegations should also be removed.
     * @returns {MaskinportenSuppliersQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, supplier?: string, cascade?: boolean}} The built payload.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for Maskinporten supplier resources query parameters.
 */
class MaskinportenSupplierResourcesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional supplier filter.
     *
     * @param {string} supplier Supplier identifier.
     * @returns {MaskinportenSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional resource filter.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, supplier?: string, resource?: string}} The built payload.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for Maskinporten supplier delegation check query parameters.
 */
class MaskinportenSupplierDelegationCheckQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenSupplierDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenSupplierDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, resource: string}} The built payload.
     */
    build() {
        return this.query;
    }
}

export {
    MaskinportenSupplierDelegationCheckQueryBuilder,
    MaskinportenSupplierResourcesQueryBuilder,
    MaskinportenSuppliersQueryBuilder,
};
