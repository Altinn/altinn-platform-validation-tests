/**
 * Request used to initialize a shared attachment.
 *
 * @typedef {object} InitializeAttachmentExt
 * @property {string|null} [fileName] Name of the attachment file.
 * @property {string|null} [displayName] Display name shown in Altinn Inbox.
 * @property {boolean} isEncrypted Whether the attachment is encrypted.
 * @property {string|null} [checksum] MD5 checksum of the file.
 * @property {string} sendersReference Sender-defined attachment reference.
 * @property {number|null} [expirationInDays] Relative expiration time in days.
 * @property {string} resourceId Correspondence service resource identifier.
 * @property {string|null} [sender] Sending organization (deprecated).
 */

/**
 * Overview of a shared attachment.
 *
 * @typedef {object} AttachmentOverviewExt
 * @property {string|null} fileName Name of the attachment file.
 * @property {string|null} displayName Display name shown in Altinn Inbox.
 * @property {boolean} isEncrypted Whether the attachment is encrypted.
 * @property {string|null} checksum MD5 checksum.
 * @property {string} sendersReference Sender-defined attachment reference.
 * @property {number|null} expirationInDays Relative expiration time in days.
 * @property {string} resourceId Correspondence service resource identifier.
 * @property {string|null} sender Sending organization (deprecated).
 * @property {string} attachmentId Attachment identifier (UUID).
 * @property {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} status Current attachment status.
 * @property {string|null} statusText Human-readable status description.
 * @property {string} statusChanged Timestamp when the current status was set.
 * @property {Array<string>|null} correspondenceIds Correspondence IDs using the attachment.
 * @property {string|null} dataType MIME type of the attachment.
 */

/**
 * Detailed attachment information.
 *
 * @typedef {object} AttachmentDetailsExt
 * @property {string|null} fileName Name of the attachment file.
 * @property {string|null} displayName Display name shown in Altinn Inbox.
 * @property {boolean} isEncrypted Whether the attachment is encrypted.
 * @property {string|null} checksum MD5 checksum.
 * @property {string} sendersReference Sender-defined attachment reference.
 * @property {number|null} expirationInDays Relative expiration time in days.
 * @property {string} resourceId Correspondence service resource identifier.
 * @property {string|null} sender Sending organization (deprecated).
 * @property {string} attachmentId Attachment identifier (UUID).
 * @property {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} status Current attachment status.
 * @property {string|null} statusText Human-readable status description.
 * @property {string} statusChanged Timestamp when the current status was set.
 * @property {Array<string>|null} correspondenceIds Correspondence IDs using the attachment.
 * @property {string|null} dataType MIME type of the attachment.
 * @property {Array<AttachmentStatusEvent>|null} statusHistory Attachment status history.
 */

/**
 * Attachment status history event.
 *
 * @typedef {object} AttachmentStatusEvent
 * @property {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} status Attachment status.
 * @property {string|null} statusText Human-readable status description.
 * @property {string} statusChanged Timestamp when the status occurred.
 */

/**
 * Supported attachment statuses.
 *
 * @typedef {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} AttachmentStatusExt
 */

export const InitializeAttachmentExt = undefined;
export const AttachmentOverviewExt = undefined;
export const AttachmentDetailsExt = undefined;
export const AttachmentStatusEvent = undefined;
export const AttachmentStatusExt = undefined;
