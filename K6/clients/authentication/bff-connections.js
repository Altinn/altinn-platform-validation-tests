import http from "k6/http";

const TAGS = {
    GetConnections: {
        action: "Get connections/rightholders"
    },
};

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
        this.BASE_PATH = "/accessmanagement/api/v1/connection";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }



    static get TAGS() {
        return TAGS;
    }

    /**
    * Get connections
    * Docs
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetConnections(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/rightholders`);
        let tags = {
            endpoint: url.toString(),
            action: "Get connections/rightholders"
        };
        if (labels != null) {
            tags = { ...labels, ...tags }
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
    * Post rightholder for an user
    * @param {string} from
    * @param {Object} to - person identifier for the rightholder
    * @param {string} lastName - last name of the rightholder, needed for creating a rightholder connection
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostRightholder(from, to, lastName, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/reportee/${from}/rightholder?rightholderPartyUuid=undefined`); // TODO: Is this correct?
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: `${this.FULL_PATH}/reportee/from/rightholder` },
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
            tags: { name: tags, endpoint: `${this.FULL_PATH}/reportee/from/rightholder?rightholderPartyUuid=to` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.post(url.toString(), null, params);
    }

    /**
     * Delete rightholder connection for a reportee
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    DeleteRightholder(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/reportee`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }
}

export { BffConnectionsApiClient };
