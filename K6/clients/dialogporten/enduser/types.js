/**
 * @typedef {Object} V1EndUserCommon_AcceptedLanguage
 * @property {string} languageCode
 * @property {number} weight
 */

/**
 * @typedef {Object} V1EndUserCommon_AcceptedLanguages
 * @property {Array<V1EndUserCommon_AcceptedLanguage>|null} [acceptedLanguage]
 */

/**
 * @typedef {Object} V1CommonLocalizations_Localization
 * @property {string} value The localized text (or URL if a front-channel embed).
 * @property {string} languageCode The language code of the localization in ISO 639-1 format.
 */

/**
 * @typedef {Object} DigdirDomainDialogportenApplicationCommon_Link
 * @property {string} metadata
 */

/**
 * @typedef {Object} V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceResource
 * @property {string} id
 * @property {string} resourceType
 * @property {string} status
 * @property {boolean} isDelegable
 * @property {number} minimumAuthenticationLevel
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {Object} V1CommonServiceResourceMetadata_ServiceResourceMetadataRole
 * @property {string} urn
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {Object} V1CommonServiceResourceMetadata_ServiceResourceMetadataAccessPackage
 * @property {string} urn
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {Object} V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceOwner
 * @property {string} orgNumber
 * @property {string} code
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 */

/**
 * @typedef {Object} V1CommonServiceResourceMetadata_ServiceResourceMetadataItem
 * @property {V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceResource} serviceResource
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataRole>|null} [roles]
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataAccessPackage>|null} [accessPackages]
 * @property {V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceOwner} serviceOwner
 */

/**
 * @typedef {Object} V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources
 * @property {boolean|null} [isFullCatalogueFallback] Set to true only when Items is the full referenced catalogue returned as a fallback instead of the caller's authorized subset: this happens when the caller is authorized to a very large number of parties on an unfiltered request, so the authorized union is not computed. Absent/null for a normal authorization-scoped result — supply a party filter to always get an authorization-scoped result.
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataItem>|null} [items]
 */


/**
 * @typedef {string} Actors_ActorType
 * Actor type.
 * @enum {"PartyRepresentative"|"ServiceOwner"}
 */

/**
 * @typedef {Object} V1EndUserCommonActors_Actor
 * @property {Actors_ActorType} actorType The type of actor; either the service owner, or someone representing the party.
 * @property {string|null} [actorName] The name of the actor.
 * @property {string|null} [actorId] The identifier (national identity number or organization number) of the actor.
 */

/**
 * @typedef {Object} V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog
 * @property {string} createdAt Date and time when the label assignment was created.
 * @property {string} name Label name.
 * @property {string} action Label assignment action.
 * @property {V1EndUserCommonActors_Actor} performedBy Actor who performed the action.
 */

/**
 * @typedef {Object} ProblemDetails_Error
 * @property {string|null} [title] Error title.
 * @property {string|null} [code] Error code.
 * @property {string|null} [detail] Error details.
 * @property {Array<string>|null} [paths] Error paths.
 */

/**
 * @typedef {Object} ProblemDetails
 * @property {string|null} [type] Problem type.
 * @property {string|null} [title] Problem title.
 * @property {number|null} [status] HTTP status code.
 * @property {string|null} [detail] Problem details.
 * @property {string|null} [instance] Problem instance.
 * @property {string|null} [statusDescription] HTTP status description.
 * @property {string|null} [code] Error code.
 * @property {string|null} [traceId] Trace identifier.
 * @property {Array<ProblemDetails_Error>|null} [validationErrors] Validation errors.
 * @property {Object<string, Array<string>>} errors Validation errors by field.
 */


/**
 * @typedef {string} DialogEndUserContextsEntities_SystemLabel
 * System label.
 * @enum {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"}
 */

/**
 * @typedef {Object} V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs. Deprecated: Use AddLabels instead. This property will be removed in a future version.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to the target dialog. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from the target dialog. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 */

/**
 * @typedef {string} DialogEndUserContextsEntities_SystemLabel
 * System label.
 * @enum {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"}
 */

/**
 * @typedef {Object} V1EndUserEndUserContextCommandsBulkSetSystemLabels_DialogRevision
 * @property {string} dialogId Target dialog id for system labels.
 * @property {string|null} [endUserContextRevision] Optional end user context revision to match against. If supplied and not matching current revision, the entire operation will fail.
 */

/**
 * @typedef {Object} V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel
 * @property {Array<V1EndUserEndUserContextCommandsBulkSetSystemLabels_DialogRevision>|null} [dialogs] List of target dialog ids with optional revision ids.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs. Deprecated: Use AddLabels instead. This property will be removed in a future version.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to the target dialogs. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from the target dialogs. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 */

/**
 * @typedef {string} DialogsEntitiesTransmissions_DialogTransmissionType
 * Transmission type.
 * @enum {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"}
 */

/**
 * @typedef {string} Attachments_AttachmentUrlConsumerType
 * Attachment URL consumer type.
 * @enum {"Gui"|"Api"}
 */

/**
 * @typedef {Object} V1CommonContent_ContentValue
 * @property {Array<V1CommonLocalizations_Localization>|null} [value] A list of localizations for the content.
 * @property {string} mediaType Media type of the content, this can also indicate that the content is embeddable.
 * @property {boolean|null} [isAuthorized] True if the authenticated user is authorized for this content. If not, the endpoints will be replaced with a fixed placeholder. Can be null if not applicable.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchTransmissions_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchTransmissions_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchTransmissions_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesSearchTransmissions_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchTransmissions_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission, or "urn:dialogporten:expired" if the action has expired.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchTransmissions_Transmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] The authorization attribute associated with the transmission.
 * @property {boolean} isAuthorized Flag indicating if the authenticated user is authorized for this transmission. If not, embedded content and the attachments will not be available.
 * @property {string|null} [extendedType] The extended type URI for the transmission.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] The unique identifier for the related transmission, if any.
 * @property {string|null} [deletedAt] The date and time when the transmission was deleted, if applicable.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of the transmission.
 * @property {V1EndUserCommonActors_Actor} sender The sender actor information for the transmission.
 * @property {V1EndUserDialogsQueriesSearchTransmissions_Content} content The content of the transmission.
 * @property {Array<V1EndUserDialogsQueriesSearchTransmissions_Attachment>|null} [attachments] The attachments associated with the transmission.
 * @property {Array<V1EndUserDialogsQueriesSearchTransmissions_NavigationalAction>|null} [navigationalActions] The navigational actions associated with the transmission.
 */





/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchSeenLogs_SeenLog
 * @property {string} id
 * @property {string} seenAt
 * @property {V1EndUserCommonActors_Actor} seenBy
 * @property {boolean} isViaServiceOwner
 * @property {boolean} isCurrentEndUser
 */

/**
 * @typedef {string} DialogsEntitiesActivities_DialogActivityType
 * Activity type.
 * @enum {"DialogCreated"|"DialogClosed"|"Information"|"TransmissionOpened"|"PaymentMade"|"SignatureProvided"|"DialogOpened"|"DialogDeleted"|"DialogRestored"|"SentToSigning"|"SentToFormFill"|"SentToSendIn"|"SentToPayment"|"FormSubmitted"|"FormSaved"|"CorrespondenceOpened"|"CorrespondenceConfirmed"}
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearchActivities_Activity
 * @property {string} id
 * @property {string} createdAt
 * @property {string|null} [extendedType]
 * @property {DialogsEntitiesActivities_DialogActivityType} type
 * @property {string|null} [transmissionId]
 * @property {Array<V1CommonLocalizations_Localization>|null} [description]
 */


/**
 * @typedef {string} DialogsEntities_DialogStatus
 * Dialog status.
 * @enum {"InProgress"|"Draft"|"RequiresAttention"|"Completed"|"NotApplicable"|"Awaiting"}
 */

/**
 * @typedef {Object} PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog
 * @property {Array<V1EndUserDialogsQueriesSearch_Dialog>|null} [items] The paginated list of items.
 * @property {boolean} hasNextPage Whether there are more items available that can be fetched by supplying the continuation token.
 * @property {string|null} [continuationToken] The continuation token to be used to fetch the next page of items.
 * @property {string} orderBy The current sorting order of the items.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary string with a service-specific activity type.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier.
 * @property {V1EndUserCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1EndUserCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the current end user.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogEndUserContext
 * @property {string} revision The unique identifier for the end user context revision in UUIDv4 format.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] System defined labels used to categorize dialogs.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog.
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state.
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the ExtendedStatus field.
 */

/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string} org The service owner code representing the organization related to this dialog.
 * @property {string} serviceResource The service identifier for the service that the dialog is related to in URN-format.
 * @property {string} serviceResourceType The ServiceResource type.
 * @property {string} party The party code representing the organization or person that the dialog belongs to in URN format.
 * @property {number|null} [progress] Advisory indicator of progress, represented as 1-100 percentage value.
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier.
 * @property {number|null} [guiAttachmentCount] The number of attachments in the dialog made available for browser-based frontends.
 * @property {string|null} [extendedStatus] Service-specific indicator of status.
 * @property {string|null} [externalReference] Service-specific reference to an external system or service.
 * @property {string} createdAt The date and time when the dialog was created.
 * @property {string} updatedAt The date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt The date and time when the dialog content was last updated.
 * @property {string|null} [dueAt] The due date for the dialog.
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog transmissions as seen by the end user.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel Deprecated system label.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by the service owner.
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative.
 * @property {V1EndUserDialogsQueriesSearch_DialogActivity|null} [latestActivity] The latest entry in the dialog's activity log.
 * @property {Array<V1EndUserDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastUpdate] Seen log entries newer than the dialog UpdatedAt date.
 * @property {Array<V1EndUserDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastContentUpdate] Seen log entries newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether a dialog has been seen since its last content update.
 * @property {V1EndUserDialogsQueriesSearch_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 * @property {V1EndUserDialogsQueriesSearch_Content|null} [content] The content of the dialog in search results.
 */





/**
 * The type of a dialog transmission.
 *
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} DialogTransmissionType
 */

/**
 * Gets a single dialog transmission.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_Transmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] The authorization attribute associated with the transmission.
 * @property {boolean} isAuthorized Flag indicating if the authenticated user is authorized for this transmission. If not, embedded content and attachments will not be available.
 * @property {string|null} [extendedType] The extended type URI for the transmission.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] The unique identifier for the related transmission, if any.
 * @property {string|null} [deletedAt] The date and time when the transmission was deleted, if applicable.
 * @property {DialogTransmissionType} type The type of the transmission.
 * @property {V1EndUserCommonActors_Actor} sender The sender actor information for the transmission.
 * @property {V1EndUserDialogsQueriesGetTransmission_Content} content The content of the transmission.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_Attachment>|null} [attachments] The attachments associated with the transmission.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_NavigationalAction>|null} [navigationalActions] The navigational actions associated with the transmission.
 */

/**
 * The content of a transmission.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content.
 */

/**
 * An attachment associated with a transmission.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_AttachmentUrl>|null} [urls] The URLs associated with the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * An attachment URL representation.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * The type of consumer the attachment URL is intended for.
 *
 * @typedef {"Gui"|"Api"} AttachmentUrlConsumerType
 */

/**
 * A navigational action associated with a transmission.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * Gets a single dialog seen log record.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetSeenLog_SeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1EndUserCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the current end user.
 */

/**
 * Gets a single dialog activity.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGetActivity_Activity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string} createdAt The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary string with a service-specific activity type.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field contains the transmission identifier.
 * @property {V1EndUserCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * The type of a dialog activity.
 *
 * @typedef {
 *   "DialogCreated"|
 *   "DialogClosed"|
 *   "Information"|
 *   "TransmissionOpened"|
 *   "PaymentMade"|
 *   "SignatureProvided"|
 *   "DialogOpened"|
 *   "DialogDeleted"|
 *   "DialogRestored"|
 *   "SentToSigning"|
 *   "SentToFormFill"|
 *   "SentToSendIn"|
 *   "SentToPayment"|
 *   "FormSubmitted"|
 *   "FormSaved"|
 *   "CorrespondenceOpened"|
 *   "CorrespondenceConfirmed"
 * } DialogsEntitiesActivities_DialogActivityType
 */

/**
 * Gets a single dialog aggregate.
 *
 * @typedef {Object} V1EndUserDialogsQueriesGet_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string} revision The unique identifier for the revision in UUIDv4 format.
 * @property {string} org The service owner code representing the organization related to this dialog.
 * @property {string} serviceResource The service identifier for the service that the dialog is related to in URN format.
 * @property {string} serviceResourceType The ServiceResource type, as defined in Altinn Resource Registry.
 * @property {string} party The party code representing the organization or person that the dialog belongs to in URN format.
 * @property {number|null} [progress] Advisory indicator of progress, represented as a 1-100 percentage value.
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier to indicate the business process that preceded this dialog process.
 * @property {string|null} [extendedStatus] Service-specific indicator of status.
 * @property {string|null} [externalReference] Service-specific reference to an external system or service.
 * @property {string|null} [dueAt] The due date for the dialog.
 * @property {string|null} [expiresAt] The expiration date for the dialog.
 * @property {string} createdAt The date and time when the dialog was created.
 * @property {string} updatedAt The date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt The date and time when the dialog content was last updated.
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel @deprecated Use EndUserContext.SystemLabels instead.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only.
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog transmissions as seen by the end user.
 * @property {V1EndUserDialogsQueriesGet_Content} content The dialog unstructured text content.
 * @property {string|null} [dialogToken] The dialog token used for supported external URLs and front-channel embeds.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by a service owner.
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogAttachment>|null} [attachments] Attachments associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogTransmission>|null} [transmissions] Immutable list of transmissions associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogGuiAction>|null} [guiActions] GUI actions associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogApiAction>|null} [apiActions] API actions associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogActivity>|null} [activities] Immutable list of activities associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastUpdate] Seen log entries newer than the dialog UpdatedAt date.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastContentUpdate] Seen log entries newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether the dialog has been seen since its last content update.
 * @property {V1EndUserDialogsQueriesGet_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 */


/**
 * Represents a dialog returned from the end-user dialog API.
 *
 * @typedef {Object} Dialog
 * @property {string} id The unique identifier for the dialog.
 * @property {string} revision The unique identifier for the dialog revision.
 * @property {string} org Service owner code.
 * @property {string} serviceResource Service identifier in URN format.
 * @property {string} serviceResourceType Service resource type.
 * @property {string} party Owning party identifier.
 * @property {?number} progress Advisory completion percentage (1-100).
 * @property {?string} process Business process identifier.
 * @property {?string} precedingProcess Previous business process identifier.
 * @property {?string} extendedStatus Service-specific status.
 * @property {?string} externalReference External service reference.
 * @property {?string} dueAt Due date of the dialog.
 * @property {?string} expiresAt Expiration date of the dialog.
 * @property {string} createdAt Creation timestamp.
 * @property {string} updatedAt Last update timestamp.
 * @property {string} contentUpdatedAt Last content update timestamp.
 * @property {DialogStatus} status Aggregated dialog status.
 * @property {?SystemLabel} systemLabel Deprecated system label.
 * @property {boolean} isApiOnly Whether the dialog is API-only.
 * @property {boolean} hasUnopenedContent Whether unopened content exists.
 * @property {DialogContent} content Dialog content.
 * @property {?string} dialogToken Token for external URLs and embeds.
 * @property {number} fromServiceOwnerTransmissionsCount Number of service owner transmissions.
 * @property {number} fromPartyTransmissionsCount Number of party transmissions.
 * @property {?DialogAttachment[]} attachments Dialog-level attachments.
 * @property {?DialogTransmission[]} transmissions Dialog transmissions.
 * @property {?DialogGuiAction[]} guiActions GUI actions.
 * @property {?DialogApiAction[]} apiActions API actions.
 * @property {?DialogActivity[]} activities Dialog activities.
 * @property {?DialogSeenLog[]} seenSinceLastUpdate Seen log entries since last update.
 * @property {?DialogSeenLog[]} seenSinceLastContentUpdate Seen log entries since content update.
 * @property {boolean} isContentSeen Whether content has been seen.
 * @property {DialogEndUserContext} endUserContext End-user metadata.
 */

/**
 * Represents a dialog returned from search results.
 *
 * @typedef {Object} SearchDialog
 * @property {string} id Dialog identifier.
 * @property {string} org Service owner code.
 * @property {string} serviceResource Service resource.
 * @property {string} serviceResourceType Service resource type.
 * @property {string} party Owning party.
 * @property {?number} progress Completion progress.
 * @property {?string} process Process identifier.
 * @property {?string} precedingProcess Previous process identifier.
 * @property {?number} guiAttachmentCount Number of GUI attachments.
 * @property {?string} extendedStatus Service-specific status.
 * @property {?string} externalReference External reference.
 * @property {string} createdAt Creation timestamp.
 * @property {string} updatedAt Update timestamp.
 * @property {string} contentUpdatedAt Content update timestamp.
 * @property {?string} dueAt Due timestamp.
 * @property {DialogStatus} status Dialog status.
 * @property {boolean} hasUnopenedContent Whether content is unopened.
 * @property {?SystemLabel} systemLabel Deprecated system label.
 * @property {boolean} isApiOnly API-only flag.
 * @property {number} fromServiceOwnerTransmissionsCount Number of service owner transmissions.
 * @property {number} fromPartyTransmissionsCount Number of party transmissions.
 * @property {?DialogActivity} latestActivity Latest activity.
 * @property {?DialogSeenLog[]} seenSinceLastUpdate Seen entries.
 * @property {?DialogSeenLog[]} seenSinceLastContentUpdate Seen entries since content update.
 * @property {boolean} isContentSeen Whether content is seen.
 * @property {DialogEndUserContext} endUserContext End-user context.
 * @property {?SearchContent} content Search content.
 */

/**
 * Paginated dialog search result.
 *
 * @typedef {Object} PaginatedDialogList
 * @property {?SearchDialog[]} items Dialog results.
 * @property {boolean} hasNextPage Whether more pages exist.
 * @property {?string} continuationToken Token for fetching the next page.
 * @property {string} orderBy Current sorting order.
 */


/**
 * @typedef {Object} Dialog
 * @property {string} id UUIDv7 dialog identifier
 * @property {string} revision UUIDv4 revision identifier
 * @property {string} org Service owner code
 * @property {string} serviceResource Service resource URN
 * @property {string} serviceResourceType Service resource type
 * @property {string} party Owning party URN
 * @property {?number} progress Progress percentage (1-100)
 * @property {?string} process Business process identifier
 * @property {?string} precedingProcess Previous process identifier
 * @property {?string} extendedStatus Service-specific status
 * @property {?string} externalReference External reference
 * @property {?string} dueAt Due date
 * @property {?string} expiresAt Expiration date
 * @property {string} createdAt Created timestamp
 * @property {string} updatedAt Updated timestamp
 * @property {string} contentUpdatedAt Content updated timestamp
 * @property {DialogStatus} status Dialog status
 * @property {?SystemLabel} systemLabel @deprecated Use endUserContext.systemLabels
 * @property {boolean} isApiOnly Whether dialog is API-only
 * @property {boolean} hasUnopenedContent Whether unopened content exists
 * @property {DialogContent} content Dialog content
 * @property {?string} dialogToken Dialog token
 * @property {number} fromServiceOwnerTransmissionsCount Service owner transmission count
 * @property {number} fromPartyTransmissionsCount Party transmission count
 * @property {?DialogAttachment[]} attachments Dialog attachments
 * @property {?DialogTransmission[]} transmissions Dialog transmissions
 * @property {?DialogGuiAction[]} guiActions GUI actions
 * @property {?DialogApiAction[]} apiActions API actions
 * @property {?DialogActivity[]} activities Activities
 * @property {?DialogSeenLog[]} seenSinceLastUpdate Seen logs since update
 * @property {?DialogSeenLog[]} seenSinceLastContentUpdate Seen logs since content update
 * @property {boolean} isContentSeen Whether content has been seen
 * @property {DialogEndUserContext} endUserContext End user context
 */


/**
 * @typedef {Object} DialogContent
 * @property {ContentValue} title Title
 * @property {?ContentValue} summary Summary
 * @property {?ContentValue} senderName Sender name
 * @property {?ContentValue} additionalInfo Additional information
 * @property {?ContentValue} extendedStatus Human readable status
 * @property {?ContentValue} mainContentReference Embedded content reference
 */


/**
 * @typedef {Object} DialogEndUserContext
 * @property {string} revision Context revision
 * @property {?SystemLabel[]} systemLabels System labels
 */


/**
 * @typedef {Object} DialogAttachment
 * @property {string} id Attachment identifier
 * @property {?Localization[]} displayName Display name
 * @property {?string} name Logical attachment name
 * @property {?DialogAttachmentUrl[]} urls Attachment URLs
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} DialogAttachmentUrl
 * @property {string} id Attachment URL identifier
 * @property {string} url Attachment URL
 * @property {?string} mediaType Media type
 * @property {AttachmentUrlConsumerType} consumerType Consumer type
 */


/**
 * @typedef {Object} DialogGuiAction
 * @property {string} id Action identifier
 * @property {string} action Action name
 * @property {string} url Action URL
 * @property {?string} authorizationAttribute Authorization attribute
 * @property {boolean} isAuthorized Authorization status
 * @property {boolean} isDeleteDialogAction Whether action deletes dialog
 * @property {DialogGuiActionPriority} priority Action priority
 * @property {HttpVerb} httpMethod HTTP method
 * @property {?Localization[]} title Action title
 * @property {?Localization[]} prompt Confirmation prompt
 */


/**
 * @typedef {"Primary"|"Secondary"|"Tertiary"} DialogGuiActionPriority
 */


/**
 * @typedef {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"} SystemLabel
 */


/**
 * @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"HEAD"|"OPTIONS"|"TRACE"|"CONNECT"} HttpVerb
 */


/**
 * @typedef {"ServiceOwner"|"PartyRepresentative"} ActorType
 */


/**
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} TransmissionType
 */


/**
 * @typedef {Object} Actor
 * @property {ActorType} actorType Actor type
 * @property {?string} actorName Actor name
 * @property {?string} actorId Actor identifier
 */


/**
 * @typedef {Object} Localization
 * @property {string} value Localized value
 * @property {string} languageCode ISO language code
 */


/**
 * @typedef {Object} ContentValue
 * Implementation depends on V1CommonContent_ContentValue schema.
 */


/**
 * @typedef {Object} DialogTransmission
 * @property {string} id Transmission identifier
 * @property {string} createdAt Created timestamp
 * @property {?string} authorizationAttribute Authorization attribute
 * @property {boolean} isAuthorized Whether user is authorized
 * @property {?string} extendedType Service-specific transmission type URI
 * @property {?string} externalReference External reference
 * @property {?string} relatedTransmissionId Related transmission identifier
 * @property {TransmissionType} type Transmission type
 * @property {Actor} sender Sender actor
 * @property {boolean} isOpened Whether transmission has been opened
 * @property {DialogTransmissionContent} content Transmission content
 * @property {?DialogTransmissionAttachment[]} attachments Transmission attachments
 * @property {?DialogTransmissionNavigationalAction[]} navigationalActions Navigational actions
 */


/**
 * @typedef {Object} Transmission
 * Full transmission response from:
 * GET /api/v1/enduser/dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @property {string} id Transmission identifier
 * @property {string} createdAt Created timestamp
 * @property {?string} authorizationAttribute Authorization attribute
 * @property {boolean} isAuthorized Whether authenticated user is authorized
 * @property {?string} extendedType Extended type URI
 * @property {?string} externalReference External reference
 * @property {?string} relatedTransmissionId Related transmission identifier
 * @property {?string} deletedAt Deleted timestamp
 * @property {TransmissionType} type Transmission type
 * @property {Actor} sender Sender actor
 * @property {TransmissionContent} content Transmission content
 * @property {?TransmissionAttachment[]} attachments Attachments
 * @property {?TransmissionNavigationalAction[]} navigationalActions Navigational actions
 */


/**
 * @typedef {Object} DialogTransmissionContent
 * @property {ContentValue} title Transmission title
 * @property {?ContentValue} summary Transmission summary
 * @property {?ContentValue} contentReference Embedded content reference
 */


/**
 * @typedef {Object} TransmissionContent
 * @property {ContentValue} title Transmission title
 * @property {?ContentValue} summary Transmission summary
 * @property {?ContentValue} contentReference Embedded content reference
 */


/**
 * @typedef {Object} DialogTransmissionAttachment
 * @property {string} id Attachment identifier
 * @property {?Localization[]} displayName Display name
 * @property {?string} name Logical attachment name
 * @property {?DialogTransmissionAttachmentUrl[]} urls Attachment URLs
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} TransmissionAttachment
 * @property {string} id Attachment identifier
 * @property {?Localization[]} displayName Display name
 * @property {?string} name Logical attachment name
 * @property {?TransmissionAttachmentUrl[]} urls Attachment URLs
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} DialogTransmissionAttachmentUrl
 * @property {string} id URL identifier
 * @property {string} url Attachment URL
 * @property {?string} mediaType Media type
 * @property {AttachmentUrlConsumerType} consumerType Consumer type
 */


/**
 * @typedef {Object} TransmissionAttachmentUrl
 * @property {string} id URL identifier
 * @property {string} url Attachment URL
 * @property {?string} mediaType Media type
 * @property {AttachmentUrlConsumerType} consumerType Consumer type
 */


/**
 * @typedef {Object} DialogTransmissionNavigationalAction
 * @property {?Localization[]} title Action title
 * @property {string} url Action URL
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} TransmissionNavigationalAction
 * @property {?Localization[]} title Action title
 * @property {string} url Action URL
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {"Attachment"|"Preview"|"Download"} AttachmentUrlConsumerType
 *
 * NOTE:
 * Replace values if your Attachments_AttachmentUrlConsumerType
 * schema defines different enum members.
 */


/**
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} TransmissionType
 */


/**
 * @typedef {Object} DialogApiAction
 * @property {string} id Action identifier
 * @property {string} action Action identifier matching the authorization policy action attribute
 * @property {?string} authorizationAttribute Authorization attribute
 * @property {boolean} isAuthorized Whether the authenticated user is authorized
 * @property {?string} name Logical operation name
 * @property {?DialogApiActionEndpoint[]} endpoints API endpoints
 */


/**
 * @typedef {Object} DialogApiActionEndpoint
 * @property {string} id Endpoint identifier
 * @property {?string} version Endpoint version
 * @property {string} url Endpoint URL
 * @property {HttpVerb} httpMethod HTTP method
 * @property {?string} documentationUrl Documentation URL
 * @property {?string} requestSchema Request schema URL
 * @property {?string} responseSchema Response schema URL
 * @property {boolean} deprecated Whether endpoint is deprecated
 * @property {?string} sunsetAt Endpoint sunset timestamp
 */


/**
 * @typedef {Object} DialogActivity
 * Activity returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/activities/{activityId}
 *
 * @property {string} id Activity identifier
 * @property {?string} createdAt Activity creation timestamp
 * @property {?string} extendedType Extended activity type URI
 * @property {DialogActivityType} type Activity type
 * @property {?string} transmissionId Related transmission identifier
 * @property {Actor} performedBy Actor performing activity
 * @property {?Localization[]} description Activity description
 */


/**
 * @typedef {Object} DialogSeenLog
 * Seen log returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/seenlog/{seenLogId}
 *
 * @property {string} id Seen log identifier
 * @property {string} seenAt Seen timestamp
 * @property {Actor} seenBy Actor who saw the dialog revision
 * @property {?boolean} isViaServiceOwner Whether created through service owner API
 * @property {boolean} isCurrentEndUser Whether created by current end user
 */


/**
 * @typedef {"Information"|"Created"|"Updated"|"TransmissionOpened"|"CorrespondenceOpened"} DialogActivityType
 *
 * NOTE:
 * Replace values with the exact DialogsEntities_Activities_DialogActivityType enum
 * if additional members exist in the OpenAPI document.
 */


/**
 * @typedef {Object} PaginatedDialogList
 * Pagination wrapper returned from:
 * GET /api/v1/enduser/dialogs
 *
 * @property {Dialog[]} data Dialog results
 * @property {?string} continuationToken Token for next page
 * @property {boolean} hasNextPage Whether more results exist
 */


/**
 * @typedef {Object} V1CommonContent_ContentValue
 *
 * Content value referenced by dialog and transmission content.
 *
 * The exact shape was not included in the provided OpenAPI excerpts.
 * Replace this typedef with the generated schema when available.
 */


/**
 * @typedef {string} DialogStatus
 *
 * Dialog status enum:
 * DialogsEntities_DialogStatus
 *
 * Exact enum values were not included in the provided schemas.
 */


/**
 * @typedef {string} AttachmentUrlConsumerType
 *
 * Attachment URL consumer type enum:
 * Attachments_AttachmentUrlConsumerType
 *
 * Exact enum values were not included in the provided schemas.
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_Dialog
 *
 * Dialog model returned from:
 * GET /api/v1/enduser/dialogs
 *
 * This schema was included earlier as:
 * V1EndUserDialogsQueriesGet_Dialog
 *
 * The search endpoint references its own schema name:
 * V1EndUserDialogsQueriesSearch_Dialog
 *
 * Add fields from that schema if it differs from the GET dialog aggregate.
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogActivity
 *
 * Activity model returned by dialog search.
 *
 * Matches:
 * V1EndUserDialogsQueriesSearch_DialogActivity
 *
 * @property {string} id Activity identifier
 * @property {?string} createdAt Activity timestamp
 * @property {?string} extendedType Extended activity URI
 * @property {DialogActivityType} type Activity type
 * @property {?string} transmissionId Related transmission identifier
 * @property {Actor} performedBy Actor performing activity
 * @property {?Localization[]} description Description
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogSeenLog
 *
 * Seen log model returned by dialog search.
 *
 * Matches:
 * V1EndUserDialogsQueriesSearch_DialogSeenLog
 *
 * @property {string} id Seen log identifier
 * @property {string} seenAt Seen timestamp
 * @property {Actor} seenBy Actor who saw the dialog
 * @property {?boolean} isViaServiceOwner Created through service owner API
 * @property {boolean} isCurrentEndUser Created by current end user
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesSearch_DialogEndUserContext
 *
 * End user context model returned by dialog search.
 *
 * @property {string} revision Context revision
 * @property {?SystemLabel[]} systemLabels System labels
 */


/**
 * @typedef {Object} PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog
 *
 * Response wrapper referenced by:
 * GET /api/v1/enduser/dialogs
 *
 * Exact pagination property names should be verified from:
 * PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog
 *
 * Common fields:
 *
 * @property {V1EndUserDialogsQueriesSearch_Dialog[]} items Result items
 * @property {?string} continuationToken Continuation token
 * @property {boolean} hasNextPage Whether another page exists
 */


/**
 * @typedef {Object} ProblemDetails
 *
 * RFC7807 problem response.
 *
 * Exact schema was not included in the provided OpenAPI excerpts.
 */


/**
 * @typedef {Object} V1EndUserCommon_AcceptedLanguages
 *
 * Header schema for accept-Language.
 *
 * Exact schema was not included in the provided OpenAPI excerpts.
 */




/**
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_Content
 *
 * Content returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @property {V1CommonContent_ContentValue} title Transmission title
 * @property {?V1CommonContent_ContentValue} summary Transmission summary
 * @property {?V1CommonContent_ContentValue} contentReference Embedded content reference
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_Attachment
 *
 * Attachment returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @property {string} id Attachment identifier
 * @property {?V1CommonLocalizations_Localization[]} displayName Display name
 * @property {?string} name Logical attachment name
 * @property {?V1EndUserDialogsQueriesGetTransmission_AttachmentUrl[]} urls Attachment URLs
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_AttachmentUrl
 *
 * Attachment URL returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @property {string} id Attachment URL identifier
 * @property {string} url Attachment URL
 * @property {?string} mediaType Media type
 * @property {Attachments_AttachmentUrlConsumerType} consumerType URL consumer type
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGetTransmission_NavigationalAction
 *
 * Navigational action returned from:
 * GET /api/v1/enduser/dialogs/{dialogId}/transmissions/{transmissionId}
 *
 * @property {?V1CommonLocalizations_Localization[]} title Action title
 * @property {string} url Action URL
 * @property {?string} expiresAt Expiration timestamp
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGetActivity_Activity
 *
 * Full activity endpoint model.
 *
 * @property {string} id Activity identifier
 * @property {?string} createdAt Creation timestamp
 * @property {?string} extendedType Extended type URI
 * @property {DialogsEntitiesActivities_DialogActivityType} type Activity type
 * @property {?string} transmissionId Related transmission identifier
 * @property {V1EndUserCommonActors_Actor} performedBy Actor
 * @property {?V1CommonLocalizations_Localization[]} description Description
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGetSeenLog_SeenLog
 *
 * Full seen log endpoint model.
 *
 * @property {string} id Seen log identifier
 * @property {string} seenAt Seen timestamp
 * @property {V1EndUserCommonActors_Actor} seenBy Actor
 * @property {boolean} isViaServiceOwner Created through service owner API
 * @property {boolean} isCurrentEndUser Created by current end user
 */


/**
 * @typedef {Object} V1EndUserDialogsQueriesGet_DialogEndUserContext
 *
 * Context returned with a dialog aggregate.
 *
 * @property {string} revision Context revision
 * @property {?DialogEndUserContextsEntities_SystemLabel[]} systemLabels System labels
 */


/**
 * @typedef {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"} DialogEndUserContextsEntities_SystemLabel
 */


/**
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} DialogsEntitiesTransmissions_DialogTransmissionType
 */


/**
 * @typedef {"Primary"|"Secondary"|"Tertiary"} DialogsEntitiesActions_DialogGuiActionPriority
 */


/**
 * @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"HEAD"|"OPTIONS"|"TRACE"|"CONNECT"} Http_HttpVerb
 */


/**
 * @typedef {"PartyRepresentative"|"ServiceOwner"} Actors_ActorType
 */


/**
 * @typedef {string} DialogsEntitiesActivities_DialogActivityType
 *
 * Activity type enum.
 *
 * The exact enum values were not included in the supplied schema excerpt.
 */


/**
 * @typedef {string} Attachments_AttachmentUrlConsumerType
 *
 * Attachment URL consumer enum.
 *
 * The exact enum values were not included in the supplied schema excerpt.
 */


/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupServiceResource
 *
 * Service resource metadata returned during dialog lookup.
 *
 * @property {string} id Service resource identifier
 * @property {boolean} isDelegable Whether the resource supports delegation
 * @property {number} minimumAuthenticationLevel Minimum required authentication level
 * @property {?V1CommonLocalizations_Localization[]} name Localized resource name
 */


/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupServiceOwner
 *
 * Service owner metadata returned during dialog lookup.
 *
 * @property {string} orgNumber Organization number
 * @property {string} code Service owner code
 * @property {?V1CommonLocalizations_Localization[]} name Localized service owner name
 */


/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidence
 *
 * Authorization evidence returned during dialog lookup.
 *
 * @property {number} currentAuthenticationLevel Current authentication level
 * @property {boolean} viaRole Authorized via role
 * @property {boolean} viaAccessPackage Authorized via access package
 * @property {boolean} viaResourceDelegation Authorized via resource delegation
 * @property {boolean} viaInstanceDelegation Authorized via instance delegation
 * @property {?V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidenceItem[]} evidence Authorization evidence items
 */



/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidenceItem
 *
 * Individual authorization evidence item returned during dialog lookup.
 *
 * @property {V1CommonIdentifierLookup_IdentifierLookupGrantType} grantType Grant type
 * @property {string} subject Subject identifier
 * @property {?V1CommonLocalizations_Localization[]} name Localized evidence name
 * @property {?DigdirDomainDialogportenApplicationCommon_Link} links Related links
 */

/**
 * @typedef {"Role"|"AccessPackage"|"ResourceDelegation"|"InstanceDelegation"} V1CommonIdentifierLookup_IdentifierLookupGrantType
 *
 * Authorization grant type.
 */


/**
 * @typedef {Object} DigdirDomainDialogportenApplicationCommon_Link
 *
 * Link metadata associated with authorization evidence.
 *
 * @property {string} metadata Link metadata
 */


/**
 * @typedef {Object} V1AccessManagementQueriesGetParties_Parties
 * @property {V1AccessManagementQueriesGetParties_AuthorizedParty[]|null} [authorizedParties]
 */

/**
 * @typedef {Object} V1AccessManagementQueriesGetParties_AuthorizedParty
 * @property {string} party
 * The party identifier in URN format.
 * @property {string} partyUuid
 * The UUID for the party.
 * @property {number} partyId
 * The numeric identifier for the party.
 * @property {string} name
 * The name of the party (verbatim from CCR, usually in all caps).
 * @property {string|null} [dateOfBirth]
 * The date of birth of the party, if a person.
 * @property {string} partyType
 * The type of the party, either "Organization" or "Person".
 * @property {boolean} isDeleted
 * Whether the party is deleted or not.
 * @property {boolean} hasKeyRole
 * Whether the authenticated user has a key role in the party.
 * @property {boolean} isCurrentEndUser
 * Whether this party represents the authenticated user.
 * @property {boolean} isMainAdministrator
 * Whether the authenticated user is the main administrator of the party.
 * @property {boolean} isAccessManager
 * Whether the authenticated user is an access manager of the party.
 * @property {boolean} hasOnlyAccessToSubParties
 * Whether the authenticated user has only access to sub parties of this party, and not this party itself.
 * @property {V1AccessManagementQueriesGetParties_AuthorizedParty[]|null} [subParties]
 * The sub parties of this party, if any. The sub party uses the same data model.
 */
