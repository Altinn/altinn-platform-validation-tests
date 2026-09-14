
import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { ComposedEmailRequestExt, NotificationOrderChainRequestExt } from "../types.js";

const TAGS = {
    OrderCreateOrder: {
        action: "order-create-order",
    },
    OrderCreateComposedEmail: {
        action: "order-create-composed-email",
    },
};

class OrderClient {
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
        this.BASE_PATH = "/notifications/api/v1/future/orders";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a new notification order with zero or more reminders.
     *
     * @param {NotificationOrderChainRequestExt} request Notification order request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    OrderCreateOrder(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.OrderCreateOrder.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a new composed email notification order.
     *
     * @param {ComposedEmailRequestExt} request Composed email order request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    OrderCreateComposedEmail(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/composed-email`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/composed-email`,
                action: TAGS.OrderCreateComposedEmail.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export {
    OrderClient,
};
