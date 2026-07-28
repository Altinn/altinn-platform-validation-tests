
class StatusFeedQueryBuilder {
    constructor() {
        this.query = {
            seq: null,
            pageSize: null,
            orderBy: null,
        };
    }

    /**
     * @param {number} seq TODO: description
     * @returns {StatusFeedQueryBuilder} TODO: description
     */
    WithSeq(seq) {
        this.query.seq = seq;

        return this;
    }

    /**
     * @param {number} pageSize TODO: description
     * @returns {StatusFeedQueryBuilder} TODO: description
     */
    WithPageSize(pageSize) {
        this.query.pageSize = pageSize;

        return this;
    }

    /**
     * @param {StatusOrderBy} orderBy TODO: description
     * @returns {StatusFeedQueryBuilder} TODO: description
     */
    WithOrderBy(orderBy) {
        this.query.orderBy = orderBy;

        return this;
    }

    /**
     * @returns {StatusFeedQuery} TODO: description
     */
    Build() {
        return this.query;
    }
}

export {
    StatusFeedQueryBuilder,
};
