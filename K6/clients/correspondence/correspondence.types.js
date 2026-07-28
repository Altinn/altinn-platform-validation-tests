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
 * Defines the location of the attachment data
 *
 * @typedef {"AltinnCorrespondenceAttachment"|"ExternalStorage"} AttachmentDataLocationTypeExt
 */

/**
 * Represents the important statuses for an attachment
 *
 * @typedef {"Initialized"|"UploadProcessing"|"Published"|"Purged"|"Failed"|"Expired"} AttachmentStatusExt
 */

/**
 * Represents a request object for the operation, InitializeCorrespondence, that can create a correspondence in Altinn.
 *
 * @typedef {object} BaseCorrespondenceExt
 * @property {string} resourceId The Resource Id associated with the correspondence service.
 * @property {string|null} [sender] The Sending organization of the correspondence.
 * @property {string} sendersReference A reference used by senders and receivers to identify a specific Correspondence using external identification methods.
 * @property {string|null} [messageSender] An alternative name for the sender of the correspondence. The name will be displayed instead of the organization name.
 * @property {InitializeCorrespondenceContentExt} content
 * @property {string|null} [requestedPublishTime] When the correspondence should become visible to the recipient.
 * @property {string|null} [dueDateTime] When the recipient must reply to the correspondence
 * @property {Array<ExternalReferenceExt>|null} [externalReferences] A list of references Senders can use to tell the recipient that the correspondence is related to the referenced item(s) Examples include Altinn App instances, Altinn Broker File Transfers
 * @property {{[key: string]: string}|null} [propertyList] User-defined properties related to the Correspondence
 * @property {Array<CorrespondenceReplyOptionExt>|null} [replyOptions] Options for how the recipient can reply to the Correspondence
 * @property {InitializeCorrespondenceNotificationExt} notification
 * @property {boolean|null} [ignoreReservation] Specifies whether the correspondence can override reservation against digital communication in KRR. This field only applies to recipients who are persons with person numbers (both default and custom recipients). It has no effect for organization recipients or email/sms recipients through custom recipients.
 * @property {boolean} isConfirmationNeeded Specifies whether reading the correspondence needs to be confirmed by the recipient
 * @property {boolean} isConfidential Specifies whether the correspondence is confidential
 */

/**
 * Represents a binary attachment to a Correspondence
 *
 * @typedef {object} CorrespondenceAttachmentExt
 * @property {string|null} [fileName] The name of the attachment file.
 * @property {string|null} [displayName] A logical name for the file, which will be shown in Altinn Inbox.
 * @property {boolean} isEncrypted A value indicating whether the attachment is encrypted or not.
 * @property {string|null} [checksum] MD5 checksum for file data.
 * @property {string} sendersReference A reference value given to the attachment by the creator.
 * @property {number|null} [expirationInDays] Relative expiration time (days) for the attachment.
 * @property {string} id A unique id for the correspondence attachment.
 * @property {AttachmentDataLocationTypeExt} dataLocationType
 * @property {string} created The date on which this attachment is created
 * @property {AttachmentStatusExt} status
 * @property {string|null} [statusText] Current attachment status text description
 * @property {string} statusChanged Timestamp for when the Current Attachment Status was changed
 * @property {string|null} [dataType] The attachment data type in MIME format
 * @property {string|null} [expirationTime] The expiration time for this attachment on this correspondence.
 */

/**
 * Represents the content of a reportee element of the type correspondence.
 *
 * @typedef {object} CorrespondenceContentExt
 * @property {string|null} [language] Gets or sets the language of the correspondence, specified according to ISO 639-1
 * @property {string} messageTitle Gets or sets the correspondence message title. Subject. Must be plaintext.
 * @property {string|null} [messageSummary] Gets or sets a summary text of the correspondence. Must be plaintext.
 * @property {string} messageBody Gets or sets the main body of the correspondence. Must be (CommonMark) Markdown.
 * @property {Array<CorrespondenceAttachmentExt>|null} [attachments] Gets or sets a list of attachments.
 */

/**
 * A more detailed object representing all the details for a correspondence, including status history and notifications
 *
 * @typedef {object} CorrespondenceDetailsExt
 * @property {string} resourceId The Resource Id associated with the correspondence service.
 * @property {string|null} [sender] The Sending organization of the correspondence.
 * @property {string} sendersReference A reference used by senders and receivers to identify a specific Correspondence using external identification methods.
 * @property {string|null} [messageSender] An alternative name for the sender of the correspondence. The name will be displayed instead of the organization name.
 * @property {CorrespondenceContentExt} content
 * @property {string|null} [requestedPublishTime] When the correspondence should become visible to the recipient.
 * @property {string|null} [dueDateTime] When the recipient must reply to the correspondence
 * @property {Array<ExternalReferenceExt>|null} [externalReferences] A list of references Senders can use to tell the recipient that the correspondence is related to the referenced item(s) Examples include Altinn App instances, Altinn Broker File Transfers
 * @property {{[key: string]: string}|null} [propertyList] User-defined properties related to the Correspondence
 * @property {Array<CorrespondenceReplyOptionExt>|null} [replyOptions] Options for how the recipient can reply to the Correspondence
 * @property {InitializeCorrespondenceNotificationExt} notification
 * @property {boolean|null} [ignoreReservation] Specifies whether the correspondence can override reservation against digital communication in KRR. This field only applies to recipients who are persons with person numbers (both default and custom recipients). It has no effect for organization recipients or email/sms recipients through custom recipients.
 * @property {boolean} isConfirmationNeeded Specifies whether reading the correspondence needs to be confirmed by the recipient
 * @property {boolean} isConfidential Specifies whether the correspondence is confidential
 * @property {string|null} [recipient] The recipient of the correspondence.
 * @property {string} correspondenceId Unique Id for this correspondence
 * @property {string} created When the correspondence was created
 * @property {CorrespondenceStatusExt} status
 * @property {string|null} [statusText] The current status text for the Correspondence
 * @property {string} statusChanged Timestamp for when the Current Correspondence Status was changed
 * @property {Array<NotificationExt>|null} [notifications] Notifications directly related to this Correspondence.
 * @property {number|null} [altinn2CorrespondenceId] The identifier/reference from Altinn 2 for migrated correspondence. Will be null for correspondence created in Altinn 3.
 * @property {string|null} [published] Is null until the correspondence is published.
 * @property {string|null} [read] Timestamp for when the correspondence was first read by the recipient. Is null until the correspondence has been read.
 * @property {Array<CorrespondenceStatusEventExt>|null} [statusHistory] The Status history for the Correspondence
 * @property {DialogPortenSystemLabel} systemLabel
 */

/**
 * Summary of a notification order linked to a correspondence.
 *
 * @typedef {object} CorrespondenceNotificationOverviewExt
 * @property {string|null} [notificationOrderId] The notification order identifier, when available.
 * @property {boolean} isReminder Whether the notification is a reminder.
 */

/**
 * An object representing an overview of a correspondence with enough details to drive the business process
 *
 * @typedef {object} CorrespondenceOverviewExt
 * @property {string} resourceId The Resource Id associated with the correspondence service.
 * @property {string|null} [sender] The Sending organization of the correspondence.
 * @property {string} sendersReference A reference used by senders and receivers to identify a specific Correspondence using external identification methods.
 * @property {string|null} [messageSender] An alternative name for the sender of the correspondence. The name will be displayed instead of the organization name.
 * @property {CorrespondenceContentExt} content
 * @property {string|null} [requestedPublishTime] When the correspondence should become visible to the recipient.
 * @property {string|null} [dueDateTime] When the recipient must reply to the correspondence
 * @property {Array<ExternalReferenceExt>|null} [externalReferences] A list of references Senders can use to tell the recipient that the correspondence is related to the referenced item(s) Examples include Altinn App instances, Altinn Broker File Transfers
 * @property {{[key: string]: string}|null} [propertyList] User-defined properties related to the Correspondence
 * @property {Array<CorrespondenceReplyOptionExt>|null} [replyOptions] Options for how the recipient can reply to the Correspondence
 * @property {InitializeCorrespondenceNotificationExt} notification
 * @property {boolean|null} [ignoreReservation] Specifies whether the correspondence can override reservation against digital communication in KRR. This field only applies to recipients who are persons with person numbers (both default and custom recipients). It has no effect for organization recipients or email/sms recipients through custom recipients.
 * @property {boolean} isConfirmationNeeded Specifies whether reading the correspondence needs to be confirmed by the recipient
 * @property {boolean} isConfidential Specifies whether the correspondence is confidential
 * @property {string|null} [recipient] The recipient of the correspondence.
 * @property {string} correspondenceId Unique Id for this correspondence
 * @property {string} created When the correspondence was created
 * @property {CorrespondenceStatusExt} status
 * @property {string|null} [statusText] The current status text for the Correspondence
 * @property {string} statusChanged Timestamp for when the Current Correspondence Status was changed
 * @property {Array<CorrespondenceNotificationOverviewExt>|null} [notifications] An overview of the notifications for this correspondence
 * @property {number|null} [altinn2CorrespondenceId] The identifier/reference from Altinn 2 for migrated correspondence. Will be null for correspondence created in Altinn 3.
 * @property {string|null} [published] Is null until the correspondence is published.
 * @property {string|null} [read] Timestamp for when the correspondence was first read by the recipient. Is null until the correspondence has been read.
 */

/**
 * Represents a ReplyOption with information provided by the sender. A reply option is a way for recipients to respond to a correspondence in addition to the normal Read and Confirm operations
 *
 * @typedef {object} CorrespondenceReplyOptionExt
 * @property {string|null} [linkURL] Gets or sets the URL to be used as a reply/response to a correspondence.
 * @property {string|null} [linkText] Gets or sets the url text.
 */

/**
 * An entity representing a Correspondence Status Event
 *
 * @typedef {object} CorrespondenceStatusEventExt
 * @property {CorrespondenceStatusExt} status
 * @property {string|null} [statusText] Correspondence Status Text description
 * @property {string} statusChanged Timestamp for when this Correspondence Status Event occurred
 */

/**
 * Represents the important statuses for an Correspondence
 *
 * @typedef {"Initialized"|"ReadyForPublish"|"Published"|"Fetched"|"Read"|"Replied"|"Confirmed"|"PurgedByRecipient"|"PurgedByAltinn"|"Archived"|"Reserved"|"Failed"|"AttachmentsDownloaded"} CorrespondenceStatusExt
 */

/**
 * An entity representing a a list of Correspondences
 *
 * @typedef {object} CorrespondencesExt
 * @property {Array<string>|null} [ids] Correspondence ids
 */

/**
 * @typedef {"Recipient"|"Sender"|"RecipientAndSender"} CorrespondencesRoleType
 */

/**
 * Represents a custom notification recipient with override options
 *
 * @typedef {object} CustomNotificationRecipientExt
 * @property {string|null} [recipientToOverride] This is not used, but is required by the API.
 * @property {Array<NotificationRecipientExt>|null} [recipients] Only the first recipient will be used as custom recipient.
 */

/**
 * @typedef {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"} DialogPortenSystemLabel
 */

/**
 * @typedef {"Plain"|"Html"} EmailContentType
 */

/**
 * Represents a reference to another item in the Altinn ecosystem
 *
 * @typedef {object} ExternalReferenceExt
 * @property {string|null} [referenceValue] The Reference Value
 * @property {ReferenceTypeExt} referenceType
 */

/**
 * Defines the location of the attachment data during the Initialize Correspondence Operation
 *
 * @typedef {"NewCorrespondenceAttachment"|"ExistingCorrespondenceAttachment"|"ExistingExternalStorage"} InitializeAttachmentDataLocationTypeExt
 */

/**
 * Represents an attachment to a specific correspondence as part of Initialize Correspondence Operation
 *
 * @typedef {object} InitializeCorrespondenceAttachmentExt
 * @property {string|null} [fileName] The name of the attachment file.
 * @property {string|null} [displayName] A logical name for the file, which will be shown in Altinn Inbox.
 * @property {boolean} isEncrypted A value indicating whether the attachment is encrypted or not.
 * @property {string|null} [checksum] MD5 checksum for file data.
 * @property {string} sendersReference A reference value given to the attachment by the creator.
 * @property {number|null} [expirationInDays] Relative expiration time (days) for the attachment.
 * @property {string} id A unique id for the correspondence attachment.
 * @property {InitializeAttachmentDataLocationTypeExt} dataLocationType
 */

/**
 * Represents the content of a Correspondence.
 *
 * @typedef {object} InitializeCorrespondenceContentExt
 * @property {string|null} [language] Gets or sets the language of the correspondence, specified according to ISO 639-1
 * @property {string} messageTitle Gets or sets the correspondence message title. Subject. Must be plaintext.
 * @property {string|null} [messageSummary] Gets or sets a summary text of the correspondence. Must be plaintext.
 * @property {string} messageBody Gets or sets the main body of the correspondence. Must be (CommonMark) Markdown.
 * @property {Array<InitializeCorrespondenceAttachmentExt>|null} [attachments] Gets or sets metadata of the attachments added in the Attachments field. Uses the InitializeCorrespondenceAttachmentExt model.
 */

/**
 * Used to specify a single notification connected to a specific Correspondence during the Initialize Correspondence operation
 *
 * @typedef {object} InitializeCorrespondenceNotificationExt
 * @property {NotificationTemplateExt} notificationTemplate
 * @property {string|null} [emailSubject] The emails subject for the main notification. Maximum length is 512 characters.
 * @property {string|null} [emailBody] The email body for the main notification. Maximum length is 10,000 characters.
 * @property {EmailContentType} emailContentType
 * @property {string|null} [smsBody] The sms body for the main notification. Maximum length is 2,144 characters (16 SMS segments × 134 characters per segment). This aligns with the Altinn Notifications service SMS processing limits.
 * @property {boolean} sendReminder Should a reminder be sent if the notification is not confirmed or opened
 * @property {string|null} [reminderEmailSubject] The email subject to use for the reminder notification Maximum length is 512 characters.
 * @property {string|null} [reminderEmailBody] The email body to use for the reminder notification. Maximum length is 10,000 characters.
 * @property {EmailContentType} reminderEmailContentType
 * @property {string|null} [reminderSmsBody] The sms body to use for the reminder notification. Maximum length is 2,144 characters (16 SMS segments × 134 characters per segment). This aligns with the Altinn Notifications service SMS processing limits.
 * @property {NotificationChannelExt} notificationChannel
 * @property {NotificationChannelExt} reminderNotificationChannel
 * @property {string|null} [sendersReference] Senders Reference for this notification
 * @property {Array<NotificationRecipientExt>|null} [customRecipients] A list of additional recipients for the notification. These are processed in addition to the Correspondence recipient; if not set, only the Correspondence recipient receives the notification.
 * @property {NotificationRecipientExt} customRecipient
 * @property {Array<CustomNotificationRecipientExt>|null} [customNotificationRecipients] Only the first list of recipients will be used. If not set, the notification will be sent to the recipient of the Correspondence
 * @property {boolean} overrideRegisteredContactInformation When set to true, only CustomRecipients will be used for notifications, overriding the default correspondence recipient. This flag can only be used when CustomRecipients is provided. Default value is false (use default contact info + custom recipients).
 */

/**
 * @typedef {object} InitializeCorrespondencesExt
 * @property {BaseCorrespondenceExt} correspondence
 * @property {Array<string>} recipients List of recipients for the correspondence: organization (urn:altinn:organization:identifier-no:ORGNR), national identity number (urn:altinn:person:identifier-no:SSN), self identified user (urn:altinn:person:idporten-email:EMAIL), or legacy selfidentified user (urn:altinn:person:legacy-selfidentified:USERNAME).
 * @property {Array<string>|null} [existingAttachments] Existing attachments that should be added to the correspondence
 * @property {string|null} [idempotentKey] Optional idempotency key to prevent duplicate correspondence creation
 */

/**
 * Contains information about the created correspondences and their attachments.
 *
 * @typedef {object} InitializeCorrespondencesResponseExt
 * @property {Array<InitializedCorrespondencesExt>|null} [correspondences] The initialized correspondences
 * @property {Array<string>|null} [attachmentIds] The IDs of the attachments that is included in the correspondences
 */

/**
 * Represents a correspondence that has been initialized
 *
 * @typedef {object} InitializedCorrespondencesExt
 * @property {string} correspondenceId The ID of the correspondence
 * @property {CorrespondenceStatusExt} status
 * @property {string|null} [recipient] The recipient of the correspondence
 * @property {Array<InitializedCorrespondencesNotificationsExt>|null} [notifications] Information about the notifications that were created for the correspondence
 */

/**
 * Information about a notification that were created for the correspondence
 *
 * @typedef {object} InitializedCorrespondencesNotificationsExt
 * @property {string|null} [orderId] The order ID of the notification
 * @property {boolean|null} [isReminder] Boolean indicating if the notification is a reminder
 * @property {InitializedNotificationStatusExt} status
 */

/**
 * @typedef {"Success"|"MissingContact"|"Failure"} InitializedNotificationStatusExt
 */

/**
 * Enum describing available notification channels.
 *
 * @typedef {"Email"|"Sms"|"EmailPreferred"|"SmsPreferred"|"EmailAndSms"} NotificationChannelExt
 */

/**
 * An abstract class representing a status overview of a notification channels
 *
 * @typedef {object} NotificationDetailsExt
 * @property {string|null} [id] The notification id
 * @property {boolean} succeeded Boolean indicating if the sending of the notification was successful
 * @property {NotificationRecipientExt} recipient
 * @property {NotificationStatusExt} sendStatus
 */

/**
 * Represents a notification connected to a specific correspondence
 *
 * @typedef {object} NotificationExt
 * @property {string|null} [id] The id of the notification order
 * @property {string|null} [sendersReference] An optional senders reference of the notification
 * @property {string|null} [creator] The short name of the creator of the notification order
 * @property {string} created The date and time of when the notification order was created
 * @property {boolean} isReminder whether the notification is a reminder notification
 * @property {NotificationChannelExt} notificationChannel
 * @property {boolean|null} [ignoreReservation] Whether notifications generated by this order should ignore KRR reservations
 * @property {string|null} [resourceId] The id of the resource that the notification is related to
 * @property {NotificationProcessStatusExt} processingStatus
 * @property {NotificationStatusDetailsExt} notificationStatusDetails
 */

/**
 * An abstract class representing a status overview of a notification channels
 *
 * @typedef {object} NotificationProcessStatusExt
 * @property {string|null} [status] The actual status of the notification
 * @property {string|null} [description] The description of the status
 * @property {string} lastUpdate The date time of when the status was last updated
 */

/**
 * A class representing a a recipient of a notification
 *
 * @typedef {object} NotificationRecipientExt
 * @property {string|null} [emailAddress] the email address of the recipient
 * @property {string|null} [mobileNumber] the mobileNumber of the recipient
 * @property {string|null} [organizationNumber] the organization number of the recipient
 * @property {string|null} [nationalIdentityNumber] The SSN of the recipient
 * @property {boolean|null} [isReserved] Boolean indicating if the recipient is reserved
 */

/**
 * A class representing a summary of status overviews of all notification channels
 *
 * @typedef {object} NotificationStatusDetailsExt
 * @property {NotificationDetailsExt} email
 * @property {NotificationDetailsExt} sms
 * @property {Array<NotificationDetailsExt>|null} [emails]
 * @property {Array<NotificationDetailsExt>|null} [smses]
 */

/**
 * A class representing a status summary
 *
 * @typedef {object} NotificationStatusExt
 * @property {string|null} [status] The actual status of the notification
 * @property {string|null} [description] The description of the status
 * @property {string} lastUpdate The date time of when the status was last updated
 */

/**
 * Enum describing available notification templates.
 *
 * @typedef {"CustomMessage"|"GenericAltinnMessage"} NotificationTemplateExt
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

/**
 * Defines what kind of reference
 *
 * @typedef {"Generic"|"AltinnAppInstance"|"AltinnBrokerFileTransfer"|"DialogportenDialogId"|"DialogportenProcessId"|"DialogportenTransmissionId"|"DialogportenTransmissionType"} ReferenceTypeExt
 */

/**
 * Query parameters for retrieving correspondences.
 *
 * Use {@link CorrespondenceQueryBuilder} to construct this object.
 *
 * @typedef {object} CorrespondenceQuery
 * @property {string|null} resourceId
 * Filter by resource id.
 * @property {string|null} from
 * Filter from date-time.
 * @property {string|null} to
 * Filter to date-time.
 * @property {CorrespondenceStatusExt|null} status
 * Filter by correspondence status.
 * @property {CorrespondencesRoleType|null} role
 * Filter by sender/recipient role.
 * @property {string|null} onBehalfOf
 * Organization or party represented.
 * @property {string|null} sendersReference
 * Sender reference filter.
 * @property {string|null} idempotentKey
 * Idempotency key filter.
 * @property {number|null} altinn2CorrespondenceId
 * Legacy Altinn 2 correspondence id.
 */

export const AltinnProblemDetails = undefined;
export const AltinnValidationProblemDetails = undefined;
export const AttachmentDataLocationTypeExt = undefined;
export const AttachmentStatusExt = undefined;
export const BaseCorrespondenceExt = undefined;
export const CorrespondenceAttachmentExt = undefined;
export const CorrespondenceContentExt = undefined;
export const CorrespondenceDetailsExt = undefined;
export const CorrespondenceNotificationOverviewExt = undefined;
export const CorrespondenceOverviewExt = undefined;
export const CorrespondenceReplyOptionExt = undefined;
export const CorrespondenceStatusEventExt = undefined;
export const CorrespondenceStatusExt = undefined;
export const CorrespondencesExt = undefined;
export const CorrespondencesRoleType = undefined;
export const CustomNotificationRecipientExt = undefined;
export const DialogPortenSystemLabel = undefined;
export const EmailContentType = undefined;
export const ExternalReferenceExt = undefined;
export const InitializeAttachmentDataLocationTypeExt = undefined;
export const InitializeCorrespondenceAttachmentExt = undefined;
export const InitializeCorrespondenceContentExt = undefined;
export const InitializeCorrespondenceNotificationExt = undefined;
export const InitializeCorrespondencesExt = undefined;
export const InitializeCorrespondencesResponseExt = undefined;
export const InitializedCorrespondencesExt = undefined;
export const InitializedCorrespondencesNotificationsExt = undefined;
export const InitializedNotificationStatusExt = undefined;
export const NotificationChannelExt = undefined;
export const NotificationDetailsExt = undefined;
export const NotificationExt = undefined;
export const NotificationProcessStatusExt = undefined;
export const NotificationRecipientExt = undefined;
export const NotificationStatusDetailsExt = undefined;
export const NotificationStatusExt = undefined;
export const NotificationTemplateExt = undefined;
export const ProblemDetails = undefined;
export const ReferenceTypeExt = undefined;
