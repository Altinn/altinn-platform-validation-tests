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
     * @param {string} id
     * @returns {ConsentRequestBuilder}
     */
    WithId(id) {
        this.request.id = id;

        return this;
    }

    /**
     * @param {string|null} from
     * @returns {ConsentRequestBuilder}
     */
    WithFrom(from) {
        this.request.from = from;

        return this;
    }

    /**
     * @param {string|null} requiredDelegator
     * @returns {ConsentRequestBuilder}
     */
    WithRequiredDelegator(requiredDelegator) {
        this.request.requiredDelegator = requiredDelegator;

        return this;
    }

    /**
     * @param {string|null} to
     * @returns {ConsentRequestBuilder}
     */
    WithTo(to) {
        this.request.to = to;

        return this;
    }

    /**
     * @param {string} validTo
     * @returns {ConsentRequestBuilder}
     */
    WithValidTo(validTo) {
        this.request.validTo = validTo;

        return this;
    }

    /**
     * @param {Array<ConsentRightDto>} consentRights
     * @returns {ConsentRequestBuilder}
     */
    WithConsentRights(consentRights) {
        this.request.consentRights = consentRights;

        return this;
    }

    /**
     * @param {{[key:string]: string}|null} requestMessage
     * @returns {ConsentRequestBuilder}
     */
    WithRequestMessage(requestMessage) {
        this.request.requestMessage = requestMessage;

        return this;
    }

    /**
     * @param {string|null} redirectUrl
     * @returns {ConsentRequestBuilder}
     */
    WithRedirectUrl(redirectUrl) {
        this.request.redirectUrl = redirectUrl;

        return this;
    }

    /**
     * @param {ConsentPortalViewMode|null} portalViewMode
     * @returns {ConsentRequestBuilder}
     */
    WithPortalViewMode(portalViewMode) {
        this.request.portalViewMode = portalViewMode;

        return this;
    }

    /**
     * @returns {ConsentRequestDto}
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
     * @param {string} continuationToken
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    WithContinuationToken(continuationToken) {
        this.query.continuationToken = continuationToken;

        return this;
    }

    /**
     * @param {string} createdAfter
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    WithCreatedAfter(createdAfter) {
        this.query.createdAfter = createdAfter;

        return this;
    }

    /**
     * @param {string} createdBefore
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    WithCreatedBefore(createdBefore) {
        this.query.createdBefore = createdBefore;

        return this;
    }

    /**
     * @param {Array<string>} eventType
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    WithEventType(eventType) {
        this.query.eventType = eventType;

        return this;
    }

    /**
     * @param {string} consentRequestId
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    WithConsentRequestId(consentRequestId) {
        this.query.consentRequestId = consentRequestId;

        return this;
    }

    /**
     * @returns {Object}
     */
    Build() {
        return this.query;
    }
}



export {
    ConsentRequestBuilder,
    ConsentRequestEventsQueryBuilder,
}