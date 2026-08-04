import http from "k6/http";

const TAGS = {
    GetConsentRequest: {
        action: "get-consent-request",
    },
    ApproveConsentRequest: {
        action: "approve-consent-request",
    },
    RejectConsentRequest: {
        action: "reject-consent-request",
    },
    GetConsentCount: {
        action: "get-consent-count",
    },
    GetActiveConsents: {
        action: "get-active-consents",
    },
    GetConsentLog: {
        action: "get-consent-log",
    },
    GetConsent: {
        action: "get-consent",
    },
    RevokeConsent: {
        action: "revoke-consent",
    },
    GetConsentRequestLogout: {
        action: "get-consent-request-logout",
    },
};

/**
 * Client for the consent endpoints of the Access Management BFF API.
 */
class ConsentClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/consent";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets a consent request.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetConsentRequest(consentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/request/${consentRequestId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/request/${consentRequestId}`,
            name: `${this.FULL_PATH}/request/{consentRequestId}`,
            action: TAGS.GetConsentRequest.action,
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
     * Approves a consent request.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {ApproveConsentContext|null} [body] Context for the approval. Prefer
     * using {@link ApproveConsentContextBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ApproveConsentRequest(consentRequestId, body = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/request/${consentRequestId}/approve`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/request/${consentRequestId}/approve`,
            name: `${this.FULL_PATH}/request/{consentRequestId}/approve`,
            action: TAGS.ApproveConsentRequest.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url.toString(),
            body !== null ? JSON.stringify(body) : null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
    }

    /**
     * Rejects a consent request.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RejectConsentRequest(consentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/request/${consentRequestId}/reject`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/request/${consentRequestId}/reject`,
            name: `${this.FULL_PATH}/request/{consentRequestId}/reject`,
            action: TAGS.RejectConsentRequest.action,
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
     * Gets the number of consent requests a party has.
     *
     * @param {string} party Party UUID.
     * @param {GetConsentCountQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetConsentCountQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetConsentCount(party, query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/count/${party}`);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/count/${party}`,
            name: `${this.FULL_PATH}/count/{party}`,
            action: TAGS.GetConsentCount.action,
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
     * Gets the active consents of a party.
     *
     * @param {string} party Party UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetActiveConsents(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/active/${party}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/active/${party}`,
            name: `${this.FULL_PATH}/active/{party}`,
            action: TAGS.GetActiveConsents.action,
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
     * Gets the consent log of a party.
     *
     * @param {string} party Party UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetConsentLog(party, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/log/${party}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/log/${party}`,
            name: `${this.FULL_PATH}/log/{party}`,
            action: TAGS.GetConsentLog.action,
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
     * Gets a single consent.
     *
     * @param {string} consentId Consent UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetConsent(consentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${consentId}`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${consentId}`,
            name: `${this.FULL_PATH}/{consentId}`,
            action: TAGS.GetConsent.action,
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
     * Revokes a consent.
     *
     * @param {string} consentId Consent UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    RevokeConsent(consentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/${consentId}/revoke`);

        let tags = {
            endpoint: `${this.FULL_PATH}/${consentId}/revoke`,
            name: `${this.FULL_PATH}/{consentId}/revoke`,
            action: TAGS.RevokeConsent.action,
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
     * Gets the logout redirect for a consent request.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetConsentRequestLogout(consentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/request/${consentRequestId}/logout`,
        );

        let tags = {
            endpoint: `${this.FULL_PATH}/request/${consentRequestId}/logout`,
            name: `${this.FULL_PATH}/request/{consentRequestId}/logout`,
            action: TAGS.GetConsentRequestLogout.action,
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

export { ConsentClient };
