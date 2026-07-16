/**
 * Builder for Maskinporten consumers query parameters.
 */
class MaskinportenConsumersQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenConsumersQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional consumer filter.
     *
     * @param {string} consumer Consumer identifier.
     * @returns {MaskinportenConsumersQueryBuilder}
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, consumer?: string}}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for Maskinporten consumers resources query parameters.
 */
class MaskinportenConsumersResourcesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenConsumersResourcesQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional consumer filter.
     *
     * @param {string} consumer Consumer identifier.
     * @returns {MaskinportenConsumersResourcesQueryBuilder}
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Optional resource filter.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenConsumersResourcesQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, consumer?: string, resource?: string}}
     */
    build() {
        return this.query;
    }
}

export {
    MaskinportenConsumersQueryBuilder,
    MaskinportenConsumersResourcesQueryBuilder,
};
