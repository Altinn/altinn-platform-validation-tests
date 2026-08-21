import { MaskinportenConsumerResourcesQuery, MaskinportenConsumersQuery } from "./maskinporten-consumers.types.js";

/**
 * Builder for Maskinporten consumers query parameters.
 */
class MaskinportenConsumersQueryBuilder {
    constructor() {
        this.query = /** @type {MaskinportenConsumersQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenConsumersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional consumer filter.
     *
     * @param {string} consumer Consumer identifier.
     * @returns {MaskinportenConsumersQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {MaskinportenConsumersQuery} The built payload.
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
        this.query = /** @type {MaskinportenConsumerResourcesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {MaskinportenConsumersResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional consumer filter.
     *
     * @param {string} consumer Consumer identifier.
     * @returns {MaskinportenConsumersResourcesQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Optional resource filter.
     *
     * @param {string} resource Resource identifier.
     * @returns {MaskinportenConsumersResourcesQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {MaskinportenConsumerResourcesQuery} The built payload.
     */
    build() {
        return this.query;
    }
}

export {
    MaskinportenConsumersQueryBuilder,
    MaskinportenConsumersResourcesQueryBuilder,
};
