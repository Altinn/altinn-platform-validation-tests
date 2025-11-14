import http from "k6/http";

class RolesApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     */
    constructor(
        baseUrl
    ) {
    /**
         *
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
    * Get Roles
    * Docs TODO: This link does not work, nothing yet {@link https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Roles}
    * @param {string} type
    * @param {string} value
    * @param {string} label
    * @returns http.RefinedResponse
    */
    GetRoles(label) {
        const url = new URL(`${this.FULL_PATH}/meta/info/roles`);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
}

export { RolesApiClient };
