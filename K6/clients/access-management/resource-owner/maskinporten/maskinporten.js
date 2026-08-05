import http from "k6/http";

const TAGS = {
    GetMaskinportenDelegations: {
        action: "get-maskinporten-delegations",
    },
    LookupConsent: {
        action: "lookup-consent",
    },
};

class MaskinportenClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     * @param {string|null} [subscriptionKey]
     * API management subscription key. The API documents the
     * Ocp-Apim-Subscription-Key header as required, but it is only needed when
     * the request goes through API management. The header is omitted when this
     * is not set.
     */
    constructor(baseUrl, tokenGenerator, subscriptionKey = null) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * API management subscription key, or null when not needed.
         */
        this.subscriptionKey = subscriptionKey;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/accessmanagement/api/v1/maskinporten";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets Maskinporten delegations.
     *
     * Requires one of the scopes altinn:maskinporten/delegations.read or
     * altinn:maskinporten/delegations.admin.
     *
     * @param {MaskinportenDelegationsQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link MaskinportenDelegationsQueryBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetMaskinportenDelegations(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/delegations`);

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
            endpoint: `${this.FULL_PATH}/delegations`,
            name: `${this.FULL_PATH}/delegations`,
            action: TAGS.GetMaskinportenDelegations.action,
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
                ...(this.subscriptionKey !== null && {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                }),
            },
        });
    }

    /**
     * Looks up a consent.
     *
     * This is the endpoint Maskinporten itself calls to look up a consent before
     * it hands out a consent token, so calling it is how a test covers what a
     * consumer would get.
     *
     * Requires an organization token with the `altinn:maskinporten/consent.read`
     * scope.
     *
     * @param {ConsentLookupRequest} request Consent to look up. Prefer using
     * {@link ConsentLookupRequestBuilder}.
     * @param {{[key: string]: string}} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    LookupConsent(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        // The trailing slash is part of the route. Without it the request is
        // redirected, and the redirect drops the Authorization header.
        const url = new URL(`${this.FULL_PATH}/consent/lookup/`);

        let tags = {
            endpoint: `${this.FULL_PATH}/consent/lookup/`,
            name: `${this.FULL_PATH}/consent/lookup/`,
            action: TAGS.LookupConsent.action,
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
                ...(this.subscriptionKey !== null && {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                }),
            },
        });
    }
}

export { MaskinportenClient };
