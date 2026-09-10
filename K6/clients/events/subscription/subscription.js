import http from "k6/http";

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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.SubscriptionCreate.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Get all subscriptions for the authorized consumer.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SubscriptionGetAll(labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.SubscriptionGetAll.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
            action: TAGS.SubscriptionGet.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
            action: TAGS.SubscriptionDelete.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/validate/${id}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/validate/{id}`,
            name: `${this.FULL_PATH}/validate/{id}`,
            action: TAGS.SubscriptionValidate.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.put(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export {
    SubscriptionClient,
};
