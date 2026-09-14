import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { NewSystemUserRequest } from "../common/common.types.js";
import { DeleteAgentSystemUserQuery } from "./system-user.types.js";

const TAGS = {
    GetSystemUsers: {
        action: "get-system-users",
    },
    CreateSystemUser: {
        action: "create-system-user",
    },
    GetSystemUser: {
        action: "get-system-user",
    },
    DeleteSystemUser: {
        action: "delete-system-user",
    },
    GetAgentSystemUsers: {
        action: "get-agent-system-users",
    },
    GetAgentSystemUser: {
        action: "get-agent-system-user",
    },
    DeleteAgentSystemUser: {
        action: "delete-agent-system-user",
    },
    GetPendingSystemUsers: {
        action: "get-pending-system-users",
    },
};

/**
 * Client for the system user endpoints of the Access Management BFF API.
 */
class SystemUserClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/systemuser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the system users of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUsers(partyId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${partyId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}`,
                action: TAGS.GetSystemUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a system user for an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {NewSystemUserRequest|null} [body] The system user to create. Prefer
     * using {@link NewSystemUserRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateSystemUser(partyId, body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${partyId}`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}`,
                action: TAGS.CreateSystemUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets a single system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSystemUser(partyId, systemUserGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${partyId}/${systemUserGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
                action: TAGS.GetSystemUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes a system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteSystemUser(partyId, systemUserGuid, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${partyId}/${systemUserGuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyId}/{systemUserGuid}`,
                action: TAGS.DeleteSystemUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the agent system users of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUsers(partyId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/agent/${partyId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/{partyId}`,
                action: TAGS.GetAgentSystemUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single agent system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAgentSystemUser(partyId, systemUserGuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/agent/${partyId}/${systemUserGuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
                action: TAGS.GetAgentSystemUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes an agent system user of an organisation.
     *
     * @param {number} partyId Party id of the organisation.
     * @param {string} systemUserGuid System user UUID.
     * @param {DeleteAgentSystemUserQuery|null} [query] Optional query parameters.
     * Prefer using {@link DeleteAgentSystemUserQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAgentSystemUser(
        partyId,
        systemUserGuid,
        query = null,
        labels = null,
    ) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/agent/${partyId}/${systemUserGuid}`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/{partyId}/{systemUserGuid}`,
                action: TAGS.DeleteAgentSystemUser.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the pending system user requests of an organisation.
     *
     * @param {string} partyUuid Party UUID of the organisation.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPendingSystemUsers(partyUuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${partyUuid}/pending`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{partyUuid}/pending`,
                action: TAGS.GetPendingSystemUsers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { SystemUserClient };
