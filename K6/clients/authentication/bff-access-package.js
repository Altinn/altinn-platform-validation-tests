import http from "k6/http";

class BffAccessPackageApiClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/accesspackage";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    /**
     * Post delegation.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request 
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    PostDelegations(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), null, params);
    }

    /**
     * Delete delegations.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    DeleteDelegations(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }

    /**
     * Get delegation check.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    GetDelegationCheck(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegationcheck`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get permission for access package.
     * @param {string} accessPackageId - id of the access package to get permissions for
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    GetPermission(accessPackageId, queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/permission/${accessPackageId}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }
}

export { BffAccessPackageApiClient };
