/**
 * Builder for query parameters for the
 * POST /resourceowner/authorizedparties endpoint.
 */
export class AuthorizedPartiesQueryBuilder {
    constructor() {
        this.query = {
            includeAltinn2: false,
            includeAltinn3: true,
            includeRoles: true,
            includeAccessPackages: false,
            includeResources: true,
            includeInstances: true
        };
    }

    /**
     * Include access information originating from Altinn 2.
     *
     * This includes Altinn 2 roles and services, as well as roles
     * inherited through the Central Coordinating Register for Legal
     * Entities (Enhetsregisteret).
     *
     * Default: false.
     *
     * @param {boolean} [value=true] Whether to include Altinn 2 access information.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeAltinn2(value = true) {
        this.query.includeAltinn2 = value;
        return this;
    }

    /**
     * Include access information originating from Altinn 3.
     *
     * This includes access packages, delegated resources,
     * applications and instance delegations.
     *
     * Default: true.
     *
     * @param {boolean} [value=true] Whether to include Altinn 3 access information.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeAltinn3(value = true) {
        this.query.includeAltinn3 = value;
        return this;
    }

    /**
     * Include detailed role information for each authorized party.
     *
     * Parties with role-based access are still returned when disabled;
     * only the populated `authorizedRoles` field is affected.
     *
     * Recommended by the API: false unless explicitly needed.
     *
     * Default: true.
     *
     * @param {boolean} [value=true] Whether to include role details.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeRoles(value = true) {
        this.query.includeRoles = value;
        return this;
    }

    /**
     * Include detailed access package information for each authorized party.
     *
     * Parties with delegated access packages are still returned when disabled;
     * only the populated `authorizedAccessPackages` field is affected.
     *
     * Recommended by the API: false unless explicitly needed.
     *
     * Default: false.
     *
     * @param {boolean} [value=true] Whether to include access package details.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeAccessPackages(value = true) {
        this.query.includeAccessPackages = value;
        return this;
    }

    /**
     * Include detailed delegated resource information for each authorized party.
     *
     * Parties with delegated resource access are still returned when disabled;
     * only the populated `authorizedResources` field is affected.
     *
     * Recommended by the API: false unless explicitly needed.
     *
     * Default: true.
     *
     * @param {boolean} [value=true] Whether to include resource details.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeResources(value = true) {
        this.query.includeResources = value;
        return this;
    }

    /**
     * Include delegated instance access information for each authorized party.
     *
     * Parties with delegated instance access are still returned when disabled;
     * only the populated `authorizedInstances` field is affected.
     *
     * Recommended by the API: false unless explicitly needed.
     *
     * Default: true.
     *
     * @param {boolean} [value=true] Whether to include instance details.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeInstances(value = true) {
        this.query.includeInstances = value;
        return this;
    }

    /**
     * Include parties accessible through key roles.
     *
     * For example, a general manager ("daglig leder") inherits access to
     * organizations for which they hold key roles.
     *
     * Using this option may negatively impact performance, especially for
     * users with many key roles or roles in large accounting or auditing firms.
     *
     * Allowed values:
     * - "false"
     * - "true"
     * - "auto"
     *
     * Recommended by the API: false unless explicitly needed.
     *
     * @param {"false"|"true"|"auto"} value Include filter.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includePartiesViaKeyRoles(value) {
        this.query.includePartiesViaKeyRoles = value;
        return this;
    }

    /**
     * Include sub-parties (party hierarchy).
     *
     * Note: This feature is not yet implemented by the API.
     *
     * Allowed values:
     * - "false"
     * - "true"
     * - "auto"
     *
     * @param {"false"|"true"|"auto"} value Include filter.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeSubParties(value) {
        this.query.includeSubParties = value;
        return this;
    }

    /**
     * Include inactive (deleted) parties.
     *
     * Note: This feature is not yet implemented by the API.
     *
     * Allowed values:
     * - "false"
     * - "true"
     * - "auto"
     *
     * @param {"false"|"true"|"auto"} value Include filter.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    includeInactiveParties(value) {
        this.query.includeInactiveParties = value;
        return this;
    }

    /**
     * Restrict the query to resources owned by the specified organization.
     *
     * The authenticated resource owner must own the supplied organization code.
     *
     * Example: "digdir"
     *
     * @param {string} orgCode Organization code.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    withOrgCode(orgCode) {
        this.query.orgCode = orgCode;
        return this;
    }

    /**
     * Add a resource ID filter.
     *
     * Only authorized parties having access to at least one of the supplied
     * resource IDs will be returned. Invalid resource IDs are ignored.
     *
     * @param {string} resourceId Resource identifier.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    addResourceId(resourceId) {
        this.query.anyOfResourceIds ??= [];
        this.query.anyOfResourceIds.push(resourceId);
        return this;
    }

    /**
     * Replace all resource ID filters.
     *
     * Only authorized parties having access to at least one of the supplied
     * resource IDs will be returned.
     *
     * @param {Array<string>} resourceIds Resource identifiers.
     * @returns {AuthorizedPartiesQueryBuilder} The builder instance for method chaining.
     */
    withResourceIds(resourceIds) {
        this.query.anyOfResourceIds = resourceIds;
        return this;
    }

    /**
     * Build the query parameter object.
     *
     * @returns {object} Query parameters for the authorized parties endpoint.
     */
    build() {
        return structuredClone(this.query);
    }
}
