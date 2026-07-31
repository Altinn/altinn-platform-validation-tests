import http from "k6/http";

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
    ChangeRequestSystemUserApprove: {
        action: "change-request-system-user-approve",
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorCreate(
        request,
        correlationId = null,
        systemUserId = null,
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/vendor`;

        const query = [];

        if (correlationId !== null) {
            query.push(
                `correlation-id=${encodeURIComponent(correlationId)}`,
            );
        }

        if (systemUserId !== null) {
            query.push(
                `system-user-id=${encodeURIComponent(systemUserId)}`,
            );
        }

        if (query.length > 0) {
            url += `?${query.join("&")}`;
        }

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.ChangeRequestSystemUserVendorCreate.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(request), {
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorGet(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: url,
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorDelete(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: url,
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
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
            endpoint: url,
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
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeRequestSystemUserVendorGetBySystem(
        systemId,
        token = null,
        labels = null,
    ) {
        const authToken = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/vendor/bysystem/${systemId}`;

        if (token !== null) {
            url += `?token=${encodeURIComponent(token.value)}`;
        }

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/vendor/bysystem/{systemId}`,
            action: TAGS.ChangeRequestSystemUserVendorGetBySystem.action,
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
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Approves a change request on behalf of the party it was made for.
     *
     * Requires the `altinn:portal/enduser` scope.
     *
     * @param {string} partyId Party the change request was made for.
     * @param {string} requestId Change request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ChangeRequestSystemUserApprove(partyId, requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${encodeURIComponent(partyId)}/${encodeURIComponent(requestId)}/approve`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{partyId}/{requestId}/approve`,
            action: TAGS.ChangeRequestSystemUserApprove.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }
}

export {
    ChangeRequestSystemUserClient,
};
