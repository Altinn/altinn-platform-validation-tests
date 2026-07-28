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
 * @typedef {object} DigdirDomainDialogportenApplicationCommon_Link
 * @property {string} metadata
 */

/**
 * @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"|"HEAD"|"OPTIONS"|"TRACE"|"CONNECT"} Http_HttpVerb
 */

/**
 * @typedef {object} PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog
 * @property {Array<V1EndUserDialogsQueriesSearch_Dialog>|null} [items] The paginated list of items
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
 * @typedef {object} V1AccessManagementQueriesGetParties_AuthorizedParty
 * @property {string} party The party identifier in URN format
 * @property {string} partyUuid The UUID for the party.
 * @property {number} partyId The numeric identifier for the party.
 * @property {string} name The name of the party (verbatim from CCR, usually in all caps)
 * @property {string|null} [dateOfBirth] The date of birth of the party, if a person.
 * @property {string} partyType The type of the party, either "Organization" or "Person".
 * @property {boolean} isDeleted Whether the party is deleted or not
 * @property {boolean} hasKeyRole Whether the authenticated user has a key role in the party. Read more about key roles (norwegian) at https://docs.altinn.studio/nb/altinn-studio/reference/configuration/authorization/guidelines_authorization/roles_and_rights/roles_er/#nøkkelroller
 * @property {boolean} isCurrentEndUser Whether this party represents the authenticated user.
 * @property {boolean} isMainAdministrator Whether the authenticated user is the main administrator of the party Read more about main administrator (norwegian) at https://docs.altinn.studio/nb/altinn-studio/reference/configuration/authorization/guidelines_authorization/roles_and_rights/roles_altinn/altinn_roles_administration/#hovedadministrator
 * @property {boolean} isAccessManager Whether the authenticated user is an access manager of the party. Read more about access managers (norwegian) at https://docs.altinn.studio/nb/altinn-studio/reference/configuration/authorization/guidelines_authorization/roles_and_rights/roles_altinn/altinn_roles_administration/#tilgangsstrying
 * @property {boolean} hasOnlyAccessToSubParties If the authenticated user has only access to sub parties of this party, and not this party itself.
 * @property {Array<V1AccessManagementQueriesGetParties_AuthorizedParty>|null} [subParties] The sub parties of this party, if any. The sub party uses the same data model.
 */

/**
 * @typedef {object} V1AccessManagementQueriesGetParties_Parties
 * @property {Array<V1AccessManagementQueriesGetParties_AuthorizedParty>|null} [authorizedParties]
 */

/**
 * @typedef {object} V1CommonContent_ContentValue
 * @property {Array<V1CommonLocalizations_Localization>|null} [value] A list of localizations for the content.
 * @property {string} mediaType Media type of the content, this can also indicate that the content is embeddable.
 * @property {boolean|null} [isAuthorized] True if the authenticated user is authorized for this content. If not, the endpoints will be replaced with a fixed placeholder. Can be null if not applicable.
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_EndUserIdentifierLookup
 * @property {string} dialogId
 * @property {string} instanceRef
 * @property {string} party
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceResource} serviceResource
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceOwner} serviceOwner
 * @property {Array<V1CommonLocalizations_Localization>|null} [title]
 * @property {V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidence} authorizationEvidence
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidence
 * @property {number} currentAuthenticationLevel
 * @property {boolean} viaRole
 * @property {boolean} viaAccessPackage
 * @property {boolean} viaResourceDelegation
 * @property {boolean} viaInstanceDelegation
 * @property {Array<V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidenceItem>|null} [evidence]
 */

/**
 * @typedef {object} V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidenceItem
 * @property {V1CommonIdentifierLookup_IdentifierLookupGrantType} grantType
 * @property {string} subject
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link|null} [links]
 */

/**
 * @typedef {"Role"|"AccessPackage"|"ResourceDelegation"|"InstanceDelegation"} V1CommonIdentifierLookup_IdentifierLookupGrantType
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
 * @typedef {object} V1CommonLocalizations_Localization
 * @property {string} value The localized text (or URL if a front-channel embed).
 * @property {string} languageCode The language code of the localization in ISO 639-1 format.
 */

/**
 * @typedef {object} V1CommonServiceResourceMetadata_ServiceResourceMetadataAccessPackage
 * @property {string} urn
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {object} V1CommonServiceResourceMetadata_ServiceResourceMetadataItem
 * @property {V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceResource} serviceResource
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataRole>|null} [roles]
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataAccessPackage>|null} [accessPackages]
 * @property {V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceOwner} serviceOwner
 */

/**
 * @typedef {object} V1CommonServiceResourceMetadata_ServiceResourceMetadataRole
 * @property {string} urn
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {object} V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceOwner
 * @property {string} orgNumber
 * @property {string} code
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 */

/**
 * @typedef {object} V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceResource
 * @property {string} id
 * @property {string} resourceType
 * @property {string} status
 * @property {boolean} isDelegable
 * @property {number} minimumAuthenticationLevel
 * @property {Array<V1CommonLocalizations_Localization>|null} [name]
 * @property {DigdirDomainDialogportenApplicationCommon_Link} links
 */

/**
 * @typedef {object} V1EndUserCommonActors_Actor
 * @property {Actors_ActorType} actorType The type of actor; either the service owner, or someone representing the party.
 * @property {string|null} [actorName] The name of the actor.
 * @property {string|null} [actorId] The identifier (national identity number or organization number) of the actor.
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
 * @typedef {object} V1EndUserDialogsQueriesGetActivity_Activity
 * @property {string} id
 * @property {string|null} [createdAt]
 * @property {string|null} [extendedType]
 * @property {DialogsEntitiesActivities_DialogActivityType} type
 * @property {string|null} [transmissionId]
 * @property {V1EndUserCommonActors_Actor} performedBy
 * @property {Array<V1CommonLocalizations_Localization>|null} [description]
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetSeenLog_SeenLog
 * @property {string} id
 * @property {string} seenAt
 * @property {V1EndUserCommonActors_Actor} seenBy
 * @property {boolean} isViaServiceOwner
 * @property {boolean} isCurrentEndUser
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetTransmission_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetTransmission_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetTransmission_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetTransmission_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action. Will be set to \"urn:dialogporten:unauthorized\" if the user is not authorized to access the transmission, or \"urn:dialogporten:expired\" if the action has expired.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGetTransmission_Transmission
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
 * @property {V1EndUserDialogsQueriesGetTransmission_Content} content The content of the transmission.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_Attachment>|null} [attachments] The attachments associated with the transmission.
 * @property {Array<V1EndUserDialogsQueriesGetTransmission_NavigationalAction>|null} [navigationalActions] The navigational actions associated with the transmission.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog.
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state.
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name.
 * @property {V1CommonContent_ContentValue|null} [additionalInfo] Additional information about the dialog, this may contain Markdown.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field.
 * @property {V1CommonContent_ContentValue|null} [mainContentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Content value will be masked if the user is not authorized to read main content.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
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
 * @property {string|null} [dueAt] The due date for the dialog. Dialogs past due date might be marked as such in frontends but will still be available.
 * @property {string|null} [expiresAt] The expiration date for the dialog. This is the last date when the dialog is available for the end user. After this date is passed, the dialog will be considered expired and no longer available for the end user in any API. If not supplied, the dialog will be considered to never expire. This field can be changed by the service owner after the dialog has been created.
 * @property {string} createdAt The date and time when the dialog was created.
 * @property {string} updatedAt The date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt The date and time when the dialog content was last updated.
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel System defined label used to categorize dialogs. This is obsolete and will only show; Default, Bin or Archive. Use SystemLabels on EndUserContext instead.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be shown in frontends aimed at humans.
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog Transmissions they sent as seen by the end user. A Transmission is considered "sent from the service owner" if the DialogTransmissionType is not one of Submission or Correction. The value of this field is: - true when there are any new unopened Transmissions sent from the service owner. - false when the service owner has created an Activity of type TransmissionOpened for all Transmissions sent from the service owner. The Activities must each contain the relevant Id for all relevant Transmissions. Note that the value is - determined by the service owner and not to be confused with IsContentSeen - not affected by SystemLabels For correspondence: HasUnopenedContent is still true until the service owner also adds a Dialog level Activity (no transmission id) of type CorrespondenceOpened
 * @property {V1EndUserDialogsQueriesGet_Content} content The dialog unstructured text content.
 * @property {string|null} [dialogToken] The dialog token. May be used (if supported) against external URLs referred to in this dialog's apiActions, transmissions or attachments. It should also be used for front-channel embeds.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by a service owner.
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogAttachment>|null} [attachments] The attachments associated with the dialog (on an aggregate level).
 * @property {Array<V1EndUserDialogsQueriesGet_DialogTransmission>|null} [transmissions] The immutable list of transmissions associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogGuiAction>|null} [guiActions] The GUI actions associated with the dialog. Should be used in browser-based interactive frontends.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogApiAction>|null} [apiActions] The API actions associated with the dialog. Should be used in specialized, non-browser-based integrations.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogActivity>|null} [activities] An immutable list of activities associated with the dialog.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastUpdate] The list of seen log entries for the dialog newer than the dialog UpdatedAt date.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogSeenLog>|null} [seenSinceLastContentUpdate] The list of seen log entries for the dialog newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether a dialog has been seen since its last content update. The value of this field is - true if the dialog has been retrieved since its last content update by either GET /enduser/dialogs/{dialogId} or GET /serviceowner/dialogs/{dialogId}?EndUserId={userId} and there is no SystemLabels MarkedAsUnopened - false if there is a SystemLabels MarkedAsUnopened, even if the dialog has been seen since its last content update - false after the dialog receives a content update. Note that the value is determined by Dialogporten and not to be confused with HasUnopenedContent
 * @property {V1EndUserDialogsQueriesGet_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary URI/URN with a service-specific activity type. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier.
 * @property {V1EndUserCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogApiAction
 * @property {string} id The unique identifier for the action in UUIDv7 format.
 * @property {string} action String identifier for the action, corresponding to the "action" attributeId used in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean} isAuthorized True if the authenticated user is authorized for this action. If not, the action will not be available and all endpoints will be replaced with a fixed placeholder.
 * @property {string|null} [name] The logical name of the operation the API action refers to.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogApiActionEndpoint>|null} [endpoints] The endpoints associated with the action.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogApiActionEndpoint
 * @property {string} id The unique identifier for the endpoint in UUIDv7 format.
 * @property {string|null} [version] Arbitrary string indicating the version of the endpoint. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {string} url The fully qualified URL of the API endpoint. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to perform the action.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the endpoint expects for this action.
 * @property {string|null} [documentationUrl] Link to service provider documentation for the endpoint. Used for service owners to provide documentation for integrators. Should be a URL to a human-readable page.
 * @property {string|null} [requestSchema] Link to the request schema for the endpoint. Used by service owners to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {string|null} [responseSchema] Link to the response schema for the endpoint. Used for service owners to provide documentation for integrators. Dialogporten will not validate information on this endpoint.
 * @property {boolean} deprecated Boolean indicating if the endpoint is deprecated. Integrators should migrate to endpoints with a higher version.
 * @property {string|null} [sunsetAt] Date and time when the service owner has indicated that endpoint will no longer function. Only set if the endpoint is deprecated. Dialogporten will not enforce this date.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogAttachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogAttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType What type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogEndUserContext
 * @property {string} revision The unique identifier for the end user context revision in UUIDv4 format.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] System defined labels used to categorize dialogs.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogGuiAction
 * @property {string} id The unique identifier for the action in UUIDv7 format.
 * @property {string} action The action identifier for the action, corresponding to the "action" attributeId used in the XACML service policy.
 * @property {string} url The fully qualified URL of the action, to which the user will be redirected when the action is triggered. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to perform the action.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean} isAuthorized Whether the user is authorized to perform the action.
 * @property {boolean} isDeleteDialogAction Indicates whether the action results in the dialog being deleted. Used by frontends to implement custom UX for delete actions.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Indicates a priority for the action, making it possible for frontends to adapt GUI elements based on action priority.
 * @property {Http_HttpVerb} httpMethod The HTTP method that the frontend should use when redirecting the user.
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the action, this should be short and in verb form.
 * @property {Array<V1CommonLocalizations_Localization>|null} [prompt] If there should be a prompt asking the user for confirmation before the action is executed, this field should contain the prompt text.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1EndUserCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner. This is used when the service owner uses the service owner API to implement its own frontend.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the current end user.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogTransmission
 * @property {string} id The unique identifier for the transmission in UUIDv7 format.
 * @property {string} createdAt The date and time when the transmission was created.
 * @property {string|null} [authorizationAttribute] Contains an authorization resource attributeId, that can used in custom authorization rules in the XACML service policy, which by default is the policy belonging to the service referred to by "serviceResource" in the dialog. Can also be used to refer to other service policies.
 * @property {boolean} isAuthorized Flag indicating if the authenticated user is authorized for this transmission. If not, embedded content and the attachments will not be available.
 * @property {string|null} [extendedType] Arbitrary URI/URN describing a service-specific transmission type. Refer to the service-specific documentation provided by the service owner for details (if in use).
 * @property {string|null} [externalReference] Arbitrary string with a service-specific reference to an external system or service.
 * @property {string|null} [relatedTransmissionId] Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type The type of transmission.
 * @property {V1EndUserCommonActors_Actor} sender The actor that sent the transmission.
 * @property {boolean} isOpened Indicates whether the dialog transmission has been opened.
 * @property {V1EndUserDialogsQueriesGet_DialogTransmissionContent} content The transmission unstructured text content.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogTransmissionAttachment>|null} [attachments] The transmission-level attachments.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogTransmissionNavigationalAction>|null} [navigationalActions] The transmission-level navigational actions.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogTransmissionAttachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesGet_DialogTransmissionAttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogTransmissionAttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogTransmissionContent
 * @property {V1CommonContent_ContentValue} title The transmission title.
 * @property {V1CommonContent_ContentValue|null} [summary] The transmission summary.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesGet_DialogTransmissionNavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action. Will be set to \"urn:dialogporten:unauthorized\" if the user is not authorized to access the transmission, or \"urn:dialogporten:expired\" if the action has expired.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchActivities_Activity
 * @property {string} id
 * @property {string} createdAt
 * @property {string|null} [extendedType]
 * @property {DialogsEntitiesActivities_DialogActivityType} type
 * @property {string|null} [transmissionId]
 * @property {Array<V1CommonLocalizations_Localization>|null} [description]
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchSeenLogs_SeenLog
 * @property {string} id
 * @property {string} seenAt
 * @property {V1EndUserCommonActors_Actor} seenBy
 * @property {boolean} isViaServiceOwner
 * @property {boolean} isCurrentEndUser
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchTransmissions_Attachment
 * @property {string} id The unique identifier for the attachment in UUIDv7 format.
 * @property {Array<V1CommonLocalizations_Localization>|null} [displayName] The display name of the attachment that should be used in GUIs.
 * @property {string|null} [name] The logical name of the attachment.
 * @property {Array<V1EndUserDialogsQueriesSearchTransmissions_AttachmentUrl>|null} [urls] The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {string|null} [expiresAt] The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchTransmissions_AttachmentUrl
 * @property {string} id The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {string|null} [mediaType] The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType The type of consumer the URL is intended for.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchTransmissions_Content
 * @property {V1CommonContent_ContentValue} title The title of the content.
 * @property {V1CommonContent_ContentValue|null} [summary] The summary of the content.
 * @property {V1CommonContent_ContentValue|null} [contentReference] Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchTransmissions_NavigationalAction
 * @property {Array<V1CommonLocalizations_Localization>|null} [title] The title of the navigational action.
 * @property {string} url The fully qualified URL of the navigational action. Will be set to \"urn:dialogporten:unauthorized\" if the user is not authorized to access the transmission, or \"urn:dialogporten:expired\" if the action has expired.
 * @property {string|null} [expiresAt] The UTC timestamp when the navigational action expires and is no longer available.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearchTransmissions_Transmission
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
 * @typedef {object} V1EndUserDialogsQueriesSearch_Content
 * @property {V1CommonContent_ContentValue} title The title of the dialog.
 * @property {V1CommonContent_ContentValue|null} [summary] A short summary of the dialog and its current state.
 * @property {V1CommonContent_ContentValue|null} [senderName] Overridden sender name. If not supplied, assume "org" as the sender name.
 * @property {V1CommonContent_ContentValue|null} [extendedStatus] Used as the human-readable label used to describe the "ExtendedStatus" field.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearch_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string} org The service owner code representing the organization (service owner) related to this dialog.
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
 * @property {DialogsEntities_DialogStatus} status The aggregated status of the dialog.
 * @property {boolean} hasUnopenedContent Whether the service owner has not yet reported all dialog Transmissions they sent as seen by the end user. A Transmission is considered "sent from the service owner" if the DialogTransmissionType is not one of Submission or Correction. The value of this field is: - true when there are any new unopened Transmissions sent from the service owner. - false when the service owner has created an Activity of type TransmissionOpened for all Transmissions sent from the service owner. The Activities must each contain the relevant Id for all relevant Transmissions. Note that the value is - determined by the service owner and not to be confused with IsContentSeen - not affected by SystemLabels For correspondence: HasUnopenedContent is still true until the service owner also adds a Dialog level Activity (no transmission id) of type CorrespondenceOpened
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel System defined label used to categorize dialogs. This is obsolete and will only show; Default, Bin or Archive. Use SystemLabels on EndUserContext instead.
 * @property {boolean} isApiOnly Indicates if this dialog is intended for API consumption only and should not be shown in frontends aimed at humans. When true, human-readable content like title and summary are not required.
 * @property {number} fromServiceOwnerTransmissionsCount The number of transmissions sent by the service owner
 * @property {number} fromPartyTransmissionsCount The number of transmissions sent by a party representative
 * @property {V1EndUserDialogsQueriesSearch_DialogActivity|null} [latestActivity] The latest entry in the dialog's activity log.
 * @property {Array<V1EndUserDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastUpdate] The list of seen log entries for the dialog newer than the dialog UpdatedAt date.
 * @property {Array<V1EndUserDialogsQueriesSearch_DialogSeenLog>|null} [seenSinceLastContentUpdate] The list of seen log entries for the dialog newer than the dialog ContentUpdatedAt date.
 * @property {boolean} isContentSeen Indicates whether a dialog has been seen since its last content update. The value of this field is - true if the dialog has been retrieved since its last content update by either GET /enduser/dialogs/{dialogId} or GET /serviceowner/dialogs/{dialogId}?EndUserId={userId} and there is no SystemLabels MarkedAsUnopened - false if there is a SystemLabels MarkedAsUnopened, even if the dialog has been seen since its last content update - false after the dialog receives a content update. Note that the value is determined by Dialogporten and not to be confused with HasUnopenedContent
 * @property {V1EndUserDialogsQueriesSearch_DialogEndUserContext} endUserContext Metadata about the dialog owned by end-users.
 * @property {V1EndUserDialogsQueriesSearch_Content|null} [content] The content of the dialog in search results. May be null for API-only dialogs, which are not required to have content.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearch_DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] The date and time when the activity was created.
 * @property {string|null} [extendedType] An arbitrary string with a service-specific activity type. Consult the service-specific documentation provided by the service owner for details (if in use).
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} [transmissionId] If the activity is related to a particular transmission, this field will contain the transmission identifier.
 * @property {V1EndUserCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {Array<V1CommonLocalizations_Localization>|null} [description] Unstructured text describing the activity. Only set if the activity type is "Information".
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearch_DialogEndUserContext
 * @property {string} revision The unique identifier for the end user context revision in UUIDv4 format.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] System defined labels used to categorize dialogs.
 */

/**
 * @typedef {object} V1EndUserDialogsQueriesSearch_DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt The timestamp when the dialog revision was seen.
 * @property {V1EndUserCommonActors_Actor} seenBy The actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Flag indicating whether the seen log entry was created via the service owner. This is used when the service owner uses the service owner API to implement its own frontend.
 * @property {boolean} isCurrentEndUser Flag indicating whether the seen log entry was created by the current end user.
 */

/**
 * @typedef {object} V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel
 * @property {Array<V1EndUserEndUserContextCommandsBulkSetSystemLabels_DialogRevision>|null} [dialogs] List of target dialog ids with optional revision ids
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to the target dialogs. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from the target dialogs. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 */

/**
 * @typedef {object} V1EndUserEndUserContextCommandsBulkSetSystemLabels_DialogRevision
 * @property {string} dialogId Target dialog id for system labels
 * @property {string|null} [endUserContextRevision] Optional end user context revision to match against. If supplied and not matching current revision, the entire operation will fail.
 */

/**
 * @typedef {object} V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [systemLabels] List of system labels to set on target dialogs
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [addLabels] List of system labels to add to the target dialog. If multiple instances of 'bin', 'archive', or 'default' are provided, the last one will be used.
 * @property {Array<DialogEndUserContextsEntities_SystemLabel>|null} [removeLabels] List of system labels to remove from the target dialog. If 'bin' or 'archive' is removed, the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 */

/**
 * @typedef {object} V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog
 * @property {string} createdAt
 * @property {string} name
 * @property {string} action
 * @property {V1EndUserCommonActors_Actor} performedBy
 */

/**
 * @typedef {object} V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources
 * @property {boolean|null} [isFullCatalogueFallback] Set to true only when Items is the full referenced catalogue returned as a fallback instead of the caller's authorized subset: this happens when the caller is authorized to a very large number of parties on an unfiltered request, so the authorized union is not computed. Absent/null for a normal authorization-scoped result — supply a party filter to always get an authorization-scoped result.
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataItem>|null} [items]
 */

/**
 * @typedef {object} V1MetadataLimitsQueriesGet_EndUserSearchLimits
 * @property {number} maxPartyFilterValues
 * @property {number} maxServiceResourceFilterValues
 * @property {number} maxOrgFilterValues
 * @property {number} maxExtendedStatusFilterValues
 */

/**
 * @typedef {object} V1MetadataLimitsQueriesGet_Limits
 * @property {V1MetadataLimitsQueriesGet_EndUserSearchLimits} endUserSearch
 * @property {V1MetadataLimitsQueriesGet_ServiceOwnerSearchLimits} serviceOwnerSearch
 */

/**
 * @typedef {object} V1MetadataLimitsQueriesGet_ServiceOwnerSearchLimits
 * @property {number} maxPartyFilterValues
 * @property {number} maxServiceResourceFilterValues
 * @property {number} maxExtendedStatusFilterValues
 */

/**
 * @typedef {object} V1MetadataServiceResourcesQueriesGet_ServiceResourceMetadata
 * @property {Array<V1CommonServiceResourceMetadata_ServiceResourceMetadataItem>|null} [items]
 */

export const Actors_ActorType = undefined;
export const Attachments_AttachmentUrlConsumerType = undefined;
export const DialogEndUserContextsEntities_SystemLabel = undefined;
export const DialogsEntitiesActions_DialogGuiActionPriority = undefined;
export const DialogsEntitiesActivities_DialogActivityType = undefined;
export const DialogsEntitiesTransmissions_DialogTransmissionType = undefined;
export const DialogsEntities_DialogStatus = undefined;
export const DigdirDomainDialogportenApplicationCommon_Link = undefined;
export const Http_HttpVerb = undefined;
export const PaginatedListOfV1EndUserDialogsQueriesSearch_Dialog = undefined;
export const ProblemDetails = undefined;
export const ProblemDetails_Error = undefined;
export const V1AccessManagementQueriesGetParties_AuthorizedParty = undefined;
export const V1AccessManagementQueriesGetParties_Parties = undefined;
export const V1CommonContent_ContentValue = undefined;
export const V1CommonIdentifierLookup_EndUserIdentifierLookup = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidence = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupAuthorizationEvidenceItem = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupGrantType = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupServiceOwner = undefined;
export const V1CommonIdentifierLookup_IdentifierLookupServiceResource = undefined;
export const V1CommonLocalizations_Localization = undefined;
export const V1CommonServiceResourceMetadata_ServiceResourceMetadataAccessPackage = undefined;
export const V1CommonServiceResourceMetadata_ServiceResourceMetadataItem = undefined;
export const V1CommonServiceResourceMetadata_ServiceResourceMetadataRole = undefined;
export const V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceOwner = undefined;
export const V1CommonServiceResourceMetadata_ServiceResourceMetadataServiceResource = undefined;
export const V1EndUserCommonActors_Actor = undefined;
export const V1EndUserCommon_AcceptedLanguage = undefined;
export const V1EndUserCommon_AcceptedLanguages = undefined;
export const V1EndUserDialogsQueriesGetActivity_Activity = undefined;
export const V1EndUserDialogsQueriesGetSeenLog_SeenLog = undefined;
export const V1EndUserDialogsQueriesGetTransmission_Attachment = undefined;
export const V1EndUserDialogsQueriesGetTransmission_AttachmentUrl = undefined;
export const V1EndUserDialogsQueriesGetTransmission_Content = undefined;
export const V1EndUserDialogsQueriesGetTransmission_NavigationalAction = undefined;
export const V1EndUserDialogsQueriesGetTransmission_Transmission = undefined;
export const V1EndUserDialogsQueriesGet_Content = undefined;
export const V1EndUserDialogsQueriesGet_Dialog = undefined;
export const V1EndUserDialogsQueriesGet_DialogActivity = undefined;
export const V1EndUserDialogsQueriesGet_DialogApiAction = undefined;
export const V1EndUserDialogsQueriesGet_DialogApiActionEndpoint = undefined;
export const V1EndUserDialogsQueriesGet_DialogAttachment = undefined;
export const V1EndUserDialogsQueriesGet_DialogAttachmentUrl = undefined;
export const V1EndUserDialogsQueriesGet_DialogEndUserContext = undefined;
export const V1EndUserDialogsQueriesGet_DialogGuiAction = undefined;
export const V1EndUserDialogsQueriesGet_DialogSeenLog = undefined;
export const V1EndUserDialogsQueriesGet_DialogTransmission = undefined;
export const V1EndUserDialogsQueriesGet_DialogTransmissionAttachment = undefined;
export const V1EndUserDialogsQueriesGet_DialogTransmissionAttachmentUrl = undefined;
export const V1EndUserDialogsQueriesGet_DialogTransmissionContent = undefined;
export const V1EndUserDialogsQueriesGet_DialogTransmissionNavigationalAction = undefined;
export const V1EndUserDialogsQueriesSearchActivities_Activity = undefined;
export const V1EndUserDialogsQueriesSearchSeenLogs_SeenLog = undefined;
export const V1EndUserDialogsQueriesSearchTransmissions_Attachment = undefined;
export const V1EndUserDialogsQueriesSearchTransmissions_AttachmentUrl = undefined;
export const V1EndUserDialogsQueriesSearchTransmissions_Content = undefined;
export const V1EndUserDialogsQueriesSearchTransmissions_NavigationalAction = undefined;
export const V1EndUserDialogsQueriesSearchTransmissions_Transmission = undefined;
export const V1EndUserDialogsQueriesSearch_Content = undefined;
export const V1EndUserDialogsQueriesSearch_Dialog = undefined;
export const V1EndUserDialogsQueriesSearch_DialogActivity = undefined;
export const V1EndUserDialogsQueriesSearch_DialogEndUserContext = undefined;
export const V1EndUserDialogsQueriesSearch_DialogSeenLog = undefined;
export const V1EndUserEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel = undefined;
export const V1EndUserEndUserContextCommandsBulkSetSystemLabels_DialogRevision = undefined;
export const V1EndUserEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest = undefined;
export const V1EndUserEndUserContextQueriesSearchLabelAssignmentLog_LabelAssignmentLog = undefined;
export const V1EndUserServiceResourcesQueriesSearch_AuthorizedServiceResources = undefined;
export const V1MetadataLimitsQueriesGet_EndUserSearchLimits = undefined;
export const V1MetadataLimitsQueriesGet_Limits = undefined;
export const V1MetadataLimitsQueriesGet_ServiceOwnerSearchLimits = undefined;
export const V1MetadataServiceResourcesQueriesGet_ServiceResourceMetadata = undefined;
