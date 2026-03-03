import http from "k6/http";

class BffConnectionsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://am.ui.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator,
    ) {
        /**
            * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
            */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1/connection/rightholders";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
    * Get connections
    * Docs 
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
}

export { BffConnectionsApiClient };
