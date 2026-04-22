import http from "k6/http";

const TAGS = {
    GetAgents: { action: "Get agents" },
    PostAgents: { action: "Post Agents" },
    DeleteAgents: { action: "Delete Agents" },
    GetAgentsAccessPackages: { action: "Get AgentsAccessPackages" },
    PostAgentsAccessPackages: { action: "Post AgentsAccessPackages" },
    DeleteAgentsAccessPackages: { action: "Delete AgentsAccessPackages" },
    GetClients: { action: "Get clients" },
};

class BffClientDelegationsApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://am.ui.at22.altinn.cloud
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
        this.BASE_PATH = "/accessmanagement/api/v1/clientdelegations";
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
    * Get agents
    * Docs: TODO: add docs link
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetAgents(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents`);
        let tags = {
            endpoint: url.toString(),
            action: "Get agents"
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
    * Post agents
    * Docs: TODO: add docs link
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostAgents(queryParams, to, lastName, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = {
            personIdentifier: to,
            lastName: lastName
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    /**
      * Delete agents
      * Docs: TODO: add docs link
      * @param {string} partyId
      * @param {Object} queryParams
      * @param {string|null} label - label for the request
      * @returns http.RefinedResponse
      */
    DeleteAgents(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), null, params);
    }

    /**
      * Get access packages
      * Docs: TODO: add docs link
      * @param {Object} queryParams
      * @param {string|null} label - label for the request
      * @returns http.RefinedResponse
      */
    GetAgentsAccessPackages(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.get(url.toString(), params);
    }

    /**
    * Post access packages
    * Docs Docs: TODO: add docs link
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    PostAgentsAccessPackages(queryParams, accessPackage, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = {
            "values": [
                {
                    "role": "rettighetshaver",
                    "packages": [`urn:altinn:accesspackage:${accessPackage}`]
                }
            ]
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.post(url.toString(), JSON.stringify(body), params);
    }

    /**
    * Delete access packages
    * Docs: TODO: add docs link
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    DeleteAgentsAccessPackages(queryParams, accessPackage, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/agents/accesspackages`);
        const tags = label ? label : url.toString();
        const params = {
            tags: { name: tags, endpoint: url.toString() },
            headers: {
                Authorization: "Bearer " + token,
                "Content-type": "application/json",
            },
        };
        const body = {
            "values": [
                {
                    "role": "rettighetshaver",
                    "packages": [`urn:altinn:accesspackage:${accessPackage}`]
                }
            ]
        };
        Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
        return http.del(url.toString(), JSON.stringify(body), params);
    }

    /**
    * Get clients
    * Docs: TODO: add docs link
    * @param {string} partyId
    * @param {Object} queryParams
    * @param {string|null} label - label for the request
    * @returns http.RefinedResponse
    */
    GetClients(queryParams, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = new URL(`${this.FULL_PATH}/clients`);
        let tags = {
            endpoint: url.toString(),
            action: "Get clients"
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

}

export { BffClientDelegationsApiClient };
