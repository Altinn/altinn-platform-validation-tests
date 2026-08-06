/**
 * Builder for the query parameters of {@link DeleteAgentSystemUser}.
 */
class DeleteAgentSystemUserQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Optional. Party UUID of the organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @returns {DeleteAgentSystemUserQueryBuilder} This builder, for chaining.
     */
    withPartyUuid(partyUuid) {
        this.query.partyUuid = partyUuid;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {DeleteAgentSystemUserQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the {@link NewSystemUserRequest} request body.
 */
class NewSystemUserRequestBuilder {
    constructor() {
        this.body = {};
    }

    /**
     * Optional. Name of the integration.
     *
     * @param {string} integrationTitle Name of the integration.
     * @returns {NewSystemUserRequestBuilder} This builder, for chaining.
     */
    withIntegrationTitle(integrationTitle) {
        this.body.integrationTitle = integrationTitle;
        return this;
    }

    /**
     * Optional. Identifier of the system in the system register.
     *
     * @param {string} systemId Identifier of the system in the system register.
     * @returns {NewSystemUserRequestBuilder} This builder, for chaining.
     */
    withSystemId(systemId) {
        this.body.systemId = systemId;
        return this;
    }

    /**
     * Builds the request body.
     *
     * @returns {NewSystemUserRequest} The built payload.
     */
    build() {
        return this.body;
    }
}

export {
    DeleteAgentSystemUserQueryBuilder,
    NewSystemUserRequestBuilder,
};
