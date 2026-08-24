import { AccessPackage, ChangeRequestSystemUser, Right } from "./types.js";

class ChangeRequestSystemUserBuilder {
    constructor() {
        // The API requires all four sets to be present, so they default to empty
        // rather than null. Leaving all four empty means no change is needed.
        this.request = {
            requiredRights: [],
            unwantedRights: [],
            requiredAccessPackages: [],
            unwantedAccessPackages: [],
            redirectUrl: null,
        };
    }

    /**
     * Adds required rights.
     *
     * @param {Right[]} rights Rights to add.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    withRequiredRights(rights) {
        this.request.requiredRights = rights;

        return this;
    }

    /**
     * Adds unwanted rights.
     *
     * @param {Right[]} rights Rights to remove.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    withUnwantedRights(rights) {
        this.request.unwantedRights = rights;

        return this;
    }

    /**
     * Adds required access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to add.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    withRequiredAccessPackages(accessPackages) {
        this.request.requiredAccessPackages = accessPackages;

        return this;
    }

    /**
     * Adds unwanted access packages.
     *
     * @param {AccessPackage[]} accessPackages Access packages to remove.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    withUnwantedAccessPackages(accessPackages) {
        this.request.unwantedAccessPackages = accessPackages;

        return this;
    }

    /**
     * Sets redirect URL.
     *
     * @param {string} redirectUrl Redirect URL.
     * @returns {ChangeRequestSystemUserBuilder} This builder, for chaining.
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * Builds the change request model.
     *
     * @returns {ChangeRequestSystemUser} The built payload.
     */
    build() {
        return this.request;
    }
}

export {
    ChangeRequestSystemUserBuilder,
};
