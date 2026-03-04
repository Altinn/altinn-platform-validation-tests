import http from "k6/http";

class BffSingleRightApiClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/singleright";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */

        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
     * Post single right delegation
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} resource - the resource for which the right is delegated, e.g. "ttd/altinn-app-frontend/tilgangstest/resource1"
     * @param {*} label - label for the request, if null the url will be used as label
     * @returns http.RefinedResponse
     */

    PostDelegate(queryParams, resource, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegate`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = this.#getBody(resource);
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    /**
     * Method to generate the body for the PostDelegate request based on the resource. 
     * The body is hardcoded to include the actions "read", "write" and "access" for the given resource, modify or extend as needed for different test scenarios.
     * @param {*} resource - the resource for which the right is delegated, e.g. "ttd/altinn-app-frontend/tilgangstest/resource1"
     * @returns - request body for the PostDelegate request
     */
    #getBody(resource) {
        return [
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:read`,
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:write`,
            `urn:altinn:resource:${resource}:urn:oasis:names:tc:xacml:1.0:action:action-id:access`,
        ]
    }
}

export { BffSingleRightApiClient };