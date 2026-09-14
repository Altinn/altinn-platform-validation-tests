import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { ChangeReporteeAndRedirectQuery, ChangeReporteeQuery } from "./reportee.types.js";

const TAGS = {
    ChangeReporteeAndRedirect: {
        action: "change-reportee-and-redirect",
    },
    ChangeReportee: {
        action: "change-reportee",
    },
};

/**
 * Client for the reportee endpoints of the Access Management BFF API.
 */
class ReporteeClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/reportee";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Changes the reportee of the authenticated user and redirects onwards.
     *
     * @param {ChangeReporteeAndRedirectQuery|null} [query] Optional query
     * parameters. Prefer using {@link ChangeReporteeAndRedirectQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeReporteeAndRedirect(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/changeandredirect`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/changeandredirect`,
                action: TAGS.ChangeReporteeAndRedirect.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Changes the reportee of the authenticated user.
     *
     * @param {ChangeReporteeQuery|null} [query] Optional query parameters. Prefer
     * using {@link ChangeReporteeQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeReportee(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/change`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/change`,
                action: TAGS.ChangeReportee.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ReporteeClient };
