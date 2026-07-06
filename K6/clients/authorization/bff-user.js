import http from "k6/http";

const TAGS = {
    GetLookupPartUser: { action: "get-lookup-part-user" },
    GetIsCompanyProfileAdmin: { action: "get-is-company-profile-admin" },
    GetReportee: { action: "get-reportee" },
    GetProfile: { action: "get-profile" },
    GetIsAdmin: { action: "get-is-admin" },
    GetIsClientAdmin: { action: "get-is-client-admin" },
    GetActorListOld: { action: "get-actor-list-old" },
    GetActorListFavorites: { action: "get-actor-list-favorites" },
    GetIsInstanceAdmin: { action: "get-is-instance-admin" },
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
     *
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     */
    GetLookupPartUser(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/lookup/party/user`);
        let tags = {
            endpoint: url.toString(),
            action: TAGS.GetLookupPartUser.action
        };
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
     *
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @returns http.RefinedResponse
     */
    GetIsCompanyProfileAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isCompanyProfileAdmin`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetIsCompanyProfileAdmin.action
        };
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
     *
     * @param {string} userId - id of the user to get reportees for
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     */
    GetReportee(userId, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/reportee/${userId}`);
        let tags = {
            endpoint: `${this.FULL_PATH}/user/reportee/userId`,
            name: `${this.FULL_PATH}/user/reportee/userId`,
            action: TAGS.GetReportee.action
        };
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
     *
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * @returns http.RefinedResponse
     */
    GetProfile(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/profile`);
        let tags = {
            endpoint: url.toString(),
            action: TAGS.GetProfile.action
        };
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
     *
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     */
    GetIsAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isAdmin`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetIsAdmin.action
        };
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
     *
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     * */
    GetIsClientAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isClientAdmin`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetIsClientAdmin.action
        };
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
     *
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     */
    GetActorListOld(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/old`);
        let tags = {
            endpoint: url.toString(),
            action: TAGS.GetActorListOld.action
        };
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
     *
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     * */
    GetActorListFavorites(labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/actorlist/favorites`);
        let tags = {
            endpoint: url.toString(),
            action: TAGS.GetActorListFavorites.action
        };
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
     *
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {Object.<string, string>} labels - Object containing request labels as key/value pairs
     * returns http.RefinedResponse
     */
    GetIsInstanceAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/isInstanceAdmin`);
        let tags = {
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetIsInstanceAdmin.action
        };
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
