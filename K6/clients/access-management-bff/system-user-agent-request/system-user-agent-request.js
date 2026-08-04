import http from "k6/http";

const TAGS = {
    GetAgentRequest: {
        action: "get-agent-request",
    },
    ApproveAgentRequest: {
        action: "approve-agent-request",
    },
    RejectAgentRequest: {
        action: "reject-agent-request",
    },
    EscalateAgentRequest: {
        action: "escalate-agent-request",
    },
    GetAgentRequestLogout: {
        action: "get-agent-request-logout",
    },
};

/**
 * Client for the agent system user request endpoints of the Access Management
 * BFF API.
 */
class SystemUserAgentRequestClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/agentrequest";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets an agent system user request.
     *
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgentRequest(agentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${agentRequestId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${agentRequestId}`,
            name: `${this.FULL_PATH}/{agentRequestId}`,
            action: TAGS.GetAgentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Approves an agent system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ApproveAgentRequest(partyId, agentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${agentRequestId}/approve`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/${partyId}/${agentRequestId}/approve`,
            name: `${this.FULL_PATH}/{partyId}/{agentRequestId}/approve`,
            action: TAGS.ApproveAgentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Rejects an agent system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RejectAgentRequest(partyId, agentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${agentRequestId}/reject`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/${partyId}/${agentRequestId}/reject`,
            name: `${this.FULL_PATH}/{partyId}/{agentRequestId}/reject`,
            action: TAGS.RejectAgentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Escalates an agent system user request to someone who can approve it.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId Agent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    EscalateAgentRequest(partyId, requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${requestId}/escalate`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/${partyId}/${requestId}/escalate`,
            name: `${this.FULL_PATH}/{partyId}/{requestId}/escalate`,
            action: TAGS.EscalateAgentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Gets the logout redirect for an agent system user request.
     *
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetAgentRequestLogout(agentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${agentRequestId}/logout`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${agentRequestId}/logout`,
            name: `${this.FULL_PATH}/{agentRequestId}/logout`,
            action: TAGS.GetAgentRequestLogout.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { SystemUserAgentRequestClient };
