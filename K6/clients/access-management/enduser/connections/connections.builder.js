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
     * @param {string} package Package identifier.
     * @returns {CreateAccessPackageQueryBuilder}
     */
    withPackage(package) {
        this.query.package = package;
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
     * @param {string} package Package identifier.
     * @returns {DeleteAccessPackageQueryBuilder}
     */
    withPackage(package) {
        this.query.package = package;
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



export {
    GetConnectionUsersQueryBuilder,
    GetConnectionsQueryBuilder,
    CreateConnectionQueryBuilder,
    DeleteConnectionQueryBuilder,
    GetAccessPackagesQueryBuilder,
    CreateAccessPackageQueryBuilder,
    DeleteAccessPackageQueryBuilder,
};
