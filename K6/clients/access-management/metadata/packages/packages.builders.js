import { PackagesSearchQuery } from "./packages.types.js";

class PackagesSearchQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} term See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithTerm(term) {
        this.query.term = term;

        return this;
    }

    /**
     * @param {Array<string>} resourceProviderCode See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithResourceProviderCode(resourceProviderCode) {
        this.query.resourceProviderCode = resourceProviderCode;

        return this;
    }

    /**
     * @param {boolean} searchInResources See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithSearchInResources(searchInResources) {
        this.query.searchInResources = searchInResources;

        return this;
    }

    /**
     * @param {string} typeName See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithTypeName(typeName) {
        this.query.typeName = typeName;

        return this;
    }

    /**
     * @param {boolean} simpleSearch See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithSimpleSearch(simpleSearch) {
        this.query.simpleSearch = simpleSearch;

        return this;
    }

    /**
     * @param {boolean} strict See the client method.
     * @returns {PackagesSearchQueryBuilder} This builder, for chaining.
     */
    WithStrict(strict) {
        this.query.strict = strict;

        return this;
    }

    /**
     * @returns {PackagesSearchQuery} The built payload.
     */
    Build() {
        return this.query;
    }
}

export {
    PackagesSearchQueryBuilder,
};
