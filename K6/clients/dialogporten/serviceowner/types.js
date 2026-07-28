/**
 * @typedef {"PartyRepresentative"|"ServiceOwner"} Actors_ActorType
 */

/**
 * @typedef {"Gui"|"Api"} Attachments_AttachmentUrlConsumerType
 */

/**
 * @typedef {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"} DialogEndUserContextsEntities_SystemLabel
 */

/**
 * @typedef {"Primary"|"Secondary"|"Tertiary"} DialogsEntitiesActions_DialogGuiActionPriority
 */

/**
 * @typedef {"DialogCreated"|"DialogClosed"|"Information"|"TransmissionOpened"|"PaymentMade"|"SignatureProvided"|"DialogOpened"|"DialogDeleted"|"DialogRestored"|"SentToSigning"|"SentToFormFill"|"SentToSendIn"|"SentToPayment"|"FormSubmitted"|"FormSaved"|"CorrespondenceOpened"|"CorrespondenceConfirmed"} DialogsEntitiesActivities_DialogActivityType
 */

/**
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} DialogsEntitiesTransmissions_DialogTransmissionType
 */

/**
 * @typedef {"InProgress"|"Draft"|"RequiresAttention"|"Completed"|"NotApplicable"|"Awaiting"} DialogsEntities_DialogStatus
 */

/**
 * @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"HEAD"|"OPTIONS"|"TRACE"|"CONNECT"} Http_HttpVerb
 */

/**
 * @typedef {object} JsonPatchOperations_Operation
 * @property {string|null} [path]
 * @property {string|null} [op]
 * @property {string|null} [from]
 * @property {*|null} [value]
 */

/**
 * @typedef {object} PaginatedListOfV1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem
 * @property {Array<V1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem>|null} [items] The paginated list of items
 * @property {boolean} hasNextPage Whether there are more items available that can be fetched by supplying the continuation token
 * @property {string|null} [continuationToken] The continuation token to be used to fetch the next page of items
 * @property {string} orderBy The current sorting order of the items
 */

/**
 * @typedef {object} PaginatedListOfV1ServiceOwnerDialogsQueriesSearch_Dialog
 * @property {Array<V1ServiceOwnerDialogsQueriesSearch_Dialog>|null} [items] The paginated list of items
 * @property {boolean} hasNextPage Whether there are more items available that can be fetched by supplying the continuation token
 * @property {string|null} [continuationToken] The continuation token to be used to fetch the next page of items
 * @property {string} orderBy The current sorting order of the items
 */

/**
 * @typedef {object} ProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {string|null} [statusDescription]
 * @property {string|null} [code]
 * @property {string|null} [traceId]
 * @property {Array<ProblemDetails_Error>|null} [validationErrors]
 * @property {{[key: string]: Array<string>}} errors
 */

/**
 * @typedef {object} ProblemDetails_Error
 * @property {string|null} [title]
 * @property {string|null} [code]
 * @property {string|null} [detail]
 * @property {Array<string>|null} [paths]
 */

/**
 * @typedef {object} V1CommonContent_ContentValue
 * @property {Array<V1CommonLocalizations_Localization>|null} [value] A list of localizations for the content.
 * @property {string} mediaType Media type of the content, this can also indicate that the content is embeddable.
 * @property {boolean|null} [isAuthorized] True if the authenticated user is authorized for this content. If not, the endpoints will be replaced with a fixed placeholder. Can be null if not applicable.
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_IdentifierLookupServiceOwner
 * @property {string} orgNumber
 * @property {string} code
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_IdentifierLookupServiceResource
 * @property {string} id
 * @property {boolean} isDelegable
 * @property {number} minimumAuthenticationLevel
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_ServiceOwnerIdentifierLookup
 * @property {string} dialogId
 * @property {string} instanceRef
 * @property {string} party
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceResource} serviceResource
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceOwner} serviceOwner
 * @property {Array<V1CommonLocalizations_Localization>|null} [title]
 * @property {Array<V1CommonLocalizations_Localization>|null} [nonSensitiveTitle]
 */

/**
 * @typedef {object} V1CommonLocalizations_Localization
 * @property {string} value The localized text (or URL if a front-channel embed).
 * @property {string} languageCode The language code of the localization in ISO 639-1 format.
 */

/**
 * @typedef {"Exclude"|"Include"|"Only"} V1Common_DeletedFilter
 */

/**
 * @typedef {object} V1EndUserCommon_AcceptedLanguage
 * @property {string} languageCode
 * @property {number} weight
 */

/**
 * @typedef {object} V1EndUserCommon_AcceptedLanguages
 * @property {Array<V1EndUserCommon_AcceptedLanguage>|null} [acceptedLanguage]
 */

/**
 * @typedef {object} V1ServiceOwnerCommonActors_Actor
 * @property {Actors_ActorType} actorType The type of actor; either the service owner, or someone representing the party.
 * @property {string|null} [actorName] The name of the actor.
 * @property {string|null} [actorId] The identifier (national identity number or organization number) of the actor.
 */

/**
 * @typedef {"New"|"InProgress"|"Draft"|"Sent"|"RequiresAttention"|"Completed"|"NotApplicable"|"Awaiting"} V1ServiceOwnerCommonDialogStatuses_DialogStatusInput
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateActivity_ActivityRequest
 * @property {string|null} [id] A UUIDv7 may be provided to support idempotent additions to the list of activities. If not supplied, a new UUIDv7 will be generated.
 * @property {string|null} [createdAt] If supplied, overrides the creating date and time for the activity. If not supplied, the current date /time will be used.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific activity type.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier. Must be present in the request body.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of transmission attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachmentUrl
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionRequest
 * @property {string|null} [id] A UUIDv7 may be provided to support idempotent additions to the list of transmissions. If not supplied, a new UUIDv7 will be generated.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt If supplied, overrides the creating date and time for the transmission. If not supplied, the current date /time will be used.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionContent|null} [content] The transmission unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Activity
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of activities. If not provided, a new UUIDv7 will be generated.
 * @property {string|null} [createdAt] If supplied, overrides the creating date and time for the activity. If not supplied, the current date /time will be used.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific activity type.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier. Must be present in the request body.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_ApiAction
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of Api Actions. If not provided, a new UUIDv7 will be generated.
 * @property {string} action String identifier for the action, corresponding to the "action" attributeId used in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [name] The logical name of the operation the API action refers to.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_ApiActionEndpoint>|null} [endpoints] The endpoints associated with the action.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_ApiActionEndpoint
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of Api Action Endpoints. If not provided, a new UUIDv7 will be generated.
 * @property {string|null} [version] Arbitrary string indicating the version of the endpoint.
 * @property {string} url The fully qualified URL of the API endpoint.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the endpoint expects for this action.
 * @property {string|null} [documentationUrl] Link to documentation for the endpoint, providing documentation for integrators. Should be a URL to a human-readable page.
 * @property {string|null} [requestSchema] Link to the request schema for the endpoint. Used to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {string|null} [responseSchema] Link to the response schema for the endpoint. Used to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {boolean} deprecated Boolean indicating if the endpoint is deprecated.
 * @property {string|null} [sunsetAt] Date and time when the endpoint will no longer function. Only set if the endpoint is deprecated. Dialogporten will not enforce this date.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Attachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_AttachmentUrl
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of attachment URLs. If not provided, a new UUIDv7 will be generated.
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog. Supported media types: text/plain
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveTitle] An optional non-sensitive title of the dialog. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state. Supported media types: text/plain
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveSummary] An optional non-sensitive summary of the dialog and its current state. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name. Must be text/plain if supplied. Supported media types: text/plain
 * @property {V1CommonContent_ContentValue|null} [additionalInfo] Additional information about the dialog. Supported media types: text/plain, text/markdown
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field. Supported media types: text/plain
 * @property {V1CommonContent_ContentValue|null} [mainContentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Dialog
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of dialogs. If not provided, a new UUIDv7 will be generated.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in dialog creation. If provided, it allows for the safe re-submission of the same dialog creation request without creating duplicate entries.
 * @property {string} serviceResource The service identifier for the service that the dialog is related to in URN-format. This corresponds to a resource in the Altinn Resource Registry, which the authenticated organization must own, i.e., be listed as the "competent authority" in the Resource Registry entry.
 * @property {string} party The party code representing the organization or person that the dialog belongs to in URN format.
 * @property {number|null} [progress] Advisory indicator of progress, represented as 1-100 percentage value. 100% representing a dialog that has come to a natural completion (successful or not).
 * @property {string|null} [extendedStatus] Arbitrary string with a service-specific indicator of status, typically used to indicate a fine-grained state of the dialog to further specify the "status" enum.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [visibleFrom] The timestamp when the dialog should be made visible for authorized end users. If not provided, the dialog will be immediately available.
 * @property {string|null} [dueAt] The due date for the dialog. Dialogs past due date might be marked as such in frontends but will still be available.
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier to indicate the business process that preceded the process indicated in the "Process" field. Cannot be set without also "Process" being set.
 * @property {string|null} [expiresAt] The expiration date for the dialog. This is the last date when the dialog is available for the end user. After this date is passed, the dialog will be considered expired and no longer available for the end user in any API. If not supplied, the dialog will be considered to never expire. This field can be changed after creation.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be displayed in user interfaces. When true, the dialog will not be visible in portals designed for human users, but will remain accessible via API.
 * @property {string|null} [createdAt] If set, will override the date and time when the dialog is set as created. If not supplied, the current date /time will be used.
 * @property {string|null} [updatedAt] If set, will override the date and time when the dialog is set as last updated. If not supplied, the current date /time will be used.
 * @property {V1ServiceOwnerCommonDialogStatuses_DialogStatusInput|null} [status] The aggregated status of the dialog.
 * @property {DialogEndUserContextsEntities_SystemLabel|null} [systemLabel] Set the system label of the dialog.
 * @property {V1ServiceOwnerDialogsCommandsCreate_DialogServiceOwnerContext|null} [serviceOwnerContext] Metadata about the dialog owned by the service owner.
 * @property {V1ServiceOwnerDialogsCommandsCreate_Content|null} [content] The dialog unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_Tag>|null} [searchTags] A list of words (tags) that will be used in dialog search queries. Not visible in end-user DTO.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_Attachment>|null} [attachments] The attachments associated with the dialog (on an aggregate level).
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_Transmission>|null} [transmissions] The immutable list of transmissions associated with the dialog.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_GuiAction>|null} [guiActions] The GUI actions associated with the dialog. Should be used in browser-based interactive frontends.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_ApiAction>|null} [apiActions] The API actions associated with the dialog. Should be used in specialized, non-browser-based integrations.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_Activity>|null} [activities] An immutable list of activities associated with the dialog.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_DialogServiceOwnerContext
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_ServiceOwnerLabel>|null} [serviceOwnerLabels] A list of labels, not visible in end-user APIs.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_GuiAction
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of Gui Actions. If not provided, a new UUIDv7 will be generated.
 * @property {string} action The action identifier for the action, corresponding to the "action" attributeId used in the XACML service policy.
 * @property {string} url The fully qualified URL of the action, to which the user will be redirected when the action is triggered. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to perform the action.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean} isDeleteDialogAction Indicates whether the action results in the dialog being deleted. Used by frontends to implement custom UX for delete actions.
 * @property {Http_HttpVerb|null} [httpMethod] The HTTP method that the frontend should use when redirecting the user.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Indicates a priority for the action, making it possible for frontends to adapt GUI elements based on action priority.
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the action, this should be short and in verb form. Must be text/plain.
 * @property {Array<V1CommonLocalizations_Localization>|null} [prompt] If there should be a prompt asking the user for confirmation before the action is executed, this field should contain the prompt text.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_ServiceOwnerLabel
 * @property {string} value A label value.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Tag
 * @property {string} value A search tag value.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_Transmission
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of transmissions. If not provided, a new UUIDv7 will be generated.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt If supplied, overrides the creating date and time for the transmission. If not supplied, the current date /time will be used.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsCommandsCreate_TransmissionContent|null} [content] The transmission unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_TransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of transmission attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachmentUrl
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_TransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsCreate_TransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of transmission attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachmentUrl
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and the transmission is not updated.
 * @property {string|null} [createdAt] Overrides the creating date and time for the transmission.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionContent|null} [content] The transmission unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 * @property {boolean} isSilentUpdate
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Activity
 * @property {string|null} [id] A UUIDv7 may be provided to support idempotent additions to the list of activities. If not supplied, a new UUIDv7 will be generated.
 * @property {string|null} [createdAt] If supplied, overrides the creating date and time for the activity. If not supplied, the current date /time will be used.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific activity type.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier. Must be present in the request body.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_ApiAction
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of Api Actions. If not provided, a new UUIDv7 will be generated.
 * @property {string} action String identifier for the action, corresponding to the "action" attributeId used in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [name] The logical name of the operation the API action refers to.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_ApiActionEndpoint>|null} [endpoints] The endpoints associated with the action.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_ApiActionEndpoint
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent creation of Api Action Endpoints. If not provided, a new UUIDv7 will be generated.
 * @property {string|null} [version] Arbitrary string indicating the version of the endpoint.
 * @property {string} url The fully qualified URL of the API endpoint.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the endpoint expects for this action.
 * @property {string|null} [documentationUrl] Link to documentation for the endpoint, providing documentation for integrators. Should be a URL to a human-readable page.
 * @property {string|null} [requestSchema] Link to the request schema for the endpoint. Used to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {string|null} [responseSchema] Link to the response schema for the endpoint. Used to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {boolean} deprecated Boolean indicating if the endpoint is deprecated.
 * @property {string|null} [sunsetAt] Date and time when the endpoint will no longer function. Only set if the endpoint is deprecated. Dialogporten will not enforce this date.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Attachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_AttachmentUrl
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions and updates of attachment URLs. If not provided, a new UUIDv7 will be generated.
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveTitle] An optional non-sensitive title of the dialog. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveSummary] An optional non-sensitive summary of the dialog and its current state. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name. Must be text/plain if supplied.
 * @property {V1CommonContent_ContentValue|null} [additionalInfo] Additional information about the dialog, this may contain Markdown.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [mainContentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Dialog
 * @property {number|null} [progress] Advisory indicator of progress, represented as 1-100 percentage value. 100% representing a dialog that has come to a natural completion (successful or not).
 * @property {string|null} [extendedStatus] Arbitrary string with a service-specific indicator of status, typically used to indicate a fine-grained state of the dialog to further specify the "status" enum.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [dueAt] The due date for the dialog. Dialogs past due date might be marked as such in frontends but will still be available.
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier to indicate the business process that preceded the process indicated in the "Process" field. Cannot be set without also "Process" being set.
 * @property {string|null} [expiresAt] The expiration date for the dialog. This is the last date when the dialog is available for the end user. After this date is passed, the dialog will be considered expired and no longer available for the end user in any API. If not supplied, the dialog will be considered to never expire. This field can be changed after creation.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be displayed in user interfaces. When true, the dialog will not be visible in portals designed for human users, but will remain accessible via API. If any Transmissions were created without Content while this property was true, the flag cannot be reverted to false.
 * @property {V1ServiceOwnerCommonDialogStatuses_DialogStatusInput} status The aggregated status of the dialog.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Content|null} [content] The dialog unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_Tag>|null} [searchTags] A list of words (tags) that will be used in dialog search queries. Not visible in end-user DTO.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_Attachment>|null} [attachments] The attachments associated with the dialog (on an aggregate level).
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_Transmission>|null} [transmissions] The immutable list of transmissions associated with the dialog. When updating via PUT, any transmissions added here will be appended to the existing list of transmissions.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_GuiAction>|null} [guiActions] The GUI actions associated with the dialog. Should be used in browser-based interactive frontends.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_ApiAction>|null} [apiActions] The API actions associated with the dialog. Should be used in specialized, non-browser-based integrations.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_Activity>|null} [activities] An immutable list of activities associated with the dialog. When updating via PUT, any activities added here will be appended to the existing list of activities.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_GuiAction
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of Gui Actions. If not provided, a new UUIDv7 will be generated.
 * @property {string} action The action identifier for the action, corresponding to the "action" attributeId used in the XACML service policy.
 * @property {string} url The fully qualified URL of the action, to which the user will be redirected when the action is triggered. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to perform the action.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean} isDeleteDialogAction Indicates whether the action results in the dialog being deleted. Used by frontends to implement custom UX for delete actions.
 * @property {Http_HttpVerb|null} [httpMethod] The HTTP method that the frontend should use when redirecting the user.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Indicates a priority for the action, making it possible for frontends to adapt GUI elements based on action priority.
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the action, this should be short and in verb form. Must be text/plain.
 * @property {Array<V1CommonLocalizations_Localization>|null} [prompt] If there should be a prompt asking the user for confirmation before the action is executed, this field should contain the prompt text.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Tag
 * @property {string} value A search tag value.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_Transmission
 * @property {string|null} [id] A UUIDv7 may be provided to support idempotent additions to the list of transmissions. If not supplied, a new UUIDv7 will be generated.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt If supplied, overrides the creating date and time for the transmission. If not supplied, the current date /time will be used.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_TransmissionContent|null} [content] The transmission unstructured text content.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_TransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachment
 * @property {string|null} [id] A self-defined UUIDv7 may be provided to support idempotent additions of transmission attachments. If not provided, a new UUIDv7 will be generated.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachmentUrl
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetActivity_Activity
 * @property {string} id
 * @property {string|null} [createdAt]
 * @property {string|null} [extendedType]
 * @property {DialogsEntitiesActivities_DialogActivityType} type
 * @property {string|null} [transmissionId]
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy
 * @property {Array<V1CommonLocalizations_Localization>|null} [description]
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetSeenLog_SeenLog
 * @property {string} id
 * @property {string} seenAt
 * @property {V1ServiceOwnerCommonActors_Actor} seenBy
 * @property {boolean|null} [isViaServiceOwner]
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetTransmission_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsQueriesGetTransmission_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetTransmission_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetTransmission_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetTransmission_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGetTransmission_Transmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] The authorization attribute associated with the transmission.
 * @property {string|null} [extendedType] The extended type URI for the transmission.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] The unique identifier for the related transmission, if any.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of the transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The sender actor information for the transmission.
 * @property {V1ServiceOwnerDialogsQueriesGetTransmission_Content} content The content of the transmission.
 * @property {Array<V1ServiceOwnerDialogsQueriesGetTransmission_Attachment>|null} [attachments] The attachments associated with the transmission.
 * @property {Array<V1ServiceOwnerDialogsQueriesGetTransmission_NavigationalAction>|null} [navigationalActions] The navigational actions associated with the transmission.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveTitle] An optional non-sensitive title of the dialog. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveSummary] An optional non-sensitive summary of the dialog and its current state. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name.
 * @property {V1CommonContent_ContentValue|null} [additionalInfo] Additional information about the dialog, this may contain Markdown.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field.
 * @property {V1CommonContent_ContentValue|null} [mainContentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS. IsAuthorized is evaluated only when you use the EndUserId query-parameter, otherwise it is null.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in dialog creation. If provided, it allows for the safe re-submission of the same dialog creation request without creating duplicate entries.
 * @property {string} revision The unique identifier for the revision in UUIDv4 format.
 * @property {string} org The service owner code representing the organization (service owner) related to this dialog.
 * @property {string} serviceResource The service identifier for the service that the dialog is related to in URN-format. This corresponds to a service resource in the Altinn Resource Registry.
 * @property {string} serviceResourceType The ServiceResource type, as defined in Altinn Resource Registry (see ResourceType).
 * @property {string} party The party code representing the organization or person that the dialog belongs to in URN format.
 * @property {number|null} [progress] Advisory indicator of progress, represented as 1-100 percentage value. 100% representing a dialog that has come to a natural completion (successful or not).
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier to indicate the business process that preceded the process indicated in the "Process" field. Cannot be set without also "Process" being set.
 * @property {string|null} [extendedStatus] Arbitrary string with a service-specific indicator of status, typically used to indicate a fine-grained state of the dialog to further specify the "status" enum. Refer to the service-specific documentation provided by the service owner for details on the possible values (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [deletedAt] If deleted, the date and time when the deletion was performed.
 * @property {string|null} [visibleFrom] The timestamp when the dialog will be made visible for authorized end users.
 * @property {string|null} [dueAt] The due date for the dialog. Dialogs past due date might be marked as such in frontends but will still be available.
 * @property {string|null} [expiresAt] The expiration date for the dialog. This is the last date when the dialog is available for the end user. After this date is passed, the dialog will be considered expired and no longer available for the end user in any API. If not supplied, the dialog will be considered to never expire. This field can be changed by the service owner after the dialog has been created.
 * @property {string} createdAt The date and time when the dialog was created.
 * @property {string} updatedAt The date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt The date and time when the dialog content was last updated.
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel System defined label used to categorize dialogs. This is obsolete and will only show; Default, Bin or Archive. Use SystemLabels on EndUserContext instead.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be shown in frontends aimed at humans.
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog Transmissions they sent as seen by the end user. A Transmission is considered "sent from the service owner" if the DialogTransmissionType is not one of Submission or Correction. The value of this field is: - true when there are any new unopened Transmissions sent from the service owner. - false when the service owner has created an Activity of type TransmissionOpened for all Transmissions sent from the service owner. The Activities must each contain the relevant Id for all relevant Transmissions. Note that the value is - determined by the service owner and not to be confused with IsContentSeen - not affected by SystemLabels For correspondence: HasUnopenedContent is still true until the service owner also adds a Dialog level Activity (no transmission id) of type CorrespondenceOpened
 * @property {V1ServiceOwnerDialogsQueriesGet_Content|null} [content] The dialog unstructured text content.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by the service owner.
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_Tag>|null} [searchTags] The list of words (tags) that will be used in dialog search queries. Not visible in end-user DTO.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogAttachment>|null} [attachments] The attachments associated with the dialog (on an aggregate level).
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogTransmission>|null} [transmissions] The immutable list of transmissions associated with the dialog.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogGuiAction>|null} [guiActions] The GUI actions associated with the dialog. Should be used in browser-based interactive frontends.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogApiAction>|null} [apiActions] The API actions associated with the dialog. Should be used in specialized, non-browser-based integrations.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogActivity>|null} [activities] An immutable list of activities associated with the dialog.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastUpdate] The list of seen log entries for the dialog newer than the dialog UpdatedAt date.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastContentUpdate] The list of seen log entries for the dialog newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether a dialog has been seen since its last content update. The value of this field is - true if the dialog has been retrieved since its last content update by either GET /enduser/dialogs/{dialogId} or GET /serviceowner/dialogs/{dialogId}?EndUserId={userId} and there is no SystemLabels MarkedAsUnopened - false if there is a SystemLabels MarkedAsUnopened, even if the dialog has been seen since its last content update - false after the dialog receives a content update. Note that the value is determined by Dialogporten and not to be confused with HasUnopenedContent
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext} serviceOwnerContext Metadata about the dialog owned by the service owner.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary URI/URN with a service-specific activity type. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogApiAction
 * @property {string} id The unique identifier for the action in UUIDv7 format.
 * @property {string} action String identifier for the action, corresponding to the "action" attributeId used in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean|null} [isAuthorized] True if the authenticated user (set in the query) is authorized for this action.
 * @property {string|null} [name] The logical name of the operation the API action refers to.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogApiActionEndpoint>|null} [endpoints] The endpoints associated with the action.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogApiActionEndpoint
 * @property {string} id The unique identifier for the endpoint in UUIDv7 format.
 * @property {string|null} [version] Arbitrary string indicating the version of the endpoint. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {string} url The fully qualified URL of the API endpoint.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the endpoint expects for this action.
 * @property {string|null} [documentationUrl] Link to service provider documentation for the endpoint. Used for service owners to provide documentation for integrators. Should be a URL to a human-readable page.
 * @property {string|null} [requestSchema] Link to the request schema for the endpoint. Used by service owners to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {string|null} [responseSchema] Link to the response schema for the endpoint. Used for service owners to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {boolean} deprecated Boolean indicating if the endpoint is deprecated. Integrators should migrate to endpoints with a higher version.
 * @property {string|null} [sunsetAt] Date and time when the service owner has indicated that endpoint will no longer function. Only set if the endpoint is deprecated. Dialogporten will not enforce this date.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogAttachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogAttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType What type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext
 * @property {string} revision The unique identifier for the end user context revision in UUIDv4 format.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] System defined labels used to categorize dialogs.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogGuiAction
 * @property {string} id The unique identifier for the action in UUIDv7 format.
 * @property {string} action The action identifier for the action, corresponding to the "action" attributeId used in the XACML service policy.
 * @property {string} url The fully qualified URL of the action, to which the user will be redirected when the action is triggered.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean|null} [isAuthorized] Whether the user, if supplied in the query, is authorized to perform the action.
 * @property {boolean} isDeleteDialogAction Indicates whether the action results in the dialog being deleted. Used by frontends to implement custom UX for delete actions.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Indicates a priority for the action, making it possible for frontends to adapt GUI elements based on action priority.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the frontend should use when redirecting the user.
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the action, this should be short and in verb form.
 * @property {Array<V1CommonLocalizations_Localization>|null} [prompt] If there should be a prompt asking the user for confirmation before the action is executed, this field should contain the prompt text.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1ServiceOwnerCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner. This is used when the service owner uses the service owner API to implement its own frontend.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the current end user, if provided in the query.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerLabel>|null} [serviceOwnerLabels] A list of labels, not visible in end-user APIs.
 * @property {string} revision The unique identifier for the service owner context revision in UUIDv4 format.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerLabel
 * @property {string} value A label value.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogTransmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean|null} [isAuthorized] Flag indicating if the authenticated user supplied in the query is authorized for this transmission.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmissionContent} content The transmission unstructured text content.
 * @property {boolean} isOpened Indicates whether the dialog transmission has been opened.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogTransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesGet_Tag
 * @property {string} value A search tag value.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition
 * @property {boolean} sendNotification
 */

/**
 * @typedef {"NotExists"|"Exists"} V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationConditionType
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchActivities_Activity
 * @property {string} id
 * @property {string} createdAt
 * @property {string|null} [extendedType]
 * @property {DialogsEntitiesActivities_DialogActivityType} type
 * @property {string|null} [transmissionId]
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem
 * @property {string} dialogId
 * @property {string} endUserContextRevision
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels]
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchSeenLogs_SeenLog
 * @property {string} id
 * @property {string} seenAt
 * @property {V1ServiceOwnerCommonActors_Actor} seenBy
 * @property {boolean|null} [isViaServiceOwner]
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearchTransmissions_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchTransmissions_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchTransmissions_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Transmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string|null} [idempotentKey] An optional key to ensure idempotency in transmission creation. If provided, it must be unique within the dialog; reusing the same key for the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] The authorization attribute associated with the transmission.
 * @property {string|null} [extendedType] The extended type URI for the transmission.
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] The unique identifier for the related transmission, if any.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of the transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender The sender actor information for the transmission.
 * @property {V1ServiceOwnerDialogsQueriesSearchTransmissions_Content} content The content of the transmission.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearchTransmissions_Attachment>|null} [attachments] The attachments associated with the transmission.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearchTransmissions_NavigationalAction>|null} [navigationalActions] The navigational actions associated with the transmission.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveTitle] An optional non-sensitive title of the dialog. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state.
 * @property {V1CommonContent_ContentValue|null} [nonSensitiveSummary] An optional non-sensitive summary of the dialog and its current state. Used for search and list views if the user authorization does not meet the required eIDAS level
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string} org The service owner code representing the organization (service owner) related to this dialog.
 * @property {string} revision The unique identifier for the revision in UUIDv4 format.
 * @property {string} serviceResource The service identifier for the service that the dialog is related to in URN-format. This corresponds to a service resource in the Altinn Resource Registry.
 * @property {string} serviceResourceType The ServiceResource type, as defined in Altinn Resource Registry (see ResourceType).
 * @property {string} party The party code representing the organization or person that the dialog belongs to in URN format.
 * @property {number|null} [progress] Advisory indicator of progress, represented as 1-100 percentage value. 100% representing a dialog that has come to a natural completion (successful or not).
 * @property {string|null} [process] Optional process identifier used to indicate a business process this dialog belongs to.
 * @property {string|null} [precedingProcess] Optional preceding process identifier to indicate the business process that preceded the process indicated in the "Process" field. Cannot be set without also "Process" being set.
 * @property {number|null} [guiAttachmentCount] The number of attachments in the dialog made available for browser-based frontends.
 * @property {string|null} [extendedStatus] Arbitrary string with a service-specific indicator of status, typically used to indicate a fine-grained state of the dialog to further specify the "status" enum. Refer to the service-specific documentation provided by the service owner for details on the possible values (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string} createdAt The date and time when the dialog was created.
 * @property {string} updatedAt The date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt The date and time when the dialog content was last updated.
 * @property {string|null} [dueAt] The due date for the dialog. This is the last date when the dialog is expected to be completed.
 * @property {string|null} [deletedAt] If deleted, the date and time when the deletion was performed.
 * @property {string|null} [visibleFrom] The timestamp when the dialog will be made visible for authorized end users.
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel System defined label used to categorize dialogs. This is obsolete and will only show; Default, Bin or Archive. Use SystemLabels on EndUserContext instead.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be shown in frontends aimed at humans.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by a service owner
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog Transmissions they sent as seen by the end user. A Transmission is considered "sent from the service owner" if the DialogTransmissionType is not one of Submission or Correction. The value of this field is: - true when there are any new unopened Transmissions sent from the service owner. - false when the service owner has created an Activity of type TransmissionOpened for all Transmissions sent from the service owner. The Activities must each contain the relevant Id for all relevant Transmissions. Note that the value is - determined by the service owner and not to be confused with IsContentSeen - not affected by SystemLabels For correspondence: HasUnopenedContent is still true until the service owner also adds a Dialog level Activity (no transmission id) of type CorrespondenceOpened
 * @property {V1ServiceOwnerDialogsQueriesSearch_DialogActivity|null} [latestActivity] The latest entry in the dialog's activity log.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastUpdate] The list of seen log entries for the dialog newer than the dialog UpdatedAt date.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastContentUpdate] The list of seen log entries for the dialog newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether a dialog has been seen since its last content update. The value of this field is - true if the dialog has been retrieved since its last content update by either GET /enduser/dialogs/{dialogId} or GET /serviceowner/dialogs/{dialogId}?EndUserId={userId} and there is no SystemLabels MarkedAsUnopened - false if there is a SystemLabels MarkedAsUnopened, even if the dialog has been seen since its last content update - false after the dialog receives a content update. Note that the value is determined by Dialogporten and not to be confused with HasUnopenedContent
 * @property {V1ServiceOwnerDialogsQueriesSearch_DialogServiceOwnerContext} serviceOwnerContext Metadata about the dialog owned by the service owner.
 * @property {V1ServiceOwnerDialogsQueriesSearch_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 * @property {V1ServiceOwnerDialogsQueriesSearch_Content|null} [content] The content of the dialog in search results.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary string with a service-specific activity type. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_DialogEndUserContext
 * @property {string} revision The unique identifier for the end user context revision in UUIDv4 format.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] System defined labels used to categorize dialogs.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1ServiceOwnerCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner. This is used when the service owner uses the service owner API to implement its own frontend.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the end user supplied in the query.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_DialogServiceOwnerContext
 * @property {string} revision The unique identifier for the service owner context revision in UUIDv4 format.
 * @property {Array<V1ServiceOwnerDialogsQueriesSearch_ServiceOwnerLabel>|null} [serviceOwnerLabels] A list of labels, not visible in end-user APIs.
 */

/**
 * @typedef {object} V1ServiceOwnerDialogsQueriesSearch_ServiceOwnerLabel
 * @property {string} value A label value.
 */

/**
 * @typedef {object} V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel
 * @property {Array<V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_DialogRevision>|null} [dialogs] List of target dialog ids with optional revision ids
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to the target dialogs. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from the target dialogs. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 * @property {V1ServiceOwnerCommonActors_Actor|null} [performedBy] Optional actor metadata describing who performed the operation. Only available for admin-integrations when EndUserId is omitted.
 */

/**
 * @typedef {object} V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_DialogRevision
 * @property {string} dialogId Target dialog id for system labels
 * @property {string|null} [endUserContextRevision] Optional end user context revision to match against. If supplied and not matching current revision, the entire operation will fail.
 */

/**
 * @typedef {object} V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to target dialogs. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from target dialogs. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 * @property {V1ServiceOwnerCommonActors_Actor|null} [performedBy] Optional actor metadata describing who performed the change. Only available for admin-integrations when EnduserId is omitted.
 */

/**
 * @typedef {object} V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label
 * @property {string} value
 */

/**
 * @typedef {object} V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel
 * @property {string} value A label value.
 */

export const Actors_ActorType = undefined;
export const Attachments_AttachmentUrlConsumerType = undefined;
export const DialogEndUserContextsEntities_SystemLabel = undefined;
export const DialogsEntitiesActions_DialogGuiActionPriority = undefined;
export const DialogsEntitiesActivities_DialogActivityType = undefined;
export const DialogsEntitiesTransmissions_DialogTransmissionType = undefined;
export const DialogsEntities_DialogStatus = undefined;
export const Http_HttpVerb = undefined;
export const JsonPatchOperations_Operation = undefined;
export const PaginatedListOfV1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem = undefined;
export const PaginatedListOfV1ServiceOwnerDialogsQueriesSearch_Dialog = undefined;
export const ProblemDetails = undefined;
export const ProblemDetails_Error = undefined;
export const V1CommonContent_ContentValue = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupServiceOwner = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupServiceResource = undefined;
export const V1CommonIdentifierLookup_ServiceOwnerIdentifierLookup = undefined;
export const V1CommonLocalizations_Localization = undefined;
export const V1Common_DeletedFilter = undefined;
export const V1EndUserCommon_AcceptedLanguage = undefined;
export const V1EndUserCommon_AcceptedLanguages = undefined;
export const V1ServiceOwnerCommonActors_Actor = undefined;
export const V1ServiceOwnerCommonDialogStatuses_DialogStatusInput = undefined;
export const V1ServiceOwnerDialogsCommandsCreateActivity_ActivityRequest = undefined;
export const V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachment = undefined;
export const V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionContent = undefined;
export const V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionNavigationalAction = undefined;
export const V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionRequest = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Activity = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_ApiAction = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_ApiActionEndpoint = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Attachment = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_AttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Content = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Dialog = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_DialogServiceOwnerContext = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_GuiAction = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_ServiceOwnerLabel = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Tag = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_Transmission = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachment = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_TransmissionAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_TransmissionContent = undefined;
export const V1ServiceOwnerDialogsCommandsCreate_TransmissionNavigationalAction = undefined;
export const V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachment = undefined;
export const V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionContent = undefined;
export const V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionNavigationalAction = undefined;
export const V1ServiceOwnerDialogsCommandsUpdateTransmission_TransmissionRequest = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Activity = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_ApiAction = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_ApiActionEndpoint = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Attachment = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_AttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Content = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Dialog = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_GuiAction = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Tag = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_Transmission = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachment = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_TransmissionContent = undefined;
export const V1ServiceOwnerDialogsCommandsUpdate_TransmissionNavigationalAction = undefined;
export const V1ServiceOwnerDialogsQueriesGetActivity_Activity = undefined;
export const V1ServiceOwnerDialogsQueriesGetSeenLog_SeenLog = undefined;
export const V1ServiceOwnerDialogsQueriesGetTransmission_Attachment = undefined;
export const V1ServiceOwnerDialogsQueriesGetTransmission_AttachmentUrl = undefined;
export const V1ServiceOwnerDialogsQueriesGetTransmission_Content = undefined;
export const V1ServiceOwnerDialogsQueriesGetTransmission_NavigationalAction = undefined;
export const V1ServiceOwnerDialogsQueriesGetTransmission_Transmission = undefined;
export const V1ServiceOwnerDialogsQueriesGet_Content = undefined;
export const V1ServiceOwnerDialogsQueriesGet_Dialog = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogActivity = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogApiAction = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogApiActionEndpoint = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogAttachment = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogGuiAction = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogSeenLog = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerLabel = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogTransmission = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachment = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachmentUrl = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogTransmissionContent = undefined;
export const V1ServiceOwnerDialogsQueriesGet_DialogTransmissionNavigationalAction = undefined;
export const V1ServiceOwnerDialogsQueriesGet_Tag = undefined;
export const V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition = undefined;
export const V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationConditionType = undefined;
export const V1ServiceOwnerDialogsQueriesSearchActivities_Activity = undefined;
export const V1ServiceOwnerDialogsQueriesSearchEndUserContext_DialogEndUserContextItem = undefined;
export const V1ServiceOwnerDialogsQueriesSearchSeenLogs_SeenLog = undefined;
export const V1ServiceOwnerDialogsQueriesSearchTransmissions_Attachment = undefined;
export const V1ServiceOwnerDialogsQueriesSearchTransmissions_AttachmentUrl = undefined;
export const V1ServiceOwnerDialogsQueriesSearchTransmissions_Content = undefined;
export const V1ServiceOwnerDialogsQueriesSearchTransmissions_NavigationalAction = undefined;
export const V1ServiceOwnerDialogsQueriesSearchTransmissions_Transmission = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_Content = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_Dialog = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_DialogActivity = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_DialogEndUserContext = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_DialogSeenLog = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_DialogServiceOwnerContext = undefined;
export const V1ServiceOwnerDialogsQueriesSearch_ServiceOwnerLabel = undefined;
export const V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel = undefined;
export const V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_DialogRevision = undefined;
export const V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest = undefined;
export const V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label = undefined;
export const V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel = undefined;
