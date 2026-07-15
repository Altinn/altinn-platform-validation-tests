class ReceivedRequestsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {ReceivedRequestsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional sender filter.
     *
     * @param {string} from Party UUID.
     * @returns {ReceivedRequestsQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatus>} status Request statuses.
     * @returns {ReceivedRequestsQueryBuilder}
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {ReceivedRequestsQueryBuilder}
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, from?: string, status?: Array<RequestStatus>, type?: string}}
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
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {SentRequestsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional recipient filter.
     *
     * @param {string} to Party UUID.
     * @returns {SentRequestsQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional request status filter.
     *
     * @param {Array<RequestStatus>} status Request statuses.
     * @returns {SentRequestsQueryBuilder}
     */
    withStatus(status) {
        this.query.status = status;
        return this;
    }

    /**
     * Optional request type filter.
     *
     * @param {string} type Request type.
     * @returns {SentRequestsQueryBuilder}
     */
    withType(type) {
        this.query.type = type;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {{party: string, to?: string, status?: Array<RequestStatus>, type?: string}}
     */
    build() {
        return this.query;
    }
}

export {
    ReceivedRequestsQueryBuilder,
    SentRequestsQueryBuilder,
};
