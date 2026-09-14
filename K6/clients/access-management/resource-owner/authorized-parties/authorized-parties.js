import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
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
        return http.post(
            buildUrl(`${this.FULL_PATH}/resourceowner/authorizedparties`, queryParams),
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/resourceowner/authorizedparties`,
                action: TAGS.GetAuthorizedParties.action,
                labels,
                // An empty token means the caller wants an unauthenticated
                // request, so send no Authorization header at all rather
                // than a bare "Bearer ".
                token: this.tokenGenerator.getToken() || null,
                json: true,
            }),
        );
    }
}

export { AuthorizedPartiesClient };
