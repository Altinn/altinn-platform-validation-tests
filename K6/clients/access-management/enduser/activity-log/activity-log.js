import http from "k6/http";

import { buildUrl, requestParams } from "../../../common/request.js";
import { ActivityLogArea, ActivityLogFilterField, ActivityLogFilterValuesQuery, ActivityLogQuery } from "./activity-log.types.js";

const TAGS = {
    GetActivityLog: {
        action: "get-activity-log",
    },
    GetActivityLogFilterValues: {
        action: "get-activity-log-filter-values",
    },
    GetActivityLogFilterFields: {
        action: "get-activity-log-filter-fields",
    },
    GetActivityLogTypes: {
        action: "get-activity-log-types",
    },
};

/**
 * Client for the activity log of one area of the enduser API:
 * `/enduser/connections/activitylog`, `/enduser/request/activitylog` or
 * `/enduser/maskinporten/activitylog`. The three share their operations, so
 * one client is created per area.
 */
class ActivityLogClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator Generates bearer tokens.
     * @param {ActivityLogArea} area The area whose activity log to read.
     */
    constructor(baseUrl, tokenGenerator, area) {
        this.tokenGenerator = tokenGenerator;
        this.area = area;

        this.BASE_PATH = `/accessmanagement/api/v2/enduser/${area}/activitylog`;

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a page of the activity log of a party.
     *
     * @param {ActivityLogQuery} query
     * Query parameters. Prefer using {@link ActivityLogQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLog(query, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetActivityLog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the values a field of the activity log can be filtered on, e.g.
     * the parties that appear in the `To` column.
     *
     * @param {ActivityLogFilterField} field The field to list values for.
     * @param {ActivityLogFilterValuesQuery} query
     * Query parameters. Prefer using {@link ActivityLogQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLogFilterValues(field, query, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/filter/${field}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/filter/{field}`,
                action: TAGS.GetActivityLogFilterValues.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the fields the activity log can be filtered on. Needs no token.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLogFilterFields(labels = null) {
        return http.get(
            `${this.FULL_PATH}/filter/fields`,
            requestParams({
                endpoint: `${this.FULL_PATH}/filter/fields`,
                action: TAGS.GetActivityLogFilterFields.action,
                labels,
            }),
        );
    }

    /**
     * Gets the activity types the activity log can hold. Needs no token.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActivityLogTypes(labels = null) {
        return http.get(
            `${this.FULL_PATH}/types`,
            requestParams({
                endpoint: `${this.FULL_PATH}/types`,
                action: TAGS.GetActivityLogTypes.action,
                labels,
            }),
        );
    }
}

export { ActivityLogClient };
