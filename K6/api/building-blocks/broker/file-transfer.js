import { check } from "k6";

import { FileTransferInitalizeExt, FileTransferInitializeResponseExt, FileTransferOverviewExt, FileTransferQuery, FileTransferStatusDetailsExt, FileTransferUploadResponseExt } from "../../../clients/broker/file-transfer.types.js";
import { FileTransferClient } from "../../../clients/broker/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Initializes a file transfer.
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {FileTransferInitalizeExt} request File transfer metadata.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {FileTransferInitializeResponseExt|null} Parsed response body, or null when the call failed.
 */
export function InitializeFileTransfer(
    fileTransferClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.InitializeFileTransfer(
            request,
            labels,
        ),
        "InitializeFileTransfer",
    );

    /** @type {FileTransferInitializeResponseExt|null} */
    let fileTransfer = null;

    const succeed = check(res, {
        "InitializeFileTransfer - status code is 200": (r) =>
            r.status === 200,
        "InitializeFileTransfer - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return fileTransfer;
    }

    check(res, {
        "InitializeFileTransfer - body is valid": (r) => {
            try {
                fileTransfer = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return fileTransfer;
}

/**
 * Gets file transfer overview.
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {string} fileTransferId File transfer UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {FileTransferOverviewExt|null} Parsed response body, or null when the call failed.
 */
export function GetFileTransfer(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.GetFileTransfer(
            fileTransferId,
            labels,
        ),
        "GetFileTransfer",
    );

    /** @type {FileTransferOverviewExt|null} */
    let fileTransfer = null;

    const succeed = check(res, {
        "GetFileTransfer - status code is 200": (r) =>
            r.status === 200,
        "GetFileTransfer - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return fileTransfer;
    }

    check(res, {
        "GetFileTransfer - body is valid": (r) => {
            try {
                fileTransfer = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return fileTransfer;
}

/**
 * Gets detailed file transfer information.
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {string} fileTransferId File transfer UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {FileTransferStatusDetailsExt|null} Parsed response body, or null when the call failed.
 */
export function GetFileTransferDetails(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.GetFileTransferDetails(
            fileTransferId,
            labels,
        ),
        "GetFileTransferDetails",
    );

    /** @type {FileTransferStatusDetailsExt|null} */
    let details = null;

    const succeed = check(res, {
        "GetFileTransferDetails - status code is 200": (r) =>
            r.status === 200,
        "GetFileTransferDetails - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return details;
    }

    check(res, {
        "GetFileTransferDetails - body is valid": (r) => {
            try {
                details = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return details;
}

/**
 * Gets available file transfers.
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {FileTransferQuery|null} queryParams TODO: Description
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {Array<string>} Parsed response body, or null when the call failed.
 */
export function GetFileTransfers(
    fileTransferClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.GetFileTransfers(
            queryParams,
            labels,
        ),
        "GetFileTransfers",
    );

    /** @type {Array<string>} */
    let fileTransferIds = [];

    const succeed = check(res, {
        "GetFileTransfers - status code is 200": (r) =>
            r.status === 200,
        "GetFileTransfers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return fileTransferIds;
    }

    check(res, {
        "GetFileTransfers - body is valid": (r) => {
            try {
                fileTransferIds = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return fileTransferIds;
}

/**
 * Confirms that a file transfer has been downloaded.
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {string} fileTransferId File transfer UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Parsed response body, or null when the call failed.
 */
export function ConfirmDownload(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.ConfirmDownload(
            fileTransferId,
            labels,
        ),
        "ConfirmDownload",
    );

    return check(res, {
        "ConfirmDownload - status code is 204": (r) =>
            r.status === 204,
    });
}

/**
 * Uploads the file of an initialized file transfer.
 *
 * POST /broker/api/v1/filetransfer/{fileTransferId}/upload
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {string} fileTransferId File transfer UUID.
 * @param {*} body Binary file content.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {FileTransferUploadResponseExt|null} Parsed response body, or null when the call failed.
 */
export function UploadFileTransfer(
    fileTransferClient,
    fileTransferId,
    body,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.UploadFileTransfer(
            fileTransferId,
            body,
            labels,
        ),
        "UploadFileTransfer",
    );

    /** @type {FileTransferUploadResponseExt|null} */
    let upload = null;

    const succeed = check(res, {
        "UploadFileTransfer - status code is 200": (r) => r.status === 200,
        "UploadFileTransfer - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return upload;
    }

    check(res, {
        "UploadFileTransfer - body is valid": (r) => {
            try {
                upload = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return upload;
}

/**
 * Downloads the file of a file transfer.
 *
 * GET /broker/api/v1/filetransfer/{fileTransferId}/download
 *
 * @param {FileTransferClient} fileTransferClient Client for the File Transfer API.
 * @param {string} fileTransferId File transfer UUID.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">} The HTTP response. The body is the file
 * content, so the response is returned rather than a boolean.
 */
export function DownloadFileTransfer(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = withRetries(
        () => fileTransferClient.DownloadFileTransfer(
            fileTransferId,
            labels,
        ),
        "DownloadFileTransfer",
    );

    const succeed = check(res, {
        "DownloadFileTransfer - status code is 200": (r) => r.status === 200,
        "DownloadFileTransfer - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return res;
}
