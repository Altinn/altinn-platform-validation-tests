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
     * @returns {typeof TAGS} Default k6 tags.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Get Authorized Parties.
     *
     * @param {AuthorizedPartiesRequest} request Authorized parties request.
     * @param {AuthorizedPartiesQuery|null} queryParams Query parameters.
     * @param {{[key:string]:string}|null} labels Request labels.
     * @returns {http.RefinedResponse<"text">} HTTP response.
     */
    GetAuthorizedParties(request, queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/resourceowner/authorizedparties`
        );

        if (queryParams !== null) {
            for (const [key, value] of Object.entries(queryParams)) {
                // The query takes booleans as well as strings, and they go on the
                // URL as their JSON spelling either way.
                url.searchParams.append(key, String(value));
            }
        }

        const tags = {
            ...labels,
            endpoint: `${this.FULL_PATH}/resourceowner/authorizedparties`,
            name: `${this.FULL_PATH}/resourceowner/authorizedparties`,
            action: TAGS.GetAuthorizedParties.action,
        };

        return http.post(
            url.toString(),
            JSON.stringify(request),
            {
                tags,
                headers: {
                    // An empty token means the caller wants an unauthenticated
                    // request, so send no Authorization header at all rather
                    // than a bare "Bearer ".
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
            }
        );
    }
}

export { AuthorizedPartiesClient };
