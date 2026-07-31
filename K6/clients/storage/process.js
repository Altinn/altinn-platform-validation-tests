import http from "k6/http";

const TAGS = {
    UpdateProcessState: {
        action: "update-process-state",
    },
    GetProcessHistory: {
        action: "get-process-history",
    },
    UpdateProcessStateAndEvents: {
        action: "update-process-state-and-events",
    },
};

class ProcessClient {
    /**
     * Creates a client for the Process API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/storage/api/v1";

        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + this.BASE_PATH;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Replaces the process state of an instance.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/process
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {ProcessState} request Process state to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateProcessState(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/process`;

        const tags = {
            ...labels,
            endpoint: url,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/process`,
            action: TAGS.UpdateProcessState.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Gets the process history of an instance.
     *
     * GET /instances/{instanceOwnerPartyId}/{instanceGuid}/process/history
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetProcessHistory(instanceOwnerPartyId, instanceGuid, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/history`;

        const tags = {
            ...labels,
            endpoint: url,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/history`,
            action: TAGS.GetProcessHistory.action,
        };

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Replaces the process state of an instance and adds the given events.
     *
     * PUT /instances/{instanceOwnerPartyId}/{instanceGuid}/process/instanceandevents
     *
     * @param {number} instanceOwnerPartyId Instance owner party id.
     * @param {string} instanceGuid Instance UUID.
     * @param {ProcessStateUpdate} request Process state and events to store.
     * @param {{[key:string]:string}} [labels] Optional k6 request labels.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UpdateProcessStateAndEvents(instanceOwnerPartyId, instanceGuid, request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/instances/${instanceOwnerPartyId}/${instanceGuid}/process/instanceandevents`;

        const tags = {
            ...labels,
            endpoint: url,
            name: `${this.FULL_PATH}/instances/{instanceOwnerPartyId}/{instanceGuid}/process/instanceandevents`,
            action: TAGS.UpdateProcessStateAndEvents.action,
        };

        return http.put(url, JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }
}

export { ProcessClient };
