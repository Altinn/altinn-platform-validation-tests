import { ReceivedRequestsQuery, RequestStatus, SentRequestsQuery } from "./request.types.js";

class ReceivedRequestsQueryBuilder {
    constructor() {
        this.query = /** @type {ReceivedRequestsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {ReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional sender filter.
     *
     * @param {string} from Party UUID.
     * @returns {ReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatus>} status Request statuses.
     * @returns {ReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {ReceivedRequestsQueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ReceivedRequestsQuery} The built payload.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for sent request query parameters.
 */
class SentRequestsQueryBuilder {
    constructor() {
        this.query = /** @type {SentRequestsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {SentRequestsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional recipient filter.
     *
     * @param {string} to Party UUID.
     * @returns {SentRequestsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatus>} status Request statuses.
     * @returns {SentRequestsQueryBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {SentRequestsQueryBuilder} This builder, for chaining.
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {SentRequestsQuery} The built payload.
     */
    build() {
        return this.query;
    }
}

export {
    ReceivedRequestsQueryBuilder,
    SentRequestsQueryBuilder,
};
