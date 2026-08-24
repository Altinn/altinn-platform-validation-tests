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
     * Gets the tus protocol options for an upload.
     *
     * OPTIONS /filetransfer/upload/tus/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUploadOptions(fileTransferId, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.GetUploadOptions.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        return http.options(url, null, {
            tags,
            headers,
        });
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
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.CreatePartialUpload.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        if (uploadLength !== null) {
            headers["Upload-Length"] = `${uploadLength}`;
        }

        if (uploadConcat !== null) {
            headers["Upload-Concat"] = `${uploadConcat}`;
        }

        return http.post(url, null, {
            tags,
            headers,
        });
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
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.GetUploadStatus.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        return http.request("HEAD", url, null, {
            tags,
            headers,
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
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadChunk(fileTransferId, uploadOffset, body, labels = null) {
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.UploadChunk.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
            "Content-Type": "application/offset+octet-stream",
            "Upload-Offset": `${uploadOffset}`,
        };

        return http.patch(url, body, {
            tags,
            headers,
        });
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
        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.DeleteUpload.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        return http.del(url, null, {
            tags,
            headers,
        });
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
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            name: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            action: TAGS.GetPartialUploadStatus.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        return http.request("HEAD", url, null, {
            tags,
            headers,
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
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            name: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            action: TAGS.UploadPartialChunk.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
            "Content-Type": "application/offset+octet-stream",
            "Upload-Offset": `${uploadOffset}`,
        };

        return http.patch(url, body, {
            tags,
            headers,
        });
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
        const url = `${this.FULL_PATH}/${fileTransferId}/partial/${partialUploadId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            name: `${this.FULL_PATH}/{fileTransferId}/partial/{partialUploadId}`,
            action: TAGS.DeletePartialUpload.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        const headers = {
            Authorization: `Bearer ${this.tokenGenerator.getToken()}`,
            "Tus-Resumable": TUS_VERSION,
        };

        return http.del(url, null, {
            tags,
            headers,
        });
    }
}

export { TusFileTransferClient };
