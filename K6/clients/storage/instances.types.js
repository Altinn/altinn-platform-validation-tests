/**
 * @typedef {object} CompleteConfirmation
 * @property {string|null} [stakeholderId]
 * @property {string} confirmedOn
 */

/**
 * @typedef {object} DataElement
 * @property {string|null} [id]
 * @property {string|null} [instanceGuid]
 * @property {string|null} [dataType]
 * @property {string|null} [filename]
 * @property {string|null} [contentType]
 * @property {string|null} [blobStoragePath]
 * @property {ResourceLinks} selfLinks
 * @property {number} size
 * @property {string|null} [contentHash]
 * @property {boolean} locked
 * @property {Array<string>|null} [refs]
 * @property {boolean} isRead
 * @property {Array<string>|null} [tags]
 * @property {Array<KeyValueEntry>|null} [userDefinedMetadata]
 * @property {Array<KeyValueEntry>|null} [metadata]
 * @property {DeleteStatus} deleteStatus
 * @property {FileScanResult} fileScanResult
 * @property {Array<Reference>|null} [references]
 * @property {string|null} [created]
 * @property {string|null} [createdBy]
 * @property {string|null} [lastChanged]
 * @property {string|null} [lastChangedBy]
 */

/**
 * @typedef {object} DataElementList
 * @property {Array<DataElement>|null} [dataElements]
 */

/**
 * @typedef {object} DataElementSignature
 * @property {string|null} [dataElementId]
 * @property {boolean} signed
 */

/**
 * @typedef {object} DataValues
 * @property {{[key: string]: string}|null} [values]
 */

/**
 * @typedef {object} DeleteStatus
 * @property {boolean} isHardDeleted
 * @property {string|null} [hardDeleted]
 */

/**
 * @typedef {"NotApplicable"|"Pending"|"Clean"|"Infected"} FileScanResult
 */

/**
 * @typedef {object} FileScanStatus
 * @property {string|null} [contentHash]
 * @property {FileScanResult} fileScanResult
 */

/**
 * @typedef {object} Instance
 * @property {string|null} [id]
 * @property {InstanceOwner} instanceOwner
 * @property {string|null} [appId]
 * @property {string|null} [org]
 * @property {ResourceLinks} selfLinks
 * @property {string|null} [dueBefore]
 * @property {string|null} [visibleAfter]
 * @property {ProcessState} process
 * @property {InstanceStatus} status
 * @property {Array<CompleteConfirmation>|null} [completeConfirmations]
 * @property {Array<DataElement>|null} [data]
 * @property {{[key: string]: string}|null} [presentationTexts]
 * @property {{[key: string]: string}|null} [dataValues]
 * @property {string|null} [created]
 * @property {string|null} [createdBy]
 * @property {string|null} [lastChanged]
 * @property {string|null} [lastChangedBy]
 */

/**
 * @typedef {object} InstanceEvent
 * @property {string|null} [id]
 * @property {string|null} [instanceId]
 * @property {string|null} [dataId]
 * @property {string|null} [created]
 * @property {string|null} [eventType]
 * @property {string|null} [instanceOwnerPartyId]
 * @property {PlatformUser} user
 * @property {PlatformUser} relatedUser
 * @property {ProcessState} processInfo
 * @property {string|null} [additionalInfo]
 */

/**
 * @typedef {object} InstanceEventList
 * @property {Array<InstanceEvent>|null} [instanceEvents]
 */

/**
 * @typedef {object} InstanceOwner
 * @property {string|null} [partyId]
 * @property {string|null} [personNumber]
 * @property {string|null} [organisationNumber]
 * @property {string|null} [username]
 * @property {string|null} [externalIdentifier]
 */

/**
 * Query response object
 *
 * @typedef {object} InstanceQueryResponse
 * @property {number} count The number of items in this response.
 * @property {string|null} [self] The current query.
 * @property {string|null} [next] A link to the next page.
 * @property {Array<Instance>|null} [instances] The metadata.
 */

/**
 * @typedef {object} InstanceStatus
 * @property {boolean} isArchived
 * @property {string|null} [archived]
 * @property {boolean} isSoftDeleted
 * @property {string|null} [softDeleted]
 * @property {boolean} isHardDeleted
 * @property {string|null} [hardDeleted]
 * @property {ReadStatus} readStatus
 * @property {Substatus} substatus
 */

/**
 * @typedef {object} KeyValueEntry
 * @property {string|null} [key]
 * @property {string|null} [value]
 */

/**
 * @typedef {object} PlatformUser
 * @property {number|null} [userId]
 * @property {string|null} [orgId]
 * @property {number} authenticationLevel
 * @property {number|null} [endUserSystemId]
 * @property {string|null} [nationalIdentityNumber]
 * @property {string|null} [systemUserId]
 * @property {string|null} [systemUserOwnerOrgNo]
 * @property {string|null} [systemUserName]
 */

/**
 * @typedef {object} PresentationTexts
 * @property {{[key: string]: string}|null} [texts]
 */

/**
 * @typedef {object} ProcessElementInfo
 * @property {number|null} [flow]
 * @property {string|null} [started]
 * @property {string|null} [elementId]
 * @property {string|null} [name]
 * @property {string|null} [altinnTaskType]
 * @property {string|null} [ended]
 * @property {ValidationStatus} validated
 * @property {string|null} [flowType]
 */

/**
 * @typedef {object} ProcessHistoryItem
 * @property {string|null} [eventType]
 * @property {string|null} [elementId]
 * @property {string|null} [occured]
 * @property {string|null} [started]
 * @property {string|null} [ended]
 * @property {string|null} [performedBy]
 */

/**
 * @typedef {object} ProcessHistoryList
 * @property {Array<ProcessHistoryItem>|null} [processHistory]
 */

/**
 * @typedef {object} ProcessState
 * @property {string|null} [started]
 * @property {string|null} [startEvent]
 * @property {ProcessElementInfo} currentTask
 * @property {string|null} [ended]
 * @property {string|null} [endEvent]
 */

/**
 * @typedef {object} ProcessStateUpdate
 * @property {ProcessState} state
 * @property {Array<InstanceEvent>|null} [events]
 */

/**
 * @typedef {"Unread"|"Read"|"UpdatedSinceLastReview"} ReadStatus
 */

/**
 * @typedef {object} Reference
 * @property {string|null} [value]
 * @property {RelationType} relation
 * @property {ReferenceType} valueType
 */

/**
 * @typedef {"DataElement"|"Task"} ReferenceType
 */

/**
 * @typedef {"GeneratedFrom"} RelationType
 */

/**
 * @typedef {object} ResourceLinks
 * @property {string|null} [apps]
 * @property {string|null} [platform]
 */

/**
 * @typedef {object} SignRequest
 * @property {string|null} [signatureDocumentDataType]
 * @property {string|null} [generatedFromTask]
 * @property {Array<DataElementSignature>|null} [dataElementSignatures]
 * @property {Signee} signee
 */

/**
 * @typedef {object} Signee
 * @property {string|null} [userId]
 * @property {string|null} [systemUserId]
 * @property {string|null} [personNumber]
 * @property {string|null} [organisationNumber]
 */

/**
 * @typedef {object} Substatus
 * @property {string|null} [label]
 * @property {string|null} [description]
 */

/**
 * @typedef {object} ValidationStatus
 * @property {string|null} [timestamp]
 * @property {boolean} canCompleteTask
 */

export const CompleteConfirmation = undefined;
export const DataElement = undefined;
export const DataElementList = undefined;
export const DataElementSignature = undefined;
export const DataValues = undefined;
export const DeleteStatus = undefined;
export const FileScanResult = undefined;
export const FileScanStatus = undefined;
export const Instance = undefined;
export const InstanceEvent = undefined;
export const InstanceEventList = undefined;
export const InstanceOwner = undefined;
export const InstanceQueryResponse = undefined;
export const InstanceStatus = undefined;
export const KeyValueEntry = undefined;
export const PlatformUser = undefined;
export const PresentationTexts = undefined;
export const ProcessElementInfo = undefined;
export const ProcessHistoryItem = undefined;
export const ProcessHistoryList = undefined;
export const ProcessState = undefined;
export const ProcessStateUpdate = undefined;
export const ReadStatus = undefined;
export const Reference = undefined;
export const ReferenceType = undefined;
export const RelationType = undefined;
export const ResourceLinks = undefined;
export const SignRequest = undefined;
export const Signee = undefined;
export const Substatus = undefined;
export const ValidationStatus = undefined;
