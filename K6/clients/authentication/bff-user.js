import http from "k6/http";

const TAGS = {
    GetLookupPartUser: { action: "GetLookupPartUser" },
    GetIsCompanyProfileAdmin: { action: "GetIsCompanyProfileAdmin" },
    GetReportee: { action: "GetReportee" },
    GetProfile: { action: "GetProfile" },
    GetIsAdmin: { action: "GetIsAdmin" },
    GetIsClientAdmin: { action: "GetIsClientAdmin" },
    GetActorListOld: { action: "GetActorListOld" },
    GetActorListFavorites: { action: "GetActorListFavorites" },
    GetIsInstanceAdmin: { action: "GetIsInstanceAdmin" },
};

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


    static get TAGS() {
        return TAGS;
    }

    /**
     * Get lookup party user
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetLookupPartUser(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/lookup/party/user`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
    * Is company profile admin
    * @param {object} queryParams - object with query parameters to be appended to the url
    * @param {string} label - label for the request, if null the url will be used as label
    * @returns http.RefinedResponse
    */
    GetIsCompanyProfileAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isCompanyProfileAdmin`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get reportees for a user
     * @param {string} userId - id of the user to get reportees for
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetReportee(userId, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/reportee/${userId}`);
        let tags = {  endpoint: `${this.FULL_PATH}/user/reportee/userId` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Get profile
     * @param {string} label - label for the request, if null the url will be used as label
     * @returns http.RefinedResponse
     */
    GetProfile(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/profile`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Get is admin
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetIsAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isAdmin`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get is client admin
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    GetIsClientAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isClientAdmin`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get actor list old
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetActorListOld(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/old`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Get actor list favorites
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    GetActorListFavorites(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/favorites`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
     * Get is instance admin
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetIsInstanceAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isInstanceAdmin`);
        let tags =  {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

}

export { BffUserApiClient };
