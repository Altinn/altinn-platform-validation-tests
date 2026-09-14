import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { CorrespondenceQuery, ForwardCorrespondenceRequestExt, InitializeCorrespondencesExt } from "./correspondence.types.js";

const TAGS = {
    ForwardCorrespondence: {
        action: "forward-correspondence",
    },
    InitializeCorrespondence: {
        action: "initialize-correspondence",
    },
    UploadCorrespondences: {
        action: "upload-correspondences",
    },
    GetCorrespondences: {
        action: "get-correspondences",
    },
    PurgeCorrespondence: {
        action: "purge-correspondence",
    },
    DownloadAttachment: {
        action: "download-attachment",
    },
    DownloadAllAttachments: {
        action: "download-all-attachments",
    },
    MarkAsRead: {
        action: "mark-as-read",
    },
    ConfirmCorrespondence: {
        action: "confirm-correspondence",
    },
    GetCorrespondence: {
        action: "get-correspondence",
    },
    GetCorrespondenceDetails: {
        action: "get-correspondence-details",
    },
    GetCorrespondenceContent: {
        action: "get-correspondence-content",
    },
};

class CorrespondenceClient {
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
        this.BASE_PATH = "/correspondence/api/v1/correspondence";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Forwards a correspondence to an email address.
     *
     * @param {string} correspondenceId Correspondence UUID.
     * @param {ForwardCorrespondenceRequestExt} request Forwarding payload.
     * Prefer using {@link ForwardCorrespondenceRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ForwardCorrespondence(correspondenceId, request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${encodeURIComponent(correspondenceId)}/forward`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/forward`,
                action: TAGS.ForwardCorrespondence.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Initialize correspondences.
     *
     * @param {InitializeCorrespondencesExt} body
     * Correspondence initialization payload.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeCorrespondence(body, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(body),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.InitializeCorrespondence.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
                accept: null,
            }),
        );
    }

    /**
     * Initializes correspondences and uploads new attachment data in one
     * multipart request.
     *
     * Do not set Content-Type here. k6 adds the multipart boundary when the
     * request body contains values created with http.file().
     *
     * @param {{[key: string]: string|import("k6/http").FileData}} formData Multipart form fields and attachment data.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadCorrespondences(formData, labels = null) {
        return http.post(
            `${this.FULL_PATH}/upload`,
            formData,
            requestParams({
                endpoint: `${this.FULL_PATH}/upload`,
                action: TAGS.UploadCorrespondences.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Gets a list of correspondences for the authenticated user.
     *
     * @param {CorrespondenceQuery|null} [query]
     * Optional query parameters.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCorrespondences(query = null, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetCorrespondences.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Deletes a correspondence.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    PurgeCorrespondence(correspondenceId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${correspondenceId}/purge`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/purge`,
                action: TAGS.PurgeCorrespondence.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Downloads a correspondence attachment.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {string} attachmentId
     * Attachment UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DownloadAttachment(correspondenceId, attachmentId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${correspondenceId}/attachment/${attachmentId}/download`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/attachment/{attachmentId}/download`,
                action: TAGS.DownloadAttachment.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Downloads all correspondence attachments as a zip file.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DownloadAllAttachments(correspondenceId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${correspondenceId}/attachments/downloadall`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/attachments/downloadall`,
                action: TAGS.DownloadAllAttachments.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Marks a correspondence as read.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    MarkAsRead(correspondenceId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${correspondenceId}/markasread`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/markasread`,
                action: TAGS.MarkAsRead.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Confirms a correspondence.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConfirmCorrespondence(correspondenceId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${correspondenceId}/confirm`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/confirm`,
                action: TAGS.ConfirmCorrespondence.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Gets correspondence overview information.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCorrespondence(correspondenceId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${correspondenceId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}`,
                action: TAGS.GetCorrespondence.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Gets detailed correspondence information.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCorrespondenceDetails(correspondenceId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${correspondenceId}/details`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/details`,
                action: TAGS.GetCorrespondenceDetails.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Gets the message body of a correspondence. This endpoint supports a
     * Dialogporten dialog token through the configured token generator.
     *
     * @param {string} correspondenceId Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetCorrespondenceContent(correspondenceId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${correspondenceId}/content`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{correspondenceId}/content`,
                action: TAGS.GetCorrespondenceContent.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: "text/plain",
            }),
        );
    }
}

export { CorrespondenceClient };
