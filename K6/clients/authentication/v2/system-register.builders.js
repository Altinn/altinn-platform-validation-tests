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
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withId("212485772_SuperSystemTriple") // Orgnumber + name of system. Orgnumber must match with vendor information to authenticate
     * .build();
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
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withVendor("0192:212485772") // area code: 0192, org number: 212485772
     * .build();
     */
    withVendor(vendor) {
        this.request.vendor = { id: vendor };
        return this;
    }

    /**
     * Sets localized system names.
     *
     * @param {{[key: string]: string}|null} name See the client method.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withName({
     *   "en": "English name",
     *   "nb": "Norsk name",
     *   "nn": "Nynorsk name"
     * })
     * .build();
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
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withDescription({
     *   "en": "English description",
     *   "nb": "Norsk description",
     *   "nn": "Nynorsk description"
     * })
     * .build();
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
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withRights([
     *   {
     *      "action": "read",
     *     "resource": [
     *       {
     *         "value": "authentication-e2e-test",
     *         "id": "urn:altinn:resource",
     *       }
     *     ]
     *   },
     */
    withRights(rights) {
        this.request.rights = rights;

        return this;
    }

    /**
     * Sets system access packages.
     *
     * @param {string[]|null} accessPackages Access package urns. Each urn is wrapped as { urn } in the request body.
     * @returns {RegisterSystemRequestBuilder} This builder, for chaining.
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withAccessPackages(["urn:altinn:accesspackage:forretningsforer-eiendom", "urn:altinn:accesspackage:jordbruk"])
     * .build();
     * // -> accessPackages: [
     * //      { "urn": "urn:altinn:accesspackage:forretningsforer-eiendom" },
     * //      { "urn": "urn:altinn:accesspackage:jordbruk" }
     * //    ]
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages === null
            ? null
            : accessPackages.map((urn) => ({ urn: urn }));

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
     * @example
     * const requestBody = new RegisterSystemRequestBuilder()
     * .withAllowedRedirectUrls(["https://example.com", "https://example.org/redirect"])
     * .build();
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
