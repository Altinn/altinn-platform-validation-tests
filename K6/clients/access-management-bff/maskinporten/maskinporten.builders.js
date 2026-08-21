import { CreateSupplierQuery, CreateSupplierResourceQuery, DeleteConsumerQuery, DeleteConsumerResourceQuery, DeleteSupplierQuery, DeleteSupplierResourceQuery, GetConsumerResourcesQuery, GetConsumersQuery, GetSupplierResourceDelegationCheckQuery, GetSupplierResourcesQuery, GetSuppliersQuery, SearchScopesQuery } from "./maskinporten.types.js";

/**
 * Builder for the query parameters of {@link SearchScopes}.
 */
class SearchScopesQueryBuilder {
    constructor() {
        this.query = /** @type {SearchScopesQuery} */ ({});
    }

    /**
     * Optional. Free text search string.
     *
     * @param {string} searchString Free text search string.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withSearchString(searchString) {
        this.query.SearchString = searchString;
        return this;
    }

    /**
     * Resource owner org codes to filter by. Can be called more than once.
     *
     * @param {string} ROFilter Resource owner org codes to filter by.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
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
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withROFilters(ROFilters) {
        this.query.ROFilters = ROFilters;
        return this;
    }

    /**
     * Optional. Whether to include Altinn 2 services.
     *
     * @param {boolean} includeA2Services Whether to include Altinn 2 services.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withIncludeA2Services(includeA2Services) {
        this.query.IncludeA2Services = includeA2Services;
        return this;
    }

    /**
     * Optional. Whether to include expired resources.
     *
     * @param {boolean} includeExpired Whether to include expired resources.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withIncludeExpired(includeExpired) {
        this.query.IncludeExpired = includeExpired;
        return this;
    }

    /**
     * Optional. Page size of the search result.
     *
     * @param {number} resultsPerPage Page size of the search result.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withResultsPerPage(resultsPerPage) {
        this.query.ResultsPerPage = resultsPerPage;
        return this;
    }

    /**
     * Optional. Page number of the search result.
     *
     * @param {number} page Page number of the search result.
     * @returns {SearchScopesQueryBuilder} This builder, for chaining.
     */
    withPage(page) {
        this.query.Page = page;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {SearchScopesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of
 * {@link GetSupplierResourceDelegationCheck}.
 */
class GetSupplierResourceDelegationCheckQueryBuilder {
    constructor() {
        this.query = /** @type {GetSupplierResourceDelegationCheckQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSupplierResourceDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetSupplierResourceDelegationCheckQueryBuilder} This builder, for
     * chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSupplierResourceDelegationCheckQuery} The built query
     * parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSupplierResources}.
 */
class GetSupplierResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {GetSupplierResourcesQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {GetSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetSupplierResourcesQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSupplierResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateSupplierResource}.
 */
class CreateSupplierResourceQueryBuilder {
    constructor() {
        this.query = /** @type {CreateSupplierResourceQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {CreateSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Required. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateSupplierResourceQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteSupplierResource}.
 */
class DeleteSupplierResourceQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteSupplierResourceQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {DeleteSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Required. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteSupplierResourceQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteSupplierResourceQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetSuppliers}.
 */
class GetSuppliersQueryBuilder {
    constructor() {
        this.query = /** @type {GetSuppliersQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetSuppliersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {GetSuppliersQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetSuppliersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link CreateSupplier}.
 */
class CreateSupplierQueryBuilder {
    constructor() {
        this.query = /** @type {CreateSupplierQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {CreateSupplierQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {CreateSupplierQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateSupplierQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteSupplier}.
 */
class DeleteSupplierQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteSupplierQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteSupplierQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Supplier organisation number.
     *
     * @param {string} supplier Supplier organisation number.
     * @returns {DeleteSupplierQueryBuilder} This builder, for chaining.
     */
    withSupplier(supplier) {
        this.query.supplier = supplier;
        return this;
    }

    /**
     * Optional. Whether to also revoke the resources delegated to the supplier.
     *
     * @param {boolean} cascade Whether to also revoke the resources delegated to
     * the supplier.
     * @returns {DeleteSupplierQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteSupplierQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetConsumers}.
 */
class GetConsumersQueryBuilder {
    constructor() {
        this.query = /** @type {GetConsumersQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetConsumersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Consumer organisation number.
     *
     * @param {string} consumer Consumer organisation number.
     * @returns {GetConsumersQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConsumersQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteConsumer}.
 */
class DeleteConsumerQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteConsumerQuery} */ ({});
    }

    /**
     * Optional. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteConsumerQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Consumer organisation number.
     *
     * @param {string} consumer Consumer organisation number.
     * @returns {DeleteConsumerQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Optional. Whether to also revoke the resources the consumer holds.
     *
     * @param {boolean} cascade Whether to also revoke the resources the consumer
     * holds.
     * @returns {DeleteConsumerQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteConsumerQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetConsumerResources}.
 */
class GetConsumerResourcesQueryBuilder {
    constructor() {
        this.query = /** @type {GetConsumerResourcesQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {GetConsumerResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional. Consumer organisation number.
     *
     * @param {string} consumer Consumer organisation number.
     * @returns {GetConsumerResourcesQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConsumerResourcesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link DeleteConsumerResource}.
 */
class DeleteConsumerResourceQueryBuilder {
    constructor() {
        this.query = /** @type {DeleteConsumerResourceQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf
     * of.
     * @returns {DeleteConsumerResourceQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required. Consumer organisation number.
     *
     * @param {string} consumer Consumer organisation number.
     * @returns {DeleteConsumerResourceQueryBuilder} This builder, for chaining.
     */
    withConsumer(consumer) {
        this.query.consumer = consumer;
        return this;
    }

    /**
     * Required. Resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteConsumerResourceQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteConsumerResourceQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    CreateSupplierQueryBuilder,
    CreateSupplierResourceQueryBuilder,
    DeleteConsumerQueryBuilder,
    DeleteConsumerResourceQueryBuilder,
    DeleteSupplierQueryBuilder,
    DeleteSupplierResourceQueryBuilder,
    GetConsumerResourcesQueryBuilder,
    GetConsumersQueryBuilder,
    GetSupplierResourceDelegationCheckQueryBuilder,
    GetSupplierResourcesQueryBuilder,
    GetSuppliersQueryBuilder,
    SearchScopesQueryBuilder,
};
