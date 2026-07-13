/**
 * @typedef {Object} Application
 * @property {string|null} id
 * @property {string|null} versionId
 * @property {string|null} org
 * @property {Object<string,string|null>|null} title
 * @property {string|null} validFrom
 * @property {string|null} validTo
 * @property {string|null} processId
 * @property {Array<DataType>|null} dataTypes
 * @property {PartyTypesAllowed|null} partyTypesAllowed
 * @property {boolean} autoDeleteOnProcessEnd
 * @property {number|null} preventInstanceDeletionForDays
 * @property {Array<DataField>|null} presentationFields
 * @property {Array<DataField>|null} dataFields
 * @property {EFormidlingContract|null} eFormidling
 * @property {OnEntryConfig|null} onEntry
 * @property {MessageBoxConfig|null} messageBoxConfig
 * @property {CopyInstanceSettings|null} copyInstanceSettings
 * @property {ApiScopesConfiguration|null} apiScopes
 * @property {number|null} storageAccountNumber
 * @property {boolean} disallowUserInstantiation
 * @property {string|null} homepage
 * @property {Array<Keyword>|null} keywords
 * @property {Object<string,string|null>|null} description
 * @property {AppMetadataAccess|null} access
 * @property {Array<AppMetadataContactPoint>|null} contactPoints
 * @property {string|null} created
 * @property {string|null} createdBy
 * @property {string|null} lastChanged
 * @property {string|null} lastChangedBy
 */

/**
 * @typedef {Object} ApplicationList
 * @property {Array<Application>|null} applications
 */

/**
 * @typedef {Object} DataType
 * @property {string|null} id
 * @property {Object<string,string>|null} description
 * @property {Array<string>|null} allowedContentTypes
 * @property {Array<string>|null} allowedContributers
 * @property {Array<string>|null} allowedContributors
 * @property {string|null} actionRequiredToRead
 * @property {string|null} actionRequiredToWrite
 * @property {ApplicationLogic|null} appLogic
 * @property {string|null} taskId
 * @property {number|null} maxSize
 * @property {number} maxCount
 * @property {number} minCount
 * @property {string|null} grouping
 * @property {boolean} enablePdfCreation
 * @property {boolean} enableFileScan
 * @property {boolean} validationErrorOnPendingFileScan
 * @property {Array<string>|null} enabledFileAnalysers
 * @property {Array<string>|null} enabledFileValidators
 * @property {Array<string>|null} allowedKeysForUserDefinedMetadata
 */

/**
 * @typedef {Object} PartyTypesAllowed
 * @property {boolean} bankruptcyEstate
 * @property {boolean} organisation
 * @property {boolean} person
 * @property {boolean} subUnit
 */

/**
 * @typedef {Object} ApplicationLogic
 * @property {boolean|null} autoCreate
 * @property {string|null} classRef
 * @property {string|null} schemaRef
 * @property {boolean} allowAnonymousOnStateless
 * @property {boolean} autoDeleteOnProcessEnd
 * @property {boolean} disallowUserCreate
 * @property {boolean} disallowUserDelete
 * @property {boolean} allowInSubform
 * @property {ShadowFields|null} shadowFields
 */

/**
 * @typedef {Object} DataField
 * @property {string|null} id
 * @property {string|null} path
 * @property {string|null} dataTypeId
 */

/**
 * @typedef {Object} ShadowFields
 * @property {string|null} prefix
 * @property {string|null} saveToDataType
 */

/**
 * @typedef {Object} EFormidlingContract
 * @property {string|null} serviceId
 * @property {string|null} dpfShipmentType
 * @property {string|null} receiver
 * @property {string|null} sendAfterTaskId
 * @property {string|null} process
 * @property {string|null} standard
 * @property {string|null} typeVersion
 * @property {string|null} type
 * @property {number} securityLevel
 * @property {Array<string>|null} dataTypes
 */

/**
 * @typedef {Object} OnEntryConfig
 * @property {string|null} show
 */

/**
 * @typedef {Object} MessageBoxConfig
 * @property {HideSettings|null} hideSettings
 * @property {SyncAdapterSettings|null} syncAdapterSettings
 */

/**
 * @typedef {Object} CopyInstanceSettings
 * @property {boolean} enabled
 * @property {Array<string>|null} excludedDataTypes
 * @property {Array<string>|null} excludedDataFields
 * @property {boolean} includeAttachments
 */

/**
 * @typedef {Object} HideSettings
 * @property {boolean} hideAlways
 * @property {Array<string>|null} hideOnTask
 */

/**
 * @typedef {Object} SyncAdapterSettings
 * @property {boolean} disableSync
 * @property {boolean} enableUserSuppliedDialogId
 * @property {boolean} disableCreate
 * @property {boolean} disableDelete
 * @property {boolean} disableAddActivities
 * @property {boolean} disableAddTransmissions
 * @property {boolean} disableSyncDueAt
 * @property {boolean} disableSyncStatus
 * @property {boolean} disableMarkCompletedWhenConfirmed
 * @property {boolean} disableSyncContentTitle
 * @property {boolean} disableSyncContentSummary
 * @property {boolean} disableSyncContentAdditionalInformation
 * @property {boolean} disableSyncContentExtendedStatus
 * @property {boolean} disableSyncAttachments
 * @property {boolean} disableSyncApiActions
 * @property {boolean} disableSyncGuiActions
 */

/**
 * @typedef {Object} ApiScopesConfiguration
 * @property {ApiScopes|null} users
 * @property {ApiScopes|null} serviceOwners
 * @property {string|null} errorMessageTextResourceKey
 */

/**
 * @typedef {Object} ApiScopes
 * @property {string|null} read
 * @property {string|null} write
 * @property {string|null} errorMessageTextResourceKey
 */

/**
 * @typedef {Object} Keyword
 * @property {string|null} word
 * @property {string|null} language
 */

/**
 * @typedef {Object} AppMetadataAccess
 * @property {Object<string,string|null>|null} rightDescription
 * @property {boolean} delegable
 * @property {boolean} visible
 */

/**
 * @typedef {Object} AppMetadataContactPoint
 * @property {string|null} category
 * @property {string|null} email
 * @property {string|null} telephone
 * @property {string|null} contactPage
 */

/**
 * @typedef {Object} TextResource
 * @property {string|null} id
 * @property {string|null} org
 * @property {string|null} language
 * @property {Array<TextResourceElement>|null} resources
 */

/**
 * @typedef {Object} TextResourceElement
 * @property {string|null} id
 * @property {string|null} value
 * @property {Array<TextResourceVariable>|null} variables
 */

/**
 * @typedef {Object} TextResourceVariable
 * @property {string|null} key
 * @property {string|null} dataSource
 * @property {string|null} defaultValue
 */

// Runtime exports for VS Code autocomplete/imports.
export const Application = {};
export const ApplicationList = {};
export const DataType = {};
export const PartyTypesAllowed = {};
export const ApplicationLogic = {};
export const DataField = {};
export const ShadowFields = {};
export const EFormidlingContract = {};
export const OnEntryConfig = {};
export const MessageBoxConfig = {};
export const CopyInstanceSettings = {};
export const HideSettings = {};
export const SyncAdapterSettings = {};
export const ApiScopesConfiguration = {};
export const ApiScopes = {};
export const Keyword = {};
export const AppMetadataAccess = {};
export const AppMetadataContactPoint = {};
export const TextResource = {};
export const TextResourceElement = {};
export const TextResourceVariable = {};
