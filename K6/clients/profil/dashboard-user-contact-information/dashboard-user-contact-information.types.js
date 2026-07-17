/**
 * Response model for user contact information registered for an organization.
 *
 * Represents a user's personal contact details they have registered for acting
 * on behalf of an organization.
 *
 * @typedef {Object} DashboardUserContactInformationResponse
 * @property {string|null} [nationalIdentityNumber]
 * Gets or sets the national identity number (SSN/D-number) of the user.
 * @property {string} name
 * Gets or sets the full name of the user.
 * @property {string|null} [email]
 * Gets or sets the email address registered by the user for this organization.
 * @property {string|null} [phone]
 * Gets or sets the phone number registered by the user for this organization.
 * @property {string|null} [organizationNumber]
 * Gets or sets the organization number the user is acting on behalf of.
 * @property {string} lastChanged
 * Gets or sets the timestamp when this contact information was last changed.
 * ISO date-time.
 */

/**
 * @typedef {Object} ValidationProblemDetails
 * @property {string|null} [type]
 * @property {string|null} [title]
 * @property {number|null} [status]
 * @property {string|null} [detail]
 * @property {string|null} [instance]
 * @property {{[key: string]: Array<string>}|null} [errors]
 */
