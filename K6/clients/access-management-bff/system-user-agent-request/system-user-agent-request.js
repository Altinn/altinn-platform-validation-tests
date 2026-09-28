import http from "k6/http";

import { requestParams } from "../../common/request.js";

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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentRequest(agentRequestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${agentRequestId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{agentRequestId}`,
                action: TAGS.GetAgentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Approves an agent system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveAgentRequest(partyId, agentRequestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${agentRequestId}/approve`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{agentRequestId}/approve`,
                action: TAGS.ApproveAgentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Rejects an agent system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectAgentRequest(partyId, agentRequestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${agentRequestId}/reject`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{agentRequestId}/reject`,
                action: TAGS.RejectAgentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Escalates an agent system user request to someone who can approve it.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId Agent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EscalateAgentRequest(partyId, requestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${requestId}/escalate`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/escalate`,
                action: TAGS.EscalateAgentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the logout redirect for an agent system user request.
     *
     * @param {string} agentRequestId Agent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentRequestLogout(agentRequestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${agentRequestId}/logout`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{agentRequestId}/logout`,
                action: TAGS.GetAgentRequestLogout.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { SystemUserAgentRequestClient };
