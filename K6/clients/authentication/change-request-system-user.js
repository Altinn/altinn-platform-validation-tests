import http from "k6/http";

import { URL } from "../../common-imports.js";
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
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/vendor`);

        if (correlationId !== null) {
            url.searchParams.set("correlation-id", correlationId);
        }

        if (systemUserId !== null) {
            url.searchParams.set("system-user-id", systemUserId);
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor`,
            name: `${this.FULL_PATH}/vendor`,
            action: TAGS.ChangeRequestSystemUserVendorCreate.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url.toString(), JSON.stringify(request), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{requestId}`,
            name: `${this.FULL_PATH}/vendor/{requestId}`,
            action: TAGS.ChangeRequestSystemUserVendorGet.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/{requestId}`,
            name: `${this.FULL_PATH}/vendor/{requestId}`,
            action: TAGS.ChangeRequestSystemUserVendorDelete.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/byexternalref/${systemId}/${orgNo}/${externalRef}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            name: `${this.FULL_PATH}/vendor/byexternalref/{systemId}/{orgNo}/{externalRef}`,
            action: TAGS.ChangeRequestSystemUserVendorGetByExternalRef.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
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
        const authToken = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/vendor/bysystem/${systemId}`);

        if (token !== null) {
            url.searchParams.set("token", token.value);
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
            name: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
            action: TAGS.ChangeRequestSystemUserVendorGetBySystem.action,
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
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
        });
    }
}

export {
    ChangeRequestSystemUserClient,
};
