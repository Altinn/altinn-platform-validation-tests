import http from "k6/http";

const TAGS = {
    EnterpriseCreateConsentRequest: {
        action: "enterprise-create-consent-request",
    },
    EnterpriseGetConsentRequest: {
        action: "enterprise-get-consent-request",
    },
    EnterpriseGetConsentRequestEvents: {
        action: "enterprise-get-consent-request-events",
    },
};

class EnterpriseClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/enterprise";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Creates a consent request.
     *
     * Requires an organization token with the `altinn:consentrequests.write` scope.
     *
     * @param {ConsentRequestDto} request Consent request payload.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    EnterpriseCreateConsentRequest(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/consentrequests`;

        let tags = {
            endpoint: url,
            name: url,
            action: TAGS.EnterpriseCreateConsentRequest.action,
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
     * Gets a consent request.
     *
     * Requires an organization token with the `altinn:consentrequests.read` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    EnterpriseGetConsentRequest(consentRequestId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/consentrequests/${consentRequestId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/consentrequests/{consentRequestId}`,
            name: `${this.FULL_PATH}/consentrequests/{consentRequestId}`,
            action: TAGS.EnterpriseGetConsentRequest.action,
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
     * Gets consent request events.
     *
     * Requires an organization token with the `altinn:consentrequests.read` scope.
     *
     * @param {ConsentRequestEventsQueryBuilder | object} [query]
     * Optional query parameters.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    EnterpriseGetConsentRequestEvents(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        let url = `${this.FULL_PATH}/consentrequests/events`;

        if (query !== null) {
            const params = [];

            Object.keys(query).forEach((key) => {
                const value = query[key];

                if (value === undefined || value === null) {
                    return;
                }

                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        params.push(
                            `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
                        );
                    });

                    return;
                }

                params.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                );
            });

            if (params.length > 0) {
                url = `${url}?${params.join("&")}`;
            }
        }

        let tags = {
            endpoint: `${this.FULL_PATH}/consentrequests/events`,
            name: `${this.FULL_PATH}/consentrequests/events`,
            action: TAGS.EnterpriseGetConsentRequestEvents.action,
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
}

export { EnterpriseClient };
