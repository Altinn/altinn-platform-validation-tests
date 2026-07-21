/**
 * Builder for creating query parameters for searching resources.
 *
 * @typedef {Object} ResourceSearchQueryBuilder
 * @property {Object} query The underlying search query parameters.
 * @property {string|null} query.Id Resource identifier filter.
 * @property {string|null} query.Title Title filter.
 * @property {string|null} query.Description Description filter.
 * @property {ResourceType|null} query.ResourceType Resource type filter.
 * @property {string|null} query.Keyword Keyword filter.
 * @property {string|null} query.Reference Reference filter.
 */
class ResourceSearchQueryBuilder {
    constructor() {
        this.query = {
            Id: null,
            Title: null,
            Description: null,
            ResourceType: null,
            Keyword: null,
            Reference: null,
        };
    }

    /**
     * Sets resource identifier filter.
     *
     * @param {string} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withId(value) {
        this.query.Id = value;

        return this;
    }

    /**
     * Sets title filter.
     *
     * @param {string} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withTitle(value) {
        this.query.Title = value;

        return this;
    }

    /**
     * Sets description filter.
     *
     * @param {string} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withDescription(value) {
        this.query.Description = value;

        return this;
    }

    /**
     * Sets resource type filter.
     *
     * @param {ResourceType} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withResourceType(value) {
        this.query.ResourceType = value;

        return this;
    }

    /**
     * Sets keyword filter.
     *
     * @param {string} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withKeyword(value) {
        this.query.Keyword = value;

        return this;
    }

    /**
     * Sets reference filter.
     *
     * @param {string} value
     * @returns {ResourceSearchQueryBuilder}
     */
    withReference(value) {
        this.query.Reference = value;

        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {Object}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating query parameters for retrieving updated resources.
 *
 * @typedef {Object} ResourceUpdatedQueryBuilder
 * @property {Object} query The underlying query parameter object.
 * @property {string} [query.since] Date time used for filtering.
 * @property {string} [query.token] Opaque continuation token.
 * @property {number} [query.limit] Maximum number of pairs returned.
 */
class ResourceUpdatedQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Sets the date time used for filtering.
     *
     * @param {string} since Date time.
     * @returns {ResourceUpdatedQueryBuilder}
     */
    since(since) {
        this.query.since = since;

        return this;
    }

    /**
     * Sets the continuation token.
     *
     * @param {string} token Continuation token.
     * @returns {ResourceUpdatedQueryBuilder}
     */
    token(token) {
        this.query.token = token;

        return this;
    }

    /**
     * Sets the maximum number of pairs returned.
     *
     * @param {number} limit Maximum number of pairs.
     * @returns {ResourceUpdatedQueryBuilder}
     */
    limit(limit) {
        this.query.limit = limit;

        return this;
    }

    /**
     * Returns the built query object.
     *
     * @returns {Object}
     */
    build() {
        return this.query;
    }
}

export {
    ResourceSearchQueryBuilder,
    ResourceUpdatedQueryBuilder
}