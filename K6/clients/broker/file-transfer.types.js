/**
 * A model containing the metadata for a file transfer.
 *
 * @typedef {object} FileTransferInitalizeExt
 * @property {string} fileName The filename including extension.
 * @property {string} resourceId The Altinn resource ID.
 * @property {string|null} sendersFileTransferReference External reference used by sender and receivers.
 * @property {string} sender Sender organization of the file.
 * @property {Array<string>} recipients Recipient organizations of the file transfer.
 * @property {{[key: string]: string}|null} propertyList User-defined properties related to the file.
 * @property {string|null} checksum MD5 checksum for file data.
 * @property {boolean|null} disableVirusScan Whether virus scan should be disabled.
 */

/**
 * Represents the response from initializing a file transfer.
 *
 * @typedef {object} FileTransferInitializeResponseExt
 * @property {string} fileTransferId The ID of the file transfer.
 */

/**
 * Represents the response from uploading a file transfer.
 *
 * @typedef {object} FileTransferUploadResponseExt
 * @property {string} fileTransferId The ID of the file transfer.
 */

/**
 * Query parameters for retrieving file transfers.
 *
 * @typedef {object} FileTransferQuery
 * @property {string} [resourceId] Filter by resource ID.
 * @property {FileTransferStatusExt} [status] Filter by file transfer status.
 * @property {RecipientFileTransferStatusExt} [recipientStatus] Filter by recipient status.
 * @property {string} [from] Filter start date/time.
 * @property {string} [to] Filter end date/time.
 * @property {boolean} [orderAscending] Sort order.
 * @property {RoleExt} [role] Filter by sender or recipient role.
 */

/**
 * Overview of a broker file transfer.
 *
 * @typedef {object} FileTransferOverviewExt
 * @property {string} fileTransferId File transfer UUID.
 * @property {string|null} resourceId Altinn resource ID.
 * @property {string|null} fileName Filename including extension.
 * @property {string|null} sendersFileTransferReference External sender reference.
 * @property {string|null} checksum MD5 checksum.
 * @property {boolean} useVirusScan Whether virus scan is enabled.
 * @property {number} fileTransferSize File size in bytes.
 * @property {FileTransferStatusExt} fileTransferStatus Current file transfer status.
 * @property {string|null} fileTransferStatusText Current status description.
 * @property {string} fileTransferStatusChanged Status change timestamp.
 * @property {string} created Creation timestamp.
 * @property {string} expirationTime Expiration timestamp.
 * @property {string|null} sender Sender of the file transfer.
 * @property {Array<RecipientFileTransferStatusDetailsExt>|null} recipients Recipients and their statuses.
 * @property {{[key: string]: string}|null} propertyList Custom properties.
 * @property {string|null} published Publication timestamp.
 */

/**
 * Detailed overview of a broker file transfer including history.
 *
 * @typedef {object} FileTransferStatusDetailsExt
 * @property {string} fileTransferId File transfer UUID.
 * @property {string|null} resourceId Altinn resource ID.
 * @property {string|null} fileName Filename including extension.
 * @property {string|null} sendersFileTransferReference External sender reference.
 * @property {string|null} checksum MD5 checksum.
 * @property {boolean} useVirusScan Whether virus scan is enabled.
 * @property {number} fileTransferSize File size in bytes.
 * @property {FileTransferStatusExt} fileTransferStatus Current file transfer status.
 * @property {string|null} fileTransferStatusText Current status description.
 * @property {string} fileTransferStatusChanged Status change timestamp.
 * @property {string} created Creation timestamp.
 * @property {string} expirationTime Expiration timestamp.
 * @property {string|null} sender Sender of the file transfer.
 * @property {Array<RecipientFileTransferStatusDetailsExt>|null} recipients Recipient statuses.
 * @property {{[key: string]: string}|null} propertyList Custom properties.
 * @property {Array<FileTransferStatusEventExt>|null} fileTransferStatusHistory File transfer status history.
 * @property {Array<RecipientFileTransferStatusEventExt>|null} recipientFileTransferStatusHistory Recipient status history.
 */

/**
 * Represents the current status of a file transfer for a specific recipient.
 *
 * @typedef {object} RecipientFileTransferStatusDetailsExt
 * @property {string|null} recipient Recipient organization.
 * @property {RecipientFileTransferStatusExt} currentRecipientFileTransferStatusCode Current recipient status.
 * @property {string|null} currentRecipientFileTransferStatusText Status description.
 * @property {string} currentRecipientFileTransferStatusChanged Status change timestamp.
 */

/**
 * Represents a file transfer status event.
 *
 * @typedef {object} FileTransferStatusEventExt
 * @property {FileTransferStatusExt} fileTransferStatus Status.
 * @property {string|null} fileTransferStatusText Status description.
 * @property {string} fileTransferStatusChanged Status timestamp.
 */

/**
 * Represents a recipient file transfer status event.
 *
 * @typedef {object} RecipientFileTransferStatusEventExt
 * @property {string|null} recipient Recipient organization.
 * @property {RecipientFileTransferStatusExt} recipientFileTransferStatusCode Recipient status.
 * @property {string|null} recipientFileTransferStatusText Status description.
 * @property {string} recipientFileTransferStatusChanged Status timestamp.
 */

/**
 * File transfer lifecycle status.
 *
 * @typedef {"Initialized"|"UploadStarted"|"UploadProcessing"|"Published"|"Cancelled"|"AllConfirmedDownloaded"|"Purged"|"Failed"} FileTransferStatusExt
 */

/**
 * Recipient file transfer status.
 *
 * @typedef {"Initialized"|"DownloadStarted"|"DownloadConfirmed"} RecipientFileTransferStatusExt
 */

/**
 * File transfer participant role.
 *
 * @typedef {"Recipient"|"Sender"} RoleExt
 */

export const FileTransferInitalizeExt = undefined;
export const FileTransferInitializeResponseExt = undefined;
export const FileTransferUploadResponseExt = undefined;
export const FileTransferQuery = undefined;
export const FileTransferOverviewExt = undefined;
export const FileTransferStatusDetailsExt = undefined;
export const RecipientFileTransferStatusDetailsExt = undefined;
export const FileTransferStatusEventExt = undefined;
export const RecipientFileTransferStatusEventExt = undefined;
export const FileTransferStatusExt = undefined;
export const RecipientFileTransferStatusExt = undefined;
export const RoleExt = undefined;
