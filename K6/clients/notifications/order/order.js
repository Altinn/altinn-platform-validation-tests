
import http from "k6/http";

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
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH} `;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a new notification order with zero or more reminders.
     *
     * @param {NotificationOrderChainRequestExt} request Notification order request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    OrderCreateOrder(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH} `;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.OrderCreateOrder.action,
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
                Authorization: `Bearer ${token} `,
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Creates a new composed email notification order.
     *
     * @param {ComposedEmailRequestExt} request Composed email order request.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    OrderCreateComposedEmail(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/composed-email`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.OrderCreateComposedEmail.action,
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
    OrderClient,
};
