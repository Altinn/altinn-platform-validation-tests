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
     * @returns {ChangeRequestSystemUserBuilder}
     */
    WithRequiredRights(rights) {
        this.request.requiredRights = rights;

        return this;
    }

    /**
     * Adds unwanted rights.
     *
     * @param {Right[]} rights Rights to remove.
     * @returns {ChangeRequestSystemUserBuilder}
     */
    WithUnwantedRights(rights) {
        this.request.unwantedRights = rights;

        return this;
    }

    /**
     * Adds required access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to add.
     * @returns {ChangeRequestSystemUserBuilder}
     */
    WithRequiredAccessPackages(accessPackages) {
        this.request.requiredAccessPackages = accessPackages;

        return this;
    }

    /**
     * Adds unwanted access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to remove.
     * @returns {ChangeRequestSystemUserBuilder}
     */
    WithUnwantedAccessPackages(accessPackages) {
        this.request.unwantedAccessPackages = accessPackages;

        return this;
    }

    /**
     * Sets redirect URL.
     *
     * @param {string} redirectUrl Redirect URL.
     * @returns {ChangeRequestSystemUserBuilder}
     */
    WithRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * Builds the change request model.
     *
     * @returns {ChangeRequestSystemUser}
     */
    Build() {
        return this.request;
    }
}

export {
    ChangeRequestSystemUserBuilder,
};
