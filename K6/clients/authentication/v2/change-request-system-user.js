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
        this.BASE_PATH = "/systemuser/changerequest";

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
     * @param {ChangeRequestSystemUser} request Change request payload.
     * @param {string|null} correlationId Correlation identifier.
     * @param {string|null} systemUserId System user identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
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
            },
        });
    }

    /**
     * Retrieves a change request by id.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ChangeRequestSystemUserVendorGet(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
     * Deletes a change request by id.
     *
     * @param {string} requestId Request identifier.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    ChangeRequestSystemUserVendorDelete(requestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/vendor/${requestId}`;

        let tags = {
            endpoint: url,
            name: url,
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
            },
        });
    }

    /**
 * Retrieves a change request by external reference.
 *
 * @param {string} systemId System identifier.
 * @param {string} orgNo Organisation number.
 * @param {string} externalRef External reference.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {http.RefinedResponse}
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
            name: url,
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
            },
        });
    }

    /**
     * Retrieves change requests for a system.
     *
     * @param {string} systemId System identifier.
     * @param {GuidOpaque|null} token Optional continuation token.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse}
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
            name: url,
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
            },
        });
    }
}

export {
    ChangeRequestSystemUserClient,
};
