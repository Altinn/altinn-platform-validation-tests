import http from "k6/http";

const TAGS = {
    PostDelegations: { action: "PostDelegations" },
    DeleteDelegations: { action: "DeleteDelegations" },
    GetDelegations: { action: "GetDelegations" },
    GetDelegationCheck: { action: "Get delegation check" },
    GetPermission: { action: "GetPermission" },
};

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

    static get TAGS() {
        return TAGS;
    }

    /**
     * Post delegation.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    PostDelegations(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
    DeleteDelegations(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }

    /**
     * Get delegations.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    GetDelegations(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegations`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get delegation check.
     * @param {*} queryParams - object with key value pairs to be added as query parameters to the request
     * @param {*} label - optional label for the request, if not provided the url will be used as label
     * @returns http response object
     */
    GetDelegationCheck(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/delegationcheck`);
        let tags = {
            endpoint: url.toString(),
            action: "Get delegation check"
        };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
    GetPermission(accessPackageId, queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/permission/${accessPackageId}`);
        let tags = {  endpoint: `${this.FULL_PATH}/permission/accessPackageId` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
