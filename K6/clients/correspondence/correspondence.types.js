// ============================================================================
// Request Models
// ============================================================================

/**
 * Request model for initializing one or more correspondences.
 *
 * @typedef {Object} InitializeCorrespondencesExt
 * @property {BaseCorrespondenceExt} correspondence
 * Correspondence data.
 *
 * @property {Array<string>} recipients
 * Recipients of the correspondence.
 * Can be organization identifiers, national identity numbers,
 * or self-identified users.
 *
 * @property {Array<string>|null} existingAttachments
 * Existing attachment ids to attach to the correspondence.
 *
 * @property {string|null} idempotentKey
 * Optional idempotency key to prevent duplicate correspondence creation.
 */


/**
 * Request model for attachment initialization.
 *
 * @typedef {Object} InitializeCorrespondenceAttachmentExt
 * @property {string|null} fileName
 * Name of the attachment file.
 *
 * @property {string|null} displayName
 * Logical name displayed in Altinn Inbox.
 *
 * @property {boolean} isEncrypted
 * Whether the attachment is encrypted.
 *
 * @property {string|null} checksum
 * MD5 checksum for file data.
 *
 * @property {string} sendersReference
 * Reference value given by the creator.
 *
 * @property {number|null} expirationInDays
 * Relative expiration time in days.
 *
 * @property {string|null} id
 * Attachment UUID.
 *
 * @property {InitializeAttachmentDataLocationTypeExt|null} dataLocationType
 * Location of attachment data.
 */


// ============================================================================
// Query Models
// ============================================================================

/**
 * Query parameters for retrieving correspondences.
 *
 * Use {@link CorrespondenceQueryBuilder} to construct this object.
 *
 * @typedef {Object} CorrespondenceQuery
 *
 * @property {string|null} resourceId
 * Filter by resource id.
 *
 * @property {string|null} from
 * Filter from date-time.
 *
 * @property {string|null} to
 * Filter to date-time.
 *
 * @property {CorrespondenceStatusExt|null} status
 * Filter by correspondence status.
 *
 * @property {CorrespondencesRoleType|null} role
 * Filter by sender/recipient role.
 *
 * @property {string|null} onBehalfOf
 * Organization or party represented.
 *
 * @property {string|null} sendersReference
 * Sender reference filter.
 *
 * @property {string|null} idempotentKey
 * Idempotency key filter.
 *
 * @property {number|null} altinn2CorrespondenceId
 * Legacy Altinn 2 correspondence id.
 */


// ============================================================================
// Response Models
// ============================================================================

/**
 * Response from initializing correspondences.
 *
 * @typedef {Object} InitializeCorrespondencesResponseExt
 *
 * @property {Array<InitializedCorrespondencesExt>|null} correspondences
 * Initialized correspondences.
 *
 * @property {Array<string>|null} attachmentIds
 * Attachment identifiers included in the correspondences.
 */


/**
 * List response containing correspondence identifiers.
 *
 * @typedef {Object} CorrespondencesExt
 *
 * @property {Array<string>|null} ids
 * Correspondence UUIDs.
 */


/**
 * Overview of a correspondence.
 *
 * Returned by:
 * GET /correspondence/api/v1/correspondence/{correspondenceId}
 *
 * @typedef {Object} CorrespondenceOverviewExt
 *
 * @property {string} resourceId
 * Resource identifier.
 *
 * @property {string|null} sender
 * Sending organization.
 *
 * @property {string} sendersReference
 * Sender supplied reference.
 *
 * @property {string|null} messageSender
 * Alternative sender display name.
 *
 * @property {CorrespondenceContentExt|null} content
 * Correspondence content.
 *
 * @property {string|null} requestedPublishTime
 * Requested publish timestamp.
 *
 * @property {string|null} dueDateTime
 * Recipient due date.
 *
 * @property {Array<ExternalReferenceExt>|null} externalReferences
 * External references.
 *
 * @property {{[key:string]:string}|null} propertyList
 * User-defined properties.
 *
 * @property {Array<CorrespondenceReplyOptionExt>|null} replyOptions
 * Reply options.
 *
 * @property {InitializeCorrespondenceNotificationExt|null} notification
 * Notification configuration.
 *
 * @property {boolean|null} ignoreReservation
 * Whether KRR reservation should be ignored.
 *
 * @property {boolean} isConfirmationNeeded
 * Whether confirmation is required.
 *
 * @property {boolean} isConfidential
 * Whether correspondence is confidential.
 *
 * @property {string|null} recipient
 * Recipient identifier.
 *
 * @property {string} correspondenceId
 * Correspondence UUID.
 *
 * @property {string} created
 * Creation timestamp.
 *
 * @property {CorrespondenceStatusExt} status
 * Current correspondence status.
 *
 * @property {string|null} statusText
 * Current status description.
 *
 * @property {string} statusChanged
 * Status change timestamp.
 *
 * @property {Array<CorrespondenceNotificationOverviewExt>|null} notifications
 * Notification summaries.
 *
 * @property {number|null} altinn2CorrespondenceId
 * Legacy Altinn 2 correspondence identifier.
 *
 * @property {string|null} published
 * Publish timestamp.
 *
 * @property {string|null} read
 * First read timestamp.
 */

// ============================================================================
// Shared Models
// ============================================================================

/**
 * Represents detailed information about a correspondence.
 *
 * Returned by:
 * GET /correspondence/api/v1/correspondence/{correspondenceId}/details
 *
 * @typedef {Object} CorrespondenceDetailsExt
 *
 * @property {string} correspondenceId
 * Correspondence UUID.
 *
 * @property {string} resourceId
 * Resource identifier.
 *
 * @property {string|null} sender
 * Sending organization.
 *
 * @property {string} sendersReference
 * Sender supplied reference.
 *
 * @property {string|null} messageSender
 * Alternative sender display name.
 *
 * @property {CorrespondenceContentExt|null} content
 * Correspondence content.
 *
 * @property {string|null} requestedPublishTime
 * Requested publish timestamp.
 *
 * @property {string|null} dueDateTime
 * Recipient due date.
 *
 * @property {Array<ExternalReferenceExt>|null} externalReferences
 * External references.
 *
 * @property {{[key:string]:string}|null} propertyList
 * User-defined properties.
 *
 * @property {Array<CorrespondenceReplyOptionExt>|null} replyOptions
 * Reply options.
 *
 * @property {Array<CorrespondenceAttachmentExt>|null} attachments
 * Correspondence attachments.
 *
 * @property {Array<CorrespondenceStatusEventExt>|null} statusHistory
 * Correspondence status history.
 *
 * @property {Array<NotificationExt>|null} notifications
 * Notifications connected to correspondence.
 *
 * @property {CorrespondenceStatusExt} status
 * Current correspondence status.
 *
 * @property {string|null} statusText
 * Current status description.
 *
 * @property {string} statusChanged
 * Status change timestamp.
 *
 * @property {boolean} isConfirmationNeeded
 * Whether confirmation is required.
 *
 * @property {boolean} isConfidential
 * Whether correspondence is confidential.
 *
 * @property {string|null} recipient
 * Recipient identifier.
 *
 * @property {string|null} published
 * Publish timestamp.
 *
 * @property {string|null} read
 * First read timestamp.
 */


/**
 * Correspondence content.
 *
 * @typedef {Object} CorrespondenceContentExt
 *
 * @property {string} language
 * Content language.
 *
 * @property {string} title
 * Correspondence title.
 *
 * @property {string} body
 * Correspondence body.
 *
 * @property {string|null} summary
 * Optional summary.
 */


/**
 * Represents a correspondence attachment.
 *
 * @typedef {Object} CorrespondenceAttachmentExt
 *
 * @property {string|null} fileName
 * Attachment filename.
 *
 * @property {string|null} displayName
 * Display name shown in Altinn Inbox.
 *
 * @property {boolean} isEncrypted
 * Whether attachment is encrypted.
 *
 * @property {string|null} checksum
 * MD5 checksum.
 *
 * @property {string} sendersReference
 * Sender attachment reference.
 *
 * @property {number|null} expirationInDays
 * Expiration duration in days.
 *
 * @property {string} id
 * Attachment UUID.
 *
 * @property {AttachmentDataLocationTypeExt} dataLocationType
 * Attachment data location.
 *
 * @property {string} created
 * Creation timestamp.
 *
 * @property {AttachmentStatusExt} status
 * Attachment status.
 *
 * @property {string|null} statusText
 * Status description.
 *
 * @property {string} statusChanged
 * Status changed timestamp.
 *
 * @property {string|null} dataType
 * MIME type.
 *
 * @property {string|null} expirationTime
 * Attachment expiration timestamp.
 */


// ============================================================================
// Notification Models
// ============================================================================

/**
 * Notification connected to a correspondence.
 *
 * @typedef {Object} NotificationExt
 *
 * @property {string|null} id
 * Notification order id.
 *
 * @property {string|null} sendersReference
 * Notification sender reference.
 *
 * @property {string|null} creator
 * Creator short name.
 *
 * @property {string} created
 * Creation timestamp.
 *
 * @property {boolean} isReminder
 * Whether notification is a reminder.
 *
 * @property {NotificationChannelExt} notificationChannel
 * Notification channel.
 *
 * @property {boolean|null} ignoreReservation
 * Whether KRR reservations should be ignored.
 *
 * @property {string|null} resourceId
 * Related resource id.
 *
 * @property {NotificationProcessStatusExt|null} processingStatus
 * Processing status.
 *
 * @property {NotificationStatusDetailsExt|null} notificationStatusDetails
 * Notification status details.
 */


/**
 * Notification configuration during correspondence initialization.
 *
 * @typedef {Object} InitializeCorrespondenceNotificationExt
 *
 * @property {NotificationTemplateExt|null} template
 * Notification template.
 *
 * @property {NotificationChannelExt|null} notificationChannel
 * Notification channel.
 *
 * @property {Array<NotificationRecipientExt>|null} recipients
 * Custom notification recipients.
 *
 * @property {string|null} emailSubject
 * Email subject.
 *
 * @property {string|null} emailBody
 * Email body.
 *
 * @property {EmailContentType|null} emailContentType
 * Email content format.
 *
 * @property {string|null} smsBody
 * SMS body.
 *
 * @property {string|null} reminderEmailSubject
 * Reminder email subject.
 *
 * @property {string|null} reminderEmailBody
 * Reminder email body.
 *
 * @property {string|null} reminderSmsBody
 * Reminder SMS body.
 */


/**
 * Notification recipient.
 *
 * @typedef {Object} NotificationRecipientExt
 *
 * @property {string|null} emailAddress
 * Email address.
 *
 * @property {string|null} mobileNumber
 * Mobile number.
 *
 * @property {string|null} organizationNumber
 * Organization number.
 *
 * @property {string|null} nationalIdentityNumber
 * National identity number.
 *
 * @property {boolean|null} isReserved
 * Whether recipient is reserved.
 */


/**
 * Notification status details.
 *
 * @typedef {Object} NotificationDetailsExt
 *
 * @property {string|null} id
 * Notification UUID.
 *
 * @property {boolean} succeeded
 * Whether sending succeeded.
 *
 * @property {NotificationRecipientExt|null} recipient
 * Recipient details.
 *
 * @property {NotificationStatusExt|null} sendStatus
 * Send status.
 */


/**
 * Notification status summary.
 *
 * @typedef {Object} NotificationStatusExt
 *
 * @property {string|null} status
 * Status value.
 *
 * @property {string|null} description
 * Status description.
 *
 * @property {string} lastUpdate
 * Last update timestamp.
 */


/**
 * Notification status overview.
 *
 * @typedef {Object} NotificationStatusDetailsExt
 *
 * @property {NotificationDetailsExt|null} email
 * Email status.
 *
 * @property {NotificationDetailsExt|null} sms
 * SMS status.
 *
 * @property {Array<NotificationDetailsExt>|null} emails
 * Email statuses.
 *
 * @property {Array<NotificationDetailsExt>|null} smses
 * SMS statuses.
 */


// ============================================================================
// Additional Shared Models
// ============================================================================

/**
 * Reference to another item in the Altinn ecosystem.
 *
 * @typedef {Object} ExternalReferenceExt
 *
 * @property {string} referenceValue
 * Reference value.
 *
 * @property {ReferenceTypeExt} referenceType
 * Type of reference.
 */


/**
 * Reply option provided by the sender.
 *
 * @typedef {Object} CorrespondenceReplyOptionExt
 *
 * @property {string} linkURL
 * URL used for replying to the correspondence.
 *
 * @property {string|null} linkText
 * Display text for the reply link.
 */


/**
 * Represents a correspondence status event.
 *
 * @typedef {Object} CorrespondenceStatusEventExt
 *
 * @property {CorrespondenceStatusExt} status
 * Correspondence status.
 *
 * @property {string|null} statusText
 * Status description.
 *
 * @property {string} statusChanged
 * Timestamp when status changed.
 */


/**
 * Summary of a notification order linked to a correspondence.
 *
 * @typedef {Object} CorrespondenceNotificationOverviewExt
 *
 * @property {string|null} notificationOrderId
 * Notification order UUID.
 *
 * @property {boolean} isReminder
 * Whether notification is a reminder.
 */


// ============================================================================
// Initialized Models
// ============================================================================

/**
 * Information about an initialized correspondence.
 *
 * @typedef {Object} InitializedCorrespondencesExt
 *
 * @property {string|null} id
 * Correspondence UUID.
 *
 * @property {string|null} sendersReference
 * Sender reference.
 *
 * @property {Array<string>|null} attachmentIds
 * Attachment identifiers.
 */


/**
 * Initialized notification result.
 *
 * @typedef {Object} InitializedCorrespondencesNotificationsExt
 *
 * @property {string|null} orderId
 * Notification order UUID.
 *
 * @property {boolean|null} isReminder
 * Whether notification is a reminder.
 *
 * @property {InitializedNotificationStatusExt|null} status
 * Initialization status.
 */


// ============================================================================
// Attachment Models
// ============================================================================

/**
 * Attachment initialization data location type.
 *
 * @typedef {string} InitializeAttachmentDataLocationTypeExt
 *
 * @enum
 * "NewCorrespondenceAttachment"
 * "ExistingCorrespondenceAttachment"
 * "ExistingExternalStorage"
 */


/**
 * Attachment data location type.
 *
 * @typedef {string} AttachmentDataLocationTypeExt
 *
 * @enum
 * "AltinnCorrespondenceAttachment"
 * "ExternalStorage"
 */


// ============================================================================
// Error Models
// ============================================================================

/**
 * Standard problem details response.
 *
 * @typedef {Object} ProblemDetails
 *
 * @property {string|null} type
 * Problem type.
 *
 * @property {string|null} title
 * Problem title.
 *
 * @property {number|null} status
 * HTTP status code.
 *
 * @property {string|null} detail
 * Problem details.
 *
 * @property {string|null} instance
 * Problem instance.
 *
 * @property {string|null} traceId
 * OpenTelemetry trace id.
 *
 * @property {string|null} errorCode
 * Altinn error code.
 */


/**
 * Altinn problem details response.
 *
 * @typedef {Object} AltinnProblemDetails
 *
 * @property {string|null} type
 * Problem type.
 *
 * @property {string|null} title
 * Problem title.
 *
 * @property {number|null} status
 * HTTP status code.
 *
 * @property {string|null} detail
 * Problem details.
 *
 * @property {string|null} instance
 * Problem instance.
 *
 * @property {string} code
 * Altinn error code.
 *
 * @property {string|null} traceId
 * OpenTelemetry trace id.
 *
 * @property {string|null} errorCode
 * Altinn error code.
 */


/**
 * Altinn validation problem details response.
 *
 * @typedef {Object} AltinnValidationProblemDetails
 *
 * @property {string|null} type
 * Problem type.
 *
 * @property {string|null} title
 * Problem title.
 *
 * @property {number|null} status
 * HTTP status code.
 *
 * @property {string|null} detail
 * Problem details.
 *
 * @property {string|null} instance
 * Problem instance.
 *
 * @property {string|null} code
 * Altinn error code.
 *
 * @property {Array<AltinnValidationError>|null} validationErrors
 * Structured validation errors.
 *
 * @property {string|null} traceId
 * OpenTelemetry trace id.
 *
 * @property {{[key:string]:Array<string>}|null} errors
 * Legacy field validation errors.
 */


/**
 * Validation error details.
 *
 * @typedef {Object} AltinnValidationError
 *
 * @property {string} code
 * Validation error code.
 *
 * @property {string} detail
 * Human readable error message.
 *
 * @property {Array<string>} paths
 * JSON pointer paths to invalid fields.
 */


// ============================================================================
// Enums
// ============================================================================

/**
 * Represents the important statuses for a correspondence.
 *
 * @typedef {string} CorrespondenceStatusExt
 *
 * @enum
 * "Initialized"
 * "ReadyForPublish"
 * "Published"
 * "Fetched"
 * "Read"
 * "Replied"
 * "Confirmed"
 * "PurgedByRecipient"
 * "PurgedByAltinn"
 * "Archived"
 * "Reserved"
 * "Failed"
 * "AttachmentsDownloaded"
 */


/**
 * Represents the important statuses for an attachment.
 *
 * @typedef {string} AttachmentStatusExt
 *
 * @enum
 * "Initialized"
 * "UploadProcessing"
 * "Published"
 * "Purged"
 * "Failed"
 * "Expired"
 */


/**
 * Defines the location of attachment data during initialization.
 *
 * @typedef {string} InitializeAttachmentDataLocationTypeExt
 *
 * @enum
 * "NewCorrespondenceAttachment"
 * "ExistingCorrespondenceAttachment"
 * "ExistingExternalStorage"
 */


/**
 * Defines the location of attachment data.
 *
 * @typedef {string} AttachmentDataLocationTypeExt
 *
 * @enum
 * "AltinnCorrespondenceAttachment"
 * "ExternalStorage"
 */


/**
 * Available notification channels.
 *
 * @typedef {string} NotificationChannelExt
 *
 * @enum
 * "Email"
 * "Sms"
 * "EmailPreferred"
 * "SmsPreferred"
 * "EmailAndSms"
 */


/**
 * Available notification templates.
 *
 * @typedef {string} NotificationTemplateExt
 *
 * @enum
 * "CustomMessage"
 * "GenericAltinnMessage"
 */


/**
 * Email content format.
 *
 * @typedef {string} EmailContentType
 *
 * @enum
 * "Plain"
 * "Html"
 */


/**
 * Notification initialization status.
 *
 * @typedef {string} InitializedNotificationStatusExt
 *
 * @enum
 * "Success"
 * "MissingContact"
 * "Failure"
 */


/**
 * Defines what kind of external reference is used.
 *
 * @typedef {string} ReferenceTypeExt
 *
 * @enum
 * "Generic"
 * "AltinnAppInstance"
 * "AltinnBrokerFileTransfer"
 * "DialogportenDialogId"
 * "DialogportenProcessId"
 * "DialogportenTransmissionId"
 * "DialogportenTransmissionType"
 */


/**
 * Dialogporten system labels.
 *
 * @typedef {string} DialogPortenSystemLabel
 *
 * @enum
 * "Default"
 * "Bin"
 * "Archive"
 * "MarkedAsUnopened"
 * "Sent"
 */


// ============================================================================
// Primitive Supporting Models
// ============================================================================

/**
 * Correspondence roles used when filtering correspondence.
 *
 * @typedef {string} CorrespondencesRoleType
 *
 * @enum
 * "Recipient"
 * "Sender"
 * "RecipientAndSender"
 */


/**
 * Generic notification processing status.
 *
 * @typedef {Object} NotificationProcessStatusExt
 *
 * @property {string|null} status
 * Current processing status.
 *
 * @property {string|null} description
 * Status description.
 *
 * @property {string} lastUpdate
 * Timestamp of last status update.
 */
