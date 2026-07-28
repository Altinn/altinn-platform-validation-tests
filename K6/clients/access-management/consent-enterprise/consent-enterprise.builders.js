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
     * @param {string} id TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * @param {string|null} from TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {string|null} requiredDelegator TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithRequiredDelegator(requiredDelegator) {
        this.request.requiredDelegator = requiredDelegator;

        return this;
    }

    /**
     * @param {string|null} to TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {string} validTo TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithValidTo(validTo) {
        this.request.validTo = validTo;

        return this;
    }

    /**
     * @param {Array<ConsentRightDto>} consentRights TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithConsentRights(consentRights) {
        this.request.consentRights = consentRights;

        return this;
    }

    /**
     * @param {{[key:string]: string}|null} requestMessage TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithRequestMessage(requestMessage) {
        this.request.requestMessage = requestMessage;

        return this;
    }

    /**
     * @param {string|null} redirectUrl TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * @param {ConsentPortalViewMode|null} portalViewMode TODO: Description
     * @returns {ConsentRequestBuilder} TODO: Description
     */
    WithPortalViewMode(portalViewMode) {
        this.request.portalViewMode = portalViewMode;

        return this;
    }

    /**
     * @returns {ConsentRequestDto} TODO: Description
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
     * @param {string} continuationToken TODO: Description
     * @returns {ConsentRequestEventsQueryBuilder} TODO: Description
     */
    WithContinuationToken(continuationToken) {
        this.query.continuationToken = continuationToken;

        return this;
    }

    /**
     * @param {string} createdAfter TODO: Description
     * @returns {ConsentRequestEventsQueryBuilder} TODO: Description
     */
    WithCreatedAfter(createdAfter) {
        this.query.createdAfter = createdAfter;

        return this;
    }

    /**
     * @param {string} createdBefore TODO: Description
     * @returns {ConsentRequestEventsQueryBuilder} TODO: Description
     */
    WithCreatedBefore(createdBefore) {
        this.query.createdBefore = createdBefore;

        return this;
    }

    /**
     * @param {Array<string>} eventType TODO: Description
     * @returns {ConsentRequestEventsQueryBuilder} TODO: Description
     */
    WithEventType(eventType) {
        this.query.eventType = eventType;

        return this;
    }

    /**
     * @param {string} consentRequestId TODO: Description
     * @returns {ConsentRequestEventsQueryBuilder} TODO: Description
     */
    WithConsentRequestId(consentRequestId) {
        this.query.consentRequestId = consentRequestId;

        return this;
    }

    /**
     * @returns {object} TODO: Description
     */
    Build() {
        return this.query;
    }
}

export {
    ConsentRequestBuilder,
    ConsentRequestEventsQueryBuilder,
};
