
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
     * @returns {http.RefinedResponse}
     */
    StatusGetShipment(id, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${id}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Retrieves an array of order status change history.
     *
     * @param {StatusFeedQuery|null} queryParams Optional feed query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    StatusGetFeed(queryParams = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/feed`;

        if (queryParams !== null) {
            const params = [];

            if (queryParams.seq !== null) {
                params.push(`Seq=${queryParams.seq}`);
            }

            if (queryParams.pageSize !== null) {
                params.push(`PageSize=${queryParams.pageSize}`);
            }

            if (queryParams.orderBy !== null) {
                params.push(`OrderBy=${queryParams.orderBy}`);
            }

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }
}

export {
    StatusClient,
};
