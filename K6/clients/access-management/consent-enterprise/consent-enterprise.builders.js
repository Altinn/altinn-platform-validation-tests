class ConsentRequestBuilder {
    constructor() {
        this.request = {
            id: null,
            from: null,
            requiredDelegator: null,
            to: null,
            validTo: null,
            consentRights: null,
            requestMessage: null,
            redirectUrl: null,
            portalViewMode: null,
        };
    }

    /**
     * @param {string} id Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * @param {string|null} from Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {string|null} requiredDelegator Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithRequiredDelegator(requiredDelegator) {
        this.request.requiredDelegator = requiredDelegator;

        return this;
    }

    /**
     * @param {string|null} to Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {string} validTo Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithValidTo(validTo) {
        this.request.validTo = validTo;

        return this;
    }

    /**
     * @param {Array<ConsentRightDto>} consentRights Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithConsentRights(consentRights) {
        this.request.consentRights = consentRights;

        return this;
    }

    /**
     * @param {{[key:string]: string}|null} requestMessage Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithRequestMessage(requestMessage) {
        this.request.requestMessage = requestMessage;

        return this;
    }

    /**
     * @param {string|null} redirectUrl Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * @param {ConsentPortalViewMode|null} portalViewMode Value to set.
     * @returns {ConsentRequestBuilder} This builder, for chaining.
     */
    WithPortalViewMode(portalViewMode) {
        this.request.portalViewMode = portalViewMode;

        return this;
    }

    /**
     * @returns {ConsentRequestDto} The built consent request.
     */
    Build() {
        return this.request;
    }
}
class ConsentRequestEventsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} continuationToken Value to set.
     * @returns {ConsentRequestEventsQueryBuilder} This builder, for chaining.
     */
    WithContinuationToken(continuationToken) {
        this.query.continuationToken = continuationToken;

        return this;
    }

    /**
     * @param {string} createdAfter Value to set.
     * @returns {ConsentRequestEventsQueryBuilder} This builder, for chaining.
     */
    WithCreatedAfter(createdAfter) {
        this.query.createdAfter = createdAfter;

        return this;
    }

    /**
     * @param {string} createdBefore Value to set.
     * @returns {ConsentRequestEventsQueryBuilder} This builder, for chaining.
     */
    WithCreatedBefore(createdBefore) {
        this.query.createdBefore = createdBefore;

        return this;
    }

    /**
     * @param {Array<string>} eventType Value to set.
     * @returns {ConsentRequestEventsQueryBuilder} This builder, for chaining.
     */
    WithEventType(eventType) {
        this.query.eventType = eventType;

        return this;
    }

    /**
     * @param {string} consentRequestId Value to set.
     * @returns {ConsentRequestEventsQueryBuilder} This builder, for chaining.
     */
    WithConsentRequestId(consentRequestId) {
        this.query.consentRequestId = consentRequestId;

        return this;
    }

    /**
     * @returns {object} The built payload.
     */
    Build() {
        return this.query;
    }
}

export {
    ConsentRequestBuilder,
    ConsentRequestEventsQueryBuilder,
};
