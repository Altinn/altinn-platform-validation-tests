import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { SystemUserByExternalIdQuery, SystemUserPagedQuery, SystemUserUpdateDto, SystemUserVendorQuery } from "./types.js";

const TAGS = {
    SystemUserGetByExternalId: {
        action: "system-user-get-by-external-id",
    },
    SystemUserUpdate: {
        action: "system-user-update",
    },
    SystemUserVendorGetByQuery: {
        action: "system-user-vendor-get-by-query",
    },
    SystemUserVendorGetBySystem: {
        action: "system-user-vendor-get-by-system",
    },
    SystemUserInternalStream: {
        action: "system-user-internal-stream",
    },
};

/**
 * Unwraps query values that are opaque objects, such as the paging token,
 * into the plain value the API expects, so buildUrl can stringify them.
 *
 * @param {{[key: string]: *}|null} query Query parameters, possibly holding
 * objects with a `value` field.
 * @returns {{[key: string]: *}|null} The same parameters with those objects
 * replaced by their value.
 */
function unwrapQuery(query) {
    if (query === null) {
        return null;
    }

    return Object.fromEntries(
        Object.entries(query).map(([key, value]) => [
            key,
            typeof value === "object" && value !== null ? value.value : value,
        ]),
    );
}

class SystemUserClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
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
        this.BASE_PATH = "/authentication/api/v1/systemuser";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Finds a SystemUser by external id.
     *
     * Requires the `altinn:maskinporten/systemuser.read` scope.
     *
     * @param {SystemUserByExternalIdQuery|null} query Query parameters, with the keys "system-id" and "external-ref".
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserGetByExternalId(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/byExternalId`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/byExternalId`,
                action: TAGS.SystemUserGetByExternalId.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates an existing SystemUser.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {SystemUserUpdateDto} request Updated SystemUser.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserUpdate(request, labels = null) {
        return http.put(
            `${this.FULL_PATH}`,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.SystemUserUpdate.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Retrieves a SystemUser by vendor query.
     *
     * Requires the `altinn:authentication/systemuser.request.write` scope.
     *
     * @param {SystemUserVendorQuery|null} query Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserVendorGetByQuery(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/vendor/byquery`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/byquery`,
                action: TAGS.SystemUserVendorGetByQuery.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves SystemUsers for a vendor system.
     *
     * Requires the `altinn:authentication/systemregister.write` scope.
     *
     * @param {string} systemId System identifier.
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserVendorGetBySystem(systemId, query = null, labels = null) {
        return http.get(
            buildUrl(
                `${this.FULL_PATH}/vendor/bysystem/${encodeURIComponent(systemId)}`,
                unwrapQuery(query),
            ),
            requestParams({
                endpoint: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
                action: TAGS.SystemUserVendorGetBySystem.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Retrieves SystemUsers for internal streaming.
     *
     * Requires the `altinn:authentication/systemuser.admin` scope.
     *
     * @param {SystemUserPagedQuery|null} [query] Query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    SystemUserInternalStream(query = null, labels = null) {
        return http.get(
            buildUrl(
                `${this.FULL_PATH}/internal/systemusers/stream`,
                unwrapQuery(query),
            ),
            requestParams({
                endpoint: `${this.FULL_PATH}/internal/systemusers/stream`,
                action: TAGS.SystemUserInternalStream.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    SystemUserClient,
};
