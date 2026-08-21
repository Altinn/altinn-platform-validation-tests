import { AccessPackageDelegationCheckQuery, CreateAccessPackageQuery, CreateConnectionQuery, CreateInstanceRightsQuery, CreateResourceRightsQuery, DeleteAccessPackageQuery, DeleteConnectionQuery, DeleteInstanceQuery, DeleteResourceQuery, DeleteRoleQuery, GetAccessPackagesQuery, GetConnectionsQuery, GetConnectionUsersQuery, GetInstanceDelegationCheckQuery, GetInstanceRightsQuery, GetInstancesQuery, GetInstanceUsersQuery, GetResourceDelegationCheckQuery, GetResourceRightsQuery, GetResourcesQuery, GetRolesQuery, UpdateInstanceRightsQuery, UpdateResourceRightsQuery } from "./connections.types.js";

/**
 * Builder for retrieving connections query parameters.
 */
class GetConnectionsQueryBuilder {
    constructor() {
        this.query = /** @type {GetConnectionsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from filter.
     *
     * @param {string} from From UUID.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to filter.
     *
     * @param {string} to To UUID.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional client delegations filter.
     *
     * @param {boolean} includeClientDelegations See the client method.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withIncludeClientDelegations(includeClientDelegations) {
        this.query.includeClientDelegations = includeClientDelegations;
        return this;
    }

    /**
     * Optional agent connections filter.
     *
     * @param {boolean} includeAgentConnections See the client method.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withIncludeAgentConnections(includeAgentConnections) {
        this.query.includeAgentConnections = includeAgentConnections;
        return this;
    }

    /**
     * Optional access packages filter.
     *
     * @param {boolean} includeAccessPackages See the client method.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withIncludeAccessPackages(includeAccessPackages) {
        this.query.includeAccessPackages = includeAccessPackages;
        return this;
    }

    /**
     * Optional resources filter.
     *
     * @param {boolean} includeResources See the client method.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withIncludeResources(includeResources) {
        this.query.includeResources = includeResources;
        return this;
    }

    /**
     * Optional instances filter.
     *
     * @param {boolean} includeInstances See the client method.
     * @returns {GetConnectionsQueryBuilder} This builder, for chaining.
     */
    withIncludeInstances(includeInstances) {
        this.query.includeInstances = includeInstances;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionsQuery} The built payload.
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
        this.query = /** @type {CreateConnectionQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateConnectionQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateConnectionQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateConnectionQuery} The built payload.
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
        this.query = /** @type {DeleteConnectionQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteConnectionQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteConnectionQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteConnectionQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional cascade deletion.
     *
     * @param {boolean} cascade See the client method.
     * @returns {DeleteConnectionQueryBuilder} This builder, for chaining.
     */
    withCascade(cascade) {
        this.query.cascade = cascade;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteConnectionQuery} The built payload.
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
        this.query = /** @type {GetConnectionUsersQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetConnectionUsersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetConnectionUsersQuery} The built payload.
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
        this.query = /** @type {GetAccessPackagesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional from party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional to party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetAccessPackagesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetAccessPackagesQuery} The built payload.
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
        this.query = /** @type {CreateAccessPackageQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateAccessPackageQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {CreateAccessPackageQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {CreateAccessPackageQueryBuilder} This builder, for chaining.
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {CreateAccessPackageQueryBuilder} This builder, for chaining.
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateAccessPackageQuery} The built payload.
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
        this.query = /** @type {DeleteAccessPackageQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteAccessPackageQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteAccessPackageQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteAccessPackageQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional access package identifier.
     *
     * @param {string} packageId Package UUID.
     * @returns {DeleteAccessPackageQueryBuilder} This builder, for chaining.
     */
    withPackageId(packageId) {
        this.query.packageId = packageId;
        return this;
    }

    /**
     * Optional package identifier.
     *
     * @param {string} pkg Package identifier.
     * @returns {DeleteAccessPackageQueryBuilder} This builder, for chaining.
     */
    withPackage(pkg) {
        this.query.package = pkg;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAccessPackageQuery} The built payload.
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
        this.query = /** @type {AccessPackageDelegationCheckQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {AccessPackageDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packageIds Package UUIDs.
     * @returns {AccessPackageDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withPackageIds(packageIds) {
        this.query.packageIds = packageIds;
        return this;
    }

    /**
     * Optional package identifiers.
     *
     * @param {Array<string>} packages Package identifiers.
     * @returns {AccessPackageDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withPackages(packages) {
        this.query.packages = packages;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {AccessPackageDelegationCheckQuery} The built payload.
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
        this.query = /** @type {GetRolesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetRolesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetRolesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetRolesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetRolesQuery} The built payload.
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
        this.query = /** @type {DeleteRoleQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required role code.
     *
     * @param {string} rolecode Role code.
     * @returns {DeleteRoleQueryBuilder} This builder, for chaining.
     */
    withRolecode(rolecode) {
        this.query.rolecode = rolecode;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteRoleQuery} The built payload.
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
        this.query = /** @type {GetResourcesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourcesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourcesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourcesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourcesQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourcesQuery} The built payload.
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
        this.query = /** @type {DeleteResourceQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteResourceQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteResourceQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteResourceQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteResourceQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteResourceQuery} The built payload.
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
        this.query = /** @type {GetResourceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceRightsQuery} The built payload.
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
        this.query = /** @type {CreateResourceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateResourceRightsQuery} The built payload.
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
        this.query = /** @type {UpdateResourceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {UpdateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {UpdateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateResourceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateResourceRightsQuery} The built payload.
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
        this.query = /** @type {GetResourceDelegationCheckQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetResourceDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetResourceDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetResourceDelegationCheckQuery} The built payload.
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
        this.query = /** @type {GetInstancesQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetInstancesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {GetInstancesQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {GetInstancesQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Optional resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstancesQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Optional instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstancesQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstancesQuery} The built payload.
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
        this.query = /** @type {DeleteInstanceQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {DeleteInstanceQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From UUID.
     * @returns {DeleteInstanceQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {DeleteInstanceQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {DeleteInstanceQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {DeleteInstanceQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteInstanceQuery} The built payload.
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
        this.query = /** @type {GetInstanceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required source party identifier.
     *
     * @param {string} from From party UUID.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withFrom(from) {
        this.query.from = from;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To party UUID.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {GetInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetInstanceRightsQuery} The built payload.
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
        this.query = /** @type {CreateInstanceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Optional target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {CreateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {CreateInstanceRightsQuery} The built payload.
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
        this.query = /** @type {UpdateInstanceRightsQuery} */ ({});
    }

    /**
     * Required party identifier.
     *
     * @param {string} party Party UUID.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * Required target party identifier.
     *
     * @param {string} to To UUID.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withTo(to) {
        this.query.to = to;
        return this;
    }

    /**
     * Required resource identifier.
     *
     * @param {string} resource Resource identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Required instance identifier.
     *
     * @param {string} instance Instance identifier.
     * @returns {UpdateInstanceRightsQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {UpdateInstanceRightsQuery} The built payload.
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
     * @param {string} party See the client method.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * @param {string} resource See the client method.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * @param {string} instance See the client method.
     * @returns {GetInstanceDelegationCheckQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * @returns {GetInstanceDelegationCheckQuery} The built payload.
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
     * @param {string} party See the client method.
     * @returns {GetInstanceUsersQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.party = party;
        return this;
    }

    /**
     * @param {string} resource See the client method.
     * @returns {GetInstanceUsersQueryBuilder} This builder, for chaining.
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * @param {string} instance See the client method.
     * @returns {GetInstanceUsersQueryBuilder} This builder, for chaining.
     */
    withInstance(instance) {
        this.query.instance = instance;
        return this;
    }

    /**
     * @returns {GetInstanceUsersQuery} The built payload.
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
    DeleteResourceQueryBuilder,
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
    GetResourcesQueryBuilder,
    GetRolesQueryBuilder,
    UpdateInstanceRightsQueryBuilder,
    UpdateResourceRightsQueryBuilder
};
