import http from "k6/http";

import { URL } from "../../../common-imports.js";

const TAGS = {
    GetChangeRequest: {
        action: "get-change-request",
    },
    ApproveChangeRequest: {
        action: "approve-change-request",
    },
    RejectChangeRequest: {
        action: "reject-change-request",
    },
    GetChangeRequestLogout: {
        action: "get-change-request-logout",
    },
};

/**
 * Client for the system user change request endpoints of the Access Management
 * BFF API.
 */
class SystemUserChangeRequestClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser/changerequest";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a system user change request.
     *
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetChangeRequest(changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${changeRequestId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{changeRequestId}`,
            name: `${this.FULL_PATH}/{changeRequestId}`,
            action: TAGS.GetChangeRequest.action,
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
     * Approves a system user change request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveChangeRequest(partyId, changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${changeRequestId}/approve`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{changeRequestId}/approve`,
            name: `${this.FULL_PATH}/{partyId}/{changeRequestId}/approve`,
            action: TAGS.ApproveChangeRequest.action,
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
     * Rejects a system user change request.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectChangeRequest(partyId, changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/${partyId}/${changeRequestId}/reject`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/{partyId}/{changeRequestId}/reject`,
            name: `${this.FULL_PATH}/{partyId}/{changeRequestId}/reject`,
            action: TAGS.RejectChangeRequest.action,
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
     * Gets the logout redirect for a system user change request.
     *
     * @param {string} changeRequestId Change request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetChangeRequestLogout(changeRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${changeRequestId}/logout`);

        let tags = {
            endpoint: `${this.FULL_PATH}/{changeRequestId}/logout`,
            name: `${this.FULL_PATH}/{changeRequestId}/logout`,
            action: TAGS.GetChangeRequestLogout.action,
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

export { SystemUserChangeRequestClient };
