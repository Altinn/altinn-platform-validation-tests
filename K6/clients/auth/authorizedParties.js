import http from "k6/http";

class AuthorizedPartiesClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
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
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
    * Get Authorized Parties
    * Docs {@link https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Authorized%20Parties}
    * @param {string} type
    * @param {string} value
    * @param {string} label
    * @returns http.RefinedResponse
    */
    GetAuthorizedParties(type, value, includeAltinn2, includeAccessPackages, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resourceowner/authorizedparties`);
        let nameTag = label ? label : url.toString();
        const params = {
            tags: { name: nameTag },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        if (includeAltinn2) {
            url.searchParams.append("includeAltinn2", "true");
        }
        if (includeAccessPackages) {
            url.searchParams.append("includeAccessPackages", "true");
            url.searchParams.append("includePartiesViaKeyRoles", "false");
        }

        const body = {
            "type": type,
            "value": value
        };
        console.log(url.toString());
        return http.post(url.toString(), JSON.stringify(body), params);
    }
}

export { AuthorizedPartiesClient };
