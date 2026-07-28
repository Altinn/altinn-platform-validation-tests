import http from "k6/http";

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
     * @param {FileTransferInitalizeExt} body File transfer metadata.
     * Prefer using {@link FileTransferInitializeRequestBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    InitializeFileTransfer(body, labels = null) {
        const token = this.tokenGenerator.getToken();

        return this.#post(
            this.FULL_PATH,
            body,
            TAGS.InitializeFileTransfer.action,
            labels,
        );
    }

    /**
     * Gets file transfers matching the specified filters.
     *
     * @param {FileTransferQuery|null} [query]
     * Optional query parameters. Prefer using
     * {@link FileTransferQueryBuilder}.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetFileTransfers(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(this.FULL_PATH);

        this.#appendQueryParameters(url, query);

        return http.get(url.toString(), {
            tags: this.#getTags(
                TAGS.GetFileTransfers.action,
                labels,
            ),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Uploads a file to an initialized file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {*} body Binary file content.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UploadFileTransfer(fileTransferId, body, labels = null) {
        return this.#post(
            `${this.FULL_PATH}/${fileTransferId}/upload`,
            body,
            TAGS.UploadFileTransfer.action,
            labels,
            "/{fileTransferId}/upload",
            { "Content-Type": "application/octet-stream" },
        );
    }

    /**
     * Initializes a file transfer and uploads its file in one request.
     *
     * POST /filetransfer/upload
     *
     * Recipient lists are expanded to indexed form field names, since a k6
     * multipart body cannot repeat a field name.
     *
     * @param {{[key: string]: *}} metadata Metadata form fields, e.g.
     * "Metadata.FileName", "Metadata.ResourceId", "Metadata.Sender" and
     * "Metadata.Recipients".
     * @param {*} file File part, as returned by http.file().
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    InitializeAndUploadFileTransfer(metadata, file, labels = null) {
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

        return this.#post(
            `${this.FULL_PATH}/upload`,
            body,
            TAGS.InitializeAndUploadFileTransfer.action,
            labels,
            "/upload",
        );
    }

    /**
     * Gets information about a file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}`;

        return http.get(
            url,
            {
                tags: this.#getTags(
                    TAGS.GetFileTransfer.action,
                    labels,
                    "/{fileTransferId}",
                    url,
                ),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Gets detailed information and status history for a file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetFileTransferDetails(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/details`;

        return http.get(
            url,
            {
                tags: this.#getTags(
                    TAGS.GetFileTransferDetails.action,
                    labels,
                    "/{fileTransferId}/details",
                    url,
                ),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Downloads the file from a file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DownloadFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/download`;

        return http.get(
            url,
            {
                tags: this.#getTags(
                    TAGS.DownloadFileTransfer.action,
                    labels,
                    "/{fileTransferId}/download",
                    url,
                ),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Confirms that a recipient has downloaded a file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ConfirmDownload(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${fileTransferId}/confirmdownload`;

        return http.post(
            url,
            null,
            {
                tags: this.#getTags(
                    TAGS.ConfirmDownload.action,
                    labels,
                    "/{fileTransferId}/confirmdownload",
                    url,
                ),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Performs a POST request with bearer authentication.
     *
     * @param {string} url Fully-qualified request URL.
     * @param {*} body Request body.
     * @param {string} action Action tag.
     * @param {{[key: string]: string}|null} labels Optional k6 request labels.
     * @param {string} [template] Templated path, appended to the base path.
     * @param {{[key: string]: string}} [headers] Additional request headers.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     * @private
     */
    #post(url, body, action, labels, template = "", headers = {}) {
        const token = this.tokenGenerator.getToken();

        return http.post(
            url,
            body,
            {
                tags: this.#getTags(action, labels, template, url),
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    ...headers,
                },
            },
        );
    }

    /**
     * Adds query parameters to a URL.
     *
     * @param {URL} url URL to add the parameters to.
     * @param {{[key: string]: *}|null} query Query parameters.
     * @private
     */
    #appendQueryParameters(url, query) {
        if (query === null) {
            return;
        }

        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null) {
                continue;
            }

            if (Array.isArray(value)) {
                value.forEach((v) => url.searchParams.append(key, v));
            } else {
                url.searchParams.append(key, value);
            }
        }
    }

    /**
     * Creates k6 tags for a request.
     *
     * @param {string} action Action tag.
     * @param {{[key: string]: string}|null} labels Optional k6 request labels.
     * @param {string} [template] Templated path, appended to the base path.
     * @param {string} [url] Fully-qualified request URL.
     * @returns {{[key: string]: string}} Request tags.
     * @private
     */
    #getTags(action, labels, template = "", url = null) {
        let tags = {
            endpoint: url ?? this.FULL_PATH,
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
}

export { FileTransferClient };
