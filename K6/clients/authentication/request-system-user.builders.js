import { AccessPackage, CreateAgentRequestSystemUser, CreateRequestSystemUser, Right } from "./types.js";

/**
 * Builder for {@link CreateRequestSystemUser}.
 */
class CreateRequestSystemUserBuilder {
    constructor() {
        // The model is filled in by the setters, so the required fields start out null.
        this.request = /** @type {CreateRequestSystemUser} */ (/** @type {unknown} */ ({
            externalRef: null,
            systemId: null,
            partyOrgNo: null,
            rights: [],
            accessPackages: [],
            redirectUrl: null,
        }));
    }

    /**
     * @param {string} externalRef See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {Right[]} rights See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withRights(rights) {
        this.request.rights = rights;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl See the client method.
     * @returns {CreateRequestSystemUserBuilder} This builder, for chaining.
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateRequestSystemUser} The built payload.
     */
    build() {
        return this.request;
    }
}

/**
 * Builder for {@link CreateAgentRequestSystemUser}.
 */
class CreateAgentRequestSystemUserBuilder {
    constructor() {
        // The model is filled in by the setters, so the required fields start out null.
        this.request = /** @type {CreateAgentRequestSystemUser} */ (/** @type {unknown} */ ({
            externalRef: null,
            systemId: null,
            partyOrgNo: null,
            accessPackages: [],
            redirectUrl: null,
        }));
    }

    /**
     * @param {string} externalRef See the client method.
     * @returns {CreateAgentRequestSystemUserBuilder} This builder, for chaining.
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId See the client method.
     * @returns {CreateAgentRequestSystemUserBuilder} This builder, for chaining.
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo See the client method.
     * @returns {CreateAgentRequestSystemUserBuilder} This builder, for chaining.
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages See the client method.
     * @returns {CreateAgentRequestSystemUserBuilder} This builder, for chaining.
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl See the client method.
     * @returns {CreateAgentRequestSystemUserBuilder} This builder, for chaining.
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateAgentRequestSystemUser} The built payload.
     */
    build() {
        return this.request;
    }
}

export {
    CreateAgentRequestSystemUserBuilder,
    CreateRequestSystemUserBuilder,
};
