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
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from filter.
     *
     * @param {string} from From UUID.
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to filter.
     *
     * @param {string} to To UUID.
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional client delegations filter.
     *
     * @param {boolean} includeClientDelegations TODO: Description
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withIncludeClientDelegations(includeClientDelegations) {
        this.query.includeClientDelegations = includeClientDelegations;
        return this;
    }

    /**
     * Optional agent connections filter.
     *
     * @param {boolean} includeAgentConnections TODO: Description
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withIncludeAgentConnections(includeAgentConnections) {
        this.query.includeAgentConnections = includeAgentConnections;
        return this;
    }

    /**
     * Optional access packages filter.
     *
     * @param {boolean} includeAccessPackages TODO: Description
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withIncludeAccessPackages(includeAccessPackages) {
        this.query.includeAccessPackages = includeAccessPackages;
        return this;
    }

    /**
     * Optional resources filter.
     *
     * @param {boolean} includeResources TODO: Description
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withIncludeResources(includeResources) {
        this.query.includeResources = includeResources;
        return this;
    }

    /**
     * Optional instances filter.
     *
     * @param {boolean} includeInstances TODO: Description
     * @returns {GetConnectionsQueryBuilder} TODO: Description
     */
    withIncludeInstances(includeInstances) {
        this.query.includeInstances = includeInstances;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionsQuery} TODO: Description
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
     * @returns {CreateConnectionQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateConnectionQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateConnectionQuery} TODO: Description
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
     * @returns {DeleteConnectionQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteConnectionQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteConnectionQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional cascade deletion.
     *
     * @param {boolean} cascade TODO: Description
     * @returns {DeleteConnectionQueryBuilder} TODO: Description
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteConnectionQuery} TODO: Description
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
     * @returns {GetConnectionUsersQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionUsersQuery} TODO: Description
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
     * @returns {GetAccessPackagesQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetAccessPackagesQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetAccessPackagesQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackagesQuery} TODO: Description
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
     * @returns {CreateAccessPackageQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {CreateAccessPackageQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {CreateAccessPackageQueryBuilder} TODO: Description
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {CreateAccessPackageQueryBuilder} TODO: Description
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAccessPackageQuery} TODO: Description
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
     * @returns {DeleteAccessPackageQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteAccessPackageQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteAccessPackageQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {DeleteAccessPackageQueryBuilder} TODO: Description
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {DeleteAccessPackageQueryBuilder} TODO: Description
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAccessPackageQuery} TODO: Description
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
     * @returns {AccessPackageDelegationCheckQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packageIds Package UUIDs.
     * @returns {AccessPackageDelegationCheckQueryBuilder} TODO: Description
     */
    withPackageIds(packageIds) {
        this.query.packageIds = packageIds;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packages Package identifiers.
     * @returns {AccessPackageDelegationCheckQueryBuilder} TODO: Description
     */
    withPackages(packages) {
        this.query.packages = packages;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AccessPackageDelegationCheckQuery} TODO: Description
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
     * @returns {GetRolesQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetRolesQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetRolesQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRolesQuery} TODO: Description
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
     * @returns {DeleteRoleQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteRoleQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteRoleQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required role code.
     *
     * @param {string} rolecode Role code.
     * @returns {DeleteRoleQueryBuilder} TODO: Description
     */
    withRolecode(rolecode) {
        this.query.rolecode = rolecode;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteRoleQuery} TODO: Description
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
     * @returns {GetResourcesQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourcesQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourcesQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourcesQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourcesQuery} TODO: Description
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
     * @returns {DeleteResourceQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteResourceQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteResourceQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteResourceQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteResourceQuery} TODO: Description
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
     * @returns {GetResourceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourceRightsQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceRightsQuery} TODO: Description
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
     * @returns {CreateResourceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateResourceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateResourceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateResourceRightsQuery} TODO: Description
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
     * @returns {UpdateResourceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {UpdateResourceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateResourceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateResourceRightsQuery} TODO: Description
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
     * @returns {GetResourceDelegationCheckQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceDelegationCheckQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceDelegationCheckQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving instance permissions query parameters.
 */
class GetInstancesQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetInstancesQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetInstancesQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetInstancesQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstancesQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstancesQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstancesQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for deleting instance permissions query parameters.
 */
class DeleteInstanceQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteInstanceQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteInstanceQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteInstanceQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteInstanceQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {DeleteInstanceQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteInstanceQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for retrieving instance rights query parameters.
 */
class GetInstanceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetInstanceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetInstanceRightsQueryBuilder} TODO: Description
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetInstanceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceRightsQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceRightsQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating instance rights query parameters.
 */
class CreateInstanceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateInstanceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateInstanceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateInstanceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {CreateInstanceRightsQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateInstanceRightsQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for updating instance rights query parameters.
 */
class UpdateInstanceRightsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {UpdateInstanceRightsQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {UpdateInstanceRightsQueryBuilder} TODO: Description
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateInstanceRightsQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

class GetInstanceDelegationCheckQueryBuilder {
    constructor() {
        /** @type {GetInstanceDelegationCheckQuery} */
        this.query = {};
    }

    /**
     * @param {string} party TODO: Description
     * @returns {GetInstanceDelegationCheckQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * @param {string} resource TODO: Description
     * @returns {GetInstanceDelegationCheckQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * @param {string} instance TODO: Description
     * @returns {GetInstanceDelegationCheckQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * @returns {GetInstanceDelegationCheckQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

class GetInstanceUsersQueryBuilder {
    constructor() {
        /** @type {GetInstanceUsersQuery} */
        this.query = {};
    }

    /**
     * @param {string} party TODO: Description
     * @returns {GetInstanceUsersQueryBuilder} TODO: Description
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * @param {string} resource TODO: Description
     * @returns {GetInstanceUsersQueryBuilder} TODO: Description
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * @param {string} instance TODO: Description
     * @returns {GetInstanceUsersQueryBuilder} TODO: Description
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * @returns {GetInstanceUsersQuery} TODO: Description
     */
    build() {
        return this.query;
    }
}

export {
    AccessPackageDelegationCheckQueryBuilder,
    CreateAccessPackageQueryBuilder,
    CreateConnectionQueryBuilder,
    CreateInstanceRightsQueryBuilder,
    CreateResourceRightsQueryBuilder,
    DeleteAccessPackageQueryBuilder,
    DeleteConnectionQueryBuilder,
    DeleteInstanceQueryBuilder,
    DeleteRoleQueryBuilder,
    GetAccessPackagesQueryBuilder,
    GetConnectionsQueryBuilder,
    GetConnectionUsersQueryBuilder,
    GetInstanceDelegationCheckQueryBuilder,
    GetInstanceRightsQueryBuilder,
    GetInstancesQueryBuilder,
    GetInstanceUsersQueryBuilder,
    GetResourceDelegationCheckQueryBuilder,
    GetResourceRightsQueryBuilder,
    GetRolesQueryBuilder,
    UpdateInstanceRightsQueryBuilder,
    UpdateResourceRightsQueryBuilder
};
