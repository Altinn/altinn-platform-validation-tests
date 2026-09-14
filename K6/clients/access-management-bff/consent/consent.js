import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";
import { ApproveConsentContext } from "../common/common.types.js";
import { GetConsentCountQuery } from "./consent.types.js";

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
 *
 * Every endpoint here is called on behalf of the person handling the consent, so
 * they all take a personal token with the `altinn:portal/enduser` scope. The
 * scope is repeated on each method, since that is where a caller looks for it.
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
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsentRequest(consentRequestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/request/${consentRequestId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/request/{consentRequestId}`,
                action: TAGS.GetConsentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Approves a consent request.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {ApproveConsentContext|null} [body] Context for the approval. Prefer
     * using {@link ApproveConsentContextBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveConsentRequest(consentRequestId, body = null, labels = null) {
        return http.post(
            `${this.FULL_PATH}/request/${consentRequestId}/approve`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/request/{consentRequestId}/approve`,
                action: TAGS.ApproveConsentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Rejects a consent request.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectConsentRequest(consentRequestId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/request/${consentRequestId}/reject`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/request/{consentRequestId}/reject`,
                action: TAGS.RejectConsentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the number of consent requests a party has.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} party Party UUID.
     * @param {GetConsentCountQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetConsentCountQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsentCount(party, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/count/${party}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/count/{party}`,
                action: TAGS.GetConsentCount.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the active consents of a party.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} party Party UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActiveConsents(party, labels = null) {
        return http.get(
            `${this.FULL_PATH}/active/${party}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/active/{party}`,
                action: TAGS.GetActiveConsents.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the consent log of a party.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} party Party UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsentLog(party, labels = null) {
        return http.get(
            `${this.FULL_PATH}/log/${party}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/log/{party}`,
                action: TAGS.GetConsentLog.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single consent.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentId Consent UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsent(consentId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${consentId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{consentId}`,
                action: TAGS.GetConsent.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Revokes a consent.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentId Consent UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RevokeConsent(consentId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${consentId}/revoke`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{consentId}/revoke`,
                action: TAGS.RevokeConsent.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the logout redirect for a consent request.
     *
     * Requires a personal token with the `altinn:portal/enduser` scope.
     *
     * @param {string} consentRequestId Consent request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetConsentRequestLogout(consentRequestId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/request/${consentRequestId}/logout`,
            requestParams({
                endpoint: `${this.FULL_PATH}/request/{consentRequestId}/logout`,
                action: TAGS.GetConsentRequestLogout.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { ConsentClient };
