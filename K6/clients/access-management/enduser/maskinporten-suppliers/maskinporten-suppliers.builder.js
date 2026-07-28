class MaskinportenSuppliersQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenSuppliersQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional supplier filter.
     *
     * @param {string} supplier Supplier identifier.
     * @returns {MaskinportenSuppliersQueryBuilder} TODO: Description
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional cascade delete flag.
     *
     * @param {boolean} cascade Whether associated delegations should also be removed.
     * @returns {MaskinportenSuppliersQueryBuilder} TODO: Description
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, supplier?: string, cascade?: boolean}} TODO: Description
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
     * @returns {MaskinportenSupplierResourcesQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional supplier filter.
     *
     * @param {string} supplier Supplier identifier.
     * @returns {MaskinportenSupplierResourcesQueryBuilder} TODO: Description
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional resource filter.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenSupplierResourcesQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, supplier?: string, resource?: string}} TODO: Description
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
     * @returns {MaskinportenSupplierDelegationCheckQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenSupplierDelegationCheckQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, resource: string}} TODO: Description
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
