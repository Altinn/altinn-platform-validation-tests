class PackagesSearchQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} term
     * @returns {PackagesSearchQueryBuilder}
     */
    WithTerm(term) {
        this.query.term = term;

        return this;
    }

    /**
     * @param {Array<string>} resourceProviderCode
     * @returns {PackagesSearchQueryBuilder}
     */
    WithResourceProviderCode(resourceProviderCode) {
        this.query.resourceProviderCode = resourceProviderCode;

        return this;
    }

    /**
     * @param {boolean} searchInResources
     * @returns {PackagesSearchQueryBuilder}
     */
    WithSearchInResources(searchInResources) {
        this.query.searchInResources = searchInResources;

        return this;
    }

    /**
     * @param {string} typeName
     * @returns {PackagesSearchQueryBuilder}
     */
    WithTypeName(typeName) {
        this.query.typeName = typeName;

        return this;
    }

    /**
     * @param {boolean} simpleSearch
     * @returns {PackagesSearchQueryBuilder}
     */
    WithSimpleSearch(simpleSearch) {
        this.query.simpleSearch = simpleSearch;

        return this;
    }

    /**
     * @param {boolean} strict
     * @returns {PackagesSearchQueryBuilder}
     */
    WithStrict(strict) {
        this.query.strict = strict;

        return this;
    }

    /**
     * @returns {Object}
     */
    Build() {
        return this.query;
    }
}

export {
    PackagesSearchQueryBuilder,
};
