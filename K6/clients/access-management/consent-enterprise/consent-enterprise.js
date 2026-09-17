import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { ConsentRequestDto, ConsentRequestEventsQuery } from "./consent-enterprise.types.js";

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
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EnterpriseCreateConsentRequest(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/consentrequests`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/consentrequests`,
                action: TAGS.EnterpriseCreateConsentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets a consent request.
     *
     * Requires an organization token with the `altinn:consentrequests.read` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EnterpriseGetConsentRequest(consentRequestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/consentrequests/${consentRequestId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/consentrequests/{consentRequestId}`,
                action: TAGS.EnterpriseGetConsentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets consent request events.
     *
     * Requires an organization token with the `altinn:consentrequests.read` scope.
     *
     * @param {ConsentRequestEventsQuery|null} [query]
     * Optional query parameters.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    EnterpriseGetConsentRequestEvents(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/consentrequests/events`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/consentrequests/events`,
                action: TAGS.EnterpriseGetConsentRequestEvents.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { EnterpriseClient };
