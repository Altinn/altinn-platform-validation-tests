class RegisterSystemRequestBuilder {
    constructor() {
        /** @type {RegisterSystemRequest} */
        this.request = {
            id: null,
            vendor: null,
            name: null,
            description: null,
            rights: null,
            accessPackages: null,
            clientId: null,
            isVisible: false,
            allowedRedirectUrls: null,
        };
    }

    /**
     * Sets the system identifier.
     *
     * @param {string|null} id
     * @returns {RegisterSystemRequestBuilder}
     */
    withId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * Sets vendor information.
     *
     * @param {VendorInfo|null} vendor
     * @returns {RegisterSystemRequestBuilder}
     */
    withVendor(vendor) {
        this.request.vendor = vendor;

        return this;
    }

    /**
     * Sets localized system names.
     *
     * @param {Object<string, string>|null} name
     * @returns {RegisterSystemRequestBuilder}
     */
    withName(name) {
        this.request.name = name;

        return this;
    }

    /**
     * Sets localized system descriptions.
     *
     * @param {Object<string, string>|null} description
     * @returns {RegisterSystemRequestBuilder}
     */
    withDescription(description) {
        this.request.description = description;

        return this;
    }

    /**
     * Sets system rights.
     *
     * @param {Right[]|null} rights
     * @returns {RegisterSystemRequestBuilder}
     */
    withRights(rights) {
        this.request.rights = rights;

        return this;
    }

    /**
     * Sets system access packages.
     *
     * @param {AccessPackage[]|null} accessPackages
     * @returns {RegisterSystemRequestBuilder}
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;

        return this;
    }

    /**
     * Sets client identifiers.
     *
     * @param {string[]|null} clientId
     * @returns {RegisterSystemRequestBuilder}
     */
    withClientId(clientId) {
        this.request.clientId = clientId;

        return this;
    }

    /**
     * Sets visibility.
     *
     * @param {boolean} isVisible
     * @returns {RegisterSystemRequestBuilder}
     */
    withVisibility(isVisible) {
        this.request.isVisible = isVisible;

        return this;
    }

    /**
     * Sets allowed redirect URLs.
     *
     * @param {string[]|null} allowedRedirectUrls
     * @returns {RegisterSystemRequestBuilder}
     */
    withAllowedRedirectUrls(allowedRedirectUrls) {
        this.request.allowedRedirectUrls = allowedRedirectUrls;

        return this;
    }

    /**
     * Builds the request model.
     *
     * @returns {RegisterSystemRequest}
     */
    build() {
        return this.request;
    }
}

export {
    RegisterSystemRequestBuilder,
};
