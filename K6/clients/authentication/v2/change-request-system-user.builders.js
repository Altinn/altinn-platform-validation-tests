class ChangeRequestSystemUserBuilder {
    constructor() {
        this.request = {
            requiredRights: null,
            unwantedRights: null,
            requiredAccessPackages: null,
            unwantedAccessPackages: null,
            redirectUrl: null,
        };
    }

    /**
     * Adds required rights.
     *
     * @param {Right[]} rights Rights to add.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    WithRequiredRights(rights) {
        this.request.requiredRights = rights;

        return this;
    }

    /**
     * Adds unwanted rights.
     *
     * @param {Right[]} rights Rights to remove.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    WithUnwantedRights(rights) {
        this.request.unwantedRights = rights;

        return this;
    }

    /**
     * Adds required access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to add.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    WithRequiredAccessPackages(accessPackages) {
        this.request.requiredAccessPackages = accessPackages;

        return this;
    }

    /**
     * Adds unwanted access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to remove.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    WithUnwantedAccessPackages(accessPackages) {
        this.request.unwantedAccessPackages = accessPackages;

        return this;
    }

    /**
     * Sets redirect URL.
     *
     * @param {string} redirectUrl Redirect URL.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    WithRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * Builds the change request model.
     *
     * @returns {ChangeRequestSystemUser} The built payload.
     */
    Build() {
        return this.request;
    }
}

export {
    ChangeRequestSystemUserBuilder,
};
