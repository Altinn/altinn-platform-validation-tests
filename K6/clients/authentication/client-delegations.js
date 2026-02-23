import http from "k6/http";

class ClientDelegationsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at23.altinn.cloud
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
        this.BASE_PATH = "/accessmanagement/api/v1/enduser/clientdelegations";
        this.BASE_PATH_BFF = "/accessmanagement/api/v1/clientdelegations";
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
    * Get agents
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetAgents(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents`);
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
    * Post agents
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostAgents(queryParams, to, lastName, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/agents`);
      const tags = label ? label : url.toString();
      const params = {
          tags: { name: tags },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
          },
      };
      const body = {
          personIdentifier: to,
          lastName: lastName
      };
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
      return http.post(url.toString(), JSON.stringify(body), params);
  }

    /**
      * Delete agents
      * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
      * @param {string} partyId
      * @param {Object} queryParams
      * @param {string|null} label - label for the request
      * @returns http.RefinedResponse
      */
    DeleteAgents(queryParams, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/agents`);
      const tags = label ? label : url.toString();
      const params = {
          tags: { name: tags },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
          },
      };
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
      return http.del(url.toString(), null, params);
  }

  /**
    * Get access packages
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
  GetAccessPackages(queryParams, label = null) {
    const token = this.tokenGenerator.getToken();
    const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
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
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostAccessPackages(queryParams, accessPackage, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
      const tags = label ? label : url.toString();
      const params = {
          tags: { name: tags },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
          },
      };
      const body = {
          "values":[ 
              {
                  "role":"rettighetshaver",
                  "packages": [`urn:altinn:accesspackage:${accessPackage}`]
              }
            ]
          };
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
      return http.post(url.toString(), JSON.stringify(body),  params);
    }

    /**
    * Delete access packages
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    DeleteAccessPackages(queryParams, accessPackage, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
      const tags = label ? label : url.toString();
      const params = {
          tags: { name: tags },
          headers: {
              Authorization: "Bearer " + token,
              "Content-type": "application/json",
          },
      };
      const body = {
          "values":[ 
              {
                  "role":"rettighetshaver",
                  "packages": [`urn:altinn:accesspackage:${accessPackage}`]
              }
            ]
          };
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
      return http.del(url.toString(), JSON.stringify(body),  params);
    }

    /**
    * Get clients
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetClients(queryParams, label = null) {
      const token = this.tokenGenerator.getToken();
      const url = new URL(`${this.FULL_PATH}/clients`);
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

export { ClientDelegationsApiClient };