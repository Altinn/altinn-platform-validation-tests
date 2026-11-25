import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { CreateAgentRequestSystemUser, CreateRequestSystemUser, GuidOpaque } from "./types.js";

const TAGS = {
    RequestSystemUserVendorCreate: {
        action: "request-system-user-vendor-create",
    },
    RequestSystemUserVendorAgentCreate: {
        action: "request-system-user-vendor-agent-create",
    },
    RequestSystemUserVendorGet: {
        action: "request-system-user-vendor-get",
    },
    RequestSystemUserVendorDelete: {
        action: "request-system-user-vendor-delete",
    },
    RequestSystemUserVendorAgentGet: {
        action: "request-system-user-vendor-agent-get",
    },
    RequestSystemUserVendorGetByExternalRef: {
        action: "request-system-user-vendor-get-by-external-ref",
    },
    RequestSystemUserVendorAgentGetByExternalRef: {
        action: "request-system-user-vendor-agent-get-by-external-ref",
    },
    RequestSystemUserVendorGetBySystem: {
        action: "request-system-user-vendor-get-by-system",
    },
    RequestSystemUserVendorAgentGetBySystem: {
        action: "request-system-user-vendor-agent-get-by-system",
    },
};

class RequestSystemUserClient {
    /**
     * @param {string} baseUrl Base URL.
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
        this.BASE_PATH = "/authentication/api/v1/systemuser/request/vendor";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a new system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {CreateRequestSystemUser} request Request model.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorCreate(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.RequestSystemUserVendorCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a new agent system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {CreateAgentRequestSystemUser} request Agent request model.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentCreate(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/agent`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/agent`,
                action: TAGS.RequestSystemUserVendorAgentCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves a request system user status by id.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorGet(requestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${encodeURIComponent(requestId)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{requestId}`,
                action: TAGS.RequestSystemUserVendorGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes a system user request.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorDelete(requestId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${encodeURIComponent(requestId)}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{requestId}`,
                action: TAGS.RequestSystemUserVendorDelete.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves an agent system user request status by id.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGet(requestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/agent/${encodeURIComponent(requestId)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/{requestId}`,
                action: TAGS.RequestSystemUserVendorAgentGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves a request system user by system id, organization number and external reference.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {string} orgNo Organization number.
     * @param {string} externalRef External reference.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorGetByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/byexternalref/${encodeURIComponent(systemId)}/${encodeURIComponent(orgNo)}/${encodeURIComponent(externalRef)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/byexternalref/{systemId}/{orgNo}/{externalRef}`,
                action: TAGS.RequestSystemUserVendorGetByExternalRef.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves an agent system user request by system id, organization number and external reference.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {string} orgNo Organization number.
     * @param {string} externalRef External reference.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGetByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/agent/byexternalref/${encodeURIComponent(systemId)}/${encodeURIComponent(orgNo)}/${encodeURIComponent(externalRef)}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/byexternalref/{systemId}/{orgNo}/{externalRef}`,
                action: TAGS.RequestSystemUserVendorAgentGetByExternalRef.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves all system user requests for a system.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorGetBySystem(systemId, token = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/bysystem/${encodeURIComponent(systemId)}`, {
                token: token !== null ? JSON.stringify(token) : null,
            }),
            requestParams({
                endpoint: `${this.FULL_PATH}/bysystem/{systemId}`,
                action: TAGS.RequestSystemUserVendorGetBySystem.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves all agent system user requests for a system.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestSystemUserVendorAgentGetBySystem(
        systemId,
        token = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/agent/bysystem/${encodeURIComponent(systemId)}`, {
                token: token !== null ? JSON.stringify(token) : null,
            }),
            requestParams({
                endpoint: `${this.FULL_PATH}/agent/bysystem/{systemId}`,
                action: TAGS.RequestSystemUserVendorAgentGetBySystem.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    RequestSystemUserClient,
};
