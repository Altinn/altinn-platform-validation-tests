/**
 * @typedef {object} AltinnProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {string} code
 * @property {string|null} [traceId] OpenTelemetry trace ID for the request.
 * @property {string|null} [errorCode] Altinn error code (e.g. CORR-00001).
 */

/**
 * @typedef {object} AltinnValidationProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {string|null} [code] Altinn error code (e.g. STD-00000).
 * @property {Array<object>|null} [validationErrors] Structured validation errors per field.
 * @property {string|null} [traceId] OpenTelemetry trace ID for the request.
 * @property {{[key: string]: Array<string>}|null} [errors] Field-keyed validation error messages (legacy format).
 */

/**
 * Represents an overview of a shared attachment that can be used by multiple correspondences
 *
 * @typedef {object} AttachmentDetailsExt
 * @property {string|null} [fileName] The name of the attachment file.
 * @property {string|null} [displayName] A logical name for the file, which will be shown in Altinn Inbox.
 * @property {boolean} isEncrypted A value indicating whether the attachment is encrypted or not.
 * @property {string|null} [checksum] MD5 checksum for file data.
 * @property {string} sendersReference A reference value given to the attachment by the creator.
 * @property {number|null} [expirationInDays] Relative expiration time (days) for the attachment.
 * @property {string} resourceId Gets or sets the Resource Id for the correspondence service.
 * @property {string|null} [sender] The Sending organisation of the correspondence.
 * @property {string} attachmentId Unique Id for this attachment
 * @property {AttachmentStatusExt} status
 * @property {string|null} [statusText] Current attachment status text description
 * @property {string} statusChanged Timestamp for when the Current Attachment Status was changed
 * @property {Array<string>|null} [correspondenceIds] List of correspondences that are using this attachment
 * @property {string|null} [dataType] The attachment data type in MIME format
 * @property {Array<AttachmentStatusEvent>|null} [statusHistory] The Status history for the Attachment
 */

/**
 * Represents an overview of a shared attachment that can be used by multiple correspondences
 *
 * @typedef {object} AttachmentOverviewExt
 * @property {string|null} [fileName] The name of the attachment file.
 * @property {string|null} [displayName] A logical name for the file, which will be shown in Altinn Inbox.
 * @property {boolean} isEncrypted A value indicating whether the attachment is encrypted or not.
 * @property {string|null} [checksum] MD5 checksum for file data.
 * @property {string} sendersReference A reference value given to the attachment by the creator.
 * @property {number|null} [expirationInDays] Relative expiration time (days) for the attachment.
 * @property {string} resourceId Gets or sets the Resource Id for the correspondence service.
 * @property {string|null} [sender] The Sending organisation of the correspondence.
 * @property {string} attachmentId Unique Id for this attachment
 * @property {AttachmentStatusExt} status
 * @property {string|null} [statusText] Current attachment status text description
 * @property {string} statusChanged Timestamp for when the Current Attachment Status was changed
 * @property {Array<string>|null} [correspondenceIds] List of correspondences that are using this attachment
 * @property {string|null} [dataType] The attachment data type in MIME format
 */

/**
 * An entity representing a Attachment Status Event
 *
 * @typedef {object} AttachmentStatusEvent
 * @property {AttachmentStatusExt} status
 * @property {string|null} [statusText] Attachment status text description
 * @property {string} statusChanged Timestamp for when the Attachment Status occurred
 */

/**
 * Represents the important statuses for an attachment
 *
 * @typedef {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} AttachmentStatusExt
 */

/**
 * Represents a container object for attachments used when initiating a shared attachment
 *
 * @typedef {object} InitializeAttachmentExt
 * @property {string|null} [fileName] The name of the attachment file.
 * @property {string|null} [displayName] A logical name for the file, which will be shown in Altinn Inbox.
 * @property {boolean} isEncrypted A value indicating whether the attachment is encrypted or not.
 * @property {string|null} [checksum] MD5 checksum for file data.
 * @property {string} sendersReference A reference value given to the attachment by the creator.
 * @property {number|null} [expirationInDays] Relative expiration time (days) for the attachment.
 * @property {string} resourceId Gets or sets the Resource Id for the correspondence service.
 * @property {string|null} [sender] The Sending organisation of the correspondence.
 */

/**
 * @typedef {object} ProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {string|null} [traceId] OpenTelemetry trace ID for the request.
 * @property {string|null} [errorCode] Altinn error code (e.g. CORR-00001).
 */

export const AltinnProblemDetails = undefined;
export const AltinnValidationProblemDetails = undefined;
export const AttachmentDetailsExt = undefined;
export const AttachmentOverviewExt = undefined;
export const AttachmentStatusEvent = undefined;
export const AttachmentStatusExt = undefined;
export const InitializeAttachmentExt = undefined;
export const ProblemDetails = undefined;
