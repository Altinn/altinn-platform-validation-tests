// -----------------------------------------------------------------------------
// Query models
// -----------------------------------------------------------------------------

/**
 * Query parameters for {@link SearchScopes}.
 *
 * Use {@link SearchScopesQueryBuilder} to construct this object.
 *
 * @typedef {object} SearchScopesQuery
 * @property {string} [SearchString] Free text search string.
 * @property {Array<string>} [ROFilters] Resource owner org codes to filter by.
 * @property {boolean} [IncludeA2Services] Whether to include Altinn 2
 * services.
 * @property {boolean} [IncludeExpired] Whether to include expired resources.
 * @property {number} [ResultsPerPage] Page size of the search result.
 * @property {number} [Page] Page number of the search result.
 */

/**
 * Query parameters for {@link GetSupplierResourceDelegationCheck}.
 *
 * Use {@link GetSupplierResourceDelegationCheckQueryBuilder} to construct this
 * object.
 *
 * @typedef {object} GetSupplierResourceDelegationCheckQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for {@link GetSupplierResources}.
 *
 * Use {@link GetSupplierResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSupplierResourcesQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [supplier] Supplier organisation number.
 * @property {string} [resource] Resource identifier.
 */

/**
 * Query parameters for {@link CreateSupplierResource}.
 *
 * Use {@link CreateSupplierResourceQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateSupplierResourceQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} supplier Supplier organisation number.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for {@link DeleteSupplierResource}.
 *
 * Use {@link DeleteSupplierResourceQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteSupplierResourceQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} supplier Supplier organisation number.
 * @property {string} resource Resource identifier.
 */

/**
 * Query parameters for {@link GetSuppliers}.
 *
 * Use {@link GetSuppliersQueryBuilder} to construct this object.
 *
 * @typedef {object} GetSuppliersQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [supplier] Supplier organisation number.
 */

/**
 * Query parameters for {@link CreateSupplier}.
 *
 * Use {@link CreateSupplierQueryBuilder} to construct this object.
 *
 * @typedef {object} CreateSupplierQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} supplier Supplier organisation number.
 */

/**
 * Query parameters for {@link DeleteSupplier}.
 *
 * Use {@link DeleteSupplierQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteSupplierQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} supplier Supplier organisation number.
 * @property {boolean} [cascade] Whether to also revoke the resources delegated
 * to the supplier.
 */

/**
 * Query parameters for {@link GetConsumers}.
 *
 * Use {@link GetConsumersQueryBuilder} to construct this object.
 *
 * @typedef {object} GetConsumersQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [consumer] Consumer organisation number.
 */

/**
 * Query parameters for {@link DeleteConsumer}.
 *
 * Use {@link DeleteConsumerQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteConsumerQuery
 * @property {string} [party] Party UUID of the party the request is made on
 * behalf of.
 * @property {string} consumer Consumer organisation number.
 * @property {boolean} [cascade] Whether to also revoke the resources the
 * consumer holds.
 */

/**
 * Query parameters for {@link GetConsumerResources}.
 *
 * Use {@link GetConsumerResourcesQueryBuilder} to construct this object.
 *
 * @typedef {object} GetConsumerResourcesQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} [consumer] Consumer organisation number.
 */

/**
 * Query parameters for {@link DeleteConsumerResource}.
 *
 * Use {@link DeleteConsumerResourceQueryBuilder} to construct this object.
 *
 * @typedef {object} DeleteConsumerResourceQuery
 * @property {string} party Party UUID of the party the request is made on
 * behalf of.
 * @property {string} consumer Consumer organisation number.
 * @property {string} resource Resource identifier.
 */
