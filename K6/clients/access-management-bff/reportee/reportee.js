import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeReporteeAndRedirect(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/changeandredirect`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/changeandredirect`,
            name: `${this.FULL_PATH}/changeandredirect`,
            action: TAGS.ChangeReporteeAndRedirect.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Changes the reportee of the authenticated user.
     *
     * @param {ChangeReporteeQuery|null} [query] Optional query parameters. Prefer
     * using {@link ChangeReporteeQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeReportee(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/change`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/change`,
            name: `${this.FULL_PATH}/change`,
            action: TAGS.ChangeReportee.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }
}

export { ReporteeClient };
