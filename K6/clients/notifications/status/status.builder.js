
class StatusFeedQueryBuilder {
    constructor() {
        this.query = {
            seq: null,
            pageSize: null,
            orderBy: null,
        };
    }

    /**
     * @param {number} seq
     * @returns {StatusFeedQueryBuilder}
     */
    WithSeq(seq) {
        this.query.seq = seq;

        return this;
    }

    /**
     * @param {number} pageSize
     * @returns {StatusFeedQueryBuilder}
     */
    WithPageSize(pageSize) {
        this.query.pageSize = pageSize;

        return this;
    }

    /**
     * @param {StatusOrderBy} orderBy
     * @returns {StatusFeedQueryBuilder}
     */
    WithOrderBy(orderBy) {
        this.query.orderBy = orderBy;

        return this;
    }

    /**
     * @returns {StatusFeedQuery}
     */
    Build() {
        return this.query;
    }
}

export {
    StatusFeedQueryBuilder,
};
