/**
 * @typedef {"Legacy"|"Verified"|"Unverified"} VerificationType
 */

/**
 * Optional string wrapper.
 *
 * @typedef {Object} StringOptional
 * @property {boolean} hasValue Read-only flag indicating whether a value exists.
 * @property {string|null} value
 */

/**
 * Optional string list wrapper.
 *
 * @typedef {Object} StringListOptional
 * @property {boolean} hasValue Read-only flag indicating whether a value exists.
 * @property {Array<string>|null} value
 */

/**
 * Response model for professional notification settings.
 *
 * @typedef {Object} NotificationSettingsResponse
 * @property {string|null} emailAddress
 * @property {string|null} phoneNumber
 * @property {Array<string>|null} resourceIncludeList
 * @property {number} userId
 * @property {string} partyUuid UUID.
 * @property {boolean} needsConfirmation
 * @property {VerificationType} emailVerificationStatus
 * @property {VerificationType} smsVerificationStatus
 */

/**
 * Request model for creating or replacing professional notification settings.
 *
 * @typedef {Object} NotificationSettingsRequest
 * @property {string|null} [emailAddress]
 * @property {string|null} [phoneNumber]
 * @property {Array<string>|null} [resourceIncludeList]
 */

/**
 * Request model for partially updating professional notification settings.
 *
 * @typedef {Object} NotificationSettingsPatchRequest
 * @property {StringOptional} [emailAddress]
 * @property {StringOptional} [phoneNumber]
 * @property {StringListOptional} [resourceIncludeList]
 */
