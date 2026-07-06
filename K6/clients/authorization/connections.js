import http from "k6/http";

const TAGS = {
    GetConnections: { action: "get-connections" },
    GetAccessPackages: { action: "get-access-packages" },
    PostConnection: { action: "post-connection" },
};

class ConnectionsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator,
        bff = false,
    ) {
        /**
            * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
            */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/connections";
        this.BASE_PATH_BFF = "/accessmanagement/api/v1/connection/rightholders";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        if (bff) {
            this.FULL_PATH = baseUrl + this.BASE_PATH_BFF;
        } else {
            this.FULL_PATH = baseUrl + this.BASE_PATH;
        }
    }

    static get TAGS() {
        return TAGS;
    }

    /**
    * Get connections
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetConnections(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetConnections.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Get access packages
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections_accesspackages}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetAccessPackages(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/accesspackages`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetAccessPackages.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Create a connection (assignment) between two parties.
    * For an organization `to` no body is needed; the assignment is fully described by the query parameters.
    * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Connections/post_enduser_connections}
    * @param {Object} queryParams - required: party, from, to
    * @param {string|null} body - optional request body (e.g. { personidentifier, lastName } when adding a person)
    * @param {Object.<string, string>} labels - request labels for metrics
    * @returns http.RefinedResponse
    */
    PostConnection(queryParams, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.PostConnection.action
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), body === null ? null : JSON.stringify(body), params);
    }

}

export { ConnectionsApiClient };
