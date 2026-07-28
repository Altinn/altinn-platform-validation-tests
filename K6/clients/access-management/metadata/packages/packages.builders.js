class PackagesSearchQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} term TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithTerm(term) {
        this.query.term = term;

        return this;
    }

    /**
     * @param {Array<string>} resourceProviderCode TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithResourceProviderCode(resourceProviderCode) {
        this.query.resourceProviderCode = resourceProviderCode;

        return this;
    }

    /**
     * @param {boolean} searchInResources TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithSearchInResources(searchInResources) {
        this.query.searchInResources = searchInResources;

        return this;
    }

    /**
     * @param {string} typeName TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithTypeName(typeName) {
        this.query.typeName = typeName;

        return this;
    }

    /**
     * @param {boolean} simpleSearch TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithSimpleSearch(simpleSearch) {
        this.query.simpleSearch = simpleSearch;

        return this;
    }

    /**
     * @param {boolean} strict TODO: Description
     * @returns {PackagesSearchQueryBuilder} TODO: Description
     */
    WithStrict(strict) {
        this.query.strict = strict;

        return this;
    }

    /**
     * @returns {object} TODO: Description
     */
    Build() {
        return this.query;
    }
}

export {
    PackagesSearchQueryBuilder,
};
