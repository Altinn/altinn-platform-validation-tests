import http from "k6/http";

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
     * Creates k6 tags for a request.
     *
     * @param {string} action Action tag.
     * @param {string} template Templated path, without host information.
     * @param {string} url Fully-qualified request URL.
     * @param {{[key: string]: string}|null} labels Optional k6 request labels.
     * @returns {{[key: string]: string}} Request tags.
     */
    #getTags(action, template, url, labels) {
        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}${template}`,
            action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return tags;
    }

    /**
     * Builds the request headers, including the mandatory tus version header.
     *
     * @param {{[key: string]: string|number}} [extra] Additional headers.
     * Null and undefined values are skipped.
     * @returns {{[key: string]: string}} Request headers.
     */
    #getHeaders(extra = {}) {
        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        for (const [key, value] of Object.entries(extra)) {
            if (value === undefined || value === null) {
                continue;
            }

            headers[key] = `${value}`;
        }

        return headers;
    }

    /**
     * Gets the tus protocol options for an upload.
     *
     * OPTIONS /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetUploadOptions(fileTransferId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.options(url, null, {
            tags: this.#getTags(
                TAGS.GetUploadOptions.action,
                "/{fileTransferId}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Creates an upload, optionally as a partial or concatenated upload.
     *
     * POST /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {number} [uploadLength] Total length of the upload in bytes.
     * @param {string} [uploadConcat] Tus concatenation header, e.g. "partial"
     * or "final;/url1 /url2".
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    CreatePartialUpload(
        fileTransferId,
        uploadLength = null,
        uploadConcat = null,
        labels = null,
    ) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.post(url, null, {
            tags: this.#getTags(
                TAGS.CreatePartialUpload.action,
                "/{fileTransferId}",
                url,
                labels,
            ),
            headers: this.#getHeaders({
                "Upload-Length": uploadLength,
                "Upload-Concat": uploadConcat,
            }),
        });
    }

    /**
     * Gets the current offset of an upload.
     *
     * HEAD /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetUploadStatus(fileTransferId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.request("HEAD", url, null, {
            tags: this.#getTags(
                TAGS.GetUploadStatus.action,
                "/{fileTransferId}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Uploads a chunk at the given offset.
     *
     * PATCH /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {number} uploadOffset Offset in bytes the chunk starts at.
     * @param {*} body Chunk of binary file content.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UploadChunk(fileTransferId, uploadOffset, body, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.patch(url, body, {
            tags: this.#getTags(
                TAGS.UploadChunk.action,
                "/{fileTransferId}",
                url,
                labels,
            ),
            headers: this.#getHeaders({
                "Upload-Offset": uploadOffset,
                "Content-Type": "application/offset+octet-stream",
            }),
        });
    }

    /**
     * Deletes an upload.
     *
     * DELETE /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeleteUpload(fileTransferId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.del(url, null, {
            tags: this.#getTags(
                TAGS.DeleteUpload.action,
                "/{fileTransferId}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }

    /**
     * Gets the current offset of a partial upload.
     *
     * HEAD /filetransfer/upload/tus/{fileTransferId}/partial/{partialUploadId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {string} partialUploadId Partial upload identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetPartialUploadStatus(fileTransferId, partialUploadId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        return http.request("HEAD", url, null, {
            tags: this.#getTags(
                TAGS.GetPartialUploadStatus.action,
                "/{fileTransferId}/partial/{partialUploadId}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UploadPartialChunk(
        fileTransferId,
        partialUploadId,
        uploadOffset,
        body,
        labels = null,
    ) {
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        return http.patch(url, body, {
            tags: this.#getTags(
                TAGS.UploadPartialChunk.action,
                "/{fileTransferId}/partial/{partialUploadId}",
                url,
                labels,
            ),
            headers: this.#getHeaders({
                "Upload-Offset": uploadOffset,
                "Content-Type": "application/offset+octet-stream",
            }),
        });
    }

    /**
     * Deletes a partial upload.
     *
     * DELETE /filetransfer/upload/tus/{fileTransferId}/partial/{partialUploadId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {string} partialUploadId Partial upload identifier.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DeletePartialUpload(fileTransferId, partialUploadId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        return http.del(url, null, {
            tags: this.#getTags(
                TAGS.DeletePartialUpload.action,
                "/{fileTransferId}/partial/{partialUploadId}",
                url,
                labels,
            ),
            headers: this.#getHeaders(),
        });
    }
}

export { TusFileTransferClient };
