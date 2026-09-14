import http from "k6/http";

import { requestParams } from "../../common/request.js";

const TAGS = {
    GetSystemUserRequest: {
        action: "get-system-user-request",
    },
    ApproveSystemUserRequest: {
        action: "approve-system-user-request",
    },
    RejectSystemUserRequest: {
        action: "reject-system-user-request",
    },
    EscalateSystemUserRequest: {
        action: "escalate-system-user-request",
    },
    GetSystemUserRequestLogout: {
        action: "get-system-user-request-logout",
    },
};

/**
 * Client for the system user request endpoints of the Access Management BFF
 * API.
 */
class SystemUserRequestClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/request";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a system user request.
     *
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUserRequest(requestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${requestId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{requestId}`,
                action: TAGS.GetSystemUserRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Approves a system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveSystemUserRequest(partyId, requestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${requestId}/approve`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/approve`,
                action: TAGS.ApproveSystemUserRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Rejects a system user request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectSystemUserRequest(partyId, requestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${requestId}/reject`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/reject`,
                action: TAGS.RejectSystemUserRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Escalates a system user request to someone who can approve it.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EscalateSystemUserRequest(partyId, requestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}/${requestId}/escalate`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{requestId}/escalate`,
                action: TAGS.EscalateSystemUserRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the logout redirect for a system user request.
     *
     * @param {string} requestId System user request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUserRequestLogout(requestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${requestId}/logout`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{requestId}/logout`,
                action: TAGS.GetSystemUserRequestLogout.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { SystemUserRequestClient };
