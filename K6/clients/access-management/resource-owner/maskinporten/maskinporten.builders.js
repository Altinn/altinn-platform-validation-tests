/**
 * Builder for Maskinporten delegations query parameters.
 *
 * All parameters are optional filters. Omitting every filter returns all
 * delegations the authenticated resource owner is allowed to see.
 */
class MaskinportenDelegationsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional supplier organization filter.
     *
     * @param {string} supplierOrg Organization number of the supplier.
     * @returns {MaskinportenDelegationsQueryBuilder} This builder, for chaining.
     */
    withSupplierOrg(supplierOrg) {
        this.query.supplierOrg = supplierOrg;
        return this;
    }

    /**
     * Optional consumer organization filter.
     *
     * @param {string} consumerOrg Organization number of the consumer.
     * @returns {MaskinportenDelegationsQueryBuilder} This builder, for chaining.
     */
    withConsumerOrg(consumerOrg) {
        this.query.consumerOrg = consumerOrg;
        return this;
    }

    /**
     * Optional scope filter.
     *
     * @param {string} scope Maskinporten scope, e.g. altinn:instances.read.
     * @returns {MaskinportenDelegationsQueryBuilder} This builder, for chaining.
     */
    withScope(scope) {
        this.query.scope = scope;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {MaskinportenDelegationsQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export { MaskinportenDelegationsQueryBuilder };
