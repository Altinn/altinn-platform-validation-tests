class ServiceOwnerAccessPackageDelegationBuilder {
    constructor() {
        this.request = {
            from: null,
            to: null,
            packageUrn: null,
        };
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} from
     * @returns {ServiceOwnerAccessPackageDelegationBuilder}
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {ServiceOwnerConnectionPartyUrn} to
     * @returns {ServiceOwnerAccessPackageDelegationBuilder}
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {AccessPackageUrn} packageUrn
     * @returns {ServiceOwnerAccessPackageDelegationBuilder}
     */
    WithPackageUrn(packageUrn) {
        this.request.packageUrn = packageUrn;

        return this;
    }

    /**
     * @returns {ServiceOwnerAccessPackageDelegation}
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
