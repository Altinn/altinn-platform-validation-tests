/**
 * @typedef {"Plain"|"Html"} EmailContentType
 */

/**
 * @typedef {"Anytime"|"Daytime"} SendingTimePolicy
 */

/**
 * @typedef {"Email"|"Sms"|"EmailPreferred"|"SmsPreferred"|"EmailAndSms"} ChannelSchema
 */

/**
 * @typedef {Object} NotificationOrderChainRequestExt
 * @property {string|null} sendersReference Sender's reference identifier.
 * @property {string} requestedSendTime Earliest date and time when the notification should be delivered.
 * @property {string|null} conditionEndpoint URI endpoint that can determine whether the notification should be sent.
 * @property {DialogportenIdentifiersExt|null} dialogportenAssociation Identifiers for dialogs and transmissions within Dialogporten.
 * @property {string} idempotencyId Idempotency identifier defined by the sender.
 * @property {NotificationRecipientExt} recipient Notification recipient.
 * @property {NotificationReminderExt[]|null} reminders List of reminders that may be triggered under certain conditions after the initial notification has been processed.
 */

/**
 * @typedef {Object} ComposedEmailRequestExt
 * @property {string|null} sendersReference Sender's reference identifier.
 * @property {string} requestedSendTime Earliest date and time when the notification should be delivered.
 * @property {string|null} conditionEndpoint URI endpoint that can determine whether the notification should be sent.
 * @property {DialogportenIdentifiersExt|null} dialogportenAssociation Identifiers for dialogs and transmissions within Dialogporten.
 * @property {string} idempotencyId Idempotency identifier defined by the sender.
 * @property {RecipientComposedEmailExt} recipient Recipient for the composed email notification.
 */

/**
 * @typedef {Object} NotificationOrderChainResponseExt
 * @property {string} notificationOrderId Unique identifier for the notification order chain.
 * @property {NotificationOrderChainReceiptExt} notification Complete receipt for the notification order chain creation.
 */

/**
 * @typedef {Object} DialogportenIdentifiersExt
 * @property {string|null} dialogId Identifier for a specific dialog within Dialogporten.
 * @property {string|null} transmissionId Identifier for a specific transmission within Dialogporten.
 */

/**
 * @typedef {Object} NotificationRecipientExt
 * @property {RecipientEmailExt|null} recipientEmail Email recipient.
 * @property {RecipientSmsExt|null} recipientSms SMS recipient.
 * @property {RecipientPersonExt|null} recipientPerson Person recipient.
 * @property {RecipientOrganizationExt|null} recipientOrganization Organization recipient.
 * @property {RecipientExternalIdentityExt|null} recipientExternalIdentity External identity recipient.
 */

/**
 * @typedef {Object} NotificationReminderExt
 * @property {string|null} sendersReference Sender's reference for this reminder.
 * @property {string|null} conditionEndpoint Condition endpoint used to determine if the reminder should be sent.
 * @property {number|null} delayDays Number of days to delay this reminder.
 * @property {string|null} requestedSendTime Earliest date and time when the reminder should be delivered.
 * @property {NotificationRecipientExt} recipient Notification recipient.
 */

/**
 * @typedef {Object} RecipientEmailExt
 * @property {string} emailAddress Email address of the intended recipient.
 * @property {EmailSendingOptionsExt} emailSettings Email sending options.
 */

/**
 * @typedef {Object} RecipientSmsExt
 * @property {string} phoneNumber Recipient phone number in international format.
 * @property {SmsSendingOptionsExt} smsSettings SMS sending options.
 */

/**
 * @typedef {Object} RecipientPersonExt
 * @property {EmailSendingOptionsExt|null} emailSettings Email sending options.
 * @property {SmsSendingOptionsExt|null} smsSettings SMS sending options.
 * @property {string|null} resourceId URN-formatted resource identifier for authorization and auditing purposes.
 * @property {string|null} resourceAction Action to authorize against the resource.
 * @property {string} nationalIdentityNumber National identity number of the recipient.
 * @property {ChannelSchema} channelSchema Required channel scheme for delivering the notification.
 * @property {boolean|null} ignoreReservation Indicates whether to bypass the recipient's reservation against electronic communication.
 * @property {boolean|null} useStaleContactInformation Indicates whether to use potentially stale contact information from the Common Contact Register.
 */

/**
 * @typedef {Object} RecipientOrganizationExt
 * @property {EmailSendingOptionsExt|null} emailSettings Email sending options.
 * @property {SmsSendingOptionsExt|null} smsSettings SMS sending options.
 * @property {string|null} resourceId URN-formatted resource identifier for authorization and auditing purposes.
 * @property {string|null} resourceAction Action to authorize against the resource.
 * @property {string} orgNumber Organization number that identifies the recipient.
 * @property {ChannelSchema} channelSchema Required channel scheme for delivering the notification.
 */

/**
 * @typedef {Object} RecipientExternalIdentityExt
 * @property {EmailSendingOptionsExt|null} emailSettings Email sending options.
 * @property {SmsSendingOptionsExt|null} smsSettings SMS sending options.
 * @property {string|null} resourceId URN-formatted resource identifier for authorization and auditing purposes.
 * @property {string|null} resourceAction Action to authorize against the resource.
 * @property {string} externalIdentity External identity of the recipient in URN format.
 * @property {ChannelSchema} channelSchema Channel scheme for delivering the notification.
 */

/**
 * @typedef {Object} RecipientComposedEmailExt
 * @property {string} emailAddress Email address of the recipient.
 * @property {ComposedEmailSendingOptionsExt} emailSettings Email sending options including SAS-referenced files.
 */

/**
 * @typedef {Object} EmailSendingOptionsExt
 * @property {string|null} senderEmailAddress Sender's email address.
 * @property {string} subject Subject line of the email.
 * @property {string} body Main body content of the email.
 * @property {EmailContentType} contentType Content type of the email.
 * @property {SendingTimePolicy} sendingTimePolicy Policy defining when the email should be sent.
 */

/**
 * @typedef {Object} SmsSendingOptionsExt
 * @property {string|null} sender Sender identifier displayed in the recipient's SMS message.
 * @property {string} body Text content of the SMS message.
 * @property {SendingTimePolicy} sendingTimePolicy Policy controlling when the SMS should be delivered.
 */

/**
 * @typedef {Object} ComposedEmailSendingOptionsExt
 * @property {string|null} senderEmailAddress Sender's email address.
 * @property {string} subject Subject line of the email.
 * @property {string} body Main body content of the email.
 * @property {EmailContentType} contentType Content type of the email.
 * @property {SendingTimePolicy} sendingTimePolicy Policy defining when the email should be sent.
 * @property {SasFileReferenceExt[]|null} attachments Files to include in the email.
 */

/**
 * @typedef {Object} SasFileReferenceExt
 * @property {string} filename Filename including extension.
 * @property {string} mimeType MIME type of the file.
 * @property {string} sasUrl SAS URL granting time-limited read access to the file in Azure Blob Storage.
 */

/**
 * @typedef {Object} NotificationOrderChainReceiptExt
 * @property {string} shipmentId Unique identifier for this shipment.
 * @property {string|null} sendersReference Sender's reference identifier.
 * @property {NotificationOrderChainShipmentExt[]|null} reminders Reminders associated with this notification order.
 */

/**
 * @typedef {Object} NotificationOrderChainShipmentExt
 * @property {string} shipmentId Unique identifier for this shipment.
 * @property {string|null} sendersReference Sender's reference identifier.
 */

/**
 * @typedef {Object} NotificationResourceLinksExt
 * @property {string|null} self Self link.
 */

/**
 * @typedef {Object} NotificationsStatusSummaryExt
 * @property {EmailNotificationStatusExt|null} email Email notification status.
 * @property {SmsNotificationStatusExt|null} sms SMS notification status.
 */

/**
 * @typedef {Object} EmailNotificationStatusExt
 * @property {NotificationResourceLinksExt|null} links Resource links.
 * @property {number} generated Number of generated notifications.
 * @property {number} succeeded Number of succeeded notifications.
 */

/**
 * @typedef {Object} SmsNotificationStatusExt
 * @property {NotificationResourceLinksExt|null} links Resource links.
 * @property {number} generated Number of generated notifications.
 * @property {number} succeeded Number of succeeded notifications.
 */



/**
 * @typedef {"Asc"|"Desc"} StatusOrderBy
 */

/**
 * @typedef {"Order_Registered"|
 * "Order_Processing"|
 * "Order_Completed"|
 * "Order_SendConditionNotMet"|
 * "Order_Cancelled"|
 * "Order_Processed"|
 * "SMS_New"|
 * "SMS_Sending"|
 * "SMS_Accepted"|
 * "SMS_Delivered"|
 * "SMS_Failed"|
 * "SMS_Failed_InvalidRecipient"|
 * "SMS_Failed_RecipientReserved"|
 * "SMS_Failed_BarredReceiver"|
 * "SMS_Failed_Deleted"|
 * "SMS_Failed_Expired"|
 * "SMS_Failed_Undelivered"|
 * "SMS_Failed_RecipientNotIdentified"|
 * "SMS_Failed_Rejected"|
 * "SMS_Failed_TTL"|
 * "Email_New"|
 * "Email_Sending"|
 * "Email_Succeeded"|
 * "Email_Delivered"|
 * "Email_Failed"|
 * "Email_Failed_RecipientReserved"|
 * "Email_Failed_RecipientNotIdentified"|
 * "Email_Failed_InvalidFormat"|
 * "Email_Failed_SuppressedRecipient"|
 * "Email_Failed_TransientError"|
 * "Email_Failed_Bounced"|
 * "Email_Failed_FilteredSpam"|
 * "Email_Failed_Quarantined"|
 * "Email_Failed_TTL"|
 * "Email_Failed_InvalidSasUrl"|
 * "Email_Failed_PayloadTooLarge"} NotificationStatus
 */

/**
 * @typedef {Object} IDeliveryManifestExt
 * @property {NotificationStatus} status Current lifecycle status of the entity.
 * @property {string} lastUpdate Date and time when the status was last updated.
 * @property {string|null} destination Destination address where the entity is intended to be sent.
 */

/**
 * @typedef {Object} StatusFeedRecipientExt
 * @property {string|null} destination Recipient destination, supporting both email and SMS formats.
 * @property {NotificationStatus} status Current status of the processing lifecycle.
 * @property {string} lastUpdate Date and time of the last update.
 */

/**
 * @typedef {Object} NotificationDeliveryManifestExt
 * @property {string} shipmentId Unique identifier for the shipment.
 * @property {string|null} sendersReference Sender's reference identifier.
 * @property {string|null} type Shipment type.
 * @property {NotificationStatus} status Lifecycle status of orders and individual notifications.
 * @property {string} lastUpdate Date and time of the last update.
 * @property {IDeliveryManifestExt[]|null} recipients Recipients and delivery information.
 */

/**
 * @typedef {Object} StatusFeedExt
 * @property {string} shipmentId Unique identifier for the shipment associated with this order status.
 * @property {string|null} sendersReference Sender's reference for the order.
 * @property {StatusFeedRecipientExt[]|null} recipients Recipients and delivery status information.
 * @property {NotificationStatus} status Current lifecycle status of the order.
 * @property {string} lastUpdate Date and time when the status was created.
 * @property {string|null} shipmentType Type of shipment.
 * @property {number} sequenceNumber Sequence number of the status feed.
 */

/**
 * @typedef {Object} StatusFeedQuery
 * @property {number|null} seq Sequence number to start fetching status feed entries from.
 * @property {number|null} pageSize Number of items to return in one page.
 * @property {StatusOrderBy|null} orderBy Order in which status feed entries should be returned.
 */

/**
 * @typedef {"Plain"|"Html"} EmailContentType
 */

/**
 * @typedef {"Plain"|"Html"} EmailContentType
 */

/**
 * @typedef {Object} ShortMessageContentExt
 * @property {string|null} sender The sender identifier displayed in the recipient's SMS message.
 * @property {string} body The text content of the SMS message to be delivered to the recipient.
 */

/**
 * @typedef {Object} ShortMessageDeliveryDetailsExt
 * @property {string} phoneNumber The recipient's phone number in international format.
 * @property {number} timeToLiveInSeconds The time-to-live duration, specified in seconds.
 * @property {ShortMessageContentExt} smsSettings SMS content and sender information.
 */

/**
 * @typedef {Object} InstantSmsNotificationOrderRequestExt
 * @property {string} idempotencyId The unique identifier used to ensure the same notification is not processed multiple times.
 * @property {string|null} sendersReference The reference identifier assigned by the sender for tracking purposes.
 * @property {ShortMessageDeliveryDetailsExt} recipientSms Recipient SMS details.
 */

/**
 * @typedef {Object} InstantEmailContentExt
 * @property {string} subject The subject of the email.
 * @property {string} body The body content of the email.
 * @property {string|null} senderEmailAddress The sender's email address.
 * @property {EmailContentType|null} contentType The content type of the body.
 */

/**
 * @typedef {Object} InstantEmailDetailsExt
 * @property {string} emailAddress The recipient's email address.
 * @property {InstantEmailContentExt} emailSettings Email content and sender information.
 */

/**
 * @typedef {Object} InstantEmailNotificationOrderRequestExt
 * @property {string} idempotencyId The unique identifier used to ensure the same notification is not processed multiple times.
 * @property {string|null} sendersReference The reference identifier assigned by the sender for tracking purposes.
 * @property {InstantEmailDetailsExt} recipientEmail Recipient email details.
 */

/**
 * @typedef {Object} InstantNotificationOrderResponseExt
 * @property {string} notificationOrderId Unique identifier for the notification order.
 * @property {NotificationOrderChainShipmentExt} notification Notification shipment information.
 */