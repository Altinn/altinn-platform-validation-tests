import http from "k6/http";

import { jsonBody, requestParams } from "../common/request.js";
import {
    InitializeAttachmentExt,
} from "./attachment.types.js";

const TAGS = {
    InitializeAttachment: { action: "initialize-attachment" },
    UploadAttachment: { action: "upload-attachment" },
    GetAttachment: { action: "get-attachment" },
    DeleteAttachment: { action: "delete-attachment" },
    GetAttachmentDetails: { action: "get-attachment-details" },
    DownloadAttachment: { action: "download-attachment" },
};

class AttachmentClient {
    /**
     * Creates a client for the Correspondence Attachment API.
     *
     * @param {string} baseUrl API base URL.
     * @param {*} tokenGenerator Token generator used for authenticated API calls.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates bearer tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/correspondence/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    /**
     * Default request tags.
     *
     * @returns {typeof TAGS} The built payload.
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Initializes a shared attachment.
     *
     * @param {InitializeAttachmentExt} request See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeAttachment(request, labels = null) {
        return http.post(
            `${this.FULL_PATH}/attachment`,
            jsonBody(request),
            requestParams({
                endpoint: `${this.FULL_PATH}/attachment`,
                action: TAGS.InitializeAttachment.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Uploads attachment data.
     *
     * @param {string} attachmentId See the client method.
     * @param {*} fileData Binary payload (ArrayBuffer, http.file(), string, etc.)
     * @param {string} [contentType] See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadAttachment(
        attachmentId,
        fileData,
        contentType = "application/octet-stream",
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}/attachment/${attachmentId}/upload`,
            fileData,
            requestParams({
                endpoint: `${this.FULL_PATH}/attachment/{attachmentId}/upload`,
                action: TAGS.UploadAttachment.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Content-Type": contentType,
                },
            }),
        );
    }

    /**
     * Gets attachment metadata.
     *
     * @param {string} attachmentId See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAttachment(attachmentId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/attachment/${attachmentId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/attachment/{attachmentId}`,
                action: TAGS.GetAttachment.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Deletes an attachment.
     *
     * @param {string} attachmentId See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteAttachment(attachmentId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/attachment/${attachmentId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/attachment/{attachmentId}`,
                action: TAGS.DeleteAttachment.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets detailed attachment metadata.
     *
     * @param {string} attachmentId See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetAttachmentDetails(attachmentId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/attachment/${attachmentId}/details`,
            requestParams({
                endpoint: `${this.FULL_PATH}/attachment/{attachmentId}/details`,
                action: TAGS.GetAttachmentDetails.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Downloads attachment data.
     *
     * @param {string} attachmentId See the client method.
     * @param {{[key:string]:string}|null} labels See the client method.
     * @returns {http.RefinedResponse<"binary">} Exposes the attachment bytes.
     */
    DownloadAttachment(attachmentId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/attachment/${attachmentId}/download`,
            {
                ...requestParams({
                    endpoint: `${this.FULL_PATH}/attachment/{attachmentId}/download`,
                    action: TAGS.DownloadAttachment.action,
                    labels,
                    token: this.tokenGenerator.getToken(),
                }),
                responseType: "binary",
            },
        );
    }
}

export { AttachmentClient };
