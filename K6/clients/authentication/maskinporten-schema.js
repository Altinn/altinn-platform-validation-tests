import http from "k6/http";

class MaskinportenSchemaApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at23.altinn.cloud
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
        this.BASE_PATH = "/accessmanagement/api/v1/";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Post an offered delegation in Maskinporten Schema API. This will create a delegation from the "from" parameter to the "to" parameter with the specified resource and label.
     * @param {} from - The identifier of the delegating party (e.g., an organization number)
     * @param {*} to - The identifier of the receiving party (e.g., a person identifier or organization number)
     * @param {*} resource - The identifier of the resource for which the delegation is being offered
     * @param {*} label - An optional label for the delegation, used for tagging and logging purposes. If not provided, the URL of the API call will be used as the label.
     * @returns A k6 HTTP response object from the POST request to the Maskinporten Schema API
     */
    PostOffered(from, to, resource, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/${from}/maskinportenschema/offered`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: `${this.FULL_PATH}/from/maskinportenschema/offered` },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };

        const body = {
            "to": [
                {
                    "id": "urn:altinn:organizationnumber",
                    "value": to
                }
            ],
            "rights": [
                {
                    "resource": [
                        {
                            "id": "urn:altinn:resource",
                            "value": resource
                        }
                    ]
                }
            ]
        };
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    /**
     * Get delegations in Maskinporten Schema API. This will retrieve delegations based on the provided query parameters.
     * @param {*} queryParams - An object containing key-value pairs to be used as query parameters in the API call (e.g., { from: "123456789", to: "987654321" })
     * @param {*} label - An optional label for the delegation, used for tagging and logging purposes. If not provided, the URL of the API call will be used as the label.
     * @return A k6 HTTP response object from the GET request to the Maskinporten Schema API
     */
    GetDelegations(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}maskinporten/delegations`);
        Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        return http.get(url.toString(), params);
    }
}

export { MaskinportenSchemaApiClient };
