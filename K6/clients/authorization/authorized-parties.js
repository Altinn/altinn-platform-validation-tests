import http from "k6/http";

import {
    AuthorizedPartiesQuery,
    AuthorizedPartiesRequest,
} from "./authorized-parties.types.js";

const TAGS = {
    GetAuthorizedParties: { action: "get-authorized-parties" },
};

class AuthorizedPartiesClient {
    /**
     * Creates a client for the Authorized Parties API.
     *
     * @param {string} baseUrl API base URL, for example https://platform.at22.altinn.cloud.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Default request tags used by the client.
     *
     * @returns {object} Default k6 tags.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Get Authorized Parties.
     *
     * @param {AuthorizedPartiesRequest} request Authorized parties request.
     * @param {AuthorizedPartiesQuery} queryParams Query parameters.
     * @param {{[key:string]:string}|null} labels Request labels.
     * @returns {http.RefinedResponse} HTTP response.
     */
    GetAuthorizedParties(request, queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/resourceowner/authorizedparties`
        );

        for (const key in queryParams) {
            url.searchParams.append(key, queryParams[key]);
        }

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetAuthorizedParties.action,
        };

        return http.post(
            url.toString(),
            JSON.stringify(request),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-type": "application/json",
                },
            }
        );
    }
}

export { AuthorizedPartiesClient };
