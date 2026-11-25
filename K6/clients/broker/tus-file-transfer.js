import http from "k6/http";

import { requestParams } from "../common/request.js";

const TUS_VERSION = "1.0.0";

const TAGS = {
    GetUploadOptions: {
        action: "tus-get-upload-options",
    },
    CreatePartialUpload: {
        action: "tus-create-partial-upload",
    },
    GetUploadStatus: {
        action: "tus-get-upload-status",
    },
    UploadChunk: {
        action: "tus-upload-chunk",
    },
    DeleteUpload: {
        action: "tus-delete-upload",
    },
    GetPartialUploadStatus: {
        action: "tus-get-partial-upload-status",
    },
    UploadPartialChunk: {
        action: "tus-upload-partial-chunk",
    },
    DeletePartialUpload: {
        action: "tus-delete-partial-upload",
    },
};

/**
 * Client for the resumable (tus) upload endpoints of the Broker API.
 *
 * Docs {@link https://docs.altinn.studio/nb/api/broker/spec/}
 */
class TusFileTransferClient {
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
        this.BASE_PATH = "/broker/api/v1/filetransfer/upload/tus";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the tus protocol options for an upload.
     *
     * OPTIONS /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUploadOptions(fileTransferId, labels = null) {
        return http.options(
            `${this.FULL_PATH}/${fileTransferId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.GetUploadOptions.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                },
            }),
        );
    }

    /**
     * Creates an upload, optionally as a partial or concatenated upload.
     *
     * POST /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {number|null} [uploadLength] Total length of the upload in bytes.
     * @param {string|null} [uploadConcat] Tus concatenation header, e.g. "partial"
     * or "final;/url1 /url2".
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreatePartialUpload(
        fileTransferId,
        uploadLength = null,
        uploadConcat = null,
        labels = null,
    ) {
        return http.post(
            `${this.FULL_PATH}/${fileTransferId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.CreatePartialUpload.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                    "Upload-Length": uploadLength,
                    "Upload-Concat": uploadConcat,
                },
            }),
        );
    }

    /**
     * Gets the current offset of an upload.
     *
     * HEAD /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUploadStatus(fileTransferId, labels = null) {
        return http.request(
            "HEAD",
            `${this.FULL_PATH}/${fileTransferId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.GetUploadStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                },
            }),
        );
    }

    /**
     * Uploads a chunk at the given offset.
     *
     * PATCH /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {number} uploadOffset Offset in bytes the chunk starts at.
     * @param {*} body Chunk of binary file content.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadChunk(fileTransferId, uploadOffset, body, labels = null) {
        return http.patch(
            `${this.FULL_PATH}/${fileTransferId}`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.UploadChunk.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                    "Content-Type": "application/offset+octet-stream",
                    "Upload-Offset": uploadOffset,
                },
            }),
        );
    }

    /**
     * Deletes an upload.
     *
     * DELETE /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteUpload(fileTransferId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${fileTransferId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.DeleteUpload.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                },
            }),
        );
    }

    /**
     * Gets the current offset of a partial upload.
     *
     * HEAD /filetransfer/upload/tus/{fileTransferId}/partial/{partialUploadId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {string} partialUploadId Partial upload identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetPartialUploadStatus(fileTransferId, partialUploadId, labels = null) {
        return http.request(
            "HEAD",
            `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
                action: TAGS.GetPartialUploadStatus.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                },
            }),
        );
    }

    /**
     * Uploads a chunk of a partial upload at the given offset.
     *
     * PATCH /filetransfer/upload/tus/{fileTransferId}/partial/{partialUploadId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {string} partialUploadId Partial upload identifier.
     * @param {number} uploadOffset Offset in bytes the chunk starts at.
     * @param {*} body Chunk of binary file content.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadPartialChunk(
        fileTransferId,
        partialUploadId,
        uploadOffset,
        body,
        labels = null,
    ) {
        return http.patch(
            `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
                action: TAGS.UploadPartialChunk.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                    "Content-Type": "application/offset+octet-stream",
                    "Upload-Offset": uploadOffset,
                },
            }),
        );
    }

    /**
     * Deletes a partial upload.
     *
     * DELETE /filetransfer/upload/tus/{fileTransferId}/partial/{partialUploadId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {string} partialUploadId Partial upload identifier.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeletePartialUpload(fileTransferId, partialUploadId, labels = null) {
        return http.del(
            `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
                action: TAGS.DeletePartialUpload.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
                headers: {
                    "Tus-Resumable": TUS_VERSION,
                },
            }),
        );
    }
}

export { TusFileTransferClient };
