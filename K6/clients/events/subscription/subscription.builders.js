/**
 * Builder for creating subscription request payloads.
 *
 * Usage:
 * const request = new SubscriptionRequestModelBuilder()
 *     .withEndpoint("https://example.com/events")
 *     .withSourceFilter("https://example.com/app")
 *     .withTypeFilter("app.instance.created")
 *     .build();
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
     * @param {string} endPoint
     * @returns {SubscriptionRequestModelBuilder}
     */
    withEndpoint(endPoint) {
        this.request.endPoint = endPoint;
        return this;
    }

    /**
     * Sets the source filter.
     *
     * @param {string} sourceFilter
     * @returns {SubscriptionRequestModelBuilder}
     */
    withSourceFilter(sourceFilter) {
        this.request.sourceFilter = sourceFilter;
        return this;
    }

    /**
     * Sets the subject filter.
     *
     * @param {string} subjectFilter
     * @returns {SubscriptionRequestModelBuilder}
     */
    withSubjectFilter(subjectFilter) {
        this.request.subjectFilter = subjectFilter;
        return this;
    }

    /**
     * Sets the resource filter.
     *
     * @param {string} resourceFilter
     * @returns {SubscriptionRequestModelBuilder}
     */
    withResourceFilter(resourceFilter) {
        this.request.resourceFilter = resourceFilter;
        return this;
    }

    /**
     * Sets the alternative subject filter.
     *
     * @param {string} alternativeSubjectFilter
     * @returns {SubscriptionRequestModelBuilder}
     */
    withAlternativeSubjectFilter(alternativeSubjectFilter) {
        this.request.alternativeSubjectFilter = alternativeSubjectFilter;
        return this;
    }

    /**
     * Sets the event type filter.
     *
     * @param {string} typeFilter
     * @returns {SubscriptionRequestModelBuilder}
     */
    withTypeFilter(typeFilter) {
        this.request.typeFilter = typeFilter;
        return this;
    }

    /**
     * Builds the subscription request payload.
     *
     * @returns {SubscriptionRequestModel}
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
