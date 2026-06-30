import http from "k6/http";

const TAGS = {
    GetAuthorizedParties: { action: "get-authorized-parties" },
    GetFavorites: { action: "get-favorites" },
    GetCurrent: { action: "get-current" },
};

class InfoPortalApiClient {
    /**
     * ApiClient for the infoportal api endpoints
     * @param {string} baseUrl e.g. https://info.at22.altinn.cloud
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

        /** @property {string} BASE_PATH The path to the api without host information
        */
        this.BASE_PATH = "/api/users";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Get authorized parties for the user
     * @param {Object} labels - k6 check tags
     * @returns http.RefinedResponse
    */
    GetAuthorizedParties(labels = null) {

        const url = this.FULL_PATH + "/authorized-parties";
        return this.#getEndpoint(url, {
            action: TAGS.GetAuthorizedParties.action,
            ...labels
        });
    }

    /**
     * Get favorites for the user
     * @param {Object} labels - k6 check tags
     * @returns http.RefinedResponse
    */
    GetFavorites(labels = null) {
        const url = this.FULL_PATH + "/favorites";
        return this.#getEndpoint(url, {
            action: TAGS.GetFavorites.action,
            ...labels
        });
    }

    /**
     * Get current user info
     * @param {Object} labels - k6 check tags
     * @returns http.RefinedResponse
    */
    GetCurrent(labels = null) {
        const url = this.FULL_PATH + "/current";
        return this.#getEndpoint(url, {
            action: TAGS.GetCurrent.action,
            ...labels
        });
    }

    /**
     * Method to do the actuel http call to the api, used by all the public methods in this class
     * @param {url} url
     * @param {*} labels
     * @returns
     */
    #getEndpoint(url, labels) {
        const token = this.tokenGenerator.getToken();
        let tags = { endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Cookie: "AltinnStudioRuntime=" + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

}

export { InfoPortalApiClient };
