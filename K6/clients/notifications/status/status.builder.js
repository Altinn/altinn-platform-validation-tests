
class StatusFeedQueryBuilder {
    constructor() {
        this.query = {
            seq: null,
            pageSize: null,
            orderBy: null,
        };
    }

    /**
     * @param {number} seq Value to set.
     * @returns {StatusFeedQueryBuilder} This builder, for chaining.
     */
    WithSeq(seq) {
        this.query.seq = seq;

        return this;
    }

    /**
     * @param {number} pageSize Value to set.
     * @returns {StatusFeedQueryBuilder} This builder, for chaining.
     */
    WithPageSize(pageSize) {
        this.query.pageSize = pageSize;

        return this;
    }

    /**
     * @param {StatusOrderBy} orderBy Value to set.
     * @returns {StatusFeedQueryBuilder} This builder, for chaining.
     */
    WithOrderBy(orderBy) {
        this.query.orderBy = orderBy;

        return this;
    }

    /**
     * @returns {StatusFeedQuery} The built payload.
     */
    Build() {
        return this.query;
    }
}

export {
    StatusFeedQueryBuilder,
};
