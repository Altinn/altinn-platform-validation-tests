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
export class ResourceSearchQueryBuilder {
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
