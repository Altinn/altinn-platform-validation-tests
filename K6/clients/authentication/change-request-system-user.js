import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { ChangeRequestSystemUser, GuidOpaque } from "./types.js";

const TAGS = {
    ChangeRequestSystemUserVendorCreate: {
        action: "change-request-system-user-vendor-create",
    },
    ChangeRequestSystemUserVendorGet: {
        action: "change-request-system-user-vendor-get",
    },
    ChangeRequestSystemUserVendorDelete: {
        action: "change-request-system-user-vendor-delete",
    },
    ChangeRequestSystemUserVendorGetByExternalRef: {
        action: "change-request-system-user-vendor-get-by-external-ref",
    },
    ChangeRequestSystemUserVendorGetBySystem: {
        action: "change-request-system-user-vendor-get-by-system",
    },
};

class ChangeRequestSystemUserClient {
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
        this.BASE_PATH = "/authentication/api/v1/systemuser/changerequest";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a change request for a system user.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {ChangeRequestSystemUser} request Change request payload.
     * @param {string|null} correlationId Correlation identifier.
     * @param {string|null} systemUserId System user identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorCreate(
        request,
        correlationId = null,
        systemUserId = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/vendor`, {
                "correlation-id": correlationId,
                "system-user-id": systemUserId,
            }),
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor`,
                action: TAGS.ChangeRequestSystemUserVendorCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves a change request by id.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorGet(requestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/vendor/${requestId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{requestId}`,
                action: TAGS.ChangeRequestSystemUserVendorGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes a change request by id.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorDelete(requestId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/vendor/${requestId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{requestId}`,
                action: TAGS.ChangeRequestSystemUserVendorDelete.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves a change request by external reference.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {string} orgNo Organisation number.
     * @param {string} externalRef External reference.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorGetByExternalRef(
        systemId,
        orgNo,
        externalRef,
        labels = null,
    ) {
        return http.get(
            `${this.FULL_PATH}/vendor/byexternalref/${systemId}/${orgNo}/${externalRef}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/byexternalref/{systemId}/{orgNo}/{externalRef}`,
                action: TAGS.ChangeRequestSystemUserVendorGetByExternalRef.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves change requests for a system.
     *
     * Requires the `altinn:authentication/systemuser.request.read` scope.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorGetBySystem(
        systemId,
        token = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/vendor/bysystem/${systemId}`, {
                token: token !== null ? token.value : null,
            }),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
                action: TAGS.ChangeRequestSystemUserVendorGetBySystem.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    ChangeRequestSystemUserClient,
};
