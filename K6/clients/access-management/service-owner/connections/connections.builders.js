import { AccessPackageUrn, GetResourceRightsQuery, RightKeyListDto, ServiceOwnerAccessPackageDelegation, ServiceOwnerConnectionPartyUrn, ServiceOwnerResourceDelegation } from "./connections.types.js";

class ServiceOwnerAccessPackageDelegationBuilder {
    constructor() {
        this.request = /** @type {ServiceOwnerAccessPackageDelegation} */ (/** @type {unknown} */ ({
            from: null,
            to: null,
            packageUrn: null,
        }));
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} from Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} to Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {AccessPackageUrn} packageUrn Value to set.
     * @returns {ServiceOwnerAccessPackageDelegationBuilder} This builder, for chaining.
     */
    WithPackageUrn(packageUrn) {
        this.request.packageUrn = packageUrn;

        return this;
    }

    /**
     * @returns {ServiceOwnerAccessPackageDelegation} The built payload.
     */
    Build() {
        if (this.request.from === null) {
            throw new Error("ServiceOwnerAccessPackageDelegation.from is required");
        }

        if (this.request.to === null) {
            throw new Error("ServiceOwnerAccessPackageDelegation.to is required");
        }

        if (this.request.packageUrn === null) {
            throw new Error(
                "ServiceOwnerAccessPackageDelegation.packageUrn is required",
            );
        }

        return this.request;
    }
}

class GetResourceRightsQueryBuilder {
    constructor() {
        this.query = /** @type {GetResourceRightsQuery} */ ({});
    }

    /**
     * @param {string} resource Value to set.
     * @returns {GetResourceRightsQueryBuilder} This builder, for chaining.
     */
    WithResource(resource) {
        this.query.resource = resource;

        return this;
    }

    /**
     * @returns {GetResourceRightsQuery} The built query.
     */
    Build() {
        return this.query;
    }
}

class ServiceOwnerResourceDelegationBuilder {
    constructor() {
        this.request = /** @type {ServiceOwnerResourceDelegation} */ (/** @type {unknown} */ ({
            from: null,
            to: null,
            resource: null,
            rightKeys: null,
        }));
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} from Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} to Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {string} resource Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithResource(resource) {
        this.request.resource = resource;

        return this;
    }

    /**
     * @param {RightKeyListDto|null} rightKeys Value to set.
     * @returns {ServiceOwnerResourceDelegationBuilder} This builder, for chaining.
     */
    WithRightKeys(rightKeys) {
        this.request.rightKeys = rightKeys;

        return this;
    }

    /**
     * @returns {ServiceOwnerResourceDelegation} The built payload.
     */
    Build() {
        if (this.request.from === null) {
            throw new Error("ServiceOwnerResourceDelegation.from is required");
        }

        if (this.request.to === null) {
            throw new Error("ServiceOwnerResourceDelegation.to is required");
        }

        if (this.request.resource === null) {
            throw new Error(
                "ServiceOwnerResourceDelegation.resource is required",
            );
        }

        return this.request;
    }
}

export {
    GetResourceRightsQueryBuilder,
    ServiceOwnerAccessPackageDelegationBuilder,
    ServiceOwnerResourceDelegationBuilder,
};
