import http from "k6/http";

const TAGS = {
    GetAuthorizedParties: { action: "get-authorized-parties" },
    GetFavorites: { action: "get-favorites" },
    GetCurrent: { action: "get-current" },
};

class InfoPortalApiClient {
    /**
     * ApiClient for the infoportal api endpoints
     *
     * @param {string} baseUrl e.g. https://info.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
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
     *
     * @param {{[key: string]: string}} labels - k6 check tags
     * @returns http.RefinedResponse<"text">
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
     *
     * @param {{[key: string]: string}} labels - k6 check tags
     * @returns http.RefinedResponse<"text">
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
     *
     * @param {{[key: string]: string}} labels - k6 check tags
     * @returns http.RefinedResponse<"text">
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
     *
     * @param {url} url TODO: Description
     * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
     * @returns TODO: description
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
