import http from "k6/http";

const TAGS = {
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
     * Initialize correspondences.
     *
     * @param {InitializeCorrespondencesExt} body
     * Correspondence initialization payload.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    InitializeCorrespondence(body, labels = null) {
        const token = this.tokenGenerator.getToken();

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.InitializeCorrespondence.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            this.FULL_PATH,
            JSON.stringify(body),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    /**
     * Initializes correspondences and uploads new attachment data in one
     * multipart request.
     *
     * Do not set Content-Type here. k6 adds the multipart boundary when the
     * request body contains values created with http.file().
     *
     * @param {object} formData Multipart form fields and attachment data.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    UploadCorrespondences(formData, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/upload`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/upload`,
            action: TAGS.UploadCorrespondences.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            formData,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Gets a list of correspondences for the authenticated user.
     *
     * @param {CorrespondencesQuery|null} [query]
     * Optional query parameters.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetCorrespondences(query = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(this.FULL_PATH);

        if (query !== null) {
            for (const [key, value] of Object.entries(query)) {
                if (value === null || value === undefined) {
                    continue;
                }

                if (Array.isArray(value)) {
                    value.forEach((v) => url.searchParams.append(key, v));
                } else {
                    url.searchParams.append(key, value);
                }
            }
        }

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.GetCorrespondences.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url.toString(),
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Deletes a correspondence.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    PurgeCorrespondence(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = `${this.FULL_PATH}/${correspondenceId}/purge`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/purge`,
            action: TAGS.PurgeCorrespondence.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.del(
            url,
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
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
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DownloadAttachment(correspondenceId, attachmentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}/attachment/${attachmentId}/download`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/attachment/{attachmentId}/download`,
            action: TAGS.DownloadAttachment.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Downloads all correspondence attachments as a zip file.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    DownloadAllAttachments(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}/attachments/downloadall`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/attachments/downloadall`,
            action: TAGS.DownloadAllAttachments.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Marks a correspondence as read.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    MarkAsRead(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}/markasread`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/markasread`,
            action: TAGS.MarkAsRead.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Confirms a correspondence.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    ConfirmCorrespondence(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}/confirm`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/confirm`,
            action: TAGS.ConfirmCorrespondence.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(
            url,
            null,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Gets correspondence overview information.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetCorrespondence(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}`,
            action: TAGS.GetCorrespondence.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Gets detailed correspondence information.
     *
     * @param {string} correspondenceId
     * Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetCorrespondenceDetails(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url =
            `${this.FULL_PATH}/${correspondenceId}/details`;

        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/{correspondenceId}/details`,
            action: TAGS.GetCorrespondenceDetails.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    /**
     * Gets the message body of a correspondence. This endpoint supports a
     * Dialogporten dialog token through the configured token generator.
     *
     * @param {string} correspondenceId Correspondence UUID.
     * @param {{[key:string]: string}|null} [labels]
     * Optional k6 request tags.
     * @returns {http.RefinedResponse} Exposes body with best possible type.
     */
    GetCorrespondenceContent(correspondenceId, labels = null) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/${correspondenceId}/content`;

        let tags = {
            endpoint: `${this.FULL_PATH}/{correspondenceId}/content`,
            name: `${this.FULL_PATH}/{correspondenceId}/content`,
            action: TAGS.GetCorrespondenceContent.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(
            url,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "text/plain",
                },
            },
        );
    }
}

export { CorrespondenceClient };
