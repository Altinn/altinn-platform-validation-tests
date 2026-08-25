import { AccessPackageUrn, ServiceOwnerAccessPackageDelegation, ServiceOwnerConnectionPartyUrn } from "./connections.types.js";

class ServiceOwnerAccessPackageDelegationBuilder {
    constructor() {
        this.request = /** @type {ServiceOwnerAccessPackageDelegation} */ ({
            from: null,
            to: null,
            packageUrn: null,
        });
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

export {
    ServiceOwnerAccessPackageDelegationBuilder,
};
