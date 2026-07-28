/**
 * Builder for {@link CreateRequestSystemUser}.
 */
class CreateRequestSystemUserBuilder {
    constructor() {
        /** @type {CreateRequestSystemUser} */
        this.request = {
            externalRef: null,
            systemId: null,
            partyOrgNo: null,
            rights: [],
            accessPackages: [],
            redirectUrl: null,
        };
    }

    /**
     * @param {string} externalRef TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {Right[]} rights TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withRights(rights) {
        this.request.rights = rights;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl TODO: Description
     * @returns {CreateRequestSystemUserBuilder} TODO: Description
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateRequestSystemUser} TODO: Description
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
        /** @type {CreateAgentRequestSystemUser} */
        this.request = {
            externalRef: null,
            systemId: null,
            partyOrgNo: null,
            accessPackages: [],
            redirectUrl: null,
        };
    }

    /**
     * @param {string} externalRef TODO: Description
     * @returns {CreateAgentRequestSystemUserBuilder} TODO: Description
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId TODO: Description
     * @returns {CreateAgentRequestSystemUserBuilder} TODO: Description
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo TODO: Description
     * @returns {CreateAgentRequestSystemUserBuilder} TODO: Description
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages TODO: Description
     * @returns {CreateAgentRequestSystemUserBuilder} TODO: Description
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl TODO: Description
     * @returns {CreateAgentRequestSystemUserBuilder} TODO: Description
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateAgentRequestSystemUser} TODO: Description
     */
    build() {
        return this.request;
    }
}

export {
    CreateAgentRequestSystemUserBuilder,
    CreateRequestSystemUserBuilder,
};
