import http from "k6/http";

import { GetDelegationExportQuery } from "./delegation-export.types.js";

const TAGS = {
    GetDelegationExport: {
        action: "get-delegation-export",
    },
};

/**
 * Client for the delegation export endpoint of the Access Management BFF API.
 */
class DelegationExportClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/delegationexport";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Exports the delegations of a party as a spreadsheet.
     *
     * @param {GetDelegationExportQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetDelegationExportQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDelegationExport(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}`,
            name: `${this.FULL_PATH}`,
            action: TAGS.GetDelegationExport.action,
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
}

export { DelegationExportClient };
