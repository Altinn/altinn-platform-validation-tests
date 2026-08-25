import { SubscriptionRequestModel } from "../types.js";

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
     * @param {string} endPoint See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withEndpoint(endPoint) {
        this.request.endPoint = endPoint;
        return this;
    }

    /**
     * Sets the source filter.
     *
     * @param {string} sourceFilter See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withSourceFilter(sourceFilter) {
        this.request.sourceFilter = sourceFilter;
        return this;
    }

    /**
     * Sets the subject filter.
     *
     * @param {string} subjectFilter See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withSubjectFilter(subjectFilter) {
        this.request.subjectFilter = subjectFilter;
        return this;
    }

    /**
     * Sets the resource filter.
     *
     * @param {string} resourceFilter See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withResourceFilter(resourceFilter) {
        this.request.resourceFilter = resourceFilter;
        return this;
    }

    /**
     * Sets the alternative subject filter.
     *
     * @param {string} alternativeSubjectFilter See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withAlternativeSubjectFilter(alternativeSubjectFilter) {
        this.request.alternativeSubjectFilter = alternativeSubjectFilter;
        return this;
    }

    /**
     * Sets the event type filter.
     *
     * @param {string} typeFilter See the client method.
     * @returns {SubscriptionRequestModelBuilder} This builder, for chaining.
     */
    withTypeFilter(typeFilter) {
        this.request.typeFilter = typeFilter;
        return this;
    }

    /**
     * Builds the subscription request payload.
     *
     * @returns {SubscriptionRequestModel} The built payload.
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
