import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { SubscriptionRequestModel } from "../types.js";

const TAGS = {
    SubscriptionCreate: {
        action: "subscription-create",
    },
    SubscriptionGetAll: {
        action: "subscription-get-all",
    },
    SubscriptionGet: {
        action: "subscription-get",
    },
    SubscriptionDelete: {
        action: "subscription-delete",
    },
    SubscriptionValidate: {
        action: "subscription-validate",
    },
};

class SubscriptionClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/events/api/v1/subscriptions";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Register a subscription for events.
     *
     * @param {SubscriptionRequestModel} request Subscription payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionCreate(request, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.SubscriptionCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Get all subscriptions for the authorized consumer.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionGetAll(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.SubscriptionGetAll.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Get a specific subscription.
     *
     * @param {number} id Subscription id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionGet(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.SubscriptionGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Delete a given subscription.
     *
     * @param {number} id Subscription id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionDelete(id, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${id}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.SubscriptionDelete.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Validate a specific subscription.
     *
     * @param {number} id Subscription id.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionValidate(id, labels = null) {
        return http.put(
            `${this.FULL_PATH}/validate/${id}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/validate/{id}`,
                action: TAGS.SubscriptionValidate.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    SubscriptionClient,
};
