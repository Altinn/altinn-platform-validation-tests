import { ReceivedRequestsQuery, RequestStatusV2, SentRequestsQuery } from "./request-v2.types.js";

/**
 * Builder for the query on GET received, received/count and received/count/subunits.
 */
class ReceivedRequestsV2QueryBuilder {
    constructor() {
        this.query = /** @type {ReceivedRequestsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {ReceivedRequestsV2QueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional sender filter.
     *
     * @param {string} from Party UUID.
     * @returns {ReceivedRequestsV2QueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatusV2>} status Request statuses.
     * @returns {ReceivedRequestsV2QueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {ReceivedRequestsV2QueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {ReceivedRequestsQuery} The built query.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query on GET sent and sent/count.
 */
class SentRequestsV2QueryBuilder {
    constructor() {
        this.query = /** @type {SentRequestsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {SentRequestsV2QueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional recipient filter.
     *
     * @param {string} to Party UUID.
     * @returns {SentRequestsV2QueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatusV2>} status Request statuses.
     * @returns {SentRequestsV2QueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {SentRequestsV2QueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query.
     *
     * @returns {SentRequestsQuery} The built query.
     */
    build() {
        return this.query;
    }
}

export {
    ReceivedRequestsV2QueryBuilder,
    SentRequestsV2QueryBuilder,
};
