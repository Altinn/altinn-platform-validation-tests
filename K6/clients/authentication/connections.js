import http from "k6/http";

class ConnectionsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator,
        bff=false,
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

    /**
    * Get connections
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetConnections(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
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
    GetAccessPackages(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/accesspackages`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Post access packages
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections_accesspackages}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
   PostAccessPackages(queryParams, label = null) {
    const token = this.tokenGenerator.getToken();
    const url = new URL(`${this.FULL_PATH}/accesspackages`);
    const tags = label ? label : url.toString();
    const params = {
        tags: { name: tags },
        headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
        },
    };
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
    return http.post(url.toString(), null, params);
}

}

export { ConnectionsApiClient };
