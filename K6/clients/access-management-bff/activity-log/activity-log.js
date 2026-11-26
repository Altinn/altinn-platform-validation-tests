import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { GetActivityLogFilterValuesQuery, GetActivityLogQuery } from "./activity-log.types.js";

const TAGS = {
    GetActivityLog: {
        action: "get-activity-log",
    },
    GetActivityLogFilterValues: {
        action: "get-activity-log-filter-values",
    },
};

/**
 * Client for the activity log endpoints of the Access Management BFF API.
 */
class ActivityLogClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
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
        this.BASE_PATH = "/accessmanagement/api/v1/activitylog";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the activity log of a party in an area.
     *
     * @param {string} area The area to get the activity log for.
     * @param {GetActivityLogQuery} query Query parameters. Prefer using
     * {@link GetActivityLogQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLog(area, query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${area}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{area}`,
                action: TAGS.GetActivityLog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the values a field of the activity log can be filtered on.
     *
     * @param {string} area The area to get the filter values for.
     * @param {string} field The field to get the filter values for.
     * @param {GetActivityLogFilterValuesQuery} query Query parameters. Prefer
     * using {@link GetActivityLogFilterValuesQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLogFilterValues(area, field, query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${area}/filter/${field}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{area}/filter/{field}`,
                action: TAGS.GetActivityLogFilterValues.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ActivityLogClient };
