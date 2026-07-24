/**
 * @typedef {Object} V1ServiceOwnerServiceOwnerContextQueriesGetServiceOwnerLabels_ServiceOwnerLabel
 * @property {string} value
 * A label value.
 */

/**
 * @typedef {Object} V1ServiceOwnerServiceOwnerContextCommandsCreateServiceOwnerLabel_Label
 * @property {string} value
 */


/**
 * @typedef {Object} V1ServiceOwnerEndUserContextCommandsSetSystemLabel_SetDialogSystemLabelRequest
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [systemLabels]
 * List of system labels to set on target dialogs.
 *
 * @deprecated Use addLabels instead. This property will be removed in a future version.
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [addLabels]
 * List of system labels to add to target dialogs. If multiple instances of 'bin', 'archive',
 * or 'default' are provided, the last one will be used.
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [removeLabels]
 * List of system labels to remove from target dialogs. If 'bin' or 'archive' is removed,
 * the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 * @property {V1ServiceOwnerCommonActors_Actor|null} [performedBy]
 * Optional actor metadata describing who performed the change. Only available for admin-integrations
 * when EnduserId is omitted.
 */

/**
 * @typedef {Object} V1ServiceOwnerCommonActors_Actor
 * @property {Actors_ActorType} actorType
 * The type of actor; either the service owner, or someone representing the party.
 * @property {string|null} [actorName]
 * The name of the actor.
 * @property {string|null} [actorId]
 * The identifier (national identity number or organization number) of the actor.
 */

/**
 * @typedef {"PartyRepresentative"|"ServiceOwner"} Actors_ActorType
 */

/**
 * @typedef {"Default"|"Bin"|"Archive"|"MarkedAsUnopened"|"Sent"} DialogEndUserContextsEntities_SystemLabel
 */


/**
 * @typedef {Object} V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_BulkSetSystemLabel
 * @property {V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_DialogRevision[]|null} [dialogs]
 * List of target dialog ids with optional revision ids.
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [systemLabels]
 * List of system labels to set on target dialogs.
 *
 * @deprecated Use addLabels instead. This property will be removed in a future version.
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [addLabels]
 * List of system labels to add to the target dialogs. If multiple instances of 'bin', 'archive',
 * or 'default' are provided, the last one will be used.
 * @property {DialogEndUserContextsEntities_SystemLabel[]|null} [removeLabels]
 * List of system labels to remove from the target dialogs. If 'bin' or 'archive' is removed,
 * the 'default' label will be added automatically unless 'bin' or 'archive' is also in the AddLabels list.
 * @property {V1ServiceOwnerCommonActors_Actor|null} [performedBy]
 * Optional actor metadata describing who performed the operation. Only available for admin-integrations
 * when EndUserId is omitted.
 */

/**
 * @typedef {Object} V1ServiceOwnerEndUserContextCommandsBulkSetSystemLabels_DialogRevision
 * @property {string} dialogId
 * Target dialog id for system labels.
 * @property {string|null} [endUserContextRevision]
 * Optional end user context revision to match against. If supplied and not matching current revision,
 * the entire operation will fail.
 */



/**
 * Represents a transmission belonging to a dialog as returned to service owners.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Transmission
 * @property {string} id - The unique identifier for the transmission in UUIDv7 format.
 * @property {?string} idempotentKey - An optional key to ensure idempotency in transmission creation. Reusing the same key within the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt - The date and time when the transmission was created.
 * @property {?string} authorizationAttribute - The authorization attribute associated with the transmission.
 * @property {?string} extendedType - The extended type URI for the transmission.
 * @property {?string} externalReference - Arbitrary string with a service-specific reference to an external system or service.
 * @property {?string} relatedTransmissionId - The unique identifier for the related transmission, if any.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type - The type of the transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender - The sender actor information for the transmission.
 * @property {V1ServiceOwnerDialogsQueriesSearchTransmissions_Content} content - The content of the transmission.
 * @property {?V1ServiceOwnerDialogsQueriesSearchTransmissions_Attachment[]} attachments - The attachments associated with the transmission.
 * @property {?V1ServiceOwnerDialogsQueriesSearchTransmissions_NavigationalAction[]} navigationalActions - The navigational actions associated with the transmission.
 */

/**
 * Represents transmission content returned from a service owner transmission query.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Content
 * @property {V1CommonContent_ContentValue} title - The title of the content.
 * @property {?V1CommonContent_ContentValue} summary - The summary of the content.
 * @property {?V1CommonContent_ContentValue} contentReference - Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL.
 */

/**
 * Represents an attachment associated with a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesSearchTransmissions_Attachment
 * @property {string} id - The unique identifier for the attachment in UUIDv7 format.
 * @property {?V1CommonLocalizations_Localization[]} displayName - The display name of the attachment that should be used in GUIs.
 * @property {?string} name - The logical name of the attachment.
 * @property {?V1ServiceOwnerDialogsQueriesSearchTransmissions_AttachmentUrl[]} urls - The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {?string} expiresAt - The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * Represents a URL representation of a transmission attachment.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesSearchTransmissions_AttachmentUrl
 * @property {string} id - The unique identifier for the attachment URL in UUIDv7 format.
 * @property {string} url - The fully qualified URL of the attachment. Will be set to "urn:dialogporten:unauthorized" if the user is not authorized to access the transmission.
 * @property {?string} mediaType - The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType - The type of consumer the URL is intended for.
 */

/**
 * Represents a navigational action associated with a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesSearchTransmissions_NavigationalAction
 * @property {?V1CommonLocalizations_Localization[]} title - The title of the navigational action.
 * @property {string} url - The fully qualified URL of the navigational action.
 * @property {?string} expiresAt - The UTC timestamp when the navigational action expires and is no longer available.
 */


/**
 * Represents a request to create a transmission on a dialog.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionRequest
 * @property {?string} id - A UUIDv7 may be provided to support idempotent additions to the list of transmissions. If not supplied, a new UUIDv7 will be generated.
 * @property {?string} idempotentKey - An optional key to ensure idempotency in transmission creation. Reusing the same key within the same dialog results in Conflict and no new transmission is created.
 * @property {string} createdAt - If supplied, overrides the creating date and time for the transmission. If not supplied, the current date/time will be used.
 * @property {?string} authorizationAttribute - Contains an authorization resource attributeId that can be used in custom authorization rules in the XACML service policy.
 * @property {?string} extendedType - Arbitrary URI/URN describing a service-specific transmission type.
 * @property {?string} externalReference - Arbitrary string with a service-specific reference to an external system or service.
 * @property {?string} relatedTransmissionId - Reference to any other transmission that this transmission is related to.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type - The type of transmission.
 * @property {V1ServiceOwnerCommonActors_Actor} sender - The actor that sent the transmission.
 * @property {?V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionContent} content - The transmission unstructured text content.
 * @property {?V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachment[]} attachments - The transmission-level attachments.
 * @property {?V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionNavigationalAction[]} navigationalActions - The transmission-level navigational actions.
 */

/**
 * Represents transmission content when creating a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionContent
 * @property {V1CommonContent_ContentValue} title - The transmission title. Must be text/plain.
 * @property {?V1CommonContent_ContentValue} summary - The transmission summary.
 * @property {?V1CommonContent_ContentValue} contentReference - Front-channel embedded content. Used to dynamically embed content in the frontend from an external URL. Must be HTTPS.
 */

/**
 * Represents an attachment included when creating a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachment
 * @property {?string} id - A self-defined UUIDv7 may be provided to support idempotent additions of transmission attachments. If not provided, a new UUIDv7 will be generated.
 * @property {?V1CommonLocalizations_Localization[]} displayName - The display name of the attachment that should be used in GUIs.
 * @property {?string} name - The logical name of the attachment.
 * @property {?V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachmentUrl[]} urls - The URLs associated with the attachment, each referring to a different representation of the attachment.
 * @property {?string} expiresAt - The UTC timestamp when the attachment expires and is no longer available.
 */

/**
 * Represents an attachment URL when creating a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionAttachmentUrl
 * @property {string} url - The fully qualified URL of the attachment.
 * @property {?string} mediaType - The media type of the attachment.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType - The type of consumer the URL is intended for.
 */

/**
 * Represents a navigational action included when creating a transmission.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsCreateTransmission_TransmissionNavigationalAction
 * @property {?V1CommonLocalizations_Localization[]} title - The title of the navigational action.
 * @property {string} url - The fully qualified URL of the navigational action.
 * @property {?string} expiresAt - The UTC timestamp when the navigational action expires and is no longer available.
 */


/**
 * Represents localized content with optional media metadata and authorization information.
 *
 * @typedef {Object} V1CommonContent_ContentValue
 * @property {?V1CommonLocalizations_Localization[]} value - A list of localizations for the content.
 * @property {string} mediaType - Media type of the content. This can also indicate that the content is embeddable.
 * @property {?boolean} isAuthorized - True if the authenticated user is authorized for this content. If not, the endpoints will be replaced with a fixed placeholder. Can be null if not applicable.
 */

/**
 * Represents a localized string value.
 *
 * @typedef {Object} V1CommonLocalizations_Localization
 * @property {string} value - The localized text (or URL if a front-channel embed).
 * @property {string} languageCode - The language code of the localization in ISO 639-1 format.
 */

/**
 * Represents an actor involved in a service owner operation.
 *
 * @typedef {Object} V1ServiceOwnerCommonActors_Actor
 * @property {Actors_ActorType} actorType - The type of actor; either the service owner, or someone representing the party.
 * @property {?string} actorName - The name of the actor.
 * @property {?string} actorId - The identifier (national identity number or organization number) of the actor.
 */

/**
 * Represents the type of actor.
 *
 * @typedef {"PartyRepresentative"|"ServiceOwner"} Actors_ActorType
 */

/**
 * Represents the transmission type.
 *
 * @typedef {"Information"|"Acceptance"|"Rejection"|"Request"|"Alert"|"Decision"|"Submission"|"Correction"} DialogsEntitiesTransmissions_DialogTransmissionType
 */

/**
 * Represents the type of consumer that an attachment URL is intended for.
 *
 * @typedef {string} Attachments_AttachmentUrlConsumerType
 */


/**
 * Represents the type of consumer that an attachment URL is intended for.
 *
 * @typedef {"Gui"|"Api"} Attachments_AttachmentUrlConsumerType
 */


/**
 * A seen log entry for a dialog.
 *
 * Returned by the Service Owner Seen Log API.
 *
 * @typedef {Object} DialogSeenLog
 * @property {string} id
 *   The unique identifier for the seen log entry in UUID format.
 * @property {string} seenAt
 *   The date and time when the dialog was seen (UTC timestamp).
 * @property {Actor} seenBy
 *   The actor that viewed the dialog.
 * @property {?boolean} [isViaServiceOwner]
 *   Indicates whether the dialog was viewed via the service owner context.
 */


/**
 * Gets end user context system labels for dialogs.
 *
 * Performs a paginated search for dialog end user context labels.
 *
 * Filters:
 * - `party` is required.
 * - `label` values are matched using OR semantics.
 * - Use the returned `continuationToken` to retrieve the next page when
 *   `hasNextPage` is `true`.
 *
 * @async
 * @function searchDialogEndUserContext
 *
 * @param {Object} params
 * @param {string[]} params.party
 *   One or more owning parties to filter by.
 * @param {?string} [params.contentUpdatedAfter]
 *   Only return context for dialogs with `contentUpdatedAt` greater than or
 *   equal to this UTC date-time.
 * @param {?SystemLabel[]} [params.label]
 *   One or more system labels to filter by. Labels are matched using OR
 *   semantics.
 * @param {?string} [params.continuationToken]
 *   Continuation token from a previous response used to retrieve the next page.
 * @param {?number} [params.limit]
 *   Maximum number of results to return (1–1000, default: 100).
 *
 * @returns {Promise<PaginatedDialogEndUserContextList>}
 *
 * @throws {UnauthorizedError}
 *   Missing or invalid authentication token. Requires the
 *   `digdir:dialogporten.serviceprovider` and
 *   `digdir:dialogporten.serviceprovider.search` scopes.
 * @throws {ServiceUnavailableError}
 *   Dialogporten is temporarily unavailable or in maintenance mode.
 */



/**
 * A paginated list of dialog end user context items.
 *
 * @typedef {Object} PaginatedDialogEndUserContextList
 * @property {?DialogEndUserContextItem[]} [items]
 *   The paginated list of items.
 * @property {boolean} hasNextPage
 *   Whether there are more items available that can be fetched by supplying
 *   the continuation token.
 * @property {?string} [continuationToken]
 *   The continuation token to be used to fetch the next page of items.
 * @property {string} orderBy
 *   The current sorting order of the items.
 */

/**
 * Dialog end user context information.
 *
 * @typedef {Object} DialogEndUserContextItem
 * @property {string} dialogId
 *   The dialog identifier in UUID format.
 * @property {string} endUserContextRevision
 *   The end user context revision identifier in UUID format.
 * @property {?SystemLabel[]} [systemLabels]
 *   The system labels currently applied to the dialog.
 */


/**
 * Gets the activities belonging to a dialog.
 *
 * @async
 * @function getDialogActivities
 *
 * @param {string} dialogId
 *   The dialog identifier (UUID).
 *
 * @returns {Promise<DialogActivity[]>}
 *   The activities belonging to the dialog.
 *
 * @throws {NotFoundError}
 *   The supplied dialog ID was not found.
 * @throws {UnauthorizedError}
 *   Missing or invalid authentication token. Requires the
 *   `digdir:dialogporten.serviceprovider` scope.
 * @throws {ForbiddenError}
 *   Unauthorized to get the supplied dialog (dialog not owned by the
 *   authenticated organization or additional policy requirements apply).
 * @throws {ServiceUnavailableError}
 *   Dialogporten is temporarily unavailable or in maintenance mode.
 */

/**
 * Adds an activity to a dialog's activity history.
 *
 * The activity is created with the supplied configuration.
 *
 * Optimistic concurrency control is implemented using the `If-Match`
 * header. Supply the dialog Revision value from the Get Dialog endpoint
 * to ensure the dialog has not been modified or deleted by another request.
 *
 * @async
 * @function createDialogActivity
 *
 * @param {string} dialogId
 *   The dialog identifier (UUID).
 * @param {ActivityRequest} activity
 *   The activity to create.
 * @param {?string} [ifMatch]
 *   Optional dialog revision (ETag) used for optimistic concurrency control.
 *
 * @returns {Promise<string>}
 *   The UUID of the created activity.
 *
 * @throws {ValidationError}
 *   Validation error occurred. See problem details for validation errors.
 * @throws {NotFoundError}
 *   The supplied dialog ID was not found.
 * @throws {ConflictError}
 *   A conflict occurred while processing the request.
 * @throws {GoneError}
 *   The entity has been removed.
 * @throws {PreconditionFailedError}
 *   The supplied `If-Match` value did not match the current dialog revision.
 * @throws {UnprocessableEntityError}
 *   A domain error occurred. See problem details for details.
 * @throws {UnauthorizedError}
 *   Missing or invalid authentication token. Requires the
 *   `digdir:dialogporten.serviceprovider` scope.
 * @throws {ForbiddenError}
 *   Unauthorized to create an activity for the supplied dialog.
 * @throws {ServiceUnavailableError}
 *   Dialogporten is temporarily unavailable or in maintenance mode.
 */



/**
 * A dialog activity.
 *
 * Returned by the Service Owner Activities API.
 *
 * @typedef {Object} DialogActivity
 * @property {string} id
 *   The unique identifier for the activity in UUID format.
 * @property {string} createdAt
 *   The date and time when the activity was created (UTC timestamp).
 * @property {?string} [extendedType]
 *   An arbitrary URI/URN describing a service-specific activity type.
 * @property {DialogActivityType} type
 *   The type of activity.
 * @property {?string} [transmissionId]
 *   The identifier of the related transmission, if any.
 */

/**
 * Request payload used to create a dialog activity.
 *
 * @typedef {Object} ActivityRequest
 * @property {?string} [id]
 *   A UUIDv7 may be provided to support idempotent additions to the list of
 *   activities. If not supplied, a new UUIDv7 will be generated.
 * @property {?string} [createdAt]
 *   If supplied, overrides the creation date and time for the activity.
 *   If not supplied, the current date/time will be used.
 * @property {?string} [extendedType]
 *   Arbitrary URI/URN describing a service-specific activity type.
 * @property {DialogActivityType} type
 *   The type of activity.
 * @property {?string} [transmissionId]
 *   If the activity is related to a particular transmission, this field
 *   contains the transmission identifier. Must be present in the request body.
 * @property {Actor} performedBy
 *   The actor that performed the activity.
 * @property {?Localization[]} [description]
 *   Unstructured text describing the activity. Only set if the activity type
 *   is `Information`.
 */


/**
 * The type of a dialog activity.
 *
 * @typedef {(
 *   'DialogCreated' |
 *   'DialogClosed' |
 *   'Information' |
 *   'TransmissionOpened' |
 *   'PaymentMade' |
 *   'SignatureProvided' |
 *   'DialogOpened' |
 *   'DialogDeleted' |
 *   'DialogRestored' |
 *   'SentToSigning' |
 *   'SentToFormFill' |
 *   'SentToSendIn' |
 *   'SentToPayment' |
 *   'FormSubmitted' |
 *   'FormSaved' |
 *   'CorrespondenceOpened' |
 *   'CorrespondenceConfirmed'
 * )} DialogActivityType
 */







/**
 * The aggregated status of the dialog.
 *
 * @typedef {(
 *   "InProgress" |
 *   "Draft" |
 *   "RequiresAttention" |
 *   "Completed" |
 *   "NotApplicable" |
 *   "Awaiting"
 * )} DialogStatus
 */

/**
 * The status values accepted when creating a dialog.
 *
 * @typedef {(
 *   "New" |
 *   "InProgress" |
 *   "Draft" |
 *   "Sent" |
 *   "RequiresAttention" |
 *   "Completed" |
 *   "NotApplicable" |
 *   "Awaiting"
 * )} DialogStatusInput
 */

/**
 * System defined labels used to categorize dialogs.
 *
 * @typedef {(
 *   "Default" |
 *   "Bin" |
 *   "Archive" |
 *   "MarkedAsUnopened" |
 *   "Sent"
 * )} SystemLabel
 */

/**
 * Types of activities associated with a dialog.
 *
 * @typedef {(
 *   "DialogCreated" |
 *   "DialogClosed" |
 *   "Information" |
 *   "TransmissionOpened" |
 *   "PaymentMade" |
 *   "SignatureProvided" |
 *   "DialogOpened" |
 *   "DialogDeleted" |
 *   "DialogRestored" |
 *   "SentToSigning" |
 *   "SentToFormFill" |
 *   "SentToSendIn" |
 *   "SentToPayment" |
 *   "FormSubmitted" |
 *   "FormSaved" |
 *   "CorrespondenceOpened" |
 *   "CorrespondenceConfirmed"
 * )} DialogActivityType
 */

/**
 * Types of transmissions associated with a dialog.
 *
 * @typedef {(
 *   "Information" |
 *   "Acceptance" |
 *   "Rejection" |
 *   "Request" |
 *   "Alert" |
 *   "Decision" |
 *   "Submission" |
 *   "Correction"
 * )} DialogTransmissionType
 */

/**
 * The type of consumer the attachment URL is intended for.
 *
 * @typedef {(
 *   "Gui" |
 *   "Api"
 * )} AttachmentUrlConsumerType
 */

/**
 * The type of actor performing an action.
 *
 * @typedef {(
 *   "PartyRepresentative" |
 *   "ServiceOwner"
 * )} ActorType
 */

/**
 * HTTP methods supported by actions and endpoints.
 *
 * @typedef {(
 *   "GET" |
 *   "POST" |
 *   "PUT" |
 *   "PATCH" |
 *   "DELETE" |
 *   "HEAD" |
 *   "OPTIONS" |
 *   "TRACE" |
 *   "CONNECT"
 * )} HttpVerb
 */

/**
 * Priority of a GUI action.
 *
 * @typedef {(
 *   "Primary" |
 *   "Secondary" |
 *   "Tertiary"
 * )} DialogGuiActionPriority
 */



/**
 * A localized text value.
 *
 * @typedef {Object} Localization
 * @property {string} value The localized text (or URL if a front-channel embed).
 * @property {string} languageCode The language code of the localization in ISO 639-1 format.
 */

/**
 * A content value with localization and media type information.
 *
 * @typedef {Object} ContentValue
 * @property {Array<Localization>|null} value A list of localizations for the content.
 * @property {string} mediaType Media type of the content. This can also indicate that the content is embeddable.
 * @property {boolean|null} [isAuthorized] True if the authenticated user is authorized for this content.
 */

/**
 * Represents an actor performing an action in a dialog.
 *
 * @typedef {Object} Actor
 * @property {ActorType} actorType The type of actor; either the service owner or someone representing the party.
 * @property {string|null} [actorName] The name of the actor.
 * @property {string|null} [actorId] The identifier (national identity number or organization number) of the actor.
 */

/**
 * A service owner label.
 *
 * Labels are not visible in end-user APIs.
 *
 * @typedef {Object} ServiceOwnerLabel
 * @property {string} value A label value.
 */

/**
 * A search tag value used for dialog search queries.
 *
 * Tags are not visible in end-user DTOs.
 *
 * @typedef {Object} Tag
 * @property {string} value A search tag value.
 */

/**
 * Metadata about the dialog owned by the service owner.
 *
 * @typedef {Object} DialogServiceOwnerContext
 * @property {Array<ServiceOwnerLabel>|null} [serviceOwnerLabels]
 * A list of labels, not visible in end-user APIs.
 */

/**
 * Metadata about the dialog owned by end users.
 *
 * @typedef {Object} DialogEndUserContext
 * @property {Array<SystemLabel>|null} [systemLabels]
 * System defined labels used to categorize dialogs.
 */






/**
 * A paginated list of dialog search results.
 *
 * @typedef {Object} PaginatedDialogSearchResult
 * @property {Array<DialogSearchResult>|null} items The paginated list of items.
 * @property {boolean} hasNextPage Whether there are more items available that can be fetched by supplying the continuation token.
 * @property {string|null} continuationToken The continuation token to be used to fetch the next page of items.
 * @property {string} orderBy The current sorting order of the items.
 */

/**
 * Dialog returned from the service owner dialog search endpoint.
 *
 * @typedef {Object} DialogSearchResult
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string} org The service owner code representing the organization related to this dialog.
 * @property {string} revision The unique identifier for the revision in UUIDv4 format.
 * @property {string} serviceResource The service identifier for the service related to this dialog in URN format.
 * @property {string} serviceResourceType The ServiceResource type as defined in Altinn Resource Registry.
 * @property {string} party The party code representing the organization or person that the dialog belongs to.
 * @property {number|null} [progress] Advisory indicator of progress represented as a percentage value.
 * @property {string|null} [process] Optional business process identifier.
 * @property {string|null} [precedingProcess] Optional preceding business process identifier.
 * @property {number|null} [guiAttachmentCount] Number of attachments available for browser-based frontends.
 * @property {string|null} [extendedStatus] Service-specific status indicator.
 * @property {string|null} [externalReference] Service-specific external reference.
 * @property {string} createdAt Date and time when the dialog was created.
 * @property {string} updatedAt Date and time when the dialog was last updated.
 * @property {string} contentUpdatedAt Date and time when dialog content was last updated.
 * @property {string|null} [dueAt] Due date for the dialog.
 * @property {string|null} [deletedAt] Date and time when the dialog was deleted.
 * @property {string|null} [visibleFrom] Timestamp when the dialog becomes visible to authorized end users.
 * @property {DialogStatus} status Aggregated status of the dialog.
 * @property {SystemLabel} systemLabel Deprecated system label.
 * @property {boolean} isApiOnly Whether the dialog is intended for API consumption only.
 * @property {number} fromServiceOwnerTransmissionsCount Number of transmissions sent by the service owner.
 * @property {number} fromPartyTransmissionsCount Number of transmissions sent by a party representative.
 * @property {boolean} hasUnopenedContent Whether the service owner has unopened content.
 * @property {DialogActivity|null} [latestActivity] Latest entry in the dialog activity log.
 * @property {Array<DialogSeenLog>|null} [seenSinceLastUpdate] Seen log entries newer than the dialog updated timestamp.
 * @property {Array<DialogSeenLog>|null} [seenSinceLastContentUpdate] Seen log entries newer than the dialog content update timestamp.
 * @property {boolean} isContentSeen Whether the dialog has been seen since its last content update.
 * @property {DialogServiceOwnerContext} serviceOwnerContext Metadata about the service owner context.
 * @property {DialogEndUserContext} endUserContext Metadata about the end user context.
 * @property {SearchContent|null} [content] Dialog content returned in search results.
 */

/**
 * An entry in the dialog activity log returned by search.
 *
 * @typedef {Object} DialogActivity
 * @property {string} id The unique identifier for the activity in UUIDv7 format.
 * @property {string|null} [createdAt] Date and time when the activity was created.
 * @property {string|null} [extendedType] Service-specific activity type URI.
 * @property {DialogActivityType} type Type of activity.
 * @property {string|null} [transmissionId] Related transmission identifier.
 * @property {Actor} performedBy Actor that performed the activity.
 * @property {Array<Localization>|null} [description] Unstructured text describing the activity.
 */

/**
 * A log entry describing when a dialog revision was seen.
 *
 * @typedef {Object} DialogSeenLog
 * @property {string} id The unique identifier for the seen log entry in UUIDv7 format.
 * @property {string} seenAt Timestamp when the dialog revision was seen.
 * @property {Actor} seenBy Actor that saw the dialog revision.
 * @property {boolean|null} [isViaServiceOwner] Whether the entry was created via the service owner.
 * @property {boolean} isCurrentEndUser Whether the entry was created by the end user supplied in the query.
 */

/**
 * Search result content for a dialog.
 *
 * @typedef {Object} SearchContent
 * @property {ContentValue} title The title of the dialog.
 * @property {ContentValue|null} [nonSensitiveTitle] Non-sensitive title used for lower authorization levels.
 * @property {ContentValue|null} [summary] Short summary of the dialog and its current state.
 * @property {ContentValue|null} [nonSensitiveSummary] Non-sensitive summary used for lower authorization levels.
 * @property {ContentValue|null} [senderName] Overridden sender name.
 * @property {ContentValue|null} [extendedStatus] Human-readable label for extended status.
 */



/**
 * Request model for creating a dialog.
 *
 * @typedef {Object} CreateDialog
 * @property {string|null} [id] Optional self-defined UUIDv7 used for idempotent creation.
 * @property {string|null} [idempotentKey] Optional key to ensure idempotent dialog creation.
 * @property {string} serviceResource Service identifier for the related service in URN format.
 * @property {string} party Party code representing the organization or person the dialog belongs to.
 * @property {number|null} [progress] Advisory progress indicator represented as a percentage value.
 * @property {string|null} [extendedStatus] Service-specific status indicator.
 * @property {string|null} [externalReference] Service-specific reference to an external system or service.
 * @property {string|null} [visibleFrom] Timestamp when the dialog should become visible.
 * @property {string|null} [dueAt] Due date for the dialog.
 * @property {string|null} [process] Optional business process identifier.
 * @property {string|null} [precedingProcess] Optional preceding business process identifier.
 * @property {string|null} [expiresAt] Date after which the dialog is no longer available.
 * @property {boolean} isApiOnly Whether the dialog is intended for API consumption only.
 * @property {string|null} [createdAt] Override creation timestamp.
 * @property {string|null} [updatedAt] Override update timestamp.
 * @property {DialogStatusInput|null} [status] Initial dialog status.
 * @property {SystemLabel|null} [systemLabel] System label for the dialog.
 * @property {CreateDialogServiceOwnerContext|null} [serviceOwnerContext] Service owner metadata.
 * @property {CreateDialogContent|null} [content] Dialog content.
 * @property {Array<Tag>|null} [searchTags] Search tags used by dialog queries.
 * @property {Array<Attachment>|null} [attachments] Dialog-level attachments.
 * @property {Array<Transmission>|null} [transmissions] Immutable list of transmissions.
 * @property {Array<GuiAction>|null} [guiActions] GUI actions associated with the dialog.
 * @property {Array<ApiAction>|null} [apiActions] API actions associated with the dialog.
 * @property {Array<Activity>|null} [activities] Immutable list of activities associated with the dialog.
 */

/**
 * Metadata about the dialog owned by the service owner when creating a dialog.
 *
 * @typedef {Object} CreateDialogServiceOwnerContext
 * @property {Array<ServiceOwnerLabel>|null} [serviceOwnerLabels]
 * A list of labels not visible in end-user APIs.
 */

/**
 * Content of a dialog during creation.
 *
 * @typedef {Object} CreateDialogContent
 * @property {ContentValue} title The title of the dialog.
 * @property {ContentValue|null} [nonSensitiveTitle] Non-sensitive title used for search/list views.
 * @property {ContentValue|null} [summary] Short summary of the dialog and current state.
 * @property {ContentValue|null} [nonSensitiveSummary] Non-sensitive summary used for lower authorization levels.
 * @property {ContentValue|null} [senderName] Overridden sender name.
 * @property {ContentValue|null} [additionalInfo] Additional information about the dialog.
 * @property {ContentValue|null} [extendedStatus] Human-readable label for extended status.
 * @property {ContentValue|null} [mainContentReference] Front-channel embedded content URL.
 */

/**
 * Attachment associated with a dialog.
 *
 * @typedef {Object} Attachment
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {Array<Localization>|null} [displayName] Display name used in GUIs.
 * @property {string|null} [name] Logical name of the attachment.
 * @property {Array<AttachmentUrl>|null} [urls] URLs representing the attachment.
 * @property {string|null} [expiresAt] UTC timestamp when the attachment expires.
 */

/**
 * URL representation of an attachment.
 *
 * @typedef {Object} AttachmentUrl
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {string} url Fully qualified URL of the attachment.
 * @property {string|null} [mediaType] Media type of the attachment.
 * @property {AttachmentUrlConsumerType} consumerType Type of consumer the URL is intended for.
 */



/**
 * A transmission associated with a dialog.
 *
 * @typedef {Object} Transmission
 * @property {string|null} [id] Optional self-defined UUIDv7 used for idempotent creation.
 * @property {string|null} [idempotentKey] Optional idempotency key unique within the dialog.
 * @property {string} createdAt Creation date and time of the transmission.
 * @property {string|null} [authorizationAttribute] Authorization resource attribute ID.
 * @property {string|null} [extendedType] Service-specific transmission type URI.
 * @property {string|null} [externalReference] Service-specific external reference.
 * @property {string|null} [relatedTransmissionId] Identifier of a related transmission.
 * @property {DialogTransmissionType} type Type of transmission.
 * @property {Actor} sender Actor that sent the transmission.
 * @property {TransmissionContent|null} [content] Transmission content.
 * @property {Array<TransmissionAttachment>|null} [attachments] Transmission-level attachments.
 * @property {Array<TransmissionNavigationalAction>|null} [navigationalActions] Transmission-level navigation actions.
 */

/**
 * Content associated with a transmission.
 *
 * @typedef {Object} TransmissionContent
 * @property {ContentValue} title Transmission title.
 * @property {ContentValue|null} [summary] Transmission summary.
 * @property {ContentValue|null} [contentReference] Front-channel embedded content reference.
 */

/**
 * Attachment associated with a transmission.
 *
 * @typedef {Object} TransmissionAttachment
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {Array<Localization>|null} [displayName] Display name used in GUIs.
 * @property {string|null} [name] Logical attachment name.
 * @property {Array<TransmissionAttachmentUrl>|null} [urls] URLs representing the attachment.
 * @property {string|null} [expiresAt] UTC timestamp when the attachment expires.
 */

/**
 * URL representation of a transmission attachment.
 *
 * @typedef {Object} TransmissionAttachmentUrl
 * @property {string} url Fully qualified URL of the attachment.
 * @property {string|null} [mediaType] Media type of the attachment.
 * @property {AttachmentUrlConsumerType} consumerType Type of consumer the URL is intended for.
 */

/**
 * A navigational action associated with a transmission.
 *
 * @typedef {Object} TransmissionNavigationalAction
 * @property {Array<Localization>|null} [title] Title of the navigation action.
 * @property {string} url Fully qualified URL of the navigation action.
 * @property {string|null} [expiresAt] UTC timestamp when the action expires.
 */

/**
 * A GUI action associated with a dialog.
 *
 * @typedef {Object} GuiAction
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {string} action Action identifier corresponding to the authorization policy attribute.
 * @property {string} url URL where the user is redirected when the action is triggered.
 * @property {string|null} [authorizationAttribute] Authorization resource attribute ID.
 * @property {boolean} isDeleteDialogAction Whether the action results in deleting the dialog.
 * @property {HttpVerb|null} [httpMethod] HTTP method used when redirecting the user.
 * @property {DialogGuiActionPriority} priority Priority of the action.
 * @property {Array<Localization>|null} [title] Short verb-form title of the action.
 * @property {Array<Localization>|null} [prompt] Confirmation prompt shown before execution.
 */

/**
 * An API action associated with a dialog.
 *
 * @typedef {Object} ApiAction
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {string} action Action identifier corresponding to the authorization policy attribute.
 * @property {string|null} [authorizationAttribute] Authorization resource attribute ID.
 * @property {string|null} [name] Logical operation name.
 * @property {Array<ApiActionEndpoint>|null} [endpoints] Endpoints associated with the action.
 */

/**
 * An endpoint belonging to an API action.
 *
 * @typedef {Object} ApiActionEndpoint
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {string|null} [version] Arbitrary endpoint version identifier.
 * @property {string} url Fully qualified API endpoint URL.
 * @property {HttpVerb} httpMethod HTTP method expected by the endpoint.
 * @property {string|null} [documentationUrl] Human-readable endpoint documentation URL.
 * @property {string|null} [requestSchema] Request schema URL.
 * @property {string|null} [responseSchema] Response schema URL.
 * @property {boolean} deprecated Whether the endpoint is deprecated.
 * @property {string|null} [sunsetAt] Date and time when the endpoint will no longer function.
 */

/**
 * Activity associated with a dialog during creation.
 *
 * @typedef {Object} Activity
 * @property {string|null} [id] Optional self-defined UUIDv7.
 * @property {string|null} [createdAt] Override activity creation timestamp.
 * @property {string|null} [extendedType] Service-specific activity type URI.
 * @property {DialogActivityType} type Type of activity.
 * @property {string|null} [transmissionId] Related transmission identifier.
 * @property {Actor} performedBy Actor that performed the activity.
 * @property {Array<Localization>|null} [description] Unstructured activity description.
 */


/**
 * @typedef {'NotExists'|'Exists'} NotificationConditionType
 * Notification condition type.
 */

/**
 * @typedef {Object} NotificationCondition
 * @property {boolean} sendNotification Indicates whether a notification should be sent.
 */


/**
 * @typedef {Object} GetTransmissionContent
 * @property {ContentValue} title Transmission title.
 * @property {ContentValue|null} summary Transmission summary.
 * @property {ContentValue|null} contentReference Front-channel embedded content reference.
 */

/**
 * @typedef {Object} GetTransmissionAttachmentUrl
 * @property {string} id Attachment URL UUID.
 * @property {string} url Fully qualified attachment URL. May be `urn:dialogporten:unauthorized` if access is denied.
 * @property {string|null} mediaType Media type of the attachment.
 * @property {AttachmentUrlConsumerType} consumerType Intended consumer type for the URL.
 */

/**
 * @typedef {Object} GetTransmissionAttachment
 * @property {string} id Attachment UUID.
 * @property {Localization[]|null} displayName Localized display name.
 * @property {string|null} name Logical attachment name.
 * @property {GetTransmissionAttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt UTC timestamp when the attachment expires.
 */

/**
 * @typedef {Object} GetTransmissionNavigationalAction
 * @property {Localization[]|null} title Localized action title.
 * @property {string} url Fully qualified navigational URL.
 * @property {string|null} expiresAt UTC timestamp when the action expires.
 */

/**
 * @typedef {Object} GetTransmission
 * @property {string} id Transmission UUID.
 * @property {string|null} idempotentKey Idempotency key for the transmission.
 * @property {string} createdAt Transmission creation timestamp.
 * @property {string|null} authorizationAttribute Authorization attribute used for access control.
 * @property {string|null} extendedType Service-specific transmission type URI.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} relatedTransmissionId Related transmission UUID.
 * @property {DialogTransmissionType} type Transmission type.
 * @property {Actor} sender Sender of the transmission.
 * @property {GetTransmissionContent} content Transmission content.
 * @property {GetTransmissionAttachment[]|null} attachments Transmission attachments.
 * @property {GetTransmissionNavigationalAction[]|null} navigationalActions Navigational actions associated with the transmission.
 */

/**
 * @typedef {Object} UpdateTransmissionContent
 * @property {ContentValue} title Transmission title.
 * @property {ContentValue|null} summary Transmission summary.
 * @property {ContentValue|null} contentReference Front-channel embedded content reference.
 */

/**
 * @typedef {Object} UpdateTransmissionAttachmentUrl
 * @property {string} url Fully qualified attachment URL.
 * @property {string|null} mediaType Media type of the attachment.
 * @property {AttachmentUrlConsumerType} consumerType Intended consumer type for the URL.
 */

/**
 * @typedef {Object} UpdateTransmissionAttachment
 * @property {string|null} id Attachment UUID.
 * @property {Localization[]|null} displayName Localized display name.
 * @property {string|null} name Logical attachment name.
 * @property {UpdateTransmissionAttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt UTC timestamp when the attachment expires.
 */

/**
 * @typedef {Object} UpdateTransmissionNavigationalAction
 * @property {Localization[]|null} title Localized action title.
 * @property {string} url Fully qualified navigational URL.
 * @property {string|null} expiresAt UTC timestamp when the action expires.
 */

/**
 * @typedef {Object} UpdateTransmissionRequest
 * @property {string|null} idempotentKey Idempotency key for the transmission.
 * @property {string|null} createdAt Overrides the transmission creation timestamp.
 * @property {string|null} authorizationAttribute Authorization attribute used for access control.
 * @property {string|null} extendedType Service-specific transmission type URI.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} relatedTransmissionId Related transmission UUID.
 * @property {DialogTransmissionType} type Transmission type.
 * @property {Actor} sender Sender of the transmission.
 * @property {UpdateTransmissionContent|null} content Transmission content.
 * @property {UpdateTransmissionAttachment[]|null} attachments Transmission attachments.
 * @property {UpdateTransmissionNavigationalAction[]|null} navigationalActions Navigational actions associated with the transmission.
 * @property {boolean} isSilentUpdate Indicates whether the update should suppress notifications.
 */



/**
 * A dialog seen log record.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGetSeenLog_SeenLog
 * @property {string} id The unique identifier for the seen log entry (UUIDv7).
 * @property {string} seenAt The timestamp when the dialog revision was seen (ISO 8601 date-time).
 * @property {V1ServiceOwnerCommonActors_Actor} seenBy The actor that viewed the dialog revision.
 * @property {boolean|null} isViaServiceOwner Indicates whether the seen log entry was created via the service owner API frontend.
 * @property {boolean} isCurrentEndUser Indicates whether the seen log entry was created by the end user supplied in the query.
 */


/**
 * A dialog activity record.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGetActivity_Activity
 * @property {string} id The unique identifier for the activity (UUIDv7).
 * @property {string|null} createdAt The date and time when the activity was created (ISO 8601 date-time).
 * @property {string|null} extendedType A service-specific activity type URI.
 * @property {DialogsEntitiesActivities_DialogActivityType} type The type of activity.
 * @property {string|null} transmissionId The identifier of the related transmission, if applicable.
 * @property {V1ServiceOwnerCommonActors_Actor} performedBy The actor that performed the activity.
 * @property {V1CommonLocalizations_Localization[]|null} description Unstructured localized text describing the activity. Only set for Information activities.
 */



/**
 * Dialog aggregate returned from the service owner GET dialog endpoint.
 *
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_Dialog
 * @property {string} id The unique identifier for the dialog (UUIDv7).
 * @property {string|null} idempotentKey Optional idempotency key used during dialog creation.
 * @property {string} revision The unique identifier for the dialog revision (UUIDv4).
 * @property {string} org Service owner code representing the organization related to this dialog.
 * @property {string} serviceResource Service identifier in URN format.
 * @property {string} serviceResourceType Service resource type as defined in Altinn Resource Registry.
 * @property {string} party Party identifier in URN format representing the owner of the dialog.
 * @property {number|null} progress Advisory progress indicator (1-100).
 * @property {string|null} process Optional business process identifier.
 * @property {string|null} precedingProcess Optional preceding business process identifier.
 * @property {string|null} extendedStatus Service-specific status extension.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} deletedAt Deletion timestamp if the dialog has been deleted.
 * @property {string|null} visibleFrom Timestamp when the dialog becomes visible to authorized users.
 * @property {string|null} dueAt Dialog due date.
 * @property {string|null} expiresAt Dialog expiration timestamp.
 * @property {string} createdAt Dialog creation timestamp.
 * @property {string} updatedAt Last update timestamp.
 * @property {string} contentUpdatedAt Last content update timestamp.
 * @property {DialogsEntities_DialogStatus} status Aggregated dialog status.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel Deprecated system label.
 * @property {boolean} isApiOnly Indicates whether the dialog is intended for API-only consumption.
 * @property {boolean} hasUnopenedContent Indicates whether the dialog contains unopened content from the service owner.
 * @property {V1ServiceOwnerDialogsQueriesGet_Content|null} content Dialog content.
 * @property {number} fromServiceOwnerTransmissionsCount Number of transmissions sent by the service owner.
 * @property {number} fromPartyTransmissionsCount Number of transmissions sent by party representatives.
 * @property {V1ServiceOwnerDialogsQueriesGet_Tag[]|null} searchTags Search tags used for dialog queries.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogAttachment[]|null} attachments Dialog-level attachments.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmission[]|null} transmissions Dialog transmissions.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogGuiAction[]|null} guiActions GUI actions available for browser clients.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogApiAction[]|null} apiActions API actions available for integrations.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogActivity[]|null} activities Dialog activities.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogSeenLog[]|null} seenSinceLastUpdate Seen log entries after the last dialog update.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogSeenLog[]|null} seenSinceLastContentUpdate Seen log entries after the last content update.
 * @property {boolean} isContentSeen Indicates whether the dialog content has been seen.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext} serviceOwnerContext Service owner metadata.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext} endUserContext End user metadata.
 */

/**
 * Dialog update request model.
 *
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Dialog
 * @property {number|null} progress Advisory progress indicator (1-100).
 * @property {string|null} extendedStatus Service-specific status extension.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} dueAt Dialog due date.
 * @property {string|null} process Optional business process identifier.
 * @property {string|null} precedingProcess Optional preceding business process identifier.
 * @property {string|null} expiresAt Dialog expiration timestamp.
 * @property {boolean} isApiOnly Indicates whether the dialog is intended for API-only consumption.
 * @property {V1ServiceOwnerCommonDialogStatuses_DialogStatusInput} status Aggregated dialog status.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Content|null} content Dialog content.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Tag[]|null} searchTags Search tags used for dialog queries.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Attachment[]|null} attachments Dialog-level attachments.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Transmission[]|null} transmissions Transmissions to append or update.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_GuiAction[]|null} guiActions GUI actions available for browser clients.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_ApiAction[]|null} apiActions API actions available for integrations.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Activity[]|null} activities Activities to append.
 */


/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_Dialog
 * @property {string} id The unique identifier for the dialog in UUIDv7 format.
 * @property {string|null} idempotentKey Optional key used to ensure idempotent dialog creation.
 * @property {string} revision Unique identifier for the revision in UUIDv4 format.
 * @property {string} org Service owner code representing the organization related to this dialog.
 * @property {string} serviceResource Service identifier for the service related to the dialog.
 * @property {string} serviceResourceType ServiceResource type as defined in Altinn Resource Registry.
 * @property {string} party Party identifier representing the organization or person the dialog belongs to.
 * @property {number|null} progress Advisory progress indicator represented as a percentage from 1-100.
 * @property {string|null} process Optional business process identifier.
 * @property {string|null} precedingProcess Optional preceding business process identifier.
 * @property {string|null} extendedStatus Service-specific status indicator.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} deletedAt Timestamp when the dialog was deleted.
 * @property {string|null} visibleFrom Timestamp when the dialog becomes visible for authorized users.
 * @property {string|null} dueAt Dialog due date.
 * @property {string|null} expiresAt Dialog expiration date.
 * @property {string} createdAt Timestamp when the dialog was created.
 * @property {string} updatedAt Timestamp when the dialog was last updated.
 * @property {string} contentUpdatedAt Timestamp when dialog content was last updated.
 * @property {DialogsEntities_DialogStatus} status Aggregated dialog status.
 * @property {DialogEndUserContextsEntities_SystemLabel} systemLabel Deprecated system-defined label.
 * @property {boolean} isApiOnly Indicates whether the dialog is intended only for API consumption.
 * @property {boolean} hasUnopenedContent Indicates whether there is unopened content from the service owner.
 * @property {V1ServiceOwnerDialogsQueriesGet_Content|null} content Dialog content.
 * @property {number} fromServiceOwnerTransmissionsCount Number of transmissions sent by the service owner.
 * @property {number} fromPartyTransmissionsCount Number of transmissions sent by a party representative.
 * @property {V1ServiceOwnerDialogsQueriesGet_Tag[]|null} searchTags Search tags for the dialog.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogAttachment[]|null} attachments Dialog-level attachments.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmission[]|null} transmissions Dialog transmissions.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogGuiAction[]|null} guiActions GUI actions associated with the dialog.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogApiAction[]|null} apiActions API actions associated with the dialog.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogActivity[]|null} activities Activities associated with the dialog.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogSeenLog[]|null} seenSinceLastUpdate Seen log entries after last update.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogSeenLog[]|null} seenSinceLastContentUpdate Seen log entries after last content update.
 * @property {boolean} isContentSeen Indicates whether the dialog has been seen since the last content update.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext} serviceOwnerContext Service owner metadata.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext} endUserContext End user metadata.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Dialog
 * @property {number|null} progress Advisory progress indicator represented as a percentage from 1-100.
 * @property {string|null} extendedStatus Service-specific status indicator.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} dueAt Dialog due date.
 * @property {string|null} process Optional business process identifier.
 * @property {string|null} precedingProcess Optional preceding business process identifier.
 * @property {string|null} expiresAt Dialog expiration date.
 * @property {boolean} isApiOnly Indicates whether the dialog is API-only.
 * @property {V1ServiceOwnerCommonDialogStatuses_DialogStatusInput} status Dialog status.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Content|null} content Dialog content.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Tag[]|null} searchTags Search tags.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Attachment[]|null} attachments Dialog attachments.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Transmission[]|null} transmissions Dialog transmissions.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_GuiAction[]|null} guiActions GUI actions.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_ApiAction[]|null} api actions.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_Activity[]|null} activities Dialog activities.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_Content
 * @property {V1CommonContent_ContentValue} title Dialog title.
 * @property {V1CommonContent_ContentValue|null} nonSensitiveTitle Non-sensitive dialog title.
 * @property {V1CommonContent_ContentValue|null} summary Dialog summary.
 * @property {V1CommonContent_ContentValue|null} nonSensitiveSummary Non-sensitive dialog summary.
 * @property {V1CommonContent_ContentValue|null} senderName Overridden sender name.
 * @property {V1CommonContent_ContentValue|null} additionalInfo Additional dialog information.
 * @property {V1CommonContent_ContentValue|null} extendedStatus Human-readable extended status.
 * @property {V1CommonContent_ContentValue|null} mainContentReference Embedded frontend content reference.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_Tag
 * @property {string} value Search tag value.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogAttachment
 * @property {string} id Attachment identifier in UUIDv7 format.
 * @property {V1CommonLocalizations_Localization[]|null} displayName Attachment display name.
 * @property {string|null} name Logical attachment name.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogAttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt Attachment expiration timestamp.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogAttachmentUrl
 * @property {string} id Attachment URL identifier in UUIDv7 format.
 * @property {string} url Attachment URL.
 * @property {string|null} mediaType Attachment media type.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType Attachment URL consumer type.
 */


/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogTransmission
 * @property {string} id Unique identifier for the transmission in UUIDv7 format.
 * @property {string|null} idempotentKey Optional key used to ensure idempotent transmission creation.
 * @property {string} createdAt Timestamp when the transmission was created.
 * @property {string|null} authorizationAttribute Authorization resource attribute used for custom authorization rules.
 * @property {boolean|null} isAuthorized Indicates whether the authenticated user is authorized for this transmission.
 * @property {string|null} extendedType Service-specific transmission type URI/URN.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} relatedTransmissionId Identifier of a related transmission.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type Transmission type.
 * @property {V1ServiceOwnerCommonActors_Actor} sender Actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmissionContent} content Transmission content.
 * @property {boolean} isOpened Indicates whether the transmission has been opened.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachment[]|null} attachments Transmission attachments.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmissionNavigationalAction[]|null} navigationalActions Transmission navigational actions.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionContent
 * @property {V1CommonContent_ContentValue} title Transmission title.
 * @property {V1CommonContent_ContentValue|null} summary Transmission summary.
 * @property {V1CommonContent_ContentValue|null} contentReference Embedded frontend content reference.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachment
 * @property {string} id Attachment identifier in UUIDv7 format.
 * @property {V1CommonLocalizations_Localization[]|null} displayName Attachment display name.
 * @property {string|null} name Logical attachment name.
 * @property {V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt Attachment expiration timestamp.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionAttachmentUrl
 * @property {string} id Attachment URL identifier in UUIDv7 format.
 * @property {string} url Attachment URL. May contain "urn:dialogporten:unauthorized" when access is denied.
 * @property {string|null} mediaType Attachment media type.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType Attachment URL consumer type.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogTransmissionNavigationalAction
 * @property {V1CommonLocalizations_Localization[]|null} title Navigational action title.
 * @property {string} url Fully qualified URL for the navigational action.
 * @property {string|null} expiresAt Expiration timestamp for the navigational action.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogGuiAction
 * @property {string} id Action identifier in UUIDv7 format.
 * @property {string} action Action identifier corresponding to the authorization policy attribute.
 * @property {string} url URL where the user is redirected when triggering the action.
 * @property {string|null} authorizationAttribute Authorization resource attribute used for custom authorization rules.
 * @property {boolean|null} isAuthorized Indicates whether the user is authorized to perform the action.
 * @property {boolean} isDeleteDialogAction Indicates whether the action deletes the dialog.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Action priority.
 * @property {Http_HttpVerb} httpMethod HTTP method used when redirecting the user.
 * @property {V1CommonLocalizations_Localization[]|null} title Action title.
 * @property {V1CommonLocalizations_Localization[]|null} prompt Confirmation prompt text.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogApiAction
 * @property {string} id Action identifier in UUIDv7 format.
 * @property {string} action API action identifier.
 * @property {string|null} authorizationAttribute Authorization resource attribute.
 * @property {boolean|null} isAuthorized Indicates whether the user is authorized to perform the action.
 * @property {Http_HttpVerb} httpMethod HTTP method used by the API action.
 * @property {string} endpoint API endpoint URL.
 * @property {V1CommonLocalizations_Localization[]|null} title Action title.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogActivity
 * @property {string} id Activity identifier in UUIDv7 format.
 * @property {string} createdAt Timestamp when the activity was created.
 * @property {DialogsEntitiesActivities_DialogActivityType} type Activity type.
 * @property {V1ServiceOwnerCommonActors_Actor} actor Actor responsible for the activity.
 * @property {string|null} transmissionId Related transmission identifier.
 * @property {string|null} description Activity description.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogSeenLog
 * @property {string} id Seen log identifier in UUIDv7 format.
 * @property {string} seenAt Timestamp when the dialog was seen.
 * @property {string} endUserId Identifier of the end user.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogServiceOwnerContext
 * @property {string|null} reporteePartyId Service owner context party identifier.
 * @property {string|null} instanceId Related instance identifier.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsQueriesGet_DialogEndUserContext
 * @property {string|null} systemLabel End user system label.
 * @property {boolean|null} isMarkedAsUnopened Indicates whether the dialog is marked as unopened.
 */


/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Content
 * @property {V1CommonContent_ContentValue} title Dialog title.
 * @property {V1CommonContent_ContentValue|null} nonSensitiveTitle Non-sensitive dialog title used for search and list views.
 * @property {V1CommonContent_ContentValue|null} summary Dialog summary.
 * @property {V1CommonContent_ContentValue|null} nonSensitiveSummary Non-sensitive dialog summary used for search and list views.
 * @property {V1CommonContent_ContentValue|null} senderName Overridden sender name.
 * @property {V1CommonContent_ContentValue|null} additionalInfo Additional dialog information.
 * @property {V1CommonContent_ContentValue|null} extendedStatus Human-readable extended status label.
 * @property {V1CommonContent_ContentValue|null} mainContentReference Embedded frontend content reference.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Tag
 * @property {string} value Search tag value.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Attachment
 * @property {string|null} id Attachment identifier. A UUIDv7 may be supplied to support idempotent additions.
 * @property {V1CommonLocalizations_Localization[]|null} displayName Attachment display name.
 * @property {string|null} name Logical attachment name.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_AttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt Attachment expiration timestamp.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_AttachmentUrl
 * @property {string} url Fully qualified attachment URL.
 * @property {string|null} mediaType Attachment media type.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType Attachment URL consumer type.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Transmission
 * @property {string|null} idempotentKey Optional idempotency key for transmission creation.
 * @property {string|null} createdAt Overrides the transmission creation timestamp.
 * @property {string|null} authorizationAttribute Authorization resource attribute used in custom authorization rules.
 * @property {string|null} extendedType Service-specific transmission type URI/URN.
 * @property {string|null} externalReference Service-specific external reference.
 * @property {string|null} relatedTransmissionId Related transmission identifier.
 * @property {DialogsEntitiesTransmissions_DialogTransmissionType} type Transmission type.
 * @property {V1ServiceOwnerCommonActors_Actor} sender Actor that sent the transmission.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_TransmissionContent|null} content Transmission content.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachment[]|null} attachments Transmission attachments.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_TransmissionNavigationalAction[]|null} navigationalActions Transmission navigational actions.
 * @property {boolean} isSilentUpdate Indicates whether the update should be silent.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionContent
 * @property {V1CommonContent_ContentValue} title Transmission title. Must be text/plain.
 * @property {V1CommonContent_ContentValue|null} summary Transmission summary.
 * @property {V1CommonContent_ContentValue|null} contentReference HTTPS embedded frontend content reference.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachment
 * @property {string|null} id Attachment identifier. A UUIDv7 may be supplied for idempotent additions.
 * @property {V1CommonLocalizations_Localization[]|null} displayName Attachment display name.
 * @property {string|null} name Logical attachment name.
 * @property {V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachmentUrl[]|null} urls Attachment URLs.
 * @property {string|null} expiresAt Attachment expiration timestamp.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionAttachmentUrl
 * @property {string} url Fully qualified attachment URL.
 * @property {string|null} mediaType Attachment media type.
 * @property {Attachments_AttachmentUrlConsumerType} consumerType Attachment URL consumer type.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_TransmissionNavigationalAction
 * @property {V1CommonLocalizations_Localization[]|null} title Navigational action title.
 * @property {string} url Fully qualified URL of the navigational action.
 * @property {string|null} expiresAt Expiration timestamp for the navigational action.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_GuiAction
 * @property {string|null} id Action identifier.
 * @property {string} action Action identifier corresponding to authorization policy.
 * @property {string} url URL where the user is redirected.
 * @property {string|null} authorizationAttribute Authorization resource attribute.
 * @property {boolean|null} isAuthorized Whether the user is authorized to perform the action.
 * @property {boolean} isDeleteDialogAction Whether the action deletes the dialog.
 * @property {DialogsEntitiesActions_DialogGuiActionPriority} priority Action priority.
 * @property {Http_HttpVerb} httpMethod HTTP method used by the frontend.
 * @property {V1CommonLocalizations_Localization[]|null} title Action title.
 * @property {V1CommonLocalizations_Localization[]|null} prompt Confirmation prompt text.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_ApiAction
 * @property {string|null} id Action identifier.
 * @property {string} action API action identifier.
 * @property {string|null} authorizationAttribute Authorization resource attribute.
 * @property {Http_HttpVerb} httpMethod HTTP method used by the API action.
 * @property {string} endpoint API endpoint URL.
 * @property {V1CommonLocalizations_Localization[]|null} title Action title.
 */

/**
 * @typedef {Object} V1ServiceOwnerDialogsCommandsUpdate_Activity
 * @property {string|null} id Activity identifier. A UUIDv7 may be supplied to support idempotent additions.
 * @property {DialogsEntitiesActivities_DialogActivityType} type Activity type.
 * @property {string|null} transmissionId Related transmission identifier.
 * @property {V1ServiceOwnerCommonActors_Actor} actor Actor responsible for the activity.
 * @property {string|null} description Activity description.
 */


/**
 * @typedef {Object} V1CommonIdentifierLookup_ServiceOwnerIdentifierLookup
 * @property {string} dialogId Dialog identifier.
 * @property {string} instanceRef Instance reference.
 * @property {string} party Party identifier.
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceResource} serviceResource Service resource metadata.
 * @property {V1CommonIdentifierLookup_IdentifierLookupServiceOwner} serviceOwner Service owner metadata.
 * @property {Array<V1CommonLocalizations_Localization>|null} title Localized title.
 * @property {Array<V1CommonLocalizations_Localization>|null} nonSensitiveTitle Non-sensitive localized title.
 */

/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupServiceResource
 * @property {string} id Service resource identifier.
 * @property {boolean} isDelegable Whether the service resource is delegable.
 * @property {number} minimumAuthenticationLevel Minimum authentication level required.
 * @property {Array<V1CommonLocalizations_Localization>|null} name Localized service resource name.
 */

/**
 * @typedef {Object} V1CommonIdentifierLookup_IdentifierLookupServiceOwner
 * @property {string} orgNumber Service owner's organization number.
 * @property {string} code Service owner code.
 * @property {Array<V1CommonLocalizations_Localization>|null} name Localized service owner name.
 */

/**
 * @typedef {Object} V1CommonLocalizations_Localization
 * @property {string} value Localized text or URL if a front-channel embed.
 * @property {string} languageCode Language code in ISO 639-1 format.
 */

/**
 * @typedef {Object} V1EndUserCommon_AcceptedLanguages
 * @property {Array<V1EndUserCommon_AcceptedLanguage>|null} acceptedLanguage Accepted language preferences.
 */

/**
 * @typedef {Object} V1EndUserCommon_AcceptedLanguage
 * @property {string} languageCode Language code.
 * @property {number} weight Language preference weight.
 */
