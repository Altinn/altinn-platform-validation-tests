/**
 * Builder for creating subscription request payloads.
 *
 * Usage:
 * const request = new SubscriptionRequestModelBuilder()
 * .withEndpoint("https://example.com/events")
 * withSourceFilter("https://example.com/app")
 * .withTypeFilter("app.instance.created")
 * .build();
 *
 * @class
 */
class SubscriptionRequestModelBuilder {
    constructor() {
        /** @type {SubscriptionRequestModel} */
        this.request = {
            endPoint: null,
            sourceFilter: null,
            subjectFilter: null,
            resourceFilter: null,
            alternativeSubjectFilter: null,
            typeFilter: null,
        };
    }

    /**
     * Sets the endpoint receiving matching events.
     *
     * @param {string} endPoint TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withEndpoint(endPoint) {
        this.request.endPoint = endPoint;
        return this;
    }

    /**
     * Sets the source filter.
     *
     * @param {string} sourceFilter TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withSourceFilter(sourceFilter) {
        this.request.sourceFilter = sourceFilter;
        return this;
    }

    /**
     * Sets the subject filter.
     *
     * @param {string} subjectFilter TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withSubjectFilter(subjectFilter) {
        this.request.subjectFilter = subjectFilter;
        return this;
    }

    /**
     * Sets the resource filter.
     *
     * @param {string} resourceFilter TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withResourceFilter(resourceFilter) {
        this.request.resourceFilter = resourceFilter;
        return this;
    }

    /**
     * Sets the alternative subject filter.
     *
     * @param {string} alternativeSubjectFilter TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withAlternativeSubjectFilter(alternativeSubjectFilter) {
        this.request.alternativeSubjectFilter = alternativeSubjectFilter;
        return this;
    }

    /**
     * Sets the event type filter.
     *
     * @param {string} typeFilter TODO: Description
     * @returns {SubscriptionRequestModelBuilder} TODO: Description
     */
    withTypeFilter(typeFilter) {
        this.request.typeFilter = typeFilter;
        return this;
    }

    /**
     * Builds the subscription request payload.
     *
     * @returns {SubscriptionRequestModel} TODO: Description
     */
    build() {
        return {
            ...this.request,
        };
    }
}

export {
    SubscriptionRequestModelBuilder,
};
