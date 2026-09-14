import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDelegationExport(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}`, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetDelegationExport.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { DelegationExportClient };
