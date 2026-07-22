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
     * @param {string} externalRef
     * @returns {CreateRequestSystemUserBuilder}
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId
     * @returns {CreateRequestSystemUserBuilder}
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo
     * @returns {CreateRequestSystemUserBuilder}
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {Right[]} rights
     * @returns {CreateRequestSystemUserBuilder}
     */
    withRights(rights) {
        this.request.rights = rights;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages
     * @returns {CreateRequestSystemUserBuilder}
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl
     * @returns {CreateRequestSystemUserBuilder}
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateRequestSystemUser}
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
     * @param {string} externalRef
     * @returns {CreateAgentRequestSystemUserBuilder}
     */
    withExternalRef(externalRef) {
        this.request.externalRef = externalRef;
        return this;
    }

    /**
     * @param {string} systemId
     * @returns {CreateAgentRequestSystemUserBuilder}
     */
    withSystemId(systemId) {
        this.request.systemId = systemId;
        return this;
    }

    /**
     * @param {string} partyOrgNo
     * @returns {CreateAgentRequestSystemUserBuilder}
     */
    withPartyOrgNo(partyOrgNo) {
        this.request.partyOrgNo = partyOrgNo;
        return this;
    }

    /**
     * @param {AccessPackage[]} accessPackages
     * @returns {CreateAgentRequestSystemUserBuilder}
     */
    withAccessPackages(accessPackages) {
        this.request.accessPackages = accessPackages;
        return this;
    }

    /**
     * @param {string} redirectUrl
     * @returns {CreateAgentRequestSystemUserBuilder}
     */
    withRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;
        return this;
    }

    /**
     * @returns {CreateAgentRequestSystemUser}
     */
    build() {
        return this.request;
    }
}

export {
    CreateRequestSystemUserBuilder,
    CreateAgentRequestSystemUserBuilder,
};
