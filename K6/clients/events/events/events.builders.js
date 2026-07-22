/**
 * Builder for creating query parameters for retrieving cloud events.
 *
 * Example:
 *
 * const query = new EventsQueryBuilder()
 *   .withResource("urn:altinn:resource:app_ttd_apps-test")
 *   .withSubject("/party/50015641")
 *   .withAlternativeSubject("/person/01017512345")
 *   .withTypes([
 *     "app.instance.created",
 *     "app.instance.process.completed"
 *   ])
 *   .withSize(50)
 *   .build();
 */
export class EventsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * Sets the required resource filter.
     *
     * @param {string} resource Resource identifier.
     * @returns {EventsQueryBuilder}
     */
    withResource(resource) {
        this.query.resource = resource;
        return this;
    }

    /**
     * Sets the event id to start retrieving events after.
     *
     * @param {string} after Event identifier.
     * @returns {EventsQueryBuilder}
     */
    withAfter(after) {
        this.query.after = after;
        return this;
    }

    /**
     * Filters events by subject.
     *
     * @param {string} subject Subject identifier.
     * @returns {EventsQueryBuilder}
     */
    withSubject(subject) {
        this.query.subject = subject;
        return this;
    }

    /**
     * Sets the alternative subject filter.
     *
     * Maps to the Altinn-AlternativeSubject header.
     *
     * @param {string} alternativeSubject Alternative subject identifier.
     * @returns {EventsQueryBuilder}
     */
    withAlternativeSubject(alternativeSubject) {
        this.query.alternativeSubject = alternativeSubject;
        return this;
    }

    /**
     * Filters events by event types.
     *
     * @param {string[]} types Event types.
     * @returns {EventsQueryBuilder}
     */
    withTypes(types) {
        this.query.type = types;
        return this;
    }

    /**
     * Sets the maximum number of events returned.
     *
     * @param {number} size Maximum result size.
     * @returns {EventsQueryBuilder}
     */
    withSize(size) {
        this.query.size = size;
        return this;
    }

    /**
     * Builds the query parameters object.
     *
     * @returns {EventsQueryParams}
     */
    build() {
        return {
            ...this.query
        };
    }
}
