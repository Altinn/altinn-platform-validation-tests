/**
 * Represents a notification address.
 *
 * @typedef {Object} NotificationAddressRequest
 * @property {string|null} [countryCode]
 * Country code for phone number.
 * @property {string|null} [email]
 * Email address.
 * @property {string|null} [phone]
 * Phone number.
 */

/**
 * Represents a notification address response.
 *
 * @typedef {Object} NotificationAddressResponse
 * @property {string|null} [countryCode]
 * Country code for phone number.
 * @property {string|null} [email]
 * Email address.
 * @property {string|null} [phone]
 * Phone number.
 * @property {number} notificationAddressId
 * Notification address identifier.
 */

/**
 * Represents an organization with notification addresses.
 *
 * @typedef {Object} OrganizationResponse
 * @property {string|null} [organizationNumber]
 * The organization's organization number.
 * @property {Array<NotificationAddressResponse>|null} [notificationAddresses]
 * List of mandatory notification addresses.
 */

/**
 * Validation problem details returned by the API.
 *
 * @typedef {Object} ValidationProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {{[key: string]: Array<string>}|null} [errors]
 */

/**
 * Problem details returned by the API.
 *
 * @typedef {Object} ProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 */
