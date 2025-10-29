import http from 'k6/http';

class ConnectionsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator
    ) {
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
    * Get connections
    * Docs {@link TODO: Add documentation link here when we have one}
    * @param {string} partyId
    * @param {string} direction - 'from' or 'to'
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetConnections(queryParams, label = null, accesspackages = "") {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/enduser/connections${accesspackages}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-type': 'application/json',
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        console.log(`GetConnections URL: ${url.toString()}`);
        return http.get(url.toString(), params); 
    }
  

  GetAccessPackages(queryParams, label = null) {
    return this.GetConnections(queryParams, label, "/accesspackages");
  }
}

export { ConnectionsApiClient };
