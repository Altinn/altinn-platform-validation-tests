import http from "k6/http";

import { jsonBody, requestParams } from "../../common/request.js";
import { InstantEmailNotificationOrderRequestExt, InstantNotificationOrderRequestExt, InstantSmsNotificationOrderRequestExt } from "../types.js";

const TAGS = {
    InstantOrdersCreate: {
        action: "instant-orders-create",
    },
    InstantOrdersCreateSms: {
        action: "instant-orders-create-sms",
    },
    InstantOrdersCreateEmail: {
        action: "instant-orders-create-email",
    },
};

class InstantOrdersClient {
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
        this.BASE_PATH = "/notifications/api/v1/future/orders/instant";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates and sends an instant SMS notification to a single recipient.
     *
     * @param {InstantSmsNotificationOrderRequestExt} request SMS notification payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InstantOrdersCreateSms(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/sms`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/sms`,
                action: TAGS.InstantOrdersCreateSms.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates and sends an instant email notification to a single recipient.
     *
     * @param {InstantEmailNotificationOrderRequestExt} request Email notification payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InstantOrdersCreateEmail(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/email`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/email`,
                action: TAGS.InstantOrdersCreateEmail.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates an instant notification order.
     *
     * POST /future/orders/instant
     *
     * @param {InstantNotificationOrderRequestExt} request Instant order.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     * @deprecated Use InstantOrdersCreateSms with recipientSms at the top level.
     */
    InstantOrdersCreate(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.InstantOrdersCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export {
    InstantOrdersClient,
};
