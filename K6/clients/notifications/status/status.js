
import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { StatusFeedQuery } from "../types.js";

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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    StatusGetShipment(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.StatusGetShipment.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves an array of order status change history.
     *
     * @param {StatusFeedQuery|null} queryParams Optional feed query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    StatusGetFeed(queryParams = null, labels = null) {
        const query = queryParams !== null
            ? { Seq: queryParams.seq, PageSize: queryParams.pageSize, OrderBy: queryParams.orderBy }
            : null;

        return http.get(
            buildUrl(`${this.FULL_PATH}/feed`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/feed`,
                action: TAGS.StatusGetFeed.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export {
    StatusClient,
};
