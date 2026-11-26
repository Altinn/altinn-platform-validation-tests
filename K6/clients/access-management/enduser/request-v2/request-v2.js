import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../../common/request.js";
import { ApproveRequestDto, ReceivedRequestsQuery, RequestedRightKeysDto, SentRequestsQuery } from "./request-v2.types.js";

const TAGS = {
    GetReceivedRequests: {
        action: "get-received-requests-v2",
    },
    GetReceivedRequestsCount: {
        action: "get-received-requests-count-v2",
    },
    GetReceivedRequestsCountSubunits: {
        action: "get-received-requests-count-subunits-v2",
    },
    ApproveReceivedRequest: {
        action: "approve-received-request-v2",
    },
    RejectReceivedRequest: {
        action: "reject-received-request-v2",
    },
    CreateResourceRequest: {
        action: "create-resource-request-v2",
    },
    CreatePackageRequest: {
        action: "create-package-request-v2",
    },
    GetSentRequests: {
        action: "get-sent-requests-v2",
    },
    GetSentRequestsCount: {
        action: "get-sent-requests-count-v2",
    },
    WithdrawSentRequest: {
        action: "withdraw-sent-request-v2",
    },
    GetRequest: {
        action: "get-request-v2",
    },
    GetDraftRequest: {
        action: "get-draft-request-v2",
    },
    ConfirmDraftRequest: {
        action: "confirm-draft-request-v2",
    },
};

/**
 * Client for the v2 enduser request endpoints.
 */
class RequestV2Client {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.tt02.altinn.no
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        this.tokenGenerator = tokenGenerator;

        this.BASE_PATH = "/accessmanagement/api/v2/enduser/request";

        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets received requests for a party.
     *
     * @param {ReceivedRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link ReceivedRequestsV2QueryBuilder}.
     * @param {number|null} [pageSize]
     * Page size header.
     * @param {number|null} [pageNumber]
     * Page number header.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedRequests(
        query = null,
        pageSize = null,
        pageNumber = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received`,
                action: TAGS.GetReceivedRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: {
                    "X-Page-Size": pageSize,
                    "X-Page-Number": pageNumber,
                },
            }),
        );
    }

    /**
     * Gets count of received requests for a party.
     *
     * @param {ReceivedRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link ReceivedRequestsV2QueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
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
     * Gets count of received requests for a party, per subunit.
     *
     * @param {ReceivedRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link ReceivedRequestsV2QueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReceivedRequestsCountSubunits(query = null, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/received/count/subunits`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/received/count/subunits`,
                action: TAGS.GetReceivedRequestsCountSubunits.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Approves a received request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {ApproveRequestDto|null} [body]
     * The right keys to approve. Approving fewer than were requested gives PartialApprove.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ApproveReceivedRequest(
        party,
        id,
        body = null,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/received/approve`, { party, id }),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/received/approve`,
                action: TAGS.ApproveReceivedRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Rejects a received request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RejectReceivedRequest(
        party,
        id,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/received/reject`, { party, id }),
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
     * Creates a resource request.
     *
     * @param {string} party Party UUID.
     * @param {string} to Party UUID.
     * @param {string} resource Resource identifier.
     * @param {RequestedRightKeysDto|null} [body]
     * The right keys to request.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateResourceRequest(
        party,
        to,
        resource,
        body = null,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/resource`, { party, to, resource }),
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/resource`,
                action: TAGS.CreateResourceRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a package request.
     *
     * @param {string} party Party UUID.
     * @param {string} to Party UUID.
     * @param {string} packageId Access package identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreatePackageRequest(
        party,
        to,
        packageId,
        labels = null,
    ) {
        return http.post(
            buildUrl(`${this.FULL_PATH}/package`, { party, to, package: packageId }),
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
     * Gets sent requests for a party.
     *
     * @param {SentRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link SentRequestsV2QueryBuilder}.
     * @param {number|null} [pageSize]
     * Page size header.
     * @param {number|null} [pageNumber]
     * Page number header.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetSentRequests(
        query = null,
        pageSize = null,
        pageNumber = null,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/sent`, query),
            requestParams({
                endpoint: `${this.FULL_PATH}/sent`,
                action: TAGS.GetSentRequests.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: {
                    "X-Page-Size": pageSize,
                    "X-Page-Number": pageNumber,
                },
            }),
        );
    }

    /**
     * Gets count of sent requests for a party.
     *
     * @param {SentRequestsQuery|null} [query]
     * Query parameters. Prefer using {@link SentRequestsV2QueryBuilder}.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
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
     * Withdraws a sent request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    WithdrawSentRequest(
        party,
        id,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/sent/withdraw`, { party, id }),
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
     * Gets a request by id.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetRequest(
        party,
        id,
        labels = null,
    ) {
        return http.get(
            buildUrl(this.FULL_PATH, { party, id }),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a draft request.
     *
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetDraftRequest(
        id,
        labels = null,
    ) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/draft`, { id }),
            requestParams({
                endpoint: `${this.FULL_PATH}/draft`,
                action: TAGS.GetDraftRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Confirms a draft request.
     *
     * @param {string} party Party UUID.
     * @param {string} id Request UUID.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConfirmDraftRequest(
        party,
        id,
        labels = null,
    ) {
        return http.put(
            buildUrl(`${this.FULL_PATH}/draft/confirm`, { party, id }),
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/draft/confirm`,
                action: TAGS.ConfirmDraftRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export {
    RequestV2Client,
};
