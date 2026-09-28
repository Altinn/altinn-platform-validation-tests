import http from "k6/http";

import { jsonBody, requestParams } from "../../../common/request.js";
import { CreateServiceOwnerRequest, RequestPackageDto, RequestResourceDto } from "./request.types.js";

const TAGS = {
    RequestGetPartyUrns: {
        action: "request-get-party-urns",
    },
    RequestGetRequestStatus: {
        action: "request-get-request-status",
    },
    RequestWithdrawRequest: {
        action: "request-withdraw-request",
    },
    RequestCreateResourceRequest: {
        action: "request-create-resource-request",
    },
    RequestCreatePackageRequest: {
        action: "request-create-package-request",
    },
    RequestCreateRequest: {
        action: "request-create-request",
    },
};

class RequestClient {
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
        this.BASE_PATH = "/accessmanagement/api/v1/serviceowner/delegationrequests";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets supported party URN types.
     *
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestGetPartyUrns(labels = null) {
        return http.get(
            `${this.FULL_PATH}/_meta/urns/party`,
            requestParams({
                endpoint: `${this.FULL_PATH}/_meta/urns/party`,
                action: TAGS.RequestGetPartyUrns.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets request status.
     *
     * @param {string} id Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestGetRequestStatus(id, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${id}/status`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/status`,
                action: TAGS.RequestGetRequestStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Withdraws a delegation request.
     *
     * @param {string} id Request identifier.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestWithdrawRequest(id, labels = null) {
        return http.put(
            `${this.FULL_PATH}/${id}/withdraw`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{id}/withdraw`,
                action: TAGS.RequestWithdrawRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Creates a resource delegation request.
     *
     * @param {RequestResourceDto} request Request payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestCreateResourceRequest(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/resource`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/resource`,
                action: TAGS.RequestCreateResourceRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a package delegation request.
     *
     * @param {RequestPackageDto} request Request payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestCreatePackageRequest(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/package`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/package`,
                action: TAGS.RequestCreatePackageRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Creates a delegation request.
     *
     * @param {CreateServiceOwnerRequest} request Request payload.
     * @param {{[key: string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    RequestCreateRequest(request, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(request),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.RequestCreateRequest.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }
}

export { RequestClient };
