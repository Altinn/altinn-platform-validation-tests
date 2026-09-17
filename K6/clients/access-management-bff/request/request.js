import http from "k6/http";

import { buildUrl, requestParams } from "../../common/request.js";
import { ApproveReceivedRequestQuery, ConfirmDraftRequestQuery, CreatePackageRequestQuery, CreateResourceRequestQuery, GetReceivedPackageRequestsQuery, GetReceivedRequestsCountQuery, GetReceivedRequestsQuery, GetReceivedResourceRequestsQuery, GetRequestQuery, GetSentPackageRequestsQuery, GetSentRequestsCountQuery, GetSentRequestsQuery, GetSentResourceRequestsQuery, RejectReceivedRequestQuery, WithdrawSentRequestQuery } from "./request.types.js";

const TAGS = {
    GetSentRequests: {
        action: "get-sent-requests",
    },
    GetSentResourceRequests: {
        action: "get-sent-resource-requests",
    },
    GetSentPackageRequests: {
        action: "get-sent-package-requests",
    },
    GetReceivedRequests: {
        action: "get-received-requests",
    },
    GetReceivedResourceRequests: {
        action: "get-received-resource-requests",
    },
    GetReceivedPackageRequests: {
        action: "get-received-package-requests",
    },
    GetSentRequestsCount: {
        action: "get-sent-requests-count",
    },
    GetReceivedRequestsCount: {
        action: "get-received-requests-count",
    },
    GetRequest: {
        action: "get-request",
    },
    GetDraftRequest: {
        action: "get-draft-request",
    },
    CreateResourceRequest: {
        action: "create-resource-request",
    },
    CreatePackageRequest: {
        action: "create-package-request",
    },
    WithdrawSentRequest: {
        action: "withdraw-sent-request",
    },
    ConfirmDraftRequest: {
        action: "confirm-draft-request",
    },
    RejectReceivedRequest: {
        action: "reject-received-request",
    },
    ApproveReceivedRequest: {
        action: "approve-received-request",
    },
};

/**
 * Client for the access request endpoints of the Access Management BFF API.
 */
class RequestClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/request";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the access requests a party has sent.
     *
     * @param {GetSentRequestsQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetSentRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSentRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/sent`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/sent`,
                action: TAGS.GetSentRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resource access requests a party has sent.
     *
     * @param {GetSentResourceRequestsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetSentResourceRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSentResourceRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/sent/resource`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/sent/resource`,
                action: TAGS.GetSentResourceRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access package requests a party has sent.
     *
     * @param {GetSentPackageRequestsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetSentPackageRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSentPackageRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/sent/package`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/sent/package`,
                action: TAGS.GetSentPackageRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access requests a party has received.
     *
     * @param {GetReceivedRequestsQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetReceivedRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received`,
                action: TAGS.GetReceivedRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the resource access requests a party has received.
     *
     * @param {GetReceivedResourceRequestsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetReceivedResourceRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedResourceRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received/resource`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received/resource`,
                action: TAGS.GetReceivedResourceRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the access package requests a party has received.
     *
     * @param {GetReceivedPackageRequestsQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetReceivedPackageRequestsQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedPackageRequests(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received/package`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received/package`,
                action: TAGS.GetReceivedPackageRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the number of access requests a party has sent.
     *
     * @param {GetSentRequestsCountQuery|null} [query] Optional query parameters.
     * Prefer using {@link GetSentRequestsCountQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSentRequestsCount(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/sent/count`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/sent/count`,
                action: TAGS.GetSentRequestsCount.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the number of access requests a party has received.
     *
     * @param {GetReceivedRequestsCountQuery|null} [query] Optional query
     * parameters. Prefer using {@link GetReceivedRequestsCountQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedRequestsCount(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received/count`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received/count`,
                action: TAGS.GetReceivedRequestsCount.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a single access request.
     *
     * @param {string} id Request UUID.
     * @param {GetRequestQuery|null} [query] Optional query parameters. Prefer
     * using {@link GetRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRequest(id, query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/${id}`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}`,
                action: TAGS.GetRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a draft access request.
     *
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDraftRequest(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/draft/${id}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/draft/{id}`,
                action: TAGS.GetDraftRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates an access request for a resource.
     *
     * @param {CreateResourceRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreateResourceRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateResourceRequest(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/resource`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/resource`,
                action: TAGS.CreateResourceRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates an access request for an access package.
     *
     * @param {CreatePackageRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link CreatePackageRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreatePackageRequest(query = null, labels = null) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/package`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/package`,
                action: TAGS.CreatePackageRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Withdraws an access request a party has sent.
     *
     * @param {WithdrawSentRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link WithdrawSentRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    WithdrawSentRequest(query = null, labels = null) {
        return http.del(
            buildUrl(`${this.FULL_PATH}/sent/withdraw`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/sent/withdraw`,
                action: TAGS.WithdrawSentRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Confirms a draft access request, turning it into a pending request.
     *
     * @param {ConfirmDraftRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link ConfirmDraftRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConfirmDraftRequest(query = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/draft/confirm`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/draft/confirm`,
                action: TAGS.ConfirmDraftRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Rejects an access request a party has received.
     *
     * @param {RejectReceivedRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link RejectReceivedRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectReceivedRequest(query = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/received/reject`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/received/reject`,
                action: TAGS.RejectReceivedRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Approves an access request a party has received.
     *
     * @param {ApproveReceivedRequestQuery|null} [query] Optional query parameters.
     * Prefer using {@link ApproveReceivedRequestQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveReceivedRequest(query = null, labels = null) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/received/approve`, query),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/received/approve`,
                action: TAGS.ApproveReceivedRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { RequestClient };
