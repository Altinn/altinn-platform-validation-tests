import http from "k6/http";

class AccessPackagesApiClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/meta/info/accesspackages";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
    * Get Roles
    * Docs TODO: This link does not work, nothing yet {@link https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Roles}
    * @param {string} label
    * @returns http.RefinedResponse
    */
    Search(searchOptions, label = null) {
        const url = new URL(`${this.FULL_PATH}` + "/search");
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                "Content-type": "application/json",
            },
        };
        for (const key in searchOptions) {
            url.searchParams.append(key, searchOptions[key]);
        }
        return http.get(url.toString(), params);
    }
}

export { AccessPackagesApiClient };
