/**
 * Builder for retrieving connections query parameters.
 */
class GetConnectionsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetConnectionsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from filter.
     *
     * @param {string} from From UUID.
     * @returns {GetConnectionsQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to filter.
     *
     * @param {string} to To UUID.
     * @returns {GetConnectionsQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional client delegations filter.
     *
     * @param {boolean} includeClientDelegations
     * @returns {GetConnectionsQueryBuilder}
     */
    withIncludeClientDelegations(includeClientDelegations) {
        this.query.includeClientDelegations = includeClientDelegations;
        return this;
    }

    /**
     * Optional agent connections filter.
     *
     * @param {boolean} includeAgentConnections
     * @returns {GetConnectionsQueryBuilder}
     */
    withIncludeAgentConnections(includeAgentConnections) {
        this.query.includeAgentConnections = includeAgentConnections;
        return this;
    }

    /**
     * Optional access packages filter.
     *
     * @param {boolean} includeAccessPackages
     * @returns {GetConnectionsQueryBuilder}
     */
    withIncludeAccessPackages(includeAccessPackages) {
        this.query.includeAccessPackages = includeAccessPackages;
        return this;
    }

    /**
     * Optional resources filter.
     *
     * @param {boolean} includeResources
     * @returns {GetConnectionsQueryBuilder}
     */
    withIncludeResources(includeResources) {
        this.query.includeResources = includeResources;
        return this;
    }

    /**
     * Optional instances filter.
     *
     * @param {boolean} includeInstances
     * @returns {GetConnectionsQueryBuilder}
     */
    withIncludeInstances(includeInstances) {
        this.query.includeInstances = includeInstances;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionsQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating connection query parameters.
 */
class CreateConnectionQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateConnectionQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateConnectionQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateConnectionQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for deleting connection query parameters.
 */
class DeleteConnectionQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteConnectionQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     *
     * @returns {DeleteConnectionQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     *
     * @returns {DeleteConnectionQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional cascade deletion.
     *
     * @param {boolean} cascade
     * @returns {DeleteConnectionQueryBuilder}
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteConnectionQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving connection users query parameters.
 */
class GetConnectionUsersQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetConnectionUsersQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionUsersQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving access package permissions query parameters.
 */
class GetAccessPackagesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetAccessPackagesQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetAccessPackagesQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetAccessPackagesQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackagesQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating access package assignment query parameters.
 */
class CreateAccessPackageQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateAccessPackageQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {CreateAccessPackageQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {CreateAccessPackageQueryBuilder}
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {CreateAccessPackageQueryBuilder}
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAccessPackageQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for deleting access package assignment query parameters.
 */
class DeleteAccessPackageQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteAccessPackageQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteAccessPackageQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteAccessPackageQueryBuilder}
    */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {DeleteAccessPackageQueryBuilder}
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {DeleteAccessPackageQueryBuilder}
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAccessPackageQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for access package delegation check query parameters.
 */
class AccessPackageDelegationCheckQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {AccessPackageDelegationCheckQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packageIds Package UUIDs.
     * @returns {AccessPackageDelegationCheckQueryBuilder}
     */
    withPackageIds(packageIds) {
        this.query.packageIds = packageIds;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packages Package identifiers.
     * @returns {AccessPackageDelegationCheckQueryBuilder}
     */
    withPackages(packages) {
        this.query.packages = packages;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AccessPackageDelegationCheckQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving role permissions query parameters.
 */
class GetRolesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetRolesQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetRolesQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetRolesQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRolesQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for deleting role permissions query parameters.
 */
class DeleteRoleQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteRoleQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteRoleQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteRoleQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required role code.
     *
     * @param {string} rolecode Role code.
     * @returns {DeleteRoleQueryBuilder}
     */
    withRolecode(rolecode) {
        this.query.rolecode = rolecode;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteRoleQuery}
     */
    build() {
        return this.query;
    }
}


/**
 * Builder for retrieving resource permissions query parameters.
 */
class GetResourcesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourcesQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourcesQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourcesQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourcesQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourcesQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for deleting resource permission query parameters.
 */
class DeleteResourceQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteResourceQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteResourceQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteResourceQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteResourceQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteResourceQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving resource rights query parameters.
 */
class GetResourceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourceRightsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourceRightsQueryBuilder}
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourceRightsQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceRightsQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceRightsQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating resource rights query parameters.
 */
class CreateResourceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateResourceRightsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateResourceRightsQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateResourceRightsQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateResourceRightsQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for updating resource rights query parameters.
 */
class UpdateResourceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {UpdateResourceRightsQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {UpdateResourceRightsQueryBuilder}
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateResourceRightsQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateResourceRightsQuery}
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for checking resource delegation query parameters.
 */
class GetResourceDelegationCheckQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourceDelegationCheckQueryBuilder}
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceDelegationCheckQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceDelegationCheckQuery}
     */
    build() {
        return this.query;
    }
}


export {
    GetConnectionUsersQueryBuilder,
    GetConnectionsQueryBuilder,
    CreateConnectionQueryBuilder,
    DeleteConnectionQueryBuilder,
    GetAccessPackagesQueryBuilder,
    CreateAccessPackageQueryBuilder,
    DeleteAccessPackageQueryBuilder,
    AccessPackageDelegationCheckQueryBuilder,
    GetRolesQueryBuilder,
    DeleteRoleQueryBuilder,
    GetResourceRightsQueryBuilder,
    CreateResourceRightsQueryBuilder,
    UpdateResourceRightsQueryBuilder,
    GetResourceDelegationCheckQueryBuilder,
};
