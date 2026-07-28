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
     * @param {string|null} id See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * Sets vendor information.
     *
     * @param {VendorInfo|null} vendor See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withVendor(vendor) {
        this.request.vendor = vendor;

        return this;
    }

    /**
     * Sets localized system names.
     *
     * @param {{[key: string]: string}|null} name See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withName(name) {
        this.request.name = name;

        return this;
    }

    /**
     * Sets localized system descriptions.
     *
     * @param {{[key: string]: string}|null} description See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withDescription(description) {
        this.request.description = description;

        return this;
    }

    /**
     * Sets system rights.
     *
     * @param {Right[]|null} rights See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withRights(rights) {
        this.request.rights = rights;

        return this;
    }

    /**
     * Sets system access packages.
     *
     * @param {AccessPackage[]|null} accessPackages See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;

        return this;
    }

    /**
     * Sets client identifiers.
     *
     * @param {string[]|null} clientId See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withClientId(clientId) {
        this.request.clientId = clientId;

        return this;
    }

    /**
     * Sets visibility.
     *
     * @param {boolean} isVisible See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withVisibility(isVisible) {
        this.request.isVisible = isVisible;

        return this;
    }

    /**
     * Sets allowed redirect URLs.
     *
     * @param {string[]|null} allowedRedirectUrls See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     */
    withAllowedRedirectUrls(allowedRedirectUrls) {
        this.request.allowedRedirectUrls = allowedRedirectUrls;

        return this;
    }

    /**
     * Builds the request model.
     *
     * @returns {RegisterSystemRequest} The built payload.
     */
    build() {
        return this.request;
    }
}

export {
    RegisterSystemRequestBuilder,
};
