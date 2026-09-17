import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { ConsentLookupRequest, MaskinportenDelegationsQuery } from "./maskinporten.types.js";

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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetMaskinportenDelegations(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/delegations`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/delegations`,
                action: TAGS.GetMaskinportenDelegations.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Ocp-Apim-Subscription-Key": this.subscriptionKey },
            }),
        );
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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    LookupConsent(request, labels = null) {
        // The trailing slash is part of the route. Without it the request is
        // redirected, and the redirect drops the Authorization header.
        return http.post(
            `${this.FULL_PATH}/consent/lookup/`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/consent/lookup/`,
                action: TAGS.LookupConsent.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                headers: { "Ocp-Apim-Subscription-Key": this.subscriptionKey },
            }),
        );
    }
}

export { MaskinportenClient };
