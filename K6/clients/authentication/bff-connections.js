import http from "k6/http";

class BffConnectionsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/connection/reportee/83eab202-c2ff-4bf0-bbea-25cbbed5efe7/rightholder?rightholderPartyUuid=undefined
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
        this.BASE_PATH = "/accessmanagement/api/v1/connection/";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
    * Post rightholder for an user
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {string} from
    * @param {Object} to - person identifier for the rightholder
    * @param {string} lastName - last name of the rightholder, needed for creating a rightholder connection
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostRightholder(from, to, lastName, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/reportee/${from}/rightholder?rightholderPartyUuid=undefined`);
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
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    /**
    * Post rightholder for an organization
    * Docs {@link https://app.swaggerhub.com/apis/jon.kjetil.oye/accessmanagement-api-enduser/1.0.0#/Connections/get_accessmanagement_api_v1_enduser_connections}
    * @param {Object} from - party uuid for the reportee organization
    * @param {Object} to - organization number for the rightholder organization
    * @param {string} lastName - last name of the rightholder, needed for creating a rightholder connection
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostRightholderOrg(from, to, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/reportee/${from}/rightholder?rightholderPartyUuid=${to}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url.toString(), null, params);
    }
}

export { BffConnectionsApiClient };
