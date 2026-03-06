import http from "k6/http";

class BffAccessManagementApiClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */

        this.FULL_PATH = baseUrl + this.BASE_PATH;

    }

    /**
    * Get is hoved admin
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * @returns http.RefinedResponse
    */
    GetIsHovedAdmin(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/ishovedadmin`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get permissions for a user
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     */
    GetRolePermissions(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/role/permissions`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get delegated resources for a user
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedResources(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/delegation/resources`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get delegated rights for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedRightsForResource(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/delegation/resources/rights`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Search for access packages
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    SearchAccessPackages(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/accesspackage/search`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Search for resources
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    SearchResources(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources/search`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get resource owners
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetResourceOwners(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources/resourceowners`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Get organization data from cdn
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetOrganizationData(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/cdn/orgdata`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Get organization data from lookup
    * @param {*} orgNo - organization number to get data for
    * @param {*} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetOrganizationDataFromLookup(orgNo, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/lookup/org/${orgNo}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        console.log(`Get organization data from lookup url: ${url.toString()}`);
        return http.get(url.toString(), params);
    }

    /**
     * Delete rightholder connection for a reportee
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    DeleteRightholderConnection(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/connection/reportee`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }

    /** 
     * Get role metadata
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * 
    */
    GetRoleMeta(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/role/meta`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get rights metadata for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetRightsMeta(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/rightsmeta`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }
}

export { BffAccessManagementApiClient };
