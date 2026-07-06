/**
 * Valid consent request event types.
 */
export const ConsentEventType = {
    ACCEPTED: "accepted",
    REVOKED: "revoked",
    REJECTED: "rejected",
    CREATED: "created",
};

/**
 * Builder for the query parameters of the enterprise consent request events endpoint.
 *
 * Endpoint: GET /accessmanagement/api/v1/enterprise/consentrequests/events
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/events/}
 *
 * `build()` returns a URL-encoded query string (without the leading "?"),
 * or an empty string when no parameters have been set.
 */
export class ConsentRequestEventsQueryBuilder {
    constructor() {
        this.params = {};
    }

    /**
     * Only include events created at or after this timestamp.
     *
     * @param {string} createdAfter DateTimeOffset, e.g. "2026-01-01T00:00:00Z".
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    withCreatedAfter(createdAfter) {
        this.params.createdAfter = createdAfter;
        return this;
    }

    /**
     * Only include events created before this timestamp. Must be strictly greater
     * than `createdAfter` when both are set.
     *
     * @param {string} createdBefore DateTimeOffset, e.g. "2026-02-01T00:00:00Z".
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    withCreatedBefore(createdBefore) {
        this.params.createdBefore = createdBefore;
        return this;
    }

    /**
     * Filter by event type. Repeatable, so an array adds multiple `EventType` params.
     *
     * @param {string|string[]} eventType One or more values from {@link ConsentEventType} (accepted, revoked, rejected).
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    withEventType(eventType) {
        const eventTypes = Array.isArray(eventType) ? eventType : [eventType];
        const validTypes = Object.values(ConsentEventType);
        for (const type of eventTypes) {
            if (!validTypes.includes(type)) {
                throw new Error(`Invalid event type: ${type}. Valid types are: ${validTypes.join(", ")}`);
            }
        }
        this.params.EventType = eventTypes;
        return this;
    }

    /**
     * Only include events belonging to a specific consent request.
     *
     * @param {string} consentRequestId The id of the consent request.
     * @returns {ConsentRequestEventsQueryBuilder}
     */
    withConsentRequestId(consentRequestId) {
        this.params.ConsentRequestID = consentRequestId;
        return this;
    }

    /**
     * Build the URL-encoded query string (without a leading "?").
     * Returns an empty string when no parameters have been set.
     *
     * @returns {string}
     */
    build() {
        const parts = [];
        for (const [key, value] of Object.entries(this.params)) {
            if (value === undefined || value === null) {
                continue;
            }
            const values = Array.isArray(value) ? value : [value];
            for (const v of values) {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
            }
        }
        return parts.join("&");
    }
}
