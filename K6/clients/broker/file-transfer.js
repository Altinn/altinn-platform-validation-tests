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
     * @returns {http.RefinedResponse}
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
     * @returns {http.RefinedResponse}
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
     * @returns {http.RefinedResponse}
     */
    UploadFileTransfer(fileTransferId, body, labels = null) {
        return this.#post(
            `${this.FULL_PATH}/${fileTransferId}/upload`,
            body,
            TAGS.UploadFileTransfer.action,
            labels,
        );
    }

    /**
     * Gets information about a file transfer.
     *
     * @param {string} fileTransferId File transfer UUID.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse}
     */
    GetFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        return http.get(
            `${this.FULL_PATH}/${fileTransferId}`,
            {
                tags: this.#getTags(
                    TAGS.GetFileTransfer.action,
                    labels,
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
     * @returns {http.RefinedResponse}
     */
    GetFileTransferDetails(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        return http.get(
            `${this.FULL_PATH}/${fileTransferId}/details`,
            {
                tags: this.#getTags(
                    TAGS.GetFileTransferDetails.action,
                    labels,
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
     * @returns {http.RefinedResponse}
     */
    DownloadFileTransfer(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        return http.get(
            `${this.FULL_PATH}/${fileTransferId}/download`,
            {
                tags: this.#getTags(
                    TAGS.DownloadFileTransfer.action,
                    labels,
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
     * @returns {http.RefinedResponse}
     */
    ConfirmDownload(fileTransferId, labels = null) {
        const token = this.tokenGenerator.getToken();

        return http.post(
            `${this.FULL_PATH}/${fileTransferId}/confirmdownload`,
            null,
            {
                tags: this.#getTags(
                    TAGS.ConfirmDownload.action,
                    labels,
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
     * @private
     */
    #post(url, body, action, labels) {
        const token = this.tokenGenerator.getToken();

        return http.post(
            url,
            body,
            {
                tags: this.#getTags(action, labels),
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Adds query parameters to a URL.
     *
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
     * @private
     */
    #getTags(action, labels) {
        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
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
