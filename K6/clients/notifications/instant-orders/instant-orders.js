import http from "k6/http";

const TAGS = {
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    InstantOrdersCreateSms(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/sms`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.InstantOrdersCreateSms.action,
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
            },
        });
    }

    /**
     * Creates and sends an instant email notification to a single recipient.
     *
     * @param {InstantEmailNotificationOrderRequestExt} request Email notification payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    InstantOrdersCreateEmail(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/email`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.InstantOrdersCreateEmail.action,
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
            },
        });
    }
}

export {
    InstantOrdersClient,
};
