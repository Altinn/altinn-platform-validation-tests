/**
 * @typedef {Object} UserProfile
 * @property {number} userId
 * @property {string|null} userUuid
 * @property {string|null} userName
 * @property {string|null} externalIdentity
 * @property {boolean} isReserved
 * @property {string|null} phoneNumber
 * @property {string|null} email
 * @property {number} partyId
 * @property {Party} party
 * @property {UserType} userType
 * @property {ProfileSettingPreference} profileSettingPreference
 */

/**
 * @typedef {0|1|2|3|4|5|6} UserType
 */

/**
 * @typedef {Object} Party
 * @property {number} partyId
 * @property {string|null} partyUuid
 * @property {PartyType} partyTypeName
 * @property {string|null} orgNumber
 * @property {string|null} ssn
 * @property {string|null} unitType
 * @property {string|null} name
 * @property {boolean} isDeleted
 * @property {boolean} onlyHierarchyElementWithNoAccess
 * @property {Person|null} person
 * @property {Organization|null} organization
 * @property {Party[]|null} childParties
 * @property {string|null} lastChangedInAltinn
 * @property {string|null} lastChangedInExternalRegister
 */

/**
 * @typedef {1|2|3|4|5} PartyType
 */

/**
 * @typedef {Object} Person
 * @property {string|null} ssn
 * @property {string|null} name
 * @property {string|null} firstName
 * @property {string|null} middleName
 * @property {string|null} lastName
 * @property {string|null} telephoneNumber
 * @property {string|null} mobileNumber
 * @property {string|null} mailingAddress
 * @property {string|null} mailingPostalCode
 * @property {string|null} mailingPostalCity
 * @property {string|null} addressMunicipalNumber
 * @property {string|null} addressMunicipalName
 * @property {string|null} addressStreetName
 * @property {string|null} addressHouseNumber
 * @property {string|null} addressHouseLetter
 * @property {string|null} addressPostalCode
 * @property {string|null} addressCity
 * @property {string|null} dateOfDeath
 */

/**
 * @typedef {Object} Organization
 * Placeholder typedef for organization data.
 */

/**
 * @typedef {Object} ProfileSettingPreference
 * @property {string|null} languageType
 * @property {string|null} language
 * @property {number} preSelectedPartyId
 * @property {boolean} doNotPromptForParty
 * @property {string|null} preselectedPartyUuid
 * @property {boolean} showClientUnits
 * @property {boolean} shouldShowSubEntities
 * @property {boolean} shouldShowDeletedEntities
 */

/**
 * @typedef {Object} ProfileSettingPutRequest
 * @property {string|null} languageType
 * @property {number} preSelectedPartyId
 * @property {boolean} doNotPromptForParty
 * @property {boolean} showClientUnits
 * @property {boolean} shouldShowSubEntities
 * @property {boolean} shouldShowDeletedEntities
 * @property {string} language
 * @property {string|null} preselectedPartyUuid
 */

/**
 * @typedef {Object} ProfileSettingsPatchRequest
 * @property {string|null} language
 * @property {boolean|null} doNotPromptForParty
 * @property {GuidNullableOptional|null} preselectedPartyUuid
 * @property {boolean|null} showClientUnits
 * @property {boolean|null} shouldShowSubEntities
 * @property {boolean|null} shouldShowDeletedEntities
 */

/**
 * @typedef {Object} GuidNullableOptional
 * @property {boolean} hasValue
 * @property {string|null} value
 */


/**
 * @typedef {Object} ProfileSettingPutRequestBuilderOptions
 * @property {string|null} [languageType]
 * @property {number} [preSelectedPartyId]
 * @property {boolean} doNotPromptForParty
 * @property {boolean} showClientUnits
 * @property {boolean} shouldShowSubEntities
 * @property {boolean} shouldShowDeletedEntities
 * @property {string} language
 * @property {string|null} [preselectedPartyUuid]
 */



/**
 * @typedef {Object} ProfileSettingsPatchRequestBuilderOptions
 * @property {string|null} [language]
 * @property {boolean|null} [doNotPromptForParty]
 * @property {string|null} [preselectedPartyUuid]
 * @property {boolean|null} [showClientUnits]
 * @property {boolean|null} [shouldShowSubEntities]
 * @property {boolean|null} [shouldShowDeletedEntities]
 */
