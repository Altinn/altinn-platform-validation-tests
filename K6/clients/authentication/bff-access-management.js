import http from "k6/http";

const TAGS = {
    GetIsHovedAdmin: { action: "Get IsHovedAdmin" },
    GetRolePermissions: { action: "Get RolePermissions" },
    GetDelegatedResources: { action: "Get DelegatedResources" },
    GetDelegatedRightsForResource: { action: "Get DelegatedRightsForResource" },
    SearchAccessPackages: { action: "SearchAccessPackages" },
    SearchResources: { action: "SearchResources" },
    GetResourceOwners: { action: "Get ResourceOwners" },
    GetOrganizationData: { action: "Get OrganizationData" },
    GetOrganizationDataFromLookup: { action: "Get OrganizationDataFromLookup" },
    GetRoleMeta: { action: "Get RoleMeta" },
    GetRightsMeta: { action: "Get RightsMeta" },
    GetDelegatedInstancesForResource: { action: "Get DelegatedInstancesForResource" },
    CheckDelegationForResource: { action: "CheckDelegationForResource" },
    DelegateRightsForResource: { action: "DelegateRightsForResource" },
    CheckInstanceDelegationForResource: { action: "CheckInstanceDelegationForResource" },
    GetActiveConsentsForUser: { action: "Get ActiveConsentsForUser" },
    GetConsentLogForUser: { action: "Get ConsentLogForUser" },
    GetResourceById: { action: "Get ResourceById" },
    GetPendingDelegationsForUser: { action: "Get PendingDelegationsForUser" },
};


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

    static get TAGS() {
        return TAGS;
    }
    /**
    * Get is hoved admin
    * @param {*} queryParams - object with query parameters to be appended to the url
    * @param {*} labels - labels for the request, if null the url will be used as label
    * @returns http.RefinedResponse
    */
    GetIsHovedAdmin(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/user/ishovedadmin`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     */
    GetRolePermissions(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/role/permissions`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedResources(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/delegation/resources`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedRightsForResource(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/delegation/resources/rights`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
    * @param {*} labels - labels for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    SearchAccessPackages(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/accesspackage/search`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    SearchResources(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources/search`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetResourceOwners(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources/resourceowners`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
    * @param {*} labels - labels for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetOrganizationData(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/cdn/orgdata`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
    * @param {*} labels - labels for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetOrganizationDataFromLookup(orgNo, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/lookup/org/${orgNo}`);
        let tags = {  endpoint: `${this.FULL_PATH}/lookup/org/orgNo` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     *
    */
    GetRoleMeta(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/role/meta`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
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
     * @param {*} labels - labels for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetRightsMeta(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/singleright/rightsmeta`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Get delegated instances for a resource
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    GetDelegatedInstancesForResource(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegation/instances`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Check if user has delegated rights for a resource
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    CheckDelegationForResource(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegationcheck`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
     * Delegate rights for a resource to a user
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} body - object with the body of the request
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     */
    DelegateRightsForResource(queryParams, body, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegation/instances/rights`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }


    /**
     * Check if user has delegated rights for a resource
     * @param {object} queryParams - object with query parameters to be appended to the url
     * @param {string} label - label for the request, if null the url will be used as label
     * returns http.RefinedResponse
     * */
    CheckInstanceDelegationForResource(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/instances/delegationcheck`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Get active consents for a user
    * @param {object} uuid - uuid for the user to get active consents for
    * @param {string} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetActiveConsentsForUser(uuid, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/consent/active/${uuid}`);
        let tags = {  endpoint: `${this.FULL_PATH}/consent/active/uuid` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }

    /**
    * Get consent log for a user
    * @param {object} uuid - uuid for the user to get consent log for
    * @param {string} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetConsentLogForUser(uuid, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/consent/log/${uuid}`);
        let tags = {  endpoint: `${this.FULL_PATH}/consent/log/uuid` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }


    /**
    * Get resource by id
    * @param {object} queryParams - object with query parameters to be appended to the url
    * @param {string} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetResourceById(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/resources`);
        let tags = {  endpoint: url.toString() };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Get pending delegations for a user
    * @param {object} queryParams - object with query parameters to be appended to the url
    * @param {string} label - label for the request, if null the url will be used as label
    * returns http.RefinedResponse
    */
    GetPendingDelegationsForUser(uuid, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/systemuser/${uuid}/pending`);
        let tags = {  endpoint: `${this.FULL_PATH}/systemuser/uuid/pending` };
        if (labels != null) {
            tags = { ...labels, ...tags };
        }
        const params = {
            tags: tags,
            headers: {
                Authorization: "Bearer " + token,
            },
        };
        return http.get(url.toString(), params);
    }
}

export { BffAccessManagementApiClient };
