import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../common/request.js";
import { FileTransferInitalizeExt, FileTransferQuery } from "./file-transfer.types.js";

const TAGS = {
    InitializeFileTransfer: {
        action: "initialize-file-transfer",
    },
    GetFileTransfers: {
        action: "get-file-transfers",
    },
    UploadFileTransfer: {
        action: "upload-file-transfer",
    },
    InitializeAndUploadFileTransfer: {
        action: "initialize-and-upload-file-transfer",
    },
    GetFileTransfer: {
        action: "get-file-transfer",
    },
    GetFileTransferDetails: {
        action: "get-file-transfer-details",
    },
    DownloadFileTransfer: {
        action: "download-file-transfer",
    },
    ConfirmDownload: {
        action: "confirm-download",
    },
};

class FileTransferClient {
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
        this.BASE_PATH = "/broker/api/v1/filetransfer";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Initializes a file transfer.
     *
     * POST /filetransfer
     *
     * @param {FileTransferInitalizeExt} body File transfer metadata.
     * Prefer using {@link FileTransferInitializeRequestBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeFileTransfer(body, labels = null) {
        return http.post(
            this.FULL_PATH,
            jsonBody(body),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.InitializeFileTransfer.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets file transfers matching the specified filters.
     *
     * GET /filetransfer
     *
     * @param {FileTransferQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link FileTransferQueryBuilder}.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransfers(query = null, labels = null) {
        return http.get(
            buildUrl(this.FULL_PATH, query),
            requestParams({
                endpoint: this.FULL_PATH,
                action: TAGS.GetFileTransfers.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Uploads a file to an initialized file transfer.
     *
     * POST /filetransfer/{fileTransferId}/upload
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {*} body Binary file content.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadFileTransfer(fileTransferId, body, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${fileTransferId}/upload`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/upload`,
                action: TAGS.UploadFileTransfer.action,
                labels,
                token: this.tokenGenerator.getToken(),
                headers: { "Content-Type": "application/octet-stream" },
            }),
        );
    }

    /**
     * Initializes a file transfer and uploads its file in one request.
     *
     * POST /filetransfer/upload
     *
     * Recipient lists are expanded to indexed form field names, since a k6
     * multipart body cannot repeat a field name. The body is left as an object
     * so that k6 encodes it as multipart/form-data.
     *
     * @param {{[key: string]: *}} metadata Metadata form fields, e.g.
     * "Metadata.FileName", "Metadata.ResourceId", "Metadata.Sender" and
     * "Metadata.Recipients".
     * @param {*} file File part, as returned by http.file().
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeAndUploadFileTransfer(metadata, file, labels = null) {
        // The metadata is flattened onto the multipart body by name, so the body
        // is read through an index signature rather than a fixed shape.
        const body = /** @type {http.StructuredRequestBody} */ ({ FileTransfer: file });

        for (const [key, value] of Object.entries(metadata)) {
            if (value === undefined || value === null) {
                continue;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    body[`${key}[${index}]`] = item;
                });

                continue;
            }

            body[key] = value;
        }

        return http.post(
            `${this.FULL_PATH}/upload`,
            body,
            requestParams({
                endpoint: `${this.FULL_PATH}/upload`,
                action: TAGS.InitializeAndUploadFileTransfer.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets information about a file transfer.
     *
     * GET /filetransfer/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransfer(fileTransferId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${fileTransferId}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}`,
                action: TAGS.GetFileTransfer.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets detailed information and status history for a file transfer.
     *
     * GET /filetransfer/{fileTransferId}/details
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransferDetails(fileTransferId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${fileTransferId}/details`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/details`,
                action: TAGS.GetFileTransferDetails.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Downloads the file from a file transfer.
     *
     * GET /filetransfer/{fileTransferId}/download
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DownloadFileTransfer(fileTransferId, labels = null) {
        return http.get(
            `${this.FULL_PATH}/${fileTransferId}/download`,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/download`,
                action: TAGS.DownloadFileTransfer.action,
                labels,
                token: this.tokenGenerator.getToken(),
                accept: null,
            }),
        );
    }

    /**
     * Confirms that a recipient has downloaded a file transfer.
     *
     * POST /filetransfer/{fileTransferId}/confirmdownload
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConfirmDownload(fileTransferId, labels = null) {
        return http.post(
            `${this.FULL_PATH}/${fileTransferId}/confirmdownload`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/{fileTransferId}/confirmdownload`,
                action: TAGS.ConfirmDownload.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { FileTransferClient };
