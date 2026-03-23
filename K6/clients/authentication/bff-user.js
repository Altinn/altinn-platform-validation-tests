import http from "k6/http";

class BffUserApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://am.ui.at23.altinn.cloud
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
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */

        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/lookup/party/user
    /**
     * Get lookup party user
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetLookupPartUser(label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/lookup/party/user`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        console.log(`GetUserIdByLookup url: ${url.toString()}`);
        return http.get(url.toString(), params);
    }

    /**
    * Is company profile admin
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * @returns http.RefinedResponse
    */
    GetIsCompanyProfileAdmin(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isCompanyProfileAdmin`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        console.log(`GetIsCompanyProfileAdmin url: ${url.toString()}`);
        return http.get(url.toString(), params);
    }

    /**
     * Get reportees for a user
     * @param {*} userId - id of the user to get reportees for
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetReportee(userId, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/reportee/${userId}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        console.log(`GetReportee url: ${url.toString()}`);
        return http.get(url.toString(), params);
    }

    /**
     * Get profile
     * @param {*} label - label for the request, if null the url will be used as label
     * @returns http.RefinedResponse 
     */
    GetProfile(label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/profile`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
    /**
     * Get is admin
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse 
     */
    GetIsAdmin(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isAdmin`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isClientAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
    /**
     * Get is client admin
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    GetIsClientAdmin(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isClientAdmin`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/sent?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/request/received?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&status=Pending (404)
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/old
    /**
     * Get actor list old
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetActorListOld(label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/old`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        console.log(`GetActorListOld url: ${url.toString()}`);
        return http.get(url.toString(), params);
    }
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/actorlist/favorites
    /**
     * Get actor list favorites
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    GetActorListFavorites(label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/favorites`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/cdn/orgdata
    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/user/isInstanceAdmin?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0
    /**
     * Get is instance admin
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetIsInstanceAdmin(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isInstanceAdmin`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

}

export { BffUserApiClient };
