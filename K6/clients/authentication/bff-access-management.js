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

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    /**
     * Get delegated instances for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedInstancesForResource(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegation/instances`);
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

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegationcheck?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    /**
     * Check if user has delegated rights for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    CheckDelegationForResource(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegationcheck`);
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
    // POST: https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances/rights?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    // {"to":{"personIdentifier":"27820698741","lastName":"lørdag"},"directRightKeys":["018e9eb719996e0a45054bf68a3fa14aebcfad4ec944194b08149a1d9eb5b5ec7f","010c7c883aa8fa5ce7824aa263a4c01be0bac14104e7eb3c4e72b8dca45d54b188","01c93af1e19e132972aa7b87cbf04a19fd9d66cd5e6ff10b61079fd3665396a536","01a7d7336a2b8929d61e352c05d2efb015309b231a6001952d2099c7e0ae775031"]}
    /**
     * Delegate rights for a resource to a user
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} body - object with the body of the request
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    DelegateRightsForResource(queryParams, body, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegation/instances/rights`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegation/instances?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&from=5f453a8c-86e2-4bef-bbd9-6235edf414f0&to=&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    /**
     * Get delegated instances for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedInstancesForResource(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegation/instances`);
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

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/instances/delegationcheck?party=5f453a8c-86e2-4bef-bbd9-6235edf414f0&resource=k6-instancedelegation-test&instance=urn%3Aaltinn%3Adialog-id%3A019d19ee-3e8e-7713-896e-e2fac1f8b77b
    /**
     * Check if user has delegated rights for a resource
     * @param {*} queryParams - object with query parameters to be appended to the url
     * @param {*} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    CheckInstanceDelegationForResource(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegationcheck`);
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

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/consent/active/5f453a8c-86e2-4bef-bbd9-6235edf414f0
    /**
    * Get active consents for a user
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetActiveConsentsForUser(uuid, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/consent/active/${uuid}`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags },
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    // https://am.ui.at23.altinn.cloud/accessmanagement/api/v1/resources?resourceId=k6-instancedelegation-test
    /**
    * Get resource by id
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetResourceById(queryParams, label = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources`);
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
