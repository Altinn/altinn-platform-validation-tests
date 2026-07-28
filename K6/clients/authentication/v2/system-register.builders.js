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
     * @param {string|null} id TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * Sets vendor information.
     *
     * @param {VendorInfo|null} vendor TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withVendor(vendor) {
        this.request.vendor = vendor;

        return this;
    }

    /**
     * Sets localized system names.
     *
     * @param {{[key: string]: string}|null} name TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withName(name) {
        this.request.name = name;

        return this;
    }

    /**
     * Sets localized system descriptions.
     *
     * @param {{[key: string]: string}|null} description TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withDescription(description) {
        this.request.description = description;

        return this;
    }

    /**
     * Sets system rights.
     *
     * @param {Right[]|null} rights TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withRights(rights) {
        this.request.rights = rights;

        return this;
    }

    /**
     * Sets system access packages.
     *
     * @param {AccessPackage[]|null} accessPackages TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;

        return this;
    }

    /**
     * Sets client identifiers.
     *
     * @param {string[]|null} clientId TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withClientId(clientId) {
        this.request.clientId = clientId;

        return this;
    }

    /**
     * Sets visibility.
     *
     * @param {boolean} isVisible TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withVisibility(isVisible) {
        this.request.isVisible = isVisible;

        return this;
    }

    /**
     * Sets allowed redirect URLs.
     *
     * @param {string[]|null} allowedRedirectUrls TODO: Description
     * @returns {RegisterSystemRequestBuilder} TODO: Description
     */
    withAllowedRedirectUrls(allowedRedirectUrls) {
        this.request.allowedRedirectUrls = allowedRedirectUrls;

        return this;
    }

    /**
     * Builds the request model.
     *
     * @returns {RegisterSystemRequest} TODO: Description
     */
    build() {
        return this.request;
    }
}

export {
    RegisterSystemRequestBuilder,
};
