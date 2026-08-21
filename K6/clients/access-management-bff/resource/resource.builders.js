import { ResourceType } from "../common/common.types.js";
import { GetResourceOwnersQuery, GetResourceQuery, SearchResourcesQuery } from "./resource.types.js";

/**
 * Builder for the query parameters of {@link GetResourceOwners}.
 */
class GetResourceOwnersQueryBuilder {
    constructor() {
        this.query = /** @type {GetResourceOwnersQuery} */ ({});
    }

    /**
     * Resource types to include. Can be called more than once.
     *
     * @param {ResourceType} relevantResourceType Resource types to include.
     * @returns {GetResourceOwnersQueryBuilder} This builder, for chaining.
     */
    addRelevantResourceType(relevantResourceType) {
        this.query.relevantResourceTypes ??= [];
        this.query.relevantResourceTypes.push(relevantResourceType);
        return this;
    }

    /**
     * Resource types to include. Replaces any previous values.
     *
     * @param {Array<ResourceType>} relevantResourceTypes Resource types to
     * include.
     * @returns {GetResourceOwnersQueryBuilder} This builder, for chaining.
     */
    withRelevantResourceTypes(relevantResourceTypes) {
        this.query.relevantResourceTypes = relevantResourceTypes;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceOwnersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetResource}.
 */
class GetResourceQueryBuilder {
    constructor() {
        this.query = /** @type {GetResourceQuery} */ ({});
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {GetResourceQueryBuilder} This builder, for chaining.
     */
    withResourceId(resourceId) {
        this.query.resourceId = resourceId;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link SearchResources}.
 */
class SearchResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {SearchResourcesQuery} */ ({});
    }

    /**
     * Optional. Free text search string.
     *
     * @param {string} searchString Free text search string.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withSearchString(searchString) {
        this.query.SearchString = searchString;
        return this;
    }

    /**
     * Resource owner org codes to filter by. Can be called more than once.
     *
     * @param {string} ROFilter Resource owner org codes to filter by.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    addROFilter(ROFilter) {
        this.query.ROFilters ??= [];
        this.query.ROFilters.push(ROFilter);
        return this;
    }

    /**
     * Resource owner org codes to filter by. Replaces any previous values.
     *
     * @param {Array<string>} ROFilters Resource owner org codes to filter by.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withROFilters(ROFilters) {
        this.query.ROFilters = ROFilters;
        return this;
    }

    /**
     * Optional. Whether to include Altinn 2 services.
     *
     * @param {boolean} includeA2Services Whether to include Altinn 2 services.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withIncludeA2Services(includeA2Services) {
        this.query.IncludeA2Services = includeA2Services;
        return this;
    }

    /**
     * Optional. Whether to include expired resources.
     *
     * @param {boolean} includeExpired Whether to include expired resources.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withIncludeExpired(includeExpired) {
        this.query.IncludeExpired = includeExpired;
        return this;
    }

    /**
     * Optional. Page size of the search result.
     *
     * @param {number} resultsPerPage Page size of the search result.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withResultsPerPage(resultsPerPage) {
        this.query.ResultsPerPage = resultsPerPage;
        return this;
    }

    /**
     * Optional. Page number of the search result.
     *
     * @param {number} page Page number of the search result.
     * @returns {SearchResourcesQueryBuilder} This builder, for chaining.
     */
    withPage(page) {
        this.query.Page = page;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {SearchResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    GetResourceOwnersQueryBuilder,
    GetResourceQueryBuilder,
    SearchResourcesQueryBuilder,
};
