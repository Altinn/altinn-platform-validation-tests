import http from "k6/http";

class SystemUserApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/authentication/api/v1/systemuser";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/authentication/api/v1/systemuser";
    }

    /**
     * Retrieves system users for a given systemId for a vendor.
     * OpenAPI for {@link https://docs.altinn.studio/nb/api/authentication/spec/#/}
     * @param {string} systemId
     * @returns http.RefinedResponse
     */
    GetSystemUsersBySystemIdForVendor(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/bysystem/${systemId}`;
        const params = {
            tags: { name: `${this.FULL_PATH}/vendor/bysystem/systemId` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }

    /**
     * Follows pagination using a fully qualified URL from links.next.
     * @param {string} url Fully qualified URL from the API response (links.next)
     * @returns http.RefinedResponse
     */
    GetSystemUsersByNextUrl(url) {
        const token = this.tokenGenerator.getToken();
        const params = {
            tags: { name: `${this.FULL_PATH}/by-url` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }
}

export { SystemUserApiClient };

