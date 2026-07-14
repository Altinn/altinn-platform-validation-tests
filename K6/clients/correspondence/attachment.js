import http from "k6/http";

import {
    InitializeAttachmentExt,
    AttachmentOverviewExt,
    AttachmentDetailsExt,
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
     * @returns {object}
     */
    static get TAGS() {
        return TAGS;
    }

    /**
     * Initializes a shared attachment.
     *
     * @param {InitializeAttachmentExt} request
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    InitializeAttachment(request, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(`${this.FULL_PATH}/attachment`);

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.InitializeAttachment.action,
        };

        return http.post(
            url.toString(),
            JSON.stringify(request),
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
     * Uploads attachment data.
     *
     * @param {string} attachmentId
     * @param {*} fileData Binary payload (ArrayBuffer, http.file(), string, etc.)
     * @param {string} [contentType]
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    UploadAttachment(
        attachmentId,
        fileData,
        contentType = "application/octet-stream",
        labels = null,
    ) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/attachment/${attachmentId}/upload`,
        );

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.UploadAttachment.action,
        };

        return http.post(
            url.toString(),
            fileData,
            {
                tags,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": contentType,
                },
            },
        );
    }

    /**
     * Gets attachment metadata.
     *
     * @param {string} attachmentId
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    GetAttachment(attachmentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/attachment/${attachmentId}`,
        );

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetAttachment.action,
        };

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Deletes an attachment.
     *
     * @param {string} attachmentId
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    DeleteAttachment(attachmentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/attachment/${attachmentId}`,
        );

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.DeleteAttachment.action,
        };

        return http.del(url.toString(), null, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Gets detailed attachment metadata.
     *
     * @param {string} attachmentId
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    GetAttachmentDetails(attachmentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/attachment/${attachmentId}/details`,
        );

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.GetAttachmentDetails.action,
        };

        return http.get(url.toString(), {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Downloads attachment data.
     *
     * @param {string} attachmentId
     * @param {{[key:string]:string}|null} labels
     * @returns {http.RefinedResponse}
     */
    DownloadAttachment(attachmentId, labels = null) {
        const token = this.tokenGenerator.getToken();

        const url = new URL(
            `${this.FULL_PATH}/attachment/${attachmentId}/download`,
        );

        const tags = {
            ...labels,
            endpoint: url.toString(),
            name: url.toString(),
            action: TAGS.DownloadAttachment.action,
        };

        return http.get(url.toString(), {
            tags,
            responseType: "binary",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export { AttachmentClient };
