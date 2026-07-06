import http from "k6/http";

const TAGS = {
    GetSystemUsersBySystemIdForVendor: { action: "get-system-users-by-system-id-for-vendor" },
};
class SystemUserApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator TODO: description
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

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves system users for a given systemId for a vendor.
     * OpenAPI for {@link https://docs.altinn.studio/nb/api/authentication/spec/#/SystemUser/vendor}
     *
     * @param {string} systemId TODO: description
     * @returns http.RefinedResponse
     */
    GetSystemUsersBySystemIdForVendor(systemId) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/vendor/bysystem/${systemId}`;
        const params = {
            tags: {
                endpoint: `${this.FULL_PATH}/vendor/bysystem/systemId`,
                name: `${this.FULL_PATH}/vendor/bysystem/systemId`,
                action: TAGS.GetSystemUsersBySystemIdForVendor.action
            },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url, params);
    }
}

export { SystemUserApiClient };
