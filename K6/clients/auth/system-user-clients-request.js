import http from "k6/http";
import { URL } from "../../common-imports.js";

class SystemUserClientsRequestApiClient {
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
        this.BASE_PATH = "/authentication/api/v1/enduser/systemuser/clients";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
    * Creates a new Request based on a systemUserId.
    * OpenAPI for {@link https://docs.altinn.studio/api/authentication/spec/#/RequestSystemUser/post_systemuser_request_vendor}
    * @param {string } systemId
    * @returns http.RefinedResponse
    */
    SystemUserClientsRequest(
        systemId,
    ) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(this.FULL_PATH);
        url.searchParams.append("agent", systemId);
        const params = {
            tags: { name: `${this.FULL_PATH}` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
  }

    

export { SystemUserClientsRequestApiClient };
