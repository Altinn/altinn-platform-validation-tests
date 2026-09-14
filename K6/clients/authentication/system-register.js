import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { AccessPackage, RegisterSystemRequest, Right } from "./types.js";

const TAGS = {
    SystemRegisterGet: {
        action: "system-register-get",
    },
    SystemRegisterVendorGet: {
        action: "system-register-vendor-get",
    },
    SystemRegisterVendorCreate: {
        action: "system-register-vendor-create",
    },
    SystemRegisterVendorGetById: {
        action: "system-register-vendor-get-by-id",
    },
    SystemRegisterVendorUpdate: {
        action: "system-register-vendor-update",
    },
    SystemRegisterVendorDelete: {
        action: "system-register-vendor-delete",
    },
    SystemRegisterGetRightsFrontend: {
        action: "system-register-get-rights",
    },
    SystemRegisterGetAccessPackagesFrontend: {
        action: "system-register-get-access-packages",
    },
    SystemRegisterVendorUpdateRights: {
        action: "system-register-vendor-update-rights",
    },
    SystemRegisterVendorUpdateAccessPackages: {
        action: "system-register-vendor-update-access-packages",
    },
    SystemRegisterVendorGetChangeLog: {
        action: "system-register-vendor-get-change-log",
    },
};

class SystemRegisterClient {
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
        this.BASE_PATH = "/authentication/api/v1/systemregister";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Retrieves all registered systems.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGet(labels = null) {
        return http.get(
            this.FULL_PATH,
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.SystemRegisterGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves all vendor registered systems.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGet(labels = null) {
        return http.get(
            `${this.FULL_PATH}/vendor`,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor`,
                action: TAGS.SystemRegisterVendorGet.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a new registered system.
     *
     * @param {RegisterSystemRequest} request System registration request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorCreate(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/vendor`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor`,
                action: TAGS.SystemRegisterVendorCreate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves a registered system by id.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGetById(systemId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/vendor/${systemId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
                action: TAGS.SystemRegisterVendorGetById.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {RegisterSystemRequest} request Updated system model.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdate(systemId, request, labels = null) {
        return http.put(
            `${this.FULL_PATH}/vendor/${systemId}`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
                action: TAGS.SystemRegisterVendorUpdate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Deletes a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorDelete(systemId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/vendor/${systemId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
                action: TAGS.SystemRegisterVendorDelete.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves default rights for a system.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} systemId System identifier.
     * @param {boolean|null} useOldFormatForApp Whether to use old app format.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGetRightsFrontend(systemId, useOldFormatForApp = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${systemId}/rights`, { useOldFormatForApp }),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
                action: TAGS.SystemRegisterGetRightsFrontend.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves default access packages for a system.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} systemId System identifier.
     * @param {boolean|null} useOldFormatForApp Whether to use old app format.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterGetAccessPackagesFrontend(
        systemId,
        useOldFormatForApp = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${systemId}/accesspackages`, { useOldFormatForApp }),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}`,
                action: TAGS.SystemRegisterGetAccessPackagesFrontend.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates rights on a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {Right[]} rights Rights.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdateRights(systemId, rights, labels = null) {
        return http.put(
            `${this.FULL_PATH}/vendor/${systemId}/rights`,
            jsonBody(rights),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}/rights`,
                action: TAGS.SystemRegisterVendorUpdateRights.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Updates access packages on a registered system.
     *
     * @param {string} systemId System identifier.
     * @param {AccessPackage[]} accessPackages Access packages.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorUpdateAccessPackages(
        systemId,
        accessPackages,
        labels = null,
    ) {
        return http.put(
            `${this.FULL_PATH}/vendor/${systemId}/accesspackages`,
            jsonBody(accessPackages),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}/accesspackages`,
                action: TAGS.SystemRegisterVendorUpdateAccessPackages.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves system change log.
     *
     * @param {string} systemId System identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemRegisterVendorGetChangeLog(systemId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/vendor/${systemId}/changelog`,
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/{systemId}/changelog`,
                action: TAGS.SystemRegisterVendorGetChangeLog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    SystemRegisterClient,
};
