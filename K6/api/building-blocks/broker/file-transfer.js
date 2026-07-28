import { check } from "k6";

import { FileTransferClient } from "../../../../clients/broker/index.js";

/**
 * Initializes a file transfer.
 *
 * @param {FileTransferClient} fileTransferClient TODO: Description
 * @param {FileTransferInitializeRequest} request TODO: Description
 * @param {{[key:string]:string}} [labels] TODO: Description
 * @returns {FileTransferInitializeResponse|null} TODO: Description
 */
export function InitializeFileTransfer(
    fileTransferClient,
    request,
    labels = null,
) {
    const res = fileTransferClient.InitializeFileTransfer(
        request,
        labels,
    );

    /** @type {FileTransferInitializeResponse|null} */
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
 * @param {FileTransferClient} fileTransferClient TODO: Description
 * @param {string} fileTransferId TODO: Description
 * @param {{[key:string]:string}} [labels] TODO: Description
 * @returns {FileTransferOverview|null} TODO: Description
 */
export function GetFileTransfer(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = fileTransferClient.GetFileTransfer(
        fileTransferId,
        labels,
    );

    /** @type {FileTransferOverview|null} */
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
 * @param {FileTransferClient} fileTransferClient TODO: Description
 * @param {string} fileTransferId TODO: Description
 * @param {{[key:string]:string}} [labels] TODO: Description
 * @returns {FileTransferStatusDetails|null} TODO: Description
 */
export function GetFileTransferDetails(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = fileTransferClient.GetFileTransferDetails(
        fileTransferId,
        labels,
    );

    /** @type {FileTransferStatusDetails|null} */
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
 * @param {FileTransferClient} fileTransferClient TODO: Description
 * @param {FileTransferQuery|null} queryParams TODO: Description
 * @param {{[key:string]:string}} [labels] TODO: Description
 * @returns {Array<string>} TODO: Description
 */
export function GetFileTransfers(
    fileTransferClient,
    queryParams = null,
    labels = null,
) {
    const res = fileTransferClient.GetFileTransfers(
        queryParams,
        labels,
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
 * @param {FileTransferClient} fileTransferClient TODO: Description
 * @param {string} fileTransferId TODO: Description
 * @param {{[key:string]:string}} [labels] TODO: Description
 * @returns {boolean} TODO: Description
 */
export function ConfirmDownload(
    fileTransferClient,
    fileTransferId,
    labels = null,
) {
    const res = fileTransferClient.ConfirmDownload(
        fileTransferId,
        labels,
    );

    return check(res, {
        "ConfirmDownload - status code is 204": (r) =>
            r.status === 204,
    });
}
