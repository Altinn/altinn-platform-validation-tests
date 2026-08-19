
import http from "k6/http";

const TAGS = {
    StatusGetShipment: {
        action: "status-get-shipment",
    },
    StatusGetFeed: {
        action: "status-get-feed",
    },
};

class StatusClient {
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
        this.BASE_PATH = "/notifications/api/v1/future/shipment";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves the delivery manifest for a specific notification order.
     *
     * @param {string} id Notification order identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    StatusGetShipment(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{id}`,
            name: `${this.FULL_PATH}/{id}`,
            action: TAGS.StatusGetShipment.action,
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
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Retrieves an array of order status change history.
     *
     * @param {StatusFeedQuery|null} queryParams Optional feed query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    StatusGetFeed(queryParams = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/feed`;

        if (queryParams !== null) {
            const params = [];

            const queryKeys = {
                Seq: queryParams.seq,
                PageSize: queryParams.pageSize,
                OrderBy: queryParams.orderBy,
            };

            for (const [key, value] of Object.entries(queryKeys)) {
                if (value === undefined || value === null) {
                    continue;
                }

                params.push(`${key}=${encodeURIComponent(value)}`);
            }

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/feed`,
            name: `${this.FULL_PATH}/feed`,
            action: TAGS.StatusGetFeed.action,
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
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }
}

export {
    StatusClient,
};
