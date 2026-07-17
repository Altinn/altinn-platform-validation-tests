/**
 * @typedef {"Email"|"Sms"} AddressType
 */

/**
 * Represents a verified address response model that contains information
 * about a verified address, including the address value and its type
 * (email or phone).
 *
 * @typedef {Object} VerifiedAddressResponse
 * @property {string} value
 * The address that has been verified. This could be an email address or a
 * phone number, depending on the type of address being verified.
 * @property {AddressType|null} [type]
 */

/**
 * Represents a request to verify an address, such as an email or phone number,
 * using a verification code.
 *
 * @typedef {Object} AddressVerificationRequest
 * @property {string} value
 * Gets or sets the address to verify, either an email or a phone number.
 * @property {AddressType} type
 * @property {string} verificationCode
 * Gets or sets the verification code for the address.
 */


/**
 * Represents a request to send a verification code for a given address
 * (email or phone number).
 *
 * @typedef {Object} AddressCodeSendRequest
 * @property {string} value
 * Gets or sets the address to verify, either an email or a phone number.
 * @property {AddressType} type
 */

/**
 * Represents a request to resend a verification code for a given address
 * (email or phone number).
 *
 * @typedef {Object} AddressCodeResendRequest
 * @property {string} value
 * Gets or sets the address to verify, either an email or a phone number.
 * @property {AddressType} type
 */
