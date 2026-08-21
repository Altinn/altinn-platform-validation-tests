import http from "k6/http";

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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeFileTransfer(body, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = this.FULL_PATH;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.InitializeFileTransfer.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify(body), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Gets file transfers matching the specified filters.
     *
     * GET /filetransfer
     *
     * @param {FileTransferQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link FileTransferQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransfers(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(this.FULL_PATH);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === undefined || value === null) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, String(v)));
                } else {
                    url.searchParams.append(key, String(value));
                }
            }
        }

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetFileTransfers.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Uploads a file to an initialized file transfer.
     *
     * POST /filetransfer/{fileTransferId}/upload
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {*} body Binary file content.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UploadFileTransfer(fileTransferId, body, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/upload`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/upload`,
            name: `${this.FULL_PATH}/{fileTransferId}/upload`,
            action: TAGS.UploadFileTransfer.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, body, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/octet-stream",
            },
        });
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
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    InitializeAndUploadFileTransfer(metadata, file, labels = null) {
        const token = this.tokenGenerator.getToken();

        const body = { FileTransfer: file };

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

        const url = `${this.FULL_PATH}/upload`;

        let tags = {
            endpoint: `${this.FULL_PATH}/upload`,
            name: `${this.FULL_PATH}/upload`,
            action: TAGS.InitializeAndUploadFileTransfer.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, body, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets information about a file transfer.
     *
     * GET /filetransfer/{fileTransferId}
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}`,
            name: `${this.FULL_PATH}/{fileTransferId}`,
            action: TAGS.GetFileTransfer.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets detailed information and status history for a file transfer.
     *
     * GET /filetransfer/{fileTransferId}/details
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFileTransferDetails(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/details`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/details`,
            name: `${this.FULL_PATH}/{fileTransferId}/details`,
            action: TAGS.GetFileTransferDetails.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }

    /**
     * Downloads the file from a file transfer.
     *
     * GET /filetransfer/{fileTransferId}/download
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DownloadFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/download`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/download`,
            name: `${this.FULL_PATH}/{fileTransferId}/download`,
            action: TAGS.DownloadFileTransfer.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Confirms that a recipient has downloaded a file transfer.
     *
     * POST /filetransfer/{fileTransferId}/confirmdownload
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    ConfirmDownload(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/confirmdownload`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{fileTransferId}/confirmdownload`,
            name: `${this.FULL_PATH}/{fileTransferId}/confirmdownload`,
            action: TAGS.ConfirmDownload.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    }
}

export { FileTransferClient };
