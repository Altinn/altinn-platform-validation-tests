import { ConsentLookupRequest, MaskinportenDelegationsQuery } from "./maskinporten.types.js";

/**
 * Builder for Maskinporten delegations query parameters.
 *
 * All parameters are optional filters. Omitting every filter returns all
 * delegations the authenticated resource owner is allowed to see.
 */
class MaskinportenDelegationsQueryBuilder {
    constructor() {
        this.query = /** @type {MaskinportenDelegationsQuery} */ ({});
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

/**
 * Builder for the body of a consent lookup.
 *
 * All three fields are required. The lookup identifies a consent by who it is
 * from, who it is to and its id, so leaving one out is not a narrower lookup, it
 * is a different consent.
 */
class ConsentLookupRequestBuilder {
    constructor() {
        this.request = /** @type {ConsentLookupRequest} */ ({
            id: null,
            from: null,
            to: null,
        });
    }

    /**
     * @param {string} id Consent UUID.
     * @returns {ConsentLookupRequestBuilder} This builder, for chaining.
     */
    withId(id) {
        this.request.id = id;
        return this;
    }

    /**
     * @param {string} from Party urn the consent was given by, e.g.
     * urn:altinn:person:identifier-no:12345678901.
     * @returns {ConsentLookupRequestBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.request.from = from;
        return this;
    }

    /**
     * @param {string} to Party urn the consent was given to, e.g.
     * urn:altinn:organization:identifier-no:123456789.
     * @returns {ConsentLookupRequestBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.request.to = to;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {ConsentLookupRequest} The built request.
     */
    build() {
        return this.request;
    }
}

export { ConsentLookupRequestBuilder, MaskinportenDelegationsQueryBuilder };
